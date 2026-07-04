import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  RizzCodeContext, 
  NextPhasePlanning, 
  GitIntegrationConfig 
} from '@/lib/git-integration/types'

interface GitIntegrationState {
  // Git Context
  rizzCodeContext: RizzCodeContext | null
  isLoading: boolean
  error: string | null
  
  // Next Phase Planning
  nextPhaseItems: NextPhasePlanning[]
  
  // Configuration
  config: GitIntegrationConfig
  
  // Actions
  initialize: () => Promise<void>
  refreshContext: () => Promise<void>
  updateConfig: (config: Partial<GitIntegrationConfig>) => void
  
  // Next Phase Management
  addNextPhaseItem: (item: Omit<NextPhasePlanning, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateNextPhaseItem: (id: string, updates: Partial<NextPhasePlanning>) => void
  deleteNextPhaseItem: (id: string) => void
  reorderNextPhaseItems: (items: NextPhasePlanning[]) => void
  
  // Error handling
  clearError: () => void
}

const defaultConfig: GitIntegrationConfig = {
  autoRefresh: true,
  refreshInterval: 30000, // 30 seconds
  deepAnalysis: true,
  includeCommitHistory: true,
  maxCommitsToTrack: 50,
  enableRealTime: true
}

export const useGitIntegrationStore = create<GitIntegrationState>()(
  persist(
    (set, get) => ({
      rizzCodeContext: null,
      isLoading: false,
      error: null,
      nextPhaseItems: [],
      config: defaultConfig,

      initialize: async () => {
        // Git context is now handled by API calls in the dashboard
        // This method is kept for compatibility but doesn't do anything
        set({ isLoading: false, error: null })
      },

      refreshContext: async () => {
        // Git context is now handled by API calls in the dashboard
        // This method is kept for compatibility but doesn't do anything
        set({ isLoading: false, error: null })
      },

      updateConfig: (configUpdates) => {
        set((state) => ({
          config: { ...state.config, ...configUpdates }
        }))
      },

      addNextPhaseItem: (item) => {
        const newItem: NextPhasePlanning = {
          ...item,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        set((state) => ({
          nextPhaseItems: [...state.nextPhaseItems, newItem]
        }))
      },

      updateNextPhaseItem: (id, updates) => {
        set((state) => ({
          nextPhaseItems: state.nextPhaseItems.map(item =>
            item.id === id
              ? { ...item, ...updates, updatedAt: new Date() }
              : item
          )
        }))
      },

      deleteNextPhaseItem: (id) => {
        set((state) => ({
          nextPhaseItems: state.nextPhaseItems.filter(item => item.id !== id)
        }))
      },

      reorderNextPhaseItems: (items) => {
        set({ nextPhaseItems: items })
      },

      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'git-integration-storage',
      version: 1,
      partialize: (state) => ({
        nextPhaseItems: state.nextPhaseItems,
        config: state.config
      })
    }
  )
)