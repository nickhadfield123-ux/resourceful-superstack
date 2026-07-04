import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let _supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (_supabase) return _supabase
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }
  _supabase = createClient(supabaseUrl, supabaseAnonKey)
  return _supabase
}

export const supabase = getSupabase()

// Dev user helper - returns a consistent dev user ID for development
// When auth is implemented, replace this with actual user context
export const DEV_USER_ID = 'dev-user-001'

export const getDevUser = () => DEV_USER_ID

// TypeScript interfaces for our tables
export interface ContentItem {
  id: string
  title: string
  content: string
  content_type: 'document' | 'conversation' | 'profile'
  category: string | null
  tags: string[] | null
  priority: 'high' | 'medium' | 'low' | null
  source_document: string | null  // Name of the source document this chunk came from
  document_context: string | null  // Contextual metadata (e.g., "Vision - not currently implemented")
  user_id: string | null  // Changed from UUID to string for dev mode
  created_at: string
  updated_at: string
}

export interface Embedding {
  id: string
  content_id: string
  user_id: string | null
  embedding: number[] // This will be stored as a vector in Supabase
  created_at: string
}

// Database operations for content items
export const contentItems = {
  async create(content: Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>) {
    const client = getSupabase()
    if (!client) throw new Error('Supabase client not configured')
    const { data, error } = await client
      .from('content_items')
      .insert([content])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async findByUserId(userId: string) {
    const client = getSupabase()
    if (!client) return []
    const { data, error } = await client
      .from('content_items')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`)

    if (error) throw error
    return data
  },

  async countByUserId(userId: string): Promise<number> {
    const client = getSupabase()
    if (!client) return 0
    const { count, error } = await client
      .from('content_items')
      .select('*', { count: 'exact', head: true })
      .or(`user_id.eq.${userId},user_id.is.null`)

    if (error) throw error
    return count || 0
  },

  async findByType(userId: string, contentType: ContentItem['content_type']) {
    const client = getSupabase()
    if (!client) return []
    const { data, error } = await client
      .from('content_items')
      .select('*')
      .eq('user_id', userId)
      .eq('content_type', contentType)

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<ContentItem>) {
    const client = getSupabase()
    if (!client) throw new Error('Supabase client not configured')
    const { data, error } = await client
      .from('content_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string) {
    const client = getSupabase()
    if (!client) throw new Error('Supabase client not configured')
    const { error } = await client
      .from('content_items')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Database operations for embeddings
export const embeddings = {
  async create(embedding: Omit<Embedding, 'id' | 'created_at' | 'updated_at'>) {
    const client = getSupabase()
    if (!client) throw new Error('Supabase client not configured')
    const { data, error } = await client
      .from('embeddings')
      .insert([embedding])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async findByContentId(contentId: string) {
    const client = getSupabase()
    if (!client) return []
    const { data, error } = await client
      .from('embeddings')
      .select('*')
      .eq('content_id', contentId)

    if (error) throw error
    return data
  },

  async findByUserId(userId: string) {
    const client = getSupabase()
    if (!client) return []
    const { data, error } = await client
      .from('embeddings')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error
    return data
  },

  async deleteByContentId(contentId: string) {
    const client = getSupabase()
    if (!client) throw new Error('Supabase client not configured')
    const { error } = await client
      .from('embeddings')
      .delete()
      .eq('content_id', contentId)

    if (error) throw error
  },

  // Vector similarity search
  async searchSimilar(userId: string, queryEmbedding: number[], limit: number = 5) {
    const client = getSupabase()
    if (!client) return []
    const { data, error } = await client
      .from('embeddings')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order('embedding', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }
}

// Initialize tables if they don't exist (for development)
export async function initializeDatabase() {
  const client = getSupabase()
  if (!client) return
  try {
    // Check if tables exist by trying to query them
    await client.from('content_items').select('id').limit(1)
    await client.from('embeddings').select('id').limit(1)
  } catch (error) {
    console.warn('Database tables may not exist. Please run the migration SQL to create them.')
  }
}