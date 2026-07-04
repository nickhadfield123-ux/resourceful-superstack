import { Ollama } from 'ollama'
import { contentItems, embeddings, type ContentItem, type Embedding, getDevUser } from './supabase'

// Initialize Ollama client
const ollama = new Ollama({ 
  host: process.env.OLLAMA_HOST || 'http://localhost:11434'
})

// Embedding service for RAG functionality
export class EmbeddingService {
  private model = 'nomic-embed-text'

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await ollama.embeddings({
        model: this.model,
        prompt: text
      })

      return response.embedding
    } catch (error) {
      console.error('Error generating embedding:', error)
      throw new Error('Failed to generate embedding')
    }
  }

  async upsertContentWithEmbedding(
    content: Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>,
    userId?: string
  ): Promise<{ content: ContentItem; embedding: Embedding }> {
    try {
      // Use provided userId or default to dev user
      const effectiveUserId = userId || getDevUser()
      
      // Generate embedding from content field (not content_text)
      const embeddingVector = await this.generateEmbedding(content.content)

      // Create content item
      const contentItem = await contentItems.create({
        ...content,
        user_id: effectiveUserId
      })

      // Create embedding record
      const embedding = await embeddings.create({
        content_id: contentItem.id,
        user_id: effectiveUserId,
        embedding: embeddingVector
      })

      return { content: contentItem, embedding }
    } catch (error) {
      console.error('Error upserting content with embedding:', error)
      throw error
    }
  }

  async updateContentWithEmbedding(
    contentId: string,
    updates: Partial<ContentItem>,
    userId?: string
  ): Promise<{ content: ContentItem; embedding: Embedding }> {
    try {
      // Use provided userId or default to dev user
      const effectiveUserId = userId || getDevUser()
      
      // Update content
      const updatedContent = await contentItems.update(contentId, updates)

      // Generate new embedding if content changed
      let embeddingVector: number[] = []
      if (updates.content) {
        embeddingVector = await this.generateEmbedding(updates.content)
      } else {
        // Use existing content for embedding
        embeddingVector = await this.generateEmbedding(updatedContent.content)
      }

      // Delete old embeddings and create new one
      await embeddings.deleteByContentId(contentId)
      
      const embedding = await embeddings.create({
        content_id: contentId,
        user_id: effectiveUserId,
        embedding: embeddingVector
      })

      return { content: updatedContent, embedding }
    } catch (error) {
      console.error('Error updating content with embedding:', error)
      throw error
    }
  }

  async searchSimilar(
    userId: string,
    query: string,
    limit: number = 5
  ): Promise<{ content: ContentItem; similarity: number }[]> {
    try {
      // Generate embedding for query
      const queryEmbedding = await this.generateEmbedding(query)

      // Search for similar embeddings
      const similarEmbeddings = await embeddings.searchSimilar(userId, queryEmbedding, limit)

      // Get content items for the embeddings
      const results: Array<{ content: ContentItem; similarity: number }> = []
      for (const embedding of similarEmbeddings) {
        const contentItemsList = await contentItems.findByUserId(userId)
        const content = contentItemsList.find(c => c.id === embedding.content_id)
        
        if (content) {
          // Calculate similarity (cosine similarity)
          const similarity = this.calculateSimilarity(queryEmbedding, embedding.embedding)
          results.push({ content, similarity })
        }
      }

      // Sort by similarity
      results.sort((a, b) => b.similarity - a.similarity)

      return results.slice(0, limit)
    } catch (error) {
      console.error('Error searching similar content:', error)
      throw error
    }
  }

  /**
   * Search for similar content with total count info
   * Returns both the top matches AND the total count of all chunks in the KB
   */
  async searchSimilarWithTotalCount(
    userId: string,
    query: string,
    limit: number = 5
  ): Promise<{ 
    results: Array<{ content: ContentItem; similarity: number }>
    totalChunksInKB: number
    returnedCount: number
  }> {
    try {
      // Get total count first
      const totalChunksInKB = await contentItems.countByUserId(userId)
      
      // Get search results
      const results = await this.searchSimilar(userId, query, limit)

      return {
        results,
        totalChunksInKB,
        returnedCount: results.length
      }
    } catch (error) {
      console.error('Error searching similar content with total count:', error)
      throw error
    }
  }

  async deleteContentWithEmbedding(contentId: string): Promise<void> {
    try {
      // Delete embedding first (due to foreign key constraint)
      await embeddings.deleteByContentId(contentId)
      
      // Delete content item
      await contentItems.delete(contentId)
    } catch (error) {
      console.error('Error deleting content with embedding:', error)
      throw error
    }
  }

  async getTeamKnowledge(userId: string, contentType?: ContentItem['content_type']): Promise<ContentItem[]> {
    try {
      if (contentType) {
        return await contentItems.findByType(userId, contentType)
      }
      return await contentItems.findByUserId(userId)
    } catch (error) {
      console.error('Error getting team knowledge:', error)
      throw error
    }
  }

  // Helper method to calculate cosine similarity
  private calculateSimilarity(vec1: number[], vec2: number[]): number {
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0)
    const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0))
    const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0))
    
    return dotProduct / (magnitude1 * magnitude2)
  }
}

// Export singleton instance
export const embeddingService = new EmbeddingService()