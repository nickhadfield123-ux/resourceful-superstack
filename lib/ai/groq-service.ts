import { Groq } from 'groq-sdk'

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
})

export interface GroqMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  name?: string
}

export interface GroqRequest {
  messages: GroqMessage[]
  model?: string
  max_tokens?: number
  temperature?: number
  top_p?: number
  stream?: boolean
}

export interface GroqResponse {
  id: string
  choices: Array<{
    message: GroqMessage
    finish_reason: string
    index: number
  }>
  created: number
  model: string
  object: string
  usage: {
    completion_tokens: number
    prompt_tokens: number
    total_tokens: number
  }
}

// Content Analyzer types
export interface ContentChunk {
  chunk_number: number
  title: string
  content: string
  content_type: 'document' | 'conversation' | 'profile'
  category: string
  priority: 'High' | 'Medium' | 'Low'
  source_document: string  // Name of the document this chunk came from
  document_context: string  // Contextual metadata (e.g., "Vision - not currently implemented")
  metadata: {
    source: string
    original_length: number
    date_analyzed: string
  }
}

export interface ContentAnalysisResponse {
  analysis: {
    total_chunks: number
    total_words: number
    chunking_strategy: string
  }
  chunks: ContentChunk[]
}

export class GroqService {
  private defaultModel = 'llama-3.3-70b-versatile'
  private kbAnalysisModel = 'llama-3.1-8b-instant'  // Smaller model for KB analysis
  private systemPrompt = `You are Rizz, a helpful AI assistant. Respond concisely and accurately.`
  
  // Max content length for KB analysis (in characters) to stay within Groq limits
  private maxContentLength = 24000  // ~6000 tokens
  
  private truncateContent(content: string, maxLength: number = this.maxContentLength): string {
    if (content.length <= maxLength) {
      return content
    }
    // Truncate to maxLength, trying to end at a sentence
    const truncated = content.substring(0, maxLength)
    const lastPeriod = truncated.lastIndexOf('.')
    const lastNewline = truncated.lastIndexOf('\n')
    const breakPoint = Math.max(lastPeriod, lastNewline)
    
    if (breakPoint > maxLength * 0.8) {
      return truncated.substring(0, breakPoint + 1) + '\n\n[Content truncated for analysis...]'
    }
    return truncated + '\n\n[Content truncated for analysis...]'
  }

  async chatCompletion(request: GroqRequest): Promise<GroqResponse> {
    try {
      // Add system prompt if not present
      const messages: GroqMessage[] = request.messages.length > 0 && request.messages[0].role === 'system'
        ? request.messages
        : [{ role: 'system' as const, content: this.systemPrompt }, ...request.messages]

      const response = await groq.chat.completions.create({
        messages,
        model: request.model || this.defaultModel,
        max_tokens: request.max_tokens || 4096,
        temperature: request.temperature || 0.7,
        top_p: request.top_p || 1.0,
        stream: request.stream || false
      })

      return response as GroqResponse
    } catch (error) {
      console.error('Groq API error:', error)
      throw new Error('Failed to get response from Groq')
    }
  }

  async analyzeDocument(documentText: string, analysisType: 'summary' | 'analysis' | 'extraction'): Promise<string> {
    try {
      const prompt = this.getDocumentPrompt(documentText, analysisType)
      
      const response = await this.chatCompletion({
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 4096,
        temperature: 0.3
      })

      return response.choices[0].message.content
    } catch (error) {
      console.error('Error analyzing document:', error)
      throw error
    }
  }

  private getDocumentPrompt(documentText: string, analysisType: string): string {
    switch (analysisType) {
      case 'summary':
        return `Please provide a concise summary of the following document:\n\n${documentText}`
      case 'analysis':
        return `Please analyze the following document and provide insights:\n\n${documentText}`
      case 'extraction':
        return `Please extract key information, entities, and important points from the following document:\n\n${documentText}`
      default:
        return `Please analyze the following document:\n\n${documentText}`
    }
  }

  async getCostEstimate(request: GroqRequest): Promise<number> {
    // Rough cost estimation for Groq models
    const modelCosts = {
      'llama3-70b-8192': 0.00059, // per 1K tokens
      'llama3-8b-8192': 0.00007,
      'mixtral-8x7b-32768': 0.00024
    }

    const model = request.model || this.defaultModel
    const costPerToken = modelCosts[model as keyof typeof modelCosts] || 0.00059
    
    // Estimate tokens (rough approximation)
    const estimatedTokens = request.messages.reduce((total, msg) => 
      total + msg.content.length / 4, 0
    )

    return estimatedTokens * costPerToken / 1000
  }

