import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CostTrackingState {
  // Anthropic API usage tracking
  anthropicUsage: {
    totalCost: number
    requestCount: number
    lastReset: Date | null
  }
  
  // Add cost to tracking
  addAnthropicCost: (cost: number) => void
  
  // Reset tracking
  resetAnthropicTracking: () => void
  
  // Check if budget is approaching limit
  isBudgetLow: () => boolean
  
  // Get budget status
  getBudgetStatus: () => {
    totalCost: number
    remainingBudget: number
    percentageUsed: number
    isLow: boolean
  }
}

export const useCostTracking = create<CostTrackingState>()(
  persist(
    (set, get) => ({
      anthropicUsage: {
        totalCost: 0,
        requestCount: 0,
        lastReset: new Date()
      },

      addAnthropicCost: (cost: number) => {
        const current = get().anthropicUsage
        set({
          anthropicUsage: {
            totalCost: current.totalCost + cost,
            requestCount: current.requestCount + 1,
            lastReset: current.lastReset
          }
        })
      },

      resetAnthropicTracking: () => {
        set({
          anthropicUsage: {
            totalCost: 0,
            requestCount: 0,
            lastReset: new Date()
          }
        })
      },

      isBudgetLow: () => {
        const { totalCost } = get().anthropicUsage
        // Alert when approaching $4.50 of the $5 budget
        return totalCost >= 4.5
      },

      getBudgetStatus: () => {
        const { totalCost, requestCount } = get().anthropicUsage
        const budgetLimit = 5.0
        const remainingBudget = Math.max(0, budgetLimit - totalCost)
        const percentageUsed = (totalCost / budgetLimit) * 100
        
        return {
          totalCost,
          remainingBudget,
          percentageUsed,
          isLow: totalCost >= 4.5
        }
      }
    }),
    {
      name: 'cost-tracking-storage',
      version: 1,
    }
  )
)

// Helper function to estimate cost based on analysis type
export const estimateAnthropicCost = (analysisType: string): number => {
  // Rough cost estimates per request
  const costMap: Record<string, number> = {
    'design': 0.005,      // ~$0.005 per design analysis
    'technical': 0.005,   // ~$0.005 per technical analysis  
    'video': 0.008,       // ~$0.008 per video analysis (more complex)
    'general': 0.004,     // ~$0.004 per general analysis
  }
  
  return costMap[analysisType] || 0.004
}

// Helper to format cost display
export const formatCost = (cost: number): string => {
  return `$${cost.toFixed(3)}`
}

// Helper to format budget status
export const formatBudgetStatus = (status: {
  totalCost: number
  remainingBudget: number
  percentageUsed: number
  isLow: boolean
}) => {
  return {
    ...status,
    totalCostFormatted: formatCost(status.totalCost),
    remainingBudgetFormatted: formatCost(status.remainingBudget),
    percentageUsedFormatted: `${status.percentageUsed.toFixed(1)}%`
  }
}
