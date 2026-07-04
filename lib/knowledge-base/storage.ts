// RIZZ Knowledge Base Storage System

import { 
  KnowledgeEntry, 
  KnowledgeType, 
  KnowledgeContext, 
  KnowledgeMetadata,
  KnowledgeRelationship,
  KnowledgeCluster,
  KnowledgeQuery,
  KnowledgeSearchResult,
  KnowledgeGraph,
  KnowledgeUpdate,
  KnowledgeImport,
  KnowledgeExport
} from './types';

export class KnowledgeStorage {
  private entries: Map<string, KnowledgeEntry> = new Map();
  private relationships: Map<string, KnowledgeRelationship> = new Map();
  private clusters: Map<string, KnowledgeCluster> = new Map();
  private index: Map<string, Set<string>> = new Map(); // word -> entryIds
  private tagIndex: Map<string, Set<string>> = new Map(); // tag -> entryIds
  private typeIndex: Map<KnowledgeType, Set<string>> = new Map(); // type -> entryIds

  // Core CRUD Operations
  async createEntry(entry: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<KnowledgeEntry> {
    const id = this.generateId();
    const now = new Date();
    
    const knowledgeEntry: KnowledgeEntry = {
      ...entry,
      id,
      createdAt: now,
      updatedAt: now,
      metadata: {
        confidence: entry.metadata?.confidence ?? 0.8,
        accessCount: 0,
        relatedEntries: [],
        version: 1,
        source: entry.metadata?.source,
        lastAccessed: entry.metadata?.lastAccessed
      }
    };

    this.entries.set(id, knowledgeEntry);
    this.updateIndexes(knowledgeEntry);
    this.updateRelationships(id, entry.tags, entry.context.domain);
    
    return knowledgeEntry;
  }

  async updateEntry(id: string, update: Partial<KnowledgeEntry>): Promise<KnowledgeEntry | null> {
    const existing = this.entries.get(id);
    if (!existing) return null;

    const updatedEntry: KnowledgeEntry = {
      ...existing,
      ...update,
      updatedAt: new Date(),
      metadata: {
        ...existing.metadata,
        ...update.metadata,
        version: (existing.metadata.version || 0) + 1,
        source: update.metadata?.source ?? existing.metadata.source,
        lastAccessed: update.metadata?.lastAccessed ?? existing.metadata.lastAccessed
      },
      context: {
        ...existing.context,
        ...update.context,
        domain: update.context?.domain ?? existing.context.domain
      }
    };

    this.entries.set(id, updatedEntry);
    this.rebuildIndexes();
    
    return updatedEntry;
  }

  async deleteEntry(id: string): Promise<boolean> {
    const existing = this.entries.get(id);
    if (!existing) return false;

    this.entries.delete(id);
    this.removeFromIndexes(existing);
    this.removeRelationships(id);
    
    return true;
  }

  async getEntry(id: string): Promise<KnowledgeEntry | null> {
    const entry = this.entries.get(id);
    if (entry) {
      this.updateAccessStats(id);
    }
    return entry || null;
  }

  // Search and Retrieval
  async search(query: KnowledgeQuery): Promise<KnowledgeSearchResult> {
    const candidates = this.findCandidates(query);
    const scored = this.scoreEntries(candidates, query.text);
    const filtered = this.applyFilters(scored, query.filters || {});
    const sorted = this.sortByScore(filtered);
    const limited = this.applyLimit(sorted, query.limit || 50);
    const thresholded = this.applyThreshold(limited, query.threshold || 0.1);

    return {
      entries: thresholded.map(item => item.entry),
      total: thresholded.length,
      query: query.text,
      filters: query.filters
    };
  }

  async getByType(type: KnowledgeType): Promise<KnowledgeEntry[]> {
    const entryIds = this.typeIndex.get(type) || new Set();
    return Array.from(entryIds).map(id => this.entries.get(id)!).filter(Boolean);
  }

  async getByTags(tags: string[]): Promise<KnowledgeEntry[]> {
    const allEntryIds = new Set<string>();
    tags.forEach(tag => {
      const entryIds = this.tagIndex.get(tag.toLowerCase()) || new Set();
      entryIds.forEach(id => allEntryIds.add(id));
    });
    
    return Array.from(allEntryIds).map(id => this.entries.get(id)!).filter(Boolean);
  }

  // Knowledge Graph Operations
  async addRelationship(relationship: KnowledgeRelationship): Promise<void> {
    const key = `${relationship.from}-${relationship.to}`;
    this.relationships.set(key, relationship);
  }

  async getRelationships(entryId: string): Promise<KnowledgeRelationship[]> {
    return Array.from(this.relationships.values()).filter(
      r => r.from === entryId || r.to === entryId
    );
  }

  async getRelatedEntries(entryId: string, limit: number = 10): Promise<KnowledgeEntry[]> {
    const relationships = await this.getRelationships(entryId);
    const relatedIds = relationships
      .sort((a, b) => b.strength - a.strength)
      .slice(0, limit)
      .map(r => r.from === entryId ? r.to : r.from);

    return relatedIds.map(id => this.entries.get(id)!).filter(Boolean);
  }

  // Clustering Operations
  async createCluster(cluster: KnowledgeCluster): Promise<KnowledgeCluster> {
    this.clusters.set(cluster.id, cluster);
    return cluster;
  }

  async getClusters(): Promise<KnowledgeCluster[]> {
    return Array.from(this.clusters.values());
  }

  async findClustersByEntry(entryId: string): Promise<KnowledgeCluster[]> {
    return Array.from(this.clusters.values()).filter(
      cluster => cluster.entries.includes(entryId)
    );
  }

  // Statistics and Analytics
  async getStats(): Promise<{
    totalEntries: number;
    byType: Record<KnowledgeType, number>;
    byDomain: Record<string, number>;
    lastUpdated: Date;
    averageConfidence: number;
    clusters: number;
  }> {
    const byType: Record<KnowledgeType, number> = {
      persona: 0, project: 0, strategy: 0, insight: 0,
      resource: 0, memory: 0, context: 0, skill: 0, video: 0
    };
    
    const byDomain: Record<string, number> = {};
    let totalConfidence = 0;
    let lastUpdated = new Date(0);

    this.entries.forEach(entry => {
      byType[entry.type]++;
      entry.context.domain.forEach(domain => {
        byDomain[domain] = (byDomain[domain] || 0) + 1;
      });
      totalConfidence += entry.metadata.confidence;
      if (entry.updatedAt > lastUpdated) {
        lastUpdated = entry.updatedAt;
      }
    });

    return {
      totalEntries: this.entries.size,
      byType,
      byDomain,
      lastUpdated,
      averageConfidence: this.entries.size > 0 ? totalConfidence / this.entries.size : 0,
      clusters: this.clusters.size
    };
  }

  // Import/Export
  async importData(importData: KnowledgeImport): Promise<{ imported: number; failed: number }> {
    try {
      const entries = this.parseImportData(importData);
      let imported = 0;
      let failed = 0;

      for (const entry of entries) {
        try {
          await this.createEntry(entry);
          imported++;
        } catch (error) {
          failed++;
        }
      }

      return { imported, failed };
    } catch (error) {
      return { imported: 0, failed: 0 };
    }
  }

  async exportData(exportConfig: KnowledgeExport): Promise<string> {
    const data = {
      entries: exportConfig.entries,
      relationships: exportConfig.includeRelationships ? Array.from(this.relationships.values()) : [],
      clusters: exportConfig.includeClusters ? Array.from(this.clusters.values()) : []
    };

    switch (exportConfig.format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'markdown':
        return this.convertToMarkdown(data);
      case 'csv':
        return this.convertToCSV(data);
      default:
        throw new Error(`Unsupported export format: ${exportConfig.format}`);
    }
  }

  // Private Methods
  private generateId(): string {
    return `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private updateIndexes(entry: KnowledgeEntry): void {
    // Update word index
    const words = this.extractWords(entry.title + ' ' + entry.content);
    words.forEach(word => {
      if (!this.index.has(word)) {
        this.index.set(word, new Set());
      }
      this.index.get(word)!.add(entry.id);
    });

    // Update tag index
    entry.tags.forEach(tag => {
      const lowerTag = tag.toLowerCase();
      if (!this.tagIndex.has(lowerTag)) {
        this.tagIndex.set(lowerTag, new Set());
      }
      this.tagIndex.get(lowerTag)!.add(entry.id);
    });

    // Update type index
    if (!this.typeIndex.has(entry.type)) {
      this.typeIndex.set(entry.type, new Set());
    }
    this.typeIndex.get(entry.type)!.add(entry.id);
  }

  private removeFromIndexes(entry: KnowledgeEntry): void {
    // Remove from word index
    const words = this.extractWords(entry.title + ' ' + entry.content);
    words.forEach(word => {
      const entryIds = this.index.get(word);
      if (entryIds) {
        entryIds.delete(entry.id);
        if (entryIds.size === 0) {
          this.index.delete(word);
        }
      }
    });

    // Remove from tag index
    entry.tags.forEach(tag => {
      const lowerTag = tag.toLowerCase();
      const entryIds = this.tagIndex.get(lowerTag);
      if (entryIds) {
        entryIds.delete(entry.id);
        if (entryIds.size === 0) {
          this.tagIndex.delete(lowerTag);
        }
      }
    });

    // Remove from type index
    const entryIds = this.typeIndex.get(entry.type);
    if (entryIds) {
      entryIds.delete(entry.id);
      if (entryIds.size === 0) {
        this.typeIndex.delete(entry.type);
      }
    }
  }

  private rebuildIndexes(): void {
    this.index.clear();
    this.tagIndex.clear();
    this.typeIndex.clear();
    
    this.entries.forEach(entry => {
      this.updateIndexes(entry);
    });
  }

  private updateRelationships(id: string, tags: string[], domains: string[]): void {
    // Create relationships based on shared tags and domains
    const allRelated = new Set<string>();
    
    tags.forEach(tag => {
      const related = this.tagIndex.get(tag.toLowerCase()) || new Set();
      related.forEach(relatedId => {
        if (relatedId !== id) allRelated.add(relatedId);
      });
    });

    domains.forEach(domain => {
      this.entries.forEach(entry => {
        if (entry.id !== id && entry.context.domain.includes(domain)) {
          allRelated.add(entry.id);
        }
      });
    });

    allRelated.forEach(relatedId => {
      const relationship: KnowledgeRelationship = {
        from: id,
        to: relatedId,
        type: 'related',
        strength: 0.5,
        context: [...tags, ...domains]
      };
      this.addRelationship(relationship);
    });
  }

  private removeRelationships(id: string): void {
    const toDelete: string[] = [];
    this.relationships.forEach((rel, key) => {
      if (rel.from === id || rel.to === id) {
        toDelete.push(key);
      }
    });
    toDelete.forEach(key => this.relationships.delete(key));
  }

  private findCandidates(query: KnowledgeQuery): KnowledgeEntry[] {
    if (!query.text) {
      return Array.from(this.entries.values());
    }

    const words = this.extractWords(query.text);
    const candidateIds = new Set<string>();

    words.forEach(word => {
      const entryIds = this.index.get(word);
      if (entryIds) {
        entryIds.forEach(id => candidateIds.add(id));
      }
    });

    return Array.from(candidateIds).map(id => this.entries.get(id)!);
  }

  private scoreEntries(entries: KnowledgeEntry[], query: string): Array<{ entry: KnowledgeEntry; score: number }> {
    return entries.map(entry => {
      const titleScore = this.calculateSimilarity(entry.title, query);
      const contentScore = this.calculateSimilarity(entry.content, query);
      const tagScore = this.calculateTagSimilarity(entry.tags, query);
      
      const finalScore = (titleScore * 0.4) + (contentScore * 0.3) + (tagScore * 0.3);
      
      return {
        entry,
        score: finalScore * entry.metadata.confidence
      };
    });
  }

  private applyFilters(entries: Array<{ entry: KnowledgeEntry; score: number }>, filters: KnowledgeQuery['filters']): Array<{ entry: KnowledgeEntry; score: number }> {
    return entries.filter(({ entry }) => {
      if (filters?.types && !filters.types.includes(entry.type)) {
        return false;
      }
      if (filters?.tags) {
        const hasTag = filters.tags.some(tag => entry.tags.includes(tag));
        if (!hasTag) return false;
      }
      if (filters?.domains) {
        const hasDomain = filters.domains.some(domain => entry.context.domain.includes(domain));
        if (!hasDomain) return false;
      }
      if (filters?.dateRange) {
        const created = entry.createdAt;
        if (filters.dateRange.from && created < filters.dateRange.from) return false;
        if (filters.dateRange.to && created > filters.dateRange.to) return false;
      }
      return true;
    });
  }

  private sortByScore(entries: Array<{ entry: KnowledgeEntry; score: number }>): Array<{ entry: KnowledgeEntry; score: number }> {
    return entries.sort((a, b) => b.score - a.score);
  }

  private applyLimit(entries: Array<{ entry: KnowledgeEntry; score: number }>, limit: number): Array<{ entry: KnowledgeEntry; score: number }> {
    return entries.slice(0, limit);
  }

  private applyThreshold(entries: Array<{ entry: KnowledgeEntry; score: number }>, threshold: number): Array<{ entry: KnowledgeEntry; score: number }> {
    return entries.filter(({ score }) => score >= threshold);
  }

  private updateAccessStats(id: string): void {
    const entry = this.entries.get(id);
    if (entry) {
      entry.metadata.lastAccessed = new Date();
      entry.metadata.accessCount++;
      this.entries.set(id, entry);
    }
  }

  private extractWords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !this.stopWords.has(word));
  }

  private calculateSimilarity(text1: string, text2: string): number {
    // Simple Jaccard similarity for now
    const words1 = new Set(this.extractWords(text1));
    const words2 = new Set(this.extractWords(text2));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  private calculateTagSimilarity(tags: string[], query: string): number {
    const queryWords = new Set(this.extractWords(query));
    const tagWords = new Set(tags.map(tag => tag.toLowerCase()));
    
    const matches = [...tagWords].filter(word => queryWords.has(word));
    return matches.length / Math.max(tags.length, 1);
  }

  private parseImportData(importData: KnowledgeImport): Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'>[] {
    switch (importData.format) {
      case 'json':
        return JSON.parse(importData.content);
      case 'markdown':
        return this.parseMarkdown(importData.content);
      case 'csv':
        return this.parseCSV(importData.content);
      default:
        throw new Error(`Unsupported import format: ${importData.format}`);
    }
  }

  private parseMarkdown(content: string): Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'>[] {
    // Simple markdown parser - extract headings as titles, content as body
    const entries: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'>[] = [];
    const sections = content.split(/^##\s+/m);
    
    sections.forEach((section, index) => {
      if (index === 0) {
        // First section might not have a heading
        if (section.trim()) {
          entries.push({
            type: 'insight',
            title: 'Imported Content',
            content: section.trim(),
            metadata: { confidence: 0.8, accessCount: 0, relatedEntries: [], version: 1 },
            tags: ['imported'],
            context: { domain: ['general'], relevance: 0.5 }
          });
        }
      } else {
        const lines = section.split('\n');
        const title = lines[0].trim();
        const content = lines.slice(1).join('\n').trim();
        
        entries.push({
          type: 'insight',
          title,
          content,
          metadata: { confidence: 0.8, accessCount: 0, relatedEntries: [], version: 1 },
          tags: ['imported'],
          context: { domain: ['general'], relevance: 0.5 }
        });
      }
    });

    return entries;
  }

  private parseCSV(content: string): Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'>[] {
    // Simple CSV parser
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const entries: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const entry: any = {};
      
      headers.forEach((header, index) => {
        entry[header] = values[index] || '';
      });

      entries.push({
        type: (entry.type as KnowledgeType) || 'insight',
        title: entry.title || 'Untitled',
        content: entry.content || '',
        metadata: { 
          confidence: parseFloat(entry.confidence) || 0.8, 
          accessCount: 0, 
          relatedEntries: [], 
          version: 1 
        },
        tags: entry.tags ? entry.tags.split(';') : [],
        context: { 
          domain: entry.domain ? entry.domain.split(';') : ['general'], 
          relevance: parseFloat(entry.relevance) || 0.5 
        }
      });
    }

    return entries;
  }

  private convertToMarkdown(data: any): string {
    let markdown = '# Knowledge Base Export\n\n';
    
    data.entries.forEach((entry: KnowledgeEntry) => {
      markdown += `## ${entry.title}\n\n`;
      markdown += `**Type:** ${entry.type}\n`;
      markdown += `**Tags:** ${entry.tags.join(', ')}\n`;
      markdown += `**Domain:** ${entry.context.domain.join(', ')}\n`;
      markdown += `**Confidence:** ${entry.metadata.confidence}\n\n`;
      markdown += `${entry.content}\n\n`;
      markdown += `---\n\n`;
    });

    return markdown;
  }

  private convertToCSV(data: any): string {
    const headers = ['id', 'type', 'title', 'content', 'tags', 'domain', 'confidence', 'createdAt', 'updatedAt'];
    let csv = headers.join(',') + '\n';
    
    data.entries.forEach((entry: KnowledgeEntry) => {
      const row = [
        entry.id,
        entry.type,
        `"${entry.title.replace(/"/g, '""')}"`,
        `"${entry.content.replace(/"/g, '""')}"`,
        `"${entry.tags.join(';')}"`,
        `"${entry.context.domain.join(';')}"`,
        entry.metadata.confidence,
        entry.createdAt.toISOString(),
        entry.updatedAt.toISOString()
      ];
      csv += row.join(',') + '\n';
    });

    return csv;
  }

  private stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must', 'shall'
  ]);
}