import { watch } from 'chokidar'
import * as fs from 'fs'
import * as path from 'path'
import { GitMonitor } from './server/monitor'
import type { ProjectContext } from '@/lib/git-integration/types'
import { useGitIntegrationStore } from '@/stores/gitIntegrationStore'

export interface ProjectChange {
  type: 'file_created' | 'file_modified' | 'file_deleted' | 'dependency_changed'
  file: string
  timestamp: Date
  details?: any
}

export class ProjectContextTracker {
  private monitor: GitMonitor
  private watcher: any
  private isTracking: boolean = false
  private trackedFiles: Set<string> = new Set()

  constructor(projectPath: string = process.cwd()) {
    this.monitor = new GitMonitor({
      autoRefresh: true,
      refreshInterval: 30000,
      deepAnalysis: true,
      includeCommitHistory: true,
      maxCommitsToTrack: 50,
      enableRealTime: true
    }, projectPath)
  }

  async startTracking(): Promise<void> {
    if (this.isTracking) return

    this.isTracking = true
    
    // Set up file system watcher
    this.watcher = watch(this.monitor.projectPath, {
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
        '**/*.log',
        '**/.DS_Store'
      ],
      persistent: true,
      ignoreInitial: true
    })

    this.watcher
      .on('add', (filePath: string) => this.handleFileChange('file_created', filePath))
      .on('change', (filePath: string) => this.handleFileChange('file_modified', filePath))
      .on('unlink', (filePath: string) => this.handleFileChange('file_deleted', filePath))
      .on('error', (error: Error) => console.error('Watcher error:', error))

    // Track package.json changes
    const packageJsonPath = path.join(this.monitor.projectPath, 'package.json')
    if (fs.existsSync(packageJsonPath)) {
      this.trackedFiles.add(packageJsonPath)
    }

    // Initial context update
    await this.updateProjectContext()
    
    // Set up periodic updates
    setInterval(() => this.updateProjectContext(), 60000) // Every minute
  }

  stopTracking(): void {
    if (this.watcher) {
      this.watcher.close()
      this.watcher = null
    }
    this.isTracking = false
  }

  private async handleFileChange(type: ProjectChange['type'], filePath: string): Promise<void> {
    const change: ProjectChange = {
      type,
      file: filePath,
      timestamp: new Date()
    }

    // Update store with the change
    const store = useGitIntegrationStore.getState()
    const currentContext = store.rizzCodeContext
    
    if (currentContext) {
      // Update the context with the latest information
      try {
        const updatedContext = await this.monitor.getRizzCodeContext()
        store.rizzCodeContext = updatedContext
      } catch (error) {
        console.error('Error updating project context:', error)
      }
    }
  }

  private async updateProjectContext(): Promise<void> {
    try {
      const context = await this.monitor.getProjectContext()
      const store = useGitIntegrationStore.getState()
      
      if (store.rizzCodeContext) {
        store.rizzCodeContext.project = context
        store.rizzCodeContext.lastUpdated = new Date()
      }
    } catch (error) {
      console.error('Error updating project context:', error)
    }
  }

  async getProjectInsights(): Promise<{
    activeFiles: string[]
    recentChanges: ProjectChange[]
    dependencyHealth: 'up_to_date' | 'outdated' | 'vulnerable'
    codeQuality: number
  }> {
    const activeFiles: string[] = []
    const recentChanges: ProjectChange[] = []
    
    // Get recent git status
    try {
      const gitStatus = await this.monitor.getGitStatus()
      activeFiles.push(...gitStatus.staged)
      activeFiles.push(...gitStatus.modified)
      activeFiles.push(...gitStatus.untracked)
    } catch (error) {
      console.error('Error getting git status:', error)
    }

    // Check dependency health
    const dependencyHealth = await this.checkDependencyHealth()

    // Calculate code quality (simplified for now)
    const codeQuality = this.calculateCodeQuality()

    return {
      activeFiles,
      recentChanges,
      dependencyHealth,
      codeQuality
    }
  }

  private async checkDependencyHealth(): Promise<'up_to_date' | 'outdated' | 'vulnerable'> {
    try {
      const packageJsonPath = path.join(this.monitor.projectPath, 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      
      // Simple check - in a real implementation, you'd use npm audit or similar
      const hasOutdated = Object.values(packageJson.dependencies || {}).some((version: any) => 
        version.includes('^0.') || version.includes('~0.')
      )
      
      return hasOutdated ? 'outdated' : 'up_to_date'
    } catch {
      return 'up_to_date'
    }
  }

  private calculateCodeQuality(): number {
    // Simplified code quality calculation
    // In a real implementation, you'd integrate with ESLint, TypeScript compiler, etc.
    return 85 // Placeholder
  }

  async getRecentCommits(limit: number = 10): Promise<any[]> {
    try {
      // This would need to be implemented in the GitMonitor
      // For now, return empty array
      return []
    } catch {
      return []
    }
  }
}