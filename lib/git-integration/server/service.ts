import { GitMonitor } from './monitor'
import { 
  GitRepository, 
  GitCommit, 
  GitBranch, 
  GitStatus, 
  ProjectContext, 
  RizzCodeContext,
  GitIntegrationConfig 
} from '../types'

export class GitService {
  private monitor: GitMonitor

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

  async getRepositoryInfo(): Promise<GitRepository> {
    return this.monitor.getRepositoryInfo()
  }

  async getCurrentBranch(): Promise<GitBranch> {
    return this.monitor.getCurrentBranch()
  }

  async getLatestCommit(): Promise<GitCommit> {
    return this.monitor.getLatestCommit()
  }

  async getBranches(): Promise<GitBranch[]> {
    return this.monitor.getBranches()
  }

  async getGitStatus(): Promise<GitStatus> {
    return this.monitor.getGitStatus()
  }

  async getProjectContext(): Promise<ProjectContext> {
    return this.monitor.getProjectContext()
  }

  async getRizzCodeContext(): Promise<RizzCodeContext> {
    return this.monitor.getRizzCodeContext()
  }

  async getAllData(): Promise<{
    repository: GitRepository
    currentBranch: GitBranch
    latestCommit: GitCommit
    status: GitStatus
    project: ProjectContext
  }> {
    const [repository, currentBranch, latestCommit, status, project] = await Promise.all([
      this.getRepositoryInfo(),
      this.getCurrentBranch(),
      this.getLatestCommit(),
      this.getGitStatus(),
      this.getProjectContext()
    ])

    return {
      repository,
      currentBranch,
      latestCommit,
      status,
      project
    }
  }
}