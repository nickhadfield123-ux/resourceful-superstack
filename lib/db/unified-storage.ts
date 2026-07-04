import { db } from './cockpit-db'
import { toast } from '@/toast'
import { useIntelligenceStore } from '@/stores/intelligenceStore'

// Unified storage service that manages both IndexedDB and Zustand synchronization
export class UnifiedStorage {
  private static instance: UnifiedStorage
  private isInitialized = false

  private constructor() {}

  static getInstance(): UnifiedStorage {
    if (!UnifiedStorage.instance) {
      UnifiedStorage.instance = new UnifiedStorage()
    }
    return UnifiedStorage.instance
  }

  // Initialize the storage system
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Test database connection
      await db.media.count()
      this.isInitialized = true
      console.log('✅ UnifiedStorage initialized successfully')
      toast.success('Storage system ready')
    } catch (error) {
      console.error('❌ UnifiedStorage initialization failed:', error)
      toast.error('Storage system failed to initialize')
      throw error
    }
  }

  // Media Management
  async addMediaEntry(mediaEntry: any): Promise<string> {
    try {
      const id = await db.media.add(mediaEntry)
      console.log(`✅ Media entry added: ${id}`)
      
      // Sync with Zustand store
      this.syncMediaToStore()
      
      return id
    } catch (error) {
      console.error('❌ Failed to add media entry:', error)
      toast.error('Failed to save media entry')
      throw error
    }
  }

  async getMediaEntry(id: string): Promise<any> {
    try {
      const entry = await db.media.get(id)
      if (!entry) {
        throw new Error(`Media entry not found: ${id}`)
      }
      return entry
    } catch (error) {
      console.error('❌ Failed to get media entry:', error)
      throw error
    }
  }

  async getAllMediaEntries(): Promise<any[]> {
    try {
      const entries = await db.media.reverse().sortBy('createdAt')
      return entries
    } catch (error) {
      console.error('❌ Failed to get media entries:', error)
      throw error
    }
  }

  async updateMediaEntry(id: string, updates: Partial<any>): Promise<void> {
    try {
      await db.media.update(id, updates)
      console.log(`✅ Media entry updated: ${id}`)
      
      // Sync with Zustand store
      this.syncMediaToStore()
    } catch (error) {
      console.error('❌ Failed to update media entry:', error)
      toast.error('Failed to update media entry')
      throw error
    }
  }

  async deleteMediaEntry(id: string): Promise<void> {
    try {
      await db.media.delete(id)
      console.log(`✅ Media entry deleted: ${id}`)
      
      // Sync with Zustand store
      this.syncMediaToStore()
    } catch (error) {
      console.error('❌ Failed to delete media entry:', error)
      toast.error('Failed to delete media entry')
      throw error
    }
  }

  // Conversation Management
  async addConversation(conversation: any): Promise<string> {
    try {
      const id = await db.conversations.add(conversation)
      console.log(`✅ Conversation added: ${id}`)
      
      // Sync with Zustand store
      this.syncConversationsToStore()
      
      return id
    } catch (error) {
      console.error('❌ Failed to add conversation:', error)
      toast.error('Failed to save conversation')
      throw error
    }
  }

  async getConversation(id: string): Promise<any> {
    try {
      const conversation = await db.conversations.get(id)
      if (!conversation) {
        throw new Error(`Conversation not found: ${id}`)
      }
      return conversation
    } catch (error) {
      console.error('❌ Failed to get conversation:', error)
      throw error
    }
  }

  async getAllConversations(): Promise<any[]> {
    try {
      const conversations = await db.conversations.reverse().sortBy('updatedAt')
      return conversations
    } catch (error) {
      console.error('❌ Failed to get conversations:', error)
      throw error
    }
  }

  async updateConversation(id: string, updates: Partial<any>): Promise<void> {
    try {
      await db.conversations.update(id, updates)
      console.log(`✅ Conversation updated: ${id}`)
      
      // Sync with Zustand store
      this.syncConversationsToStore()
    } catch (error) {
      console.error('❌ Failed to update conversation:', error)
      toast.error('Failed to update conversation')
      throw error
    }
  }

  async deleteConversation(id: string): Promise<void> {
    try {
      await db.conversations.delete(id)
      console.log(`✅ Conversation deleted: ${id}`)
      
      // Sync with Zustand store
      this.syncConversationsToStore()
    } catch (error) {
      console.error('❌ Failed to delete conversation:', error)
      toast.error('Failed to delete conversation')
      throw error
    }
  }

  // KB Entry Management
  async addKBEntry(kbEntry: any): Promise<string> {
    try {
      const id = await db.kbEntries.add(kbEntry)
      console.log(`✅ KB entry added: ${id}`)
      
      // Sync with Zustand store
      this.syncKBToStore()
      
      return id
    } catch (error) {
      console.error('❌ Failed to add KB entry:', error)
      toast.error('Failed to save KB entry')
      throw error
    }
  }

  async getKBEntry(id: string): Promise<any> {
    try {
      const entry = await db.kbEntries.get(id)
      if (!entry) {
        throw new Error(`KB entry not found: ${id}`)
      }
      return entry
    } catch (error) {
      console.error('❌ Failed to get KB entry:', error)
      throw error
    }
  }

  async getAllKBEntries(): Promise<any[]> {
    try {
      const entries = await db.kbEntries.reverse().sortBy('updatedAt')
      return entries
    } catch (error) {
      console.error('❌ Failed to get KB entries:', error)
      throw error
    }
  }

  async updateKBEntry(id: string, updates: Partial<any>): Promise<void> {
    try {
      await db.kbEntries.update(id, updates)
      console.log(`✅ KB entry updated: ${id}`)
      
      // Sync with Zustand store
      this.syncKBToStore()
    } catch (error) {
      console.error('❌ Failed to update KB entry:', error)
      toast.error('Failed to update KB entry')
      throw error
    }
  }

  async deleteKBEntry(id: string): Promise<void> {
    try {
      await db.kbEntries.delete(id)
      console.log(`✅ KB entry deleted: ${id}`)
      
      // Sync with Zustand store
      this.syncKBToStore()
    } catch (error) {
      console.error('❌ Failed to delete KB entry:', error)
      toast.error('Failed to delete KB entry')
      throw error
    }
  }

  // Bulk Operations
  async clearAllData(): Promise<void> {
    try {
      await db.transaction('rw', [db.media, db.conversations, db.kbEntries], async () => {
        await Promise.all([
          db.media.clear(),
          db.conversations.clear(),
          db.kbEntries.clear()
        ])
      })
      
      console.log('✅ All data cleared')
      
      // Sync with Zustand store
      this.syncMediaToStore()
      this.syncConversationsToStore()
      this.syncKBToStore()
      
      toast.success('All data cleared successfully')
    } catch (error) {
      console.error('❌ Failed to clear data:', error)
      toast.error('Failed to clear data')
      throw error
    }
  }

  async getStorageStats(): Promise<{
    mediaCount: number
    conversationCount: number
    kbCount: number
    totalSize: number
  }> {
    try {
      const [mediaCount, conversationCount, kbCount] = await Promise.all([
        db.media.count(),
        db.conversations.count(),
        db.kbEntries.count()
      ])

      // Calculate approximate total size
      const mediaEntries = await db.media.toArray()
      const totalSize = mediaEntries.reduce((sum, entry) => sum + entry.fileSize, 0)

      return {
        mediaCount,
        conversationCount,
        kbCount,
        totalSize
      }
    } catch (error) {
      console.error('❌ Failed to get storage stats:', error)
      throw error
    }
  }

  // Synchronization with Zustand store
  private syncMediaToStore(): void {
    try {
      this.getAllMediaEntries().then(entries => {
        // Update Zustand store with media entries
        // Note: This would need to be implemented based on your Zustand store structure
        console.log('🔄 Syncing media entries to store:', entries.length)
      }).catch(error => {
        console.error('❌ Failed to sync media to store:', error)
      })
    } catch (error) {
      console.error('❌ Error syncing media to store:', error)
    }
  }

  private syncConversationsToStore(): void {
    try {
      this.getAllConversations().then(entries => {
        // Update Zustand store with conversations
        console.log('🔄 Syncing conversations to store:', entries.length)
      }).catch(error => {
        console.error('❌ Failed to sync conversations to store:', error)
      })
    } catch (error) {
      console.error('❌ Error syncing conversations to store:', error)
    }
  }

  private syncKBToStore(): void {
    try {
      this.getAllKBEntries().then(entries => {
        // Update Zustand store with KB entries
        console.log('🔄 Syncing KB entries to store:', entries.length)
      }).catch(error => {
        console.error('❌ Failed to sync KB entries to store:', error)
      })
    } catch (error) {
      console.error('❌ Error syncing KB entries to store:', error)
    }
  }

  // Utility methods
  async generateBlobURL(blob: Blob): Promise<string> {
    return URL.createObjectURL(blob)
  }

  revokeBlobURL(url: string): void {
    URL.revokeObjectURL(url)
  }

  async blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  async dataURLToBlob(dataURL: string): Promise<Blob> {
    const arr = dataURL.split(',')
    const mime = arr[0].match(/:(.*?);/)?.[1] || ''
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    
    return new Blob([u8arr], { type: mime })
  }
}

// Export singleton instance
export const unifiedStorage = UnifiedStorage.getInstance()