import { ollamaService } from './ollama-service'
import { useIntelligenceStore } from '../../stores/intelligenceStore'

// Import services only on server side
let groqService: any
let embeddingService: any

// Initialize services on server side only
if (typeof window === 'undefined') {
  // Server-side imports
  const { groqService: serverGroqService } = require('./groq-service')
  const { embeddingService: serverEmbeddingService } = require('../db/embedding-service')
  
  groqService = serverGroqService
  embeddingService = serverEmbeddingService
}

export interface UnifiedRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
  }>
  model?: 'ollama' | 'groq'
  max_tokens?: number
  temperature?: number
  top_p?: number
  stream?: boolean
  useRAG?: boolean
  ragQuery?: string
}

export interface UnifiedResponse {
  content: string
  model: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  ragContext?: Array<{
    content: string
    similarity: number
  }>
}

export class UnifiedAIService {
  private systemPrompt = `You are Rizz, a helpful AI assistant. Respond concisely and accurately. Use the provided context if available to enhance your response.`

  async chatCompletion(request: UnifiedRequest): Promise<UnifiedResponse> {
    try {
      const { messages, model, useRAG, ragQuery, ...rest } = request
      
      // Determine which model to use
      const targetModel = this.selectModel(model)
      
      // Prepare messages with system prompt
      const preparedMessages = this.prepareMessages(messages)
      
      // Handle RAG if requested
      let ragContext: Array<{ content: string; similarity: number }> | undefined
      if (useRAG && ragQuery) {
        ragContext = await this.getRAGContext(ragQuery)
      }

      let response: UnifiedResponse

      if (targetModel === 'ollama') {
        // Use Ollama
        const ollamaResponse = await ollamaService.chatCompletion({
          messages: preparedMessages,
          ...rest
        })
        
        response = {
          content: ollamaResponse.message.content,
          model: 'ollama',
          usage: {
            prompt_tokens: 0, // Ollama doesn't provide detailed usage
            completion_tokens: 0,
            total_tokens: 0
          },
          ragContext
        }
      } else {
        // Use Groq
        const groqResponse = await groqService.chatCompletion({
          messages: preparedMessages,
          ...rest
        })
        
        response = {
          content: groqResponse.choices[0].message.content,
          model: 'groq',
          usage: {
            prompt_tokens: groqResponse.usage.prompt_tokens,
            completion_tokens: groqResponse.usage.completion_tokens,
            total_tokens: groqResponse.usage.total_tokens
          },
          ragContext
        }
      }

      // Enhance response with RAG context if available
      if (ragContext && ragContext.length > 0) {
        const enhancedContent = this.enhanceWithRAGContext(response.content, ragContext)
        response.content = enhancedContent
      }

      return response
    } catch (error) {
      console.error('Unified AI service error:', error)
      throw new Error('Failed to get response from AI service')
    }
  }

  async analyzeDocument(documentText: string, analysisType: 'summary' | 'analysis' | 'extraction'): Promise<string> {
    try {
      // Use Groq for document analysis (better for structured tasks)
      return await groqService.analyzeDocument(documentText, analysisType)
    } catch (error) {
      console.error('Error analyzing document:', error)
      throw error
    }
  }

  async getCostEstimate(request: UnifiedRequest): Promise<{ ollama: number; groq: number }> {
    try {
      const { messages, ...rest } = request
      
      // Estimate Groq cost
      const groqCost = await groqService.getCostEstimate({
        messages: this.prepareMessages(messages),
        ...rest
      })

      // Ollama is free (local), so cost is 0
      const ollamaCost = 0

      return {
        ollama: ollamaCost,
        groq: groqCost
      }
    } catch (error) {
      console.error('Error estimating cost:', error)
      return { ollama: 0, groq: 0 }
    }
  }

  private selectModel(preferredModel?: 'ollama' | 'groq'): 'ollama' | 'groq' {
    // Check user preference from store
    try {
      const userPreference = useIntelligenceStore.getState().modelPreference
      
      if (preferredModel) {
        return preferredModel
      }
      
      if (userPreference) {
        return userPreference
      }
    } catch (error) {
      console.warn('Could not access store state, using default model')
    }

    // Default to Ollama for local processing
    return 'ollama'
  }

  private prepareMessages(messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>): Array<{ role: 'user' | 'assistant' | 'system'; content: string }> {
    // Add system prompt if not present
    if (messages.length === 0 || messages[0].role !== 'system') {
      return [
        { role: 'system', content: this.systemPrompt },
        ...messages
      ]
    }
    return messages
  }

  private async getRAGContext(query: string): Promise<Array<{ content: string; similarity: number }>> {
    try {
      // Get user ID from store or context
      const userId = useIntelligenceStore.getState().userId || 'default-user'
      
      const similarResults = await embeddingService.searchSimilar(userId, query, 5)
      
      return similarResults.map((result: any) => ({
        content: result.content.content_text,
        similarity: result.similarity
      }))
    } catch (error) {
      console.error('Error getting RAG context:', error)
      return []
    }
  }

  private enhanceWithRAGContext(originalContent: string, ragContext: Array<{ content: string; similarity: number }>): string {
    if (ragContext.length === 0) {
      return originalContent
    }

    // Create context summary
    const contextSummary = ragContext
      .map((item, index) => `Context ${index + 1} (similarity: ${item.similarity.toFixed(3)}): ${item.content}`)
      .join('\n\n')

    return `${originalContent}\n\n---\nContext used for this response:\n${contextSummary}`
  }

  async storeContentForRAG(
    content: string,
    title: string,
    contentType: 'document' | 'conversation' | 'profile',
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const userId = useIntelligenceStore.getState().userId || 'default-user'
      
      await embeddingService.upsertContentWithEmbedding({
        title,
        content_type: contentType,
        content_text: content,
        content_metadata: metadata || {}
      }, userId)
    } catch (error) {
      console.error('Error storing content for RAG:', error)
      throw error
    }
  }
}

// Export singleton instance
export const unifiedAIService = new UnifiedAIService()