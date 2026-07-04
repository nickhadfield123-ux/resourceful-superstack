import { type GroqRequest, type GroqResponse } from './groq-service'

export interface OllamaRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
  }>
  model?: string
  max_tokens?: number
  temperature?: number
  top_p?: number
  stream?: boolean
}

export interface OllamaResponse {
  message: {
    content: string
  }
  model: string
  created_at: string
}

export class OllamaService {
  private baseUrl = process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434'

  async chatCompletion(request: OllamaRequest): Promise<OllamaResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model || 'llama2',
          messages: request.messages,
          stream: false,
          options: {
            temperature: request.temperature || 0.7,
            top_p: request.top_p || 1.0,
            max_tokens: request.max_tokens || 2000,
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        message: {
          content: data.message.content
        },
        model: data.model,
        created_at: data.created_at
      }
    } catch (error) {
      console.error('Ollama service error:', error)
      throw new Error('Failed to get response from Ollama')
    }
  }

  async analyzeDocument(documentText: string, analysisType: 'summary' | 'analysis' | 'extraction'): Promise<string> {
    try {
      const prompt = this.getAnalysisPrompt(documentText, analysisType)
      
      const response = await this.chatCompletion({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful document analysis assistant. Provide concise and accurate analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'llama2',
        max_tokens: 1000,
        temperature: 0.3
      })

      return response.message.content
    } catch (error) {
      console.error('Error analyzing document with Ollama:', error)
      throw error
    }
  }

  private getAnalysisPrompt(documentText: string, analysisType: string): string {
    switch (analysisType) {
      case 'summary':
        return `Please provide a concise summary of the following document:\n\n${documentText}`
      case 'analysis':
        return `Please analyze the following document and provide insights:\n\n${documentText}`
      case 'extraction':
        return `Please extract key information from the following document:\n\n${documentText}`
      default:
        return `Please analyze the following document:\n\n${documentText}`
    }
  }
}

// Export singleton instance
export const ollamaService = new OllamaService()