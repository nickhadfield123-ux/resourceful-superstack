import Dexie, { type Table } from 'dexie';

// Data models
export interface MediaEntry {
  id: string;  // UUID
  type: 'voice' | 'image' | 'video';
  
  // Storage (CRITICAL: Store as Blob, not data URL)
  blob: Blob;
  mimeType: string;
  fileSize: number;
  
  // Context (uniform across all types)
  context: {
    title: string;
    description: string;
    tags: string[];
    category: string;
    purpose: string;
  };
  
  // Relationships
  conversationId?: string;
  kbEntryId?: string;
  
  // Metadata
  createdAt: Date;
  
  // AI scaffolding (empty for now)
  analysis?: {
    transcription?: string;      // for voice (future)
    imageDescription?: string;   // for screenshots (future)
    videoSummary?: string;       // for screenshares (future)
    aiTags?: string[];           // AI-generated tags (future)
    sentiment?: string;          // sentiment analysis (future)
  };
}

export interface Conversation {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title?: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    mediaIds?: string[];  // References to MediaEntry IDs
    timestamp: Date;
  }>;
  summary?: string;  // AI-generated (future)
}

export interface KBEntry {
  id: string;
  type: 'conversation' | 'media' | 'note';
  title: string;
  content: string;
  tags: string[];
  category: string;
  priority: 'low' | 'medium' | 'high';
  
  // Relationships
  conversationId?: string;
  mediaIds: string[];
  relatedKBIds: string[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  
  // AI scaffolding (future)
  embedding?: number[];  // for semantic search
  summary?: string;
}

export class CockpitDB extends Dexie {
  media!: Table<MediaEntry>;
  conversations!: Table<Conversation>;
  kbEntries!: Table<KBEntry>;

  constructor() {
    super('CockpitDB');
    
    // Define indexes for efficient queries
    this.version(1).stores({
      media: 'id, type, conversationId, kbEntryId, createdAt',
      conversations: 'id, createdAt, updatedAt',
      kbEntries: 'id, type, conversationId, createdAt, updatedAt'
    });
  }
}

export const db = new CockpitDB();