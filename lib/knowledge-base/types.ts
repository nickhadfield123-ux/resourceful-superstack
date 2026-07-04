// RIZZ Knowledge Base Types

export interface KnowledgeEntry {
  id: string;
  type: KnowledgeType;
  title: string;
  content: string;
  metadata: KnowledgeMetadata;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  context: KnowledgeContext;
}

export type KnowledgeType = 
  | 'persona'
  | 'project'
  | 'strategy'
  | 'insight'
  | 'resource'
  | 'memory'
  | 'context'
  | 'skill'
  | 'video';

export interface KnowledgeMetadata {
  source?: string;
  confidence: number;
  lastAccessed?: Date;
  accessCount: number;
  relatedEntries: string[];
  version: number;
}

export interface KnowledgeContext {
  domain: string[];
  relevance: number;
  temporal?: {
    validFrom?: Date;
    validUntil?: Date;
    lastUpdated: Date;
  };
  spatial?: {
    location?: string;
    coordinates?: [number, number];
  };
}

export interface KnowledgeQuery {
  text: string;
  filters?: {
    types?: KnowledgeType[];
    tags?: string[];
    domains?: string[];
    dateRange?: {
      from?: Date;
      to?: Date;
    };
  };
  limit?: number;
  threshold?: number; // Minimum relevance score
}

export interface KnowledgeSearchResult {
  entries: KnowledgeEntry[];
  total: number;
  query: string;
  filters: KnowledgeQuery['filters'];
}

export interface KnowledgeGraph {
  nodes: Map<string, KnowledgeEntry>;
  edges: Map<string, KnowledgeRelationship>;
  clusters: KnowledgeCluster[];
}

export interface KnowledgeRelationship {
  from: string;
  to: string;
  type: 'related' | 'derived' | 'contradicts' | 'supports';
  strength: number;
  context: string[];
}

export interface KnowledgeCluster {
  id: string;
  name: string;
  entries: string[];
  centroid: string;
  tags: string[];
  coherence: number;
}

export interface KnowledgeUpdate {
  entryId: string;
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
  reason?: string;
  author?: string;
}

export interface KnowledgeVersion {
  id: string;
  entryId: string;
  versionNumber: number;
  timestamp: Date;
  reason: string;
  author: string;
  content: string;
  metadata: KnowledgeMetadata;
  context: KnowledgeContext;
  changes: KnowledgeChange[];
  checksum: string;
}

export interface KnowledgeChange {
  type: 'creation' | 'modification' | 'deletion' | 'conflict';
  field: string;
  oldValue: any;
  newValue: any;
  confidence: number;
  timestamp: Date;
}

export interface KnowledgeAudit {
  id: string;
  entryId: string;
  timestamp: Date;
  action: string;
  details: any;
  performedBy: string;
}

export interface KnowledgeMigration {
  source: KnowledgeImport;
  target: KnowledgeExport;
  transformations: any[];
}

export interface KnowledgeStats {
  totalEntries: number;
  byType: Record<KnowledgeType, number>;
  byDomain: Record<string, number>;
  lastUpdated: Date;
  averageConfidence: number;
  clusters: number;
}

export interface KnowledgeImport {
  source: string;
  format: 'markdown' | 'json' | 'csv' | 'pdf';
  content: string;
  metadata?: Partial<KnowledgeEntry>;
}

export interface KnowledgeExport {
  format: 'json' | 'markdown' | 'csv';
  entries: KnowledgeEntry[];
  includeRelationships: boolean;
  includeClusters: boolean;
}