  async analyzeContentForKnowledgeBase(content: string): Promise<ContentAnalysisResponse> {
    try {
      // Truncate content to stay within Groq free tier limits
      const truncatedContent = this.truncateContent(content)
      
      // Log if truncation occurred
      if (truncatedContent.length < content.length) {
        console.log(`KB analysis: Content truncated from ${content.length} to ${truncatedContent.length} chars`)
      }
      
      const prompt = this.getContentAnalysisPrompt(truncatedContent)
      
      console.log(`KB analysis: Using model ${this.kbAnalysisModel} for analysis`)
      
      const response = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert knowledge base curator. You must respond with valid JSON only — no markdown, no code fences, no explanation. Just the raw JSON object.'
          },
          { role: 'user', content: prompt }
        ],
        model: this.kbAnalysisModel,  // Use smaller model for KB analysis
        max_tokens: 4096,  // Reduced to stay within limits
        temperature: 0.3,
        response_format: { type: 'json_object' }
      })

      const analysisText = response.choices[0].message.content || ''
      
      // Defensive: strip markdown fences if model adds them despite json_object mode
      const cleaned = analysisText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```\s*$/i, '')
        .trim()
      
      const analysis = JSON.parse(cleaned) as ContentAnalysisResponse
      
      return analysis
    } catch (error) {
      console.error('Error analyzing content for knowledge base:', error)
      throw error
    }
  }

  private getContentAnalysisPrompt(content: string): string {
    return `You are an expert document analyst. Your job is to EXTRACT and PRESERVE actual text from documents, not summarize them.

╔══════════════════════════════════════════════════════════════════════════════╗
║  CRITICAL: Each chunk MUST contain the ACTUAL ORIGINAL TEXT from the        ║
║  document, NOT a summary or description of what the chunk is about.         ║
║  Preserve the exact wording, paragraphs, and content.                       ║
║  The "content" field should be SUBSTANTIAL (200-800 words of actual text),  ║
║  NOT a one-sentence summary.                                                 ║
╚══════════════════════════════════════════════════════════════════════════════╝

**YOU ARE A TEXT EXTRACTION TOOL, NOT A SUMMARIZER:**
- Your job is to COPY text from the source, not describe it
- NEVER write "Purpose: ..." or "This section is about ..."
- NEVER write "Introduces the concept of ..." or "Discusses ..."
- ALWAYS copy the actual paragraphs and sentences from the document

**EXAMPLE - PAY CLOSE ATTENTION:**

// ❌ WRONG - This is a SUMMARY, do NOT do this:
{
  "content": "Purpose: Introduce the Zero Point platform and its vision for transforming organizational structure.",
  ...
}

// ✅ CORRECT - This is ACTUAL TEXT extracted from the document:
{
  "content": "Zero Point is a revolutionary platform that transforms how organizations structure themselves. Unlike traditional hierarchical models, Zero Point enables fluid, purpose-driven collaboration that adapts to the needs of each project. The platform was founded on the principle that the most innovative companies of the future will not be organized around rigid departments, but around dynamic teams that form and reform based on the work at hand. This approach allows organizations to tap into the full potential of their workforce, breaking down silos and enabling unprecedented levels of collaboration and innovation.",
  ...
}

**ANALYSIS REQUIREMENTS:**
1. Read through the entire document first
2. Identify natural section boundaries (headers, topic shifts)
3. For each chunk, COPY the actual text verbatim - word for word
4. Each chunk should contain 200-800 words of ACTUAL text

**FOR EACH CHUNK, PROVIDE:**
- **title**: A short descriptive title (5-10 words)
- **content**: **VERBATIM TEXT copied exactly from the source document**
- **content_type**: "document", "conversation", or "profile"
- **category**: A topic area
- **priority**: "High", "Medium", or "Low"
- **source_document**: The name/title of the document this chunk came from (use the same value for ALL chunks from this document)

**SOURCE DOCUMENT TRACKING:**
- All chunks from this document should have the SAME source_document value
- Use a concise document name like "Zero Point Operational Structure" or "Product Roadmap Q1"
- This allows finding ALL chunks from a document, even if they don't mention the document name in their text

**OUTPUT FORMAT:**
Return ONLY a raw JSON object (no markdown, no code fences):

{
  "analysis": {
    "total_chunks": 3,
    "total_words": 1250,
    "chunking_strategy": "Section-based segmentation",
    "source_document": "Zero Point Operational Structure"
  },
  "chunks": [
    {
      "chunk_number": 1,
      "title": "Platform Vision",
      "content": "Zero Point is a revolutionary platform that transforms how organizations structure themselves. Unlike traditional hierarchical models, Zero Point enables fluid, purpose-driven collaboration... [continues with actual text from document]",
      "content_type": "document",
      "category": "platform vision",
      "priority": "High",
      "source_document": "Zero Point Operational Structure",
      "metadata": {
        "source": "user-provided",
        "original_length": 500,
        "date_analyzed": "2026-02-19"
      }
    }
  ]
}

**DOCUMENT TO CHUNK - EXTRACT ACTUAL TEXT:**
${content}`
  }
}

// Export singleton instance
export const groqService = new GroqService()
