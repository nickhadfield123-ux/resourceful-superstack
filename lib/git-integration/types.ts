// RIZZ Code Integration Types

export interface GitRepository {
  name: string;
  url: string;
  path: string;
  isPrivate: boolean;
  defaultBranch: string;
}

export interface GitCommit {
  hash: string;
  shortHash: string;
  message: string;
  author: {
    name: string;
    email: string;
  };
  date: Date;
  parents: string[];
}

export interface GitBranch {
  name: string;
  isCurrent: boolean;
  isRemote: boolean;
  commit: string;
  ahead: number;
  behind: number;
}

export interface GitStatus {
  workingTree: 'clean' | 'modified' | 'untracked';
  staged: string[];
  modified: string[];
  untracked: string[];
  deleted: string[];
  renamed: Array<{ from: string; to: string }>;
}

export interface GitDiff {
  file: string;
  additions: number;
  deletions: number;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  hunks: GitHunk[];
}

export interface GitHunk {
  header: string;
  lines: GitLine[];
}

export interface GitLine {
  type: 'addition' | 'deletion' | 'context';
  content: string;
  lineNumber: number;
}

export interface GitRemote {
  name: string;
  url: string;
  fetch: string;
  push: string;
}

export interface ProjectContext {
  name: string;
  version: string;
  description: string;
  stack: string[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  lastUpdated: Date;
  architecture: {
    framework: string;
    language: string;
    database?: string;
    hosting?: string;
  };
}

export interface NextPhasePlanning {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'planned' | 'in_progress' | 'completed';
  estimatedHours?: number;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  relatedFeatures: string[];
  blockers: string[];
}

export interface RizzCodeContext {
  repository: GitRepository;
  currentBranch: GitBranch;
  latestCommit: GitCommit;
  status: GitStatus;
  project: ProjectContext;
  nextPhase: NextPhasePlanning[];
  health: {
    codeQuality: number; // 0-100
    testCoverage: number; // 0-100
    dependencies: 'up_to_date' | 'outdated' | 'vulnerable';
    lastAnalysis: Date;
  };
  lastUpdated: Date;
}

export interface GitIntegrationConfig {
  autoRefresh: boolean;
  refreshInterval: number; // milliseconds
  deepAnalysis: boolean;
  includeCommitHistory: boolean;
  maxCommitsToTrack: number;
  enableRealTime: boolean;
}