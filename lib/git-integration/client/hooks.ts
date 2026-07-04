import { useState, useEffect } from 'react'
import { 
  GitRepository, 
  GitCommit, 
  GitBranch, 
  GitStatus, 
  ProjectContext, 
  RizzCodeContext 
} from '../types'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export function useGitStatus() {
  const [status, setStatus] = useState<GitStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/git/status')
      const result: ApiResponse<GitStatus> = await response.json()

      if (result.success) {
        setStatus(result.data!)
        setError(null)
      } else {
        setError(result.error || 'Failed to fetch git status')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchStatus, 30000) // Every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  return { status, loading, error, refresh: fetchStatus }
}

export function useGitRepository() {
  const [repository, setRepository] = useState<GitRepository | null>(null)
  const [currentBranch, setCurrentBranch] = useState<GitBranch | null>(null)
  const [latestCommit, setLatestCommit] = useState<GitCommit | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRepository = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/git/repository')
      const result: ApiResponse<{
        repository: GitRepository
        currentBranch: GitBranch
        latestCommit: GitCommit
      }> = await response.json()

      if (result.success) {
        setRepository(result.data!.repository)
        setCurrentBranch(result.data!.currentBranch)
        setLatestCommit(result.data!.latestCommit)
        setError(null)
      } else {
        setError(result.error || 'Failed to fetch repository info')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRepository()
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchRepository, 30000) // Every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  return { 
    repository, 
    currentBranch, 
    latestCommit, 
    loading, 
    error, 
    refresh: fetchRepository 
  }
}

export function useGitProject() {
  const [project, setProject] = useState<ProjectContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProject = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/git/project')
      const result: ApiResponse<ProjectContext> = await response.json()

      if (result.success) {
        setProject(result.data!)
        setError(null)
      } else {
        setError(result.error || 'Failed to fetch project context')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProject()
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchProject, 60000) // Every minute
    
    return () => clearInterval(interval)
  }, [])

  return { project, loading, error, refresh: fetchProject }
}

export function useRizzCodeContext() {
  const [rizzCodeContext, setRizzCodeContext] = useState<RizzCodeContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRizzCodeContext = async () => {
    try {
      setLoading(true)
      
      // Fetch all data in parallel
      const [statusResponse, repositoryResponse, projectResponse] = await Promise.all([
        fetch('/api/git/status'),
        fetch('/api/git/repository'),
        fetch('/api/git/project')
      ])

      const statusResult: ApiResponse<GitStatus> = await statusResponse.json()
      const repositoryResult: ApiResponse<{
        repository: GitRepository
        currentBranch: GitBranch
        latestCommit: GitCommit
      }> = await repositoryResponse.json()
      const projectResult: ApiResponse<ProjectContext> = await projectResponse.json()

      if (statusResult.success && repositoryResult.success && projectResult.success) {
        const context: RizzCodeContext = {
          repository: repositoryResult.data!.repository,
          currentBranch: repositoryResult.data!.currentBranch,
          latestCommit: repositoryResult.data!.latestCommit,
          status: statusResult.data!,
          project: projectResult.data!,
          nextPhase: [], // Will be managed separately
          health: {
            codeQuality: 85, // Placeholder
            testCoverage: 0, // Placeholder
            dependencies: 'up_to_date', // Placeholder
            lastAnalysis: new Date()
          },
          lastUpdated: new Date()
        }
        
        setRizzCodeContext(context)
        setError(null)
      } else {
        const errors = [
          statusResult.error,
          repositoryResult.error,
          projectResult.error
        ].filter(Boolean)
        
        setError(errors.join('; ') || 'Failed to fetch git context')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRizzCodeContext()
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchRizzCodeContext, 30000) // Every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  return { rizzCodeContext, loading, error, refresh: fetchRizzCodeContext }
}