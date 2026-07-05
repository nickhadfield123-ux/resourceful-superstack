import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import { 
  GitRepository, 
  GitCommit, 
  GitBranch, 
  GitStatus, 
  GitDiff, 
  GitRemote, 
  ProjectContext, 
  RizzCodeContext,
  GitIntegrationConfig 
} from '@/lib/git-integration/types'

export class GitMonitor {
  private config: GitIntegrationConfig
  public projectPath: string

  constructor(config: GitIntegrationConfig, projectPath: string = process.cwd()) {
    this.config = config
    this.projectPath = projectPath
  }

  async getRepositoryInfo(): Promise<GitRepository> {
    try {
      const name = this.getRepoName()
      const url = this.getRemoteUrl()
      const isPrivate = await this.checkIfPrivate(url)
      const defaultBranch = this.getDefaultBranch()

      return {
        name,
        url,
        path: this.projectPath,
        isPrivate,
        defaultBranch
      }
    } catch (error) {
      console.error('Error getting repository info:', error)
      throw new Error('Failed to get repository information')
    }
  }

  async getCurrentBranch(): Promise<GitBranch> {
    try {
      const currentBranch = this.executeGitCommand('rev-parse --abbrev-ref HEAD').trim()
      const branches = await this.getBranches()
      return branches.find(b => b.name === currentBranch) || branches[0]
    } catch (error) {
      console.error('Error getting current branch:', error)
      throw new Error('Failed to get current branch')
    }
  }

  async getLatestCommit(): Promise<GitCommit> {
    try {
      const commitInfo = this.executeGitCommand(
        'log -1 --pretty=format:"%H|%h|%an|%ae|%ad|%s"'
      ).split('|')

      return {
        hash: commitInfo[0],
        shortHash: commitInfo[1],
        author: {
          name: commitInfo[2],
          email: commitInfo[3]
        },
        date: new Date(commitInfo[4]),
        message: commitInfo[5],
        parents: this.getParentCommits(commitInfo[0])
      }
    } catch (error) {
      console.error('Error getting latest commit:', error)
      throw new Error('Failed to get latest commit')
    }
  }

  async getBranches(): Promise<GitBranch[]> {
    try {
      const localBranches = this.executeGitCommand('branch --format="%(refname:short)|%(objectname)|%(HEAD)"')
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [name, commit, isCurrent] = line.split('|')
          return {
            name,
            isCurrent: isCurrent === '*',
            isRemote: false,
            commit,
            ahead: 0,
            behind: 0
          }
        })

