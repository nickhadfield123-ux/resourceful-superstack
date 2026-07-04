import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PromptModule {
  id: string
  name: string
  content: string
  isActive: boolean
  lastModified: Date
}

export interface KnowledgeEntry {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  priority: 'high' | 'medium' | 'low'
  lastModified: Date
}

interface IntelligenceState {
  // Prompt Management
  prompts: PromptModule[]
  addPrompt: (prompt: Omit<PromptModule, 'id' | 'lastModified'>) => void
  updatePrompt: (id: string, updates: Partial<PromptModule>) => void
  deletePrompt: (id: string) => void
  togglePrompt: (id: string) => void

  // Knowledge Base Management
  knowledgeEntries: KnowledgeEntry[]
  addKnowledgeEntry: (entry: Omit<KnowledgeEntry, 'id' | 'lastModified'>) => void
  updateKnowledgeEntry: (id: string, updates: Partial<KnowledgeEntry>) => void
  deleteKnowledgeEntry: (id: string) => void

  // System Settings
  version: string
  lastBackup: Date | null
  systemHealth: 'healthy' | 'warning' | 'error'
  updateSystemHealth: (status: IntelligenceState['systemHealth']) => void
  createBackup: () => void

  // AI Configuration
  modelPreference: 'ollama' | 'groq' | null
  setModelPreference: (preference: IntelligenceState['modelPreference']) => void
  userId: string | null
  setUserId: (userId: string | null) => void
}

export const useIntelligenceStore = create<IntelligenceState>()(
  persist(
    (set, get) => ({
      // Initial state
      prompts: [
        {
          id: '1',
          name: 'Identity & Personality',
          content: 'You are RIZZ, an AI co-founder with deep understanding of Nick\'s vision and goals. You are supportive, strategic, and focused on building a resourceful life where technology serves human flourishing.',
          isActive: true,
          lastModified: new Date()
        },
        {
          id: '2',
          name: 'Context Modules',
          content: 'Access Nick\'s reality context including family, projects, and personal preferences. Understand his relationships with Alison, Maya, and his professional network.',
          isActive: true,
          lastModified: new Date()
        },
        {
          id: '3',
          name: 'Mode Detection',
          content: 'Detect when to use Vision, Strategy, or Execution modes based on user input and context. Adapt responses accordingly.',
          isActive: true,
          lastModified: new Date()
        }
      ],

      knowledgeEntries: [],

      version: '1.0.0',
      lastBackup: new Date(),
      systemHealth: 'healthy',
      modelPreference: null,
      userId: null,

      // Actions
      addPrompt: (prompt) => set((state) => ({
        prompts: [
          ...state.prompts,
          {
            ...prompt,
            id: Date.now().toString(),
            lastModified: new Date()
          }
        ]
      })),

      updatePrompt: (id, updates) => set((state) => ({
        prompts: state.prompts.map(prompt =>
          prompt.id === id
            ? { ...prompt, ...updates, lastModified: new Date() }
            : prompt
        )
      })),

      deletePrompt: (id) => set((state) => ({
        prompts: state.prompts.filter(prompt => prompt.id !== id)
      })),

      togglePrompt: (id) => set((state) => ({
        prompts: state.prompts.map(prompt =>
          prompt.id === id
            ? { ...prompt, isActive: !prompt.isActive, lastModified: new Date() }
            : prompt
        )
      })),

      addKnowledgeEntry: (entry) => set((state) => ({
        knowledgeEntries: [
          ...state.knowledgeEntries,
          {
            ...entry,
            id: Date.now().toString(),
            lastModified: new Date()
          }
        ]
      })),

      updateKnowledgeEntry: (id, updates) => set((state) => ({
        knowledgeEntries: state.knowledgeEntries.map(entry =>
          entry.id === id
            ? { ...entry, ...updates, lastModified: new Date() }
            : entry
        )
      })),

      deleteKnowledgeEntry: (id) => set((state) => ({
        knowledgeEntries: state.knowledgeEntries.filter(entry => entry.id !== id)
      })),

      updateSystemHealth: (status) => set({ systemHealth: status }),

      createBackup: () => set({ lastBackup: new Date() }),

      setModelPreference: (preference) => set({ modelPreference: preference }),

      setUserId: (userId) => set({ userId })
    }),
    {
      name: 'intelligence-storage',
      version: 1,
    }
  )
)