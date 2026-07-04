"use client"

import * as React from "react"
import { createContext, useContext } from "react"

/**
 * DATA CONTRACT for ViewportProvider
 * 
 * Provides:
 * - context: ContextBundle | null - User's unified context data
 * - loading: boolean - Loading state
 * - error: string | null - Error message if any
 * - refetch: () => Promise<void> - Manual refresh function
 * 
 * ContextBundle Structure:
 * ```
 * {
 *   user: { id: string, email: string | null }
 *   member: {
 *     tier: 'free' | 'pioneer' | 'architect' | 'community' | 'ai-company'
 *     tierStatus: string
 *     role: string
 *     onboardingStage: string
 *     preferences: Record<string, unknown>
 *     profileData: Record<string, unknown>
 *   }
 *   projects: Array<{ id, name, description, status, createdAt }>
 *   permissions: {
 *     canSubmitBuildTasks: boolean
 *     canCreateProjects: boolean
 *     canInviteMembers: boolean
 *   }
 * }
 * ```
 * 
 * API Endpoint: /api/rizz/context
 */

export interface ContextBundle {
  user: {
    id: string
    email: string | null
  }
  member: {
    tier: 'free' | 'pioneer' | 'architect' | 'community' | 'ai-company'
    tierStatus: string
    role: string
    onboardingStage: string
    preferences: Record<string, unknown>
    profileData: Record<string, unknown>
  }
  projects: Array<{
    id: string
    name: string
    description: string | null
    status: string
    createdAt: string
  }>
  permissions: {
    canSubmitBuildTasks: boolean
    canCreateProjects: boolean
    canInviteMembers: boolean
  }
}

interface ViewportContextValue {
  context: ContextBundle | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const ViewportContext = createContext<ViewportContextValue | null>(null)

export function ViewportProvider({ children }: { children: React.ReactNode }) {
  const [context, setContext] = React.useState<ContextBundle | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadContext = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/rizz/context')
      if (!res.ok) throw new Error('Failed to load context')
      const bundle = await res.json()
      setContext(bundle)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadContext()
  }, [loadContext])

  return (
    <ViewportContext.Provider value={{ context, loading, error, refetch: loadContext }}>
      {children}
    </ViewportContext.Provider>
  )
}

export function useViewportContext() {
  const ctx = useContext(ViewportContext)
  if (!ctx) {
    throw new Error('useViewportContext must be used within ViewportProvider')
  }
  return ctx
}