      const remoteBranches = this.executeGitCommand('branch -r --format="%(refname:short)|%(objectname)"')
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [name, commit] = line.split('|')
          return {
            name: name.replace('origin/', ''),
            isCurrent: false,
            isRemote: true,
            commit,
            ahead: 0,
            behind: 0
          }
        })

      return [...localBranches, ...remoteBranches]
    } catch (error) {
      console.error('Error getting branches:', error)
      throw new Error('Failed to get branches')
    }
  }

  async getGitStatus(): Promise<GitStatus> {
    try {
      const statusOutput = this.executeGitCommand('status --porcelain')
      const lines = statusOutput.split('\n').filter(line => line.trim())

      const status: GitStatus = {
        workingTree: 'clean',
        staged: [],
        modified: [],
        untracked: [],
        deleted: [],
        renamed: []
      }

      for (const line of lines) {
        const statusChars = line.substring(0, 2).trim()
        const filePath = line.substring(3)

        if (statusChars.includes('A')) status.staged.push(filePath)
        if (statusChars.includes('M')) status.modified.push(filePath)
        if (statusChars.includes('?')) status.untracked.push(filePath)
        if (statusChars.includes('D')) status.deleted.push(filePath)
        if (statusChars.includes('R')) {
          // Handle renamed files
          const renameMatch = line.match(/R\s+(\S+)\s+(\S+)/)
          if (renameMatch) {
            status.renamed.push({ from: renameMatch[1], to: renameMatch[2] })
          }
        }
      }

      if (status.staged.length > 0 || status.modified.length > 0 || status.untracked.length > 0) {
        status.workingTree = status.untracked.length > 0 ? 'untracked' : 'modified'
      }

      return status
    } catch (error) {
      console.error('Error getting git status:', error)
      throw new Error('Failed to get git status')
    }
  }

  async getProjectContext(): Promise<ProjectContext> {
    try {
      const packageJsonPath = path.join(this.projectPath, 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

      const dependencies = packageJson.dependencies || {}
      const devDependencies = packageJson.devDependencies || {}

      return {
        name: packageJson.name || 'Resourceful Cockpit',
        version: packageJson.version || '1.0.0',
        description: packageJson.description || 'AI-powered developer cockpit',
        stack: this.detectTechStack(packageJson),
        dependencies,
        devDependencies,
        lastUpdated: new Date(),
        architecture: {
          framework: this.detectFramework(packageJson),
          language: 'TypeScript',
          database: this.detectDatabase(packageJson),
          hosting: 'Next.js'
        }
      }
    } catch (error) {
      console.error('Error getting project context:', error)
      throw new Error('Failed to get project context')
    }
  }

  async getRemotes(): Promise<GitRemote[]> {
    try {
      const remotes = this.executeGitCommand('remote -v')
        .split('\n')
        .filter(line => line.includes('(fetch)'))
        .map(line => {
          const [name, url] = line.split('\t')[0].split(' ')
          return { name, url, fetch: url, push: url }
        })

      return remotes
    } catch (error) {
      console.error('Error getting remotes:', error)
      throw new Error('Failed to get remotes')
    }
  }

  async getRizzCodeContext(): Promise<RizzCodeContext> {
    try {
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
        project,
        nextPhase: [], // Will be managed separately
        health: {
          codeQuality: 85, // Placeholder - would need actual analysis
          testCoverage: 0, // Placeholder - would need test runner integration
          dependencies: 'up_to_date', // Placeholder - would need npm audit
          lastAnalysis: new Date()
        },
        lastUpdated: new Date()
      }
    } catch (error) {
      console.error('Error getting RIZZ code context:', error)
      throw new Error('Failed to get RIZZ code context')
    }
  }

  private executeGitCommand(command: string): string {
    try {
      return execSync(`git ${command}`, { 
        cwd: this.projectPath, 
        encoding: 'utf8' 
      }).trim()
    } catch (error) {
      throw new Error(`Git command failed: ${command}`)
    }
  }

  private getRepoName(): string {
    return path.basename(this.projectPath)
  }

  private getRemoteUrl(): string {
    try {
      return this.executeGitCommand('remote get-url origin')
    } catch {
      return 'No remote configured'
    }
  }

  private async checkIfPrivate(url: string): Promise<boolean> {
    // Simple heuristic - if it's GitHub and contains the username, likely private
    if (url.includes('github.com') && url.includes('nickhadfield123-ux')) {
      return true
    }
    return false
  }

  private getDefaultBranch(): string {
    try {
      return this.executeGitCommand('rev-parse --abbrev-ref HEAD')
    } catch {
      return 'main'
    }
  }

  private getParentCommits(hash: string): string[] {
    try {
      const parents = this.executeGitCommand(`log -1 --pretty=format:"%P" ${hash}`)
      return parents ? parents.split(' ') : []
    } catch {
      return []
    }
  }

  private detectTechStack(packageJson: any): string[] {
    const stack: string[] = []
    
    if (packageJson.dependencies?.next) stack.push('Next.js')
    if (packageJson.dependencies?.react) stack.push('React')
    if (packageJson.dependencies?.typescript) stack.push('TypeScript')
    if (packageJson.dependencies?.tailwindcss) stack.push('Tailwind CSS')
    if (packageJson.dependencies?.zustand) stack.push('Zustand')
    if (packageJson.dependencies?.lucide) stack.push('Lucide Icons')
    
    return stack
  }

  private detectFramework(packageJson: any): string {
    if (packageJson.dependencies?.next) return 'Next.js'
    if (packageJson.dependencies?.react) return 'React'
    if (packageJson.dependencies?.vue) return 'Vue.js'
    if (packageJson.dependencies?.angular) return 'Angular'
    return 'Unknown'
  }

  private detectDatabase(packageJson: any): string | undefined {
    if (packageJson.dependencies?.prisma) return 'Prisma'
    if (packageJson.dependencies?.mongoose) return 'MongoDB'
    if (packageJson.dependencies?.pg) return 'PostgreSQL'
    if (packageJson.dependencies?.sqlite3) return 'SQLite'
    return undefined
  }
}