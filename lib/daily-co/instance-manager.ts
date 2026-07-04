"use client"

import DailyIframe, { DailyCall } from '@daily-co/daily-js'

// Global singleton instance manager for Daily.co
class DailyInstanceManager {
  private static instance: DailyInstanceManager
  private callObject: DailyCall | null = null
  private isDestroying: boolean = false
  private pendingDestroy: boolean = false

  private constructor() {}

  public static getInstance(): DailyInstanceManager {
    if (!DailyInstanceManager.instance) {
      DailyInstanceManager.instance = new DailyInstanceManager()
    }
    return DailyInstanceManager.instance
  }

  public async createCallObject(): Promise<DailyCall> {
    console.log('🏗️ DailyInstanceManager: Creating call object...')
    
    // If we're in the process of destroying, wait for it to complete
    if (this.isDestroying) {
      console.log('⏳ Waiting for current destruction to complete...')
      await this.waitForDestruction()
    }

    // If we already have a call object, return it
    if (this.callObject) {
      console.log('🔄 Reusing existing call object')
      return this.callObject
    }

    try {
      console.log('🎯 Creating new Daily.co call object...')
      this.callObject = DailyIframe.createCallObject()
      console.log('✅ Call object created successfully')
      return this.callObject
    } catch (error: any) {
      console.error('❌ Failed to create call object:', error)
      
      // If creation failed due to duplicate instance, try to force cleanup
      if (error.message?.includes('Duplicate DailyIframe instances')) {
        console.log('🔄 Attempting forced cleanup due to duplicate instance error')
        await this.forceCleanup()
        
        // Try creating again after cleanup
        try {
          this.callObject = DailyIframe.createCallObject()
          console.log('✅ Call object created successfully after cleanup')
          return this.callObject
        } catch (retryError: any) {
          console.error('❌ Failed to create call object even after cleanup:', retryError)
          throw retryError
        }
      }
      
      throw error
    }
  }

  public getCallObject(): DailyCall | null {
    return this.callObject
  }

  public async destroyCallObject(): Promise<void> {
    if (!this.callObject || this.isDestroying) {
      return
    }

    console.log('🗑️ DailyInstanceManager: Destroying call object...')
    this.isDestroying = true

    try {
      // Remove all event listeners first
      if (this.callObject) {
        this.callObject.off('joined-meeting', () => {})
        this.callObject.off('left-meeting', () => {})
        this.callObject.off('error', () => {})
        this.callObject.off('participant-joined', () => {})
        this.callObject.off('participant-left', () => {})
        this.callObject.off('participant-updated', () => {})
        this.callObject.off('track-started', () => {})
        this.callObject.off('track-stopped', () => {})
      }

      await this.callObject.destroy()
      console.log('✅ Call object destroyed successfully')
    } catch (error) {
      console.error('❌ Error destroying call object:', error)
    } finally {
      this.callObject = null
      this.isDestroying = false
      this.pendingDestroy = false
    }
  }

  public async forceCleanup(): Promise<void> {
    console.log('🚨 DailyInstanceManager: Force cleanup initiated...')
    
    // Set pending destroy flag to prevent new creations during cleanup
    this.pendingDestroy = true
    
    // Wait a bit to let any ongoing operations complete
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Destroy current object if it exists
    if (this.callObject) {
      await this.destroyCallObject()
    }
    
    // Reset pending destroy flag
    this.pendingDestroy = false
    console.log('🚨 Force cleanup completed')
  }

  private async waitForDestruction(): Promise<void> {
    let attempts = 0
    const maxAttempts = 50 // Wait up to 5 seconds (50 * 100ms)
    
    while (this.isDestroying && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
    
    if (attempts >= maxAttempts) {
      console.warn('⚠️  Waited too long for destruction, proceeding anyway')
    }
  }

  public isReady(): boolean {
    return !this.isDestroying && !this.pendingDestroy
  }
}

// Export singleton instance
export const dailyInstanceManager = DailyInstanceManager.getInstance()

// Global cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', async () => {
    try {
      await dailyInstanceManager.destroyCallObject()
    } catch (error) {
      console.error('Error during global cleanup:', error)
    }
  })
}