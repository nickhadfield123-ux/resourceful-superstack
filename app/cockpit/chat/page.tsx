"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Send, 
  Bot, 
  Trash2, 
  Loader2,
  Brain,
  Database,
  Activity,
  Settings,
  Zap,
  Mic,
  BookOpen,
  CheckCircle2
} from "lucide-react"
import type { ContentChunk } from "@/lib/ai/groq-service"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { ConversationToKBModal } from "@/components/cockpit/ConversationToKBModal"
import { ConversationPersistenceTest } from "@/components/cockpit/ConversationPersistenceTest"
import { useIntelligenceStore } from "@/stores/intelligenceStore"
import { toast } from "@/toast"
import { AudioContextModal } from "@/components/cockpit/AudioContextModal"
import { ImageUploadModal } from "@/components/cockpit/ImageUploadModal"
import { ScreenRecordModal } from "@/components/cockpit/ScreenRecordModal"
import { DocumentUploadModal } from "@/components/cockpit/DocumentUploadModal"
import { FlowSelector } from "@/components/intelligence/FlowSelector"
import { ModeSelector } from "@/components/cockpit/ModeSelector"
import { Play, Pause, RotateCcw, Image as ImageIcon, Video, Save, Download, Eye, FileText } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant" | "audio" | "image" | "video"
  content: string
  conversationContent?: string // Clean content for AI context
  timestamp: Date
  audioBlob?: Blob
  audioUrl?: string
  audioDuration?: number
  imageFile?: File
  imagePreview?: string
  imageMetadata?: {
    name: string
    size: string
    type: string
    dimensions: string
  }
  imageContext?: {
    title: string
    description: string
    category: string
    tags: string
    purpose: string
    voiceContext?: {
      audioBlob: Blob
      audioUrl: string
      audioDuration: number
    }
  }
  aiAnalysis?: string
  kbChunks?: ContentChunk[]  // chunk proposals for KB ingestion
  kbPending?: boolean        // marks this message as awaiting approval
  isPastedDocument?: boolean // collapsed preview for long pasted content
  documentName?: string      // name of the document
  documentContext?: string   // contextual metadata about the document
  documentStats?: { words: number; chars: number } // stats for pasted docs
  isExpanded?: boolean       // expand/collapse toggle state
}

interface CockpitLayoutProps {
  children?: React.ReactNode
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  // Get model preference from store instead of local state
  const modelPreference = useIntelligenceStore((state) => state.modelPreference)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAddToKBDialog, setShowAddToKBDialog] = useState(false)
  const [showAudioModal, setShowAudioModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showScreenRecordModal, setShowScreenRecordModal] = useState(false)
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [expandedChunks, setExpandedChunks] = useState<Set<number>>(new Set())

  // Synchronous conversation history ref
  const conversationRef = useRef<Message[]>([])

  // KB curation state - persists across refinement turns
  const pendingChunksRef = useRef<ContentChunk[]>([])
  const kbModeRef = useRef<boolean>(false)
  const waitingForKBContentRef = useRef<boolean>(false)
  const pendingKBContentRef = useRef<string>('') // Store pasted doc for later chunking

  // Auto-resize textarea ref
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // ── KB Intent Detection Helpers ──────────────────────────────────────────

  const isKBAddIntent = (text: string): boolean => {
    const t = text.toLowerCase()
    return (
      t.includes('add to kb') || t.includes('add this to kb') ||
      t.includes('save to kb') || t.includes('save this to kb') ||
      t.includes('add to knowledge base') || t.includes('save to knowledge base') ||
      t.includes('store in kb') || t.includes('add this to the knowledge base')
    )
  }

  const isLongContent = (text: string): boolean => {
    return text.trim().split(/\s+/).length >= 500
  }

  const isRefinementCommand = (text: string): boolean => {
    const t = text.toLowerCase()
    return (
      t.includes('merge chunk') || t.includes('retitle chunk') ||
      t.includes('delete chunk') || t.includes('remove chunk') ||
      t.includes('change chunk') || t.includes('split chunk') ||
      t.includes('rename chunk') || t.includes('update chunk') ||
      t.includes('set chunk') || t.includes('combine chunk')
    )
  }

  const isApproval = (text: string): boolean => {
    // Only match SHORT messages that are clearly commands (under 50 chars)
    const t = text.toLowerCase().trim()
    if (t.length > 50) return false
    
    return (
      t === 'approve' || t === 'approved' || t === 'looks good' ||
      t === 'save it' || t === 'yes' || t === 'save all' ||
      t.includes('looks good') || t.includes('approve') ||
      t.includes('save them') || t.includes('store them') ||
      t.includes('save all') || t.includes('store all') ||
      t.includes('save it') || t.includes('confirm') ||
      t === 'lgtm' || t.includes('let\'s save') || t.includes('go ahead')
    )
  }

  const isCancelKB = (text: string): boolean => {
    // Only match SHORT messages that are clearly commands (under 50 chars)
    // This prevents matching document content that happens to contain these words
    const t = text.toLowerCase().trim()
    if (t.length > 50) return false
    
    return (
      t === 'cancel' || t === 'discard' || t === 'nevermind' ||
      t === 'cancel this' || t === 'discard this' ||
      t.includes('don\'t save') || t.includes('forget it') ||
      t.includes('cancel this') || t.includes('discard this')
    )
  }

  // Detect when user wants to trigger actual chunking
  const isChunkItCommand = (text: string): boolean => {
    const t = text.toLowerCase().trim()
    return (
      t.includes('chunk it') || t.includes('chunk this') ||
      t.includes('now chunk') || t.includes('go ahead and chunk') ||
      t.includes('start chunking') || t.includes('proceed with chunking') ||
      t.includes('create the chunks') || t.includes('make the chunks')
    )
  }

  // ── Format chunks as a conversational Rizz message ───────────────────────

  const formatChunksAsMessage = (
    analysis: { analysis: { total_chunks: number; total_words: number; chunking_strategy: string }; chunks: ContentChunk[] }
  ): string => {
    const priorityEmoji = (p: string) => p === 'High' ? '🔴' : p === 'Medium' ? '🟡' : '🟢'
    const typeEmoji = (t: string) => t === 'document' ? '📄' : t === 'conversation' ? '💬' : '👤'

    let msg = `I've analyzed your content and proposed **${analysis.analysis.total_chunks} chunk${analysis.analysis.total_chunks !== 1 ? 's' : ''}** for the knowledge base.\n\n`
    msg += `_Strategy: ${analysis.analysis.chunking_strategy}_\n\n`
    msg += `---\n\n`

    analysis.chunks.forEach((chunk) => {
      msg += `**${typeEmoji(chunk.content_type)} Chunk ${chunk.chunk_number}: ${chunk.title}**\n`
      msg += `${priorityEmoji(chunk.priority)} ${chunk.priority} Priority  ·  Type: \`${chunk.content_type}\`  ·  Category: \`${chunk.category}\`\n`
      msg += `> ${chunk.content.substring(0, 120).replace(/\n/g, ' ')}...\n\n`
    })

    msg += `---\n\n`
    msg += `You can refine these by saying:\n`
    msg += `• _"Merge chunks 2 and 3"_\n`
    msg += `• _"Retitle chunk 1 to 'New Title'"_\n`
    msg += `• _"Delete chunk 4"_\n`
    msg += `• _"Change chunk 2 priority to High"_\n\n`
    msg += `Or say **"approve"** / **"looks good"** to save them to the knowledge base! 🗃️`

    return msg
  }

  // ── KB Analysis & Refinement Handlers ────────────────────────────────────

  // NEW: Start a conversation about the document structure BEFORE chunking
  const handleKBStructureChat = async (content: string) => {
    // First, add a collapsed document message for the pasted content
    const words = content.trim().split(/\s+/).length
    const chars = content.length
    
    const docMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.substring(0, 150) + (content.length > 150 ? '...' : ''), // Preview only
      conversationContent: content, // Full content for AI context
      timestamp: new Date(),
      isPastedDocument: true,
      documentStats: { words, chars }
    }
    addMessage(docMessage)
    
    // Store the content for later chunking
    pendingKBContentRef.current = content
    
    setIsLoading(true)
    toast.info('🧠 Analyzing document structure...')

    try {
      // Send to regular chat API with structure analysis prompt
      const response = await fetch('/api/ai/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `[DOCUMENT ANALYSIS] I'm about to chunk this document for my knowledge base. First, analyze its structure and tell me what you see. What's the best chunking strategy? Should I chunk by sections, by topics, or another way?\n\nDocument content:\n${content.substring(0, 3000)}${content.length > 3000 ? '...(truncated for analysis)' : ''}`
          }],
          provider: modelPreference || 'groq'
        })
      })

      if (!response.ok) throw new Error('AI API error')

      const data = await response.json()

      // Add Rizz's structure analysis as a message
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content + '\n\n_When you\'re ready, say **"chunk it"** and I\'ll create the knowledge base chunks based on our discussion._',
        timestamp: new Date()
      })
      toast.success('Structure analyzed! Discuss the approach, then say "chunk it" when ready.')
    } catch (error) {
      console.error('Structure analysis error:', error)
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I had trouble analyzing that document. Try saying **'chunk it'** to proceed anyway, or paste a different document.",
        timestamp: new Date()
      })
      toast.error('Failed to analyze structure')
    } finally {
      setIsLoading(false)
    }
  }

  // RENAMED: This is called AFTER the conversation, when user says "chunk it"
  const handleKBChunking = async () => {
    const content = pendingKBContentRef.current
    if (!content) {
      toast.error('No document to chunk. Paste a document first!')
      return
    }

    setIsLoading(true)
    toast.info('🧠 Creating chunks for knowledge base...')

    try {
      // Get recent conversation history to pass as context
      const recentHistory = conversationRef.current
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .slice(-6) // Last 6 messages for context
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.conversationContent || m.content
        }))

      const response = await fetch('/api/ai/kb-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'analyze', 
          content,
          conversationContext: recentHistory // Pass the discussion as context
        })
      })

      if (!response.ok) throw new Error('KB analyze API error')

      const data = await response.json()
      const analysis = data.analysis

      // Store proposed chunks for refinement
      pendingChunksRef.current = analysis.chunks
      kbModeRef.current = true
      pendingKBContentRef.current = '' // Clear after use

      // Add formatted chunk proposals as assistant message
      const chunkMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: formatChunksAsMessage(analysis),
        timestamp: new Date(),
        kbChunks: analysis.chunks,
        kbPending: true
      }
      addMessage(chunkMessage)
      toast.success('Chunks created! Review and approve when ready.')
    } catch (error) {
      console.error('KB chunking error:', error)
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I had trouble creating chunks. Try again or paste a shorter document!",
        timestamp: new Date()
      })
      toast.error('Failed to create chunks')
    } finally {
      setIsLoading(false)
    }
  }

  // KEPT for backwards compatibility - now just calls the structure chat
  const handleKBAnalysis = async (content: string) => {
    await handleKBStructureChat(content)
  }

  const handleKBRefinement = async (command: string) => {
    if (pendingChunksRef.current.length === 0) return

    setIsLoading(true)
    toast.info('🔧 Applying your changes...')

    try {
      const response = await fetch('/api/ai/kb-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'refine',
          currentChunks: pendingChunksRef.current,
          refinementCommand: command
        })
      })

      if (!response.ok) throw new Error('KB refine API error')

      const data = await response.json()
      const analysis = data.analysis

      // Update stored chunks
      pendingChunksRef.current = analysis.chunks

      const chunkMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Done! Here are the updated chunks:\n\n${formatChunksAsMessage(analysis)}`,
        timestamp: new Date(),
        kbChunks: analysis.chunks,
        kbPending: true
      }
      addMessage(chunkMessage)
      toast.success('Chunks updated!')
    } catch (error) {
      console.error('KB refinement error:', error)
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I had trouble applying that change. Please try again!",
        timestamp: new Date()
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKBApproval = async () => {
    const chunks = pendingChunksRef.current
    if (chunks.length === 0) return

    // Exit KB mode immediately — no refinements during save
    kbModeRef.current = false

    const progressMsgId = `kb-progress-${Date.now()}`

    // Add initial progress message
    addMessage({
      id: progressMsgId,
      role: 'assistant',
      content: `🧠 Generating embeddings and saving to knowledge base…\n_0/${chunks.length} chunks complete_`,
      timestamp: new Date()
    })
    setIsLoading(true)

    try {
      const response = await fetch('/api/kb/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chunks, userId: null })
      })

      if (!response.ok || !response.body) {
        throw new Error(`Store API returned ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // keep incomplete last line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6))

            if (event.type === 'progress') {
              setMessages(prev => prev.map(m =>
                m.id === progressMsgId
                  ? {
                      ...m,
                      content: `🧠 Saving to knowledge base…\n_${event.progress}/${event.total} complete_${!event.success ? `\n⚠️ "${event.title}" failed — skipping` : ''}`
                    }
                  : m
              ))
            }

            if (event.type === 'done') {
              const saved: number = event.saved
              const failed: number = event.failed
              const total: number = event.total

              let summary: string
              if (failed === 0) {
                summary = `✅ **${saved} chunk${saved !== 1 ? 's' : ''} saved** to the knowledge base!\n\n`
                summary += (event.results as any[]).map((r: any) => `• ${r.title}`).join('\n')
              } else if (saved === 0) {
                summary = `❌ All ${total} chunks failed to save.\n\n`
                summary += (event.results as any[]).map((r: any) => `❌ ${r.title}: ${r.error ?? 'unknown'}`).join('\n')
                summary += `\n\n_Chunks kept in pending state — say **"approve"** to retry._`
              } else {
                summary = `⚠️ Partially saved: **${saved}/${total} chunks** succeeded.\n\n`
                summary += (event.results as any[]).map((r: any) =>
                  `${r.success ? '✅' : '❌'} ${r.title}${r.error ? ': ' + r.error : ''}`
                ).join('\n')
              }

              setMessages(prev => prev.map(m =>
                m.id === progressMsgId ? { ...m, content: summary } : m
              ))

              if (saved > 0) {
                pendingChunksRef.current = []
                toast.success(`${saved} chunk${saved !== 1 ? 's' : ''} saved to knowledge base!`)
              } else {
                // Restore so user can retry
                kbModeRef.current = true
                toast.error('All chunks failed. Try approving again.')
              }
            }
          } catch {
            // Ignore malformed SSE line
          }
        }
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error'
      setMessages(prev => prev.map(m =>
        m.id === progressMsgId
          ? {
              ...m,
              content: `❌ Storage service error.\n\n_${errMsg}_\n\nYour chunks are still pending — say **"approve"** to try again.`
            }
          : m
      ))
      // Restore state for retry
      kbModeRef.current = true
      pendingChunksRef.current = chunks
      toast.error('Storage failed. Say "approve" to retry.')
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to add messages that updates both state and ref
  const addMessage = (message: Message) => {
    setMessages(prev => {
      const newMessages = [...prev, message]
      conversationRef.current = newMessages
      return newMessages
    })
  }

  // Load conversation from localStorage on mount
  React.useEffect(() => {
    const savedConversation = localStorage.getItem("rizz_conversation")
    if (savedConversation) {
      try {
        const parsed = JSON.parse(savedConversation)
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
        setMessages(messagesWithDates)
        conversationRef.current = messagesWithDates  // CRITICAL: sync ref with state
        console.log("Loaded saved conversation:", messagesWithDates)
      } catch (error) {
        console.error("Error parsing saved conversation:", error)
        // Clear corrupted data
        localStorage.removeItem("rizz_conversation")
      }
    }
    setIsInitialized(true)
  }, [])

  // Save conversation to localStorage whenever messages change
  React.useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("rizz_conversation", JSON.stringify(messages))
      console.log("Saved conversation to localStorage:", messages)
    }
  }, [messages, isInitialized])

  // Auto-resize textarea as content grows
  React.useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [inputValue])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const text = inputValue.trim()
    setInputValue("")

    // ── EARLY KB CHECK: Don't add user message if we're handling KB content ──────────
    
    // Check for KB add intent with content BEFORE adding user message
    // This prevents duplicate messages (full doc + collapsed preview)
    if (!kbModeRef.current && isKBAddIntent(text)) {
      const stripped = text
        .replace(/add (this |it )?to (the )?knowledge base/gi, '')
        .replace(/save (this |it )?to (the )?knowledge base/gi, '')
        .replace(/add (this |it )?to (the )?kb/gi, '')
        .replace(/save (this |it )?to (the )?kb/gi, '')
        .replace(/store (this |it )?in (the )?kb/gi, '')
        .trim()

      if (stripped.length > 20) {
        // handleKBStructureChat will add the collapsed preview message
        await handleKBAnalysis(stripped)
        return
      }
    }

    // Now add the user message for normal flow
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date()
    }

    addMessage(userMessage)

    // ── KB Mode Routing ──────────────────────────────────────────────────────

    // 0. Waiting for pasted KB content (two-step flow)
    if (waitingForKBContentRef.current) {
      waitingForKBContentRef.current = false
      if (text.length > 20) {
        await handleKBAnalysis(text)
      } else {
        addMessage({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "That content seems too short to analyze. Paste a longer piece of text and I'll chunk it for you! 📚",
          timestamp: new Date()
        })
      }
      return
    }

    // 1. In KB mode: handle refinement, approval, cancel, or allow conversation
    if (kbModeRef.current && pendingChunksRef.current.length > 0) {
      if (isCancelKB(text)) {
        kbModeRef.current = false
        pendingChunksRef.current = []
        addMessage({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "No problem, I've discarded the proposed chunks. What else can I help you with? 👍",
          timestamp: new Date()
        })
        return
      }
      if (isApproval(text)) {
        await handleKBApproval()
        return
      }
      if (isRefinementCommand(text)) {
        await handleKBRefinement(text)
        return
      }
      // NOT a recognized command — fall through to conversational AI with KB context
      // The normal AI flow below will handle this, with KB chunks injected as context
    }

    // 1.5. User says "chunk it" after document analysis discussion
    if (pendingKBContentRef.current && isChunkItCommand(text)) {
      await handleKBChunking()
      return
    }

    // 2. Explicit KB add intent (not yet in KB mode)
    if (!kbModeRef.current && isKBAddIntent(text)) {
      const stripped = text
        .replace(/add (this |it )?to (the )?knowledge base/gi, '')
        .replace(/save (this |it )?to (the )?knowledge base/gi, '')
        .replace(/add (this |it )?to (the )?kb/gi, '')
        .replace(/save (this |it )?to (the )?kb/gi, '')
        .replace(/store (this |it )?in (the )?kb/gi, '')
        .trim()

      if (stripped.length > 20) {
        await handleKBAnalysis(stripped)
      } else {
        // Set waiting state — next message will be treated as KB content
        waitingForKBContentRef.current = true
        addMessage({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Sure! Paste the content you'd like me to analyze for the knowledge base 📚\n\n_Tip: You can paste multi-paragraph docs — Shift+Enter adds a new line, Enter sends._",
          timestamp: new Date()
        })
      }
      return
    }

    // 3. Long content (500+ words) — prompt for KB addition
    if (!kbModeRef.current && isLongContent(text)) {
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `That's a lot of content! 📄 Would you like me to analyze it for the knowledge base?\n\nSay **"add to KB"** to analyze it for intelligent chunking, or I'll just respond normally if you re-send.`,
        timestamp: new Date()
      })
      return
    }

    // ── Normal AI Flow (with optional KB context) ────────────────────────────────
    setIsLoading(true)

    try {
      // Limit conversation history to last 10 messages to stay within token limits
      const allMessages = conversationRef.current
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.conversationContent || m.content
        }))
      
      // Keep only last 10 messages for context (plus current message)
      const conversationHistory = allMessages.slice(-10)

      // If in KB mode, inject compact context about pending chunks
      let kbContextPrefix = ''
      if (kbModeRef.current && pendingChunksRef.current.length > 0) {
        const chunks = pendingChunksRef.current
        kbContextPrefix = `[KB MODE: ${chunks.length} chunks proposed. `
        chunks.forEach((chunk, i) => {
          kbContextPrefix += `${i + 1}:"${chunk.title}"(${chunk.priority}) `
        })
        kbContextPrefix += `Answer questions about chunking or accept refinements.]\n`
      }

      conversationHistory.push({ 
        role: 'user', 
        content: kbContextPrefix + text 
      })

      const response = await fetch('/api/ai/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          provider: modelPreference || 'groq'
        })
      })

      if (!response.ok) throw new Error('AI API error')

      const data = await response.json()

      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content || "I'm thinking...",
        timestamp: new Date()
      })

      // Show toast if fallback occurred
      if (data.fallback) {
        const fromProvider = data.fallbackFrom || 'unknown'
        const toProvider = data.provider || 'unknown'
        toast.info(`⚠️ ${fromProvider.charAt(0).toUpperCase() + fromProvider.slice(1)} rate limited — switched to ${toProvider.charAt(0).toUpperCase() + toProvider.slice(1)}`)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again!",
        timestamp: new Date()
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Helper to analyze media with AI
  const analyzeMedia = async (message: Message) => {
    if (!message.imagePreview) return

    setIsLoading(true)
    toast.info('Rizz is analyzing your image...')

    try {
      // Convert blob URL to base64
      const response = await fetch(message.imagePreview)
      const blob = await response.blob()
      const base64 = await blobToBase64(blob)

      // Call Vision API
      const visionResponse = await fetch('/api/ai/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64.split(',')[1], // Remove data URL prefix
          mimeType: blob.type,
          context: message.imageContext?.purpose || message.imageContext?.description,
          analysisType: 'design' // Default to design analysis for UI screenshots
        })
      })

      if (!visionResponse.ok) {
        const errorData = await visionResponse.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Vision API error response:', errorData)
        throw new Error(errorData.details || errorData.error || `Vision API error: ${visionResponse.status}`)
      }

      const visionData = await visionResponse.json()
      
      // Create a Rizz (assistant) message with the analysis
      const rizzAnalysisMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: visionData.analysis?.description || 'No analysis available',
        conversationContent: visionData.analysis?.description || 'No analysis available', // Add this line
        timestamp: new Date(),
      }
      
      // Add Rizz's analysis as a new message using the helper
      addMessage(rizzAnalysisMessage)

      toast.success('Analysis complete! Rizz has responded with insights.')
    } catch (error) {
      console.error('Media analysis error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I had trouble analyzing that image. Please try again or describe what you're seeing.",
        timestamp: new Date(),
      }
      addMessage(errorMessage)
      toast.error('Failed to analyze media')
    } finally {
      setIsLoading(false)
    }
  }

  // Helper: Blob to Base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  const handleDeleteConversation = async () => {
    setIsDeleting(true)
    try {
      // Clear localStorage
      localStorage.removeItem("rizz_conversation")
      // Clear UI state immediately
      setMessages([])
      setIsDeleting(false)
      alert("Your conversation has been cleared.")
    } catch (error) {
      console.error("Error deleting conversation:", error)
      setIsDeleting(false)
      alert("Failed to delete conversation. Please try again.")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSaveMediaToKB = async (message: Message) => {
    if (!message.imagePreview || !message.imageContext) {
      toast.error('Cannot save media without context')
      return
    }

    try {
      toast.info('Saving to knowledge base...')
      
      // Create knowledge base entry using the intelligence store format
      const kbEntry = {
        title: message.imageContext.title || message.content,
        content: message.imageContext.description || message.content,
        category: message.imageContext.category || 'general',
        tags: message.imageContext.tags ? message.imageContext.tags.split(',').map(tag => tag.trim()) : [],
        priority: 'medium' as const
      }

      // Use the intelligence store to add the entry
      const addKnowledgeEntry = useIntelligenceStore.getState().addKnowledgeEntry
      addKnowledgeEntry(kbEntry)

      // Also save to localStorage for backup compatibility
      const existingKB = JSON.parse(localStorage.getItem('knowledge_base') || '[]')
      const backupEntry = {
        ...kbEntry,
        id: `media-${Date.now()}`,
        type: 'media',
        metadata: {
          originalFilename: message.imageMetadata?.name || 'media',
          fileSize: message.imageMetadata?.size || 'Unknown',
          mediaType: message.imageMetadata?.type || 'Unknown',
          dimensions: message.imageMetadata?.dimensions || 'Unknown',
          purpose: message.imageContext.purpose || 'Unknown',
          hasVoiceContext: !!message.imageContext.voiceContext,
          timestamp: message.timestamp.toISOString()
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      existingKB.push(backupEntry)
      localStorage.setItem('knowledge_base', JSON.stringify(existingKB))

      // Simulate processing time
      setTimeout(() => {
        toast.success('Media saved to knowledge base!')
      }, 1000)

    } catch (error) {
      console.error('Error saving to knowledge base:', error)
      toast.error('Failed to save to knowledge base')
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">🤖 RIZZ - AI Co-Founder</CardTitle>
                <p className="text-sm text-muted-foreground">Your intelligent coordination partner</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowAddToKBDialog(true)}
                disabled={messages.length === 0}
                className={`h-10 px-4 py-2 flex items-center space-x-2 ${
                  messages.length === 0 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-primary/90 cursor-pointer'
                } bg-primary text-primary-foreground`}
              >
                <Database className="h-4 w-4" />
                <span>Add to KB</span>
              </Button>

              <ConversationToKBModal
                isOpen={showAddToKBDialog}
                onOpenChange={setShowAddToKBDialog}
                messages={messages}
              />

              <AudioContextModal
                isOpen={showAudioModal}
                onOpenChange={setShowAudioModal}
                onAudioRecorded={(audioBlob, audioUrl, audioDuration) => {
                  const audioMessage: Message = {
                    id: Date.now().toString(),
                    role: "audio",
                    content: "Voice message",
                    timestamp: new Date(),
                    audioBlob,
                    audioUrl,
                    audioDuration
                  }
                  addMessage(audioMessage)
                }}
              />

              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogTrigger>
                  <div className={`h-10 px-4 py-2 flex items-center space-x-2 rounded-md font-medium transition-colors ${
                    messages.length === 0 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-destructive/90 cursor-pointer'
                  } bg-destructive text-destructive-foreground ${
                    messages.length === 0 ? 'pointer-events-none' : ''
                  }`}>
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </div>
                </AlertDialogTrigger>
                <AlertDialogContent className={showDeleteDialog ? '' : 'hidden'}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your conversation history. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        handleDeleteConversation()
                        setShowDeleteDialog(false)
                      }}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete Conversation"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <ImageUploadModal
                isOpen={showImageModal}
                onOpenChange={setShowImageModal}
                onImageUploaded={(imageFile, context) => {
                  // Generate preview URL from the file
                  const imagePreview = URL.createObjectURL(imageFile)
                  
                  const imageMessage: Message = {
                    id: Date.now().toString(),
                    role: "user", // Changed from "image" to "user"
                    content: context.title || "Image uploaded",
                    timestamp: new Date(),
                    imageFile,
                    imagePreview,
                    imageMetadata: {
                      name: imageFile.name,
                      size: (imageFile.size / 1024).toFixed(2) + ' KB',
                      type: imageFile.type.split('/')[1].toUpperCase(),
                      dimensions: 'Loading...'
                    },
                    imageContext: context
                  }
                  addMessage(imageMessage)
                }}
              />

              <ScreenRecordModal
                isOpen={showScreenRecordModal}
                onOpenChange={setShowScreenRecordModal}
                onVideoRecorded={(videoBlob, context) => {
                  // Create video message
                  const videoMessage: Message = {
                    id: Date.now().toString(),
                    role: "user", // Changed from "image" to "user"
                    content: context.title || "Screen recording",
                    timestamp: new Date(),
                    imagePreview: URL.createObjectURL(videoBlob),
                    imageContext: context
                  }
                  addMessage(videoMessage)
                }}
                onSendToChat={(videoBlob, context) => {
                  // Create video message
                  const videoMessage: Message = {
                    id: Date.now().toString(),
                    role: "user", // Changed from "image" to "user"
                    content: context.title || "Screen recording",
                    timestamp: new Date(),
                    imagePreview: URL.createObjectURL(videoBlob),
                    imageContext: context
                  }
                  addMessage(videoMessage)
                }}
              />

              <DocumentUploadModal
                isOpen={showDocumentModal}
                onOpenChange={setShowDocumentModal}
                onSendToChat={async (document) => {
                  // Handle different storage types
                  if (document.storageType === 'always_on') {
                    // Store as strategic document
                    try {
                      const response = await fetch('/api/kb/store-strategic', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          title: document.name,
                          content: document.content,
                          sourceDocument: document.name,
                          documentContext: document.context,
                          userId: null
                        })
                      })

                      const result = await response.json()

                      if (result.success) {
                        // Add success message
                        addMessage({
                          id: Date.now().toString(),
                          role: 'user',
                          content: `Strategic document "${document.name}" uploaded`,
                          timestamp: new Date()
                        })
                        addMessage({
                          id: (Date.now() + 1).toString(),
                          role: 'assistant',
                          content: `✅ Strategic document "${document.name}" has been added to my always-on context! I'll now always remember this core knowledge.`,
                          timestamp: new Date()
                        })
                        toast.success(`Strategic document "${document.name}" stored successfully!`)
                      } else {
                        throw new Error(result.error || 'Failed to store strategic document')
                      }
                    } catch (error) {
                      console.error('Strategic document upload error:', error)
                      addMessage({
                        id: Date.now().toString(),
                        role: 'user',
                        content: `Failed to upload strategic document "${document.name}"`,
                        timestamp: new Date()
                      })
                      addMessage({
                        id: (Date.now() + 1).toString(),
                        role: 'assistant',
                        content: `❌ I'm sorry, I couldn't add "${document.name}" as a strategic document. Please try again or use the regular upload option.`,
                        timestamp: new Date()
                      })
                      toast.error('Failed to upload strategic document')
                    }
                  } else {
                    // Store as regular chunked document (existing logic)
                    // Add the document as a collapsed pasted document message
                    const words = document.content.trim().split(/\s+/).length
                    const chars = document.content.length
                    
                    const docMessage: Message = {
                      id: Date.now().toString(),
                      role: 'user',
                      content: document.name + (document.context ? ` (${document.context})` : ''),
                      conversationContent: document.content,
                      timestamp: new Date(),
                      isPastedDocument: true,
                      documentName: document.name,
                      documentContext: document.context,
                      documentStats: { words, chars }
                    }
                    addMessage(docMessage)
                    
                    // Store for KB chunking
                    pendingKBContentRef.current = document.content
                    
                    // Trigger Rizz's response to start the KB flow
                    setIsLoading(true)
                    toast.info('🧠 Analyzing document structure...')
                    
                    fetch('/api/ai/text', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        messages: [{
                          role: 'user',
                          content: `[DOCUMENT ANALYSIS] I've provided a document called "${document.name}"${document.context ? ` (Context: ${document.context})` : ''}. Analyze its structure and tell me what you see. What's the best chunking strategy?\n\nDocument content:\n${document.content.substring(0, 3000)}${document.content.length > 3000 ? '...(truncated for analysis)' : ''}`
                        }],
                        provider: modelPreference || 'groq'
                      })
                    })
                      .then(res => res.json())
                      .then(data => {
                        addMessage({
                          id: (Date.now() + 1).toString(),
                          role: 'assistant',
                          content: data.content + '\n\n_When you\'re ready, say **"chunk it"** and I\'ll create the knowledge base chunks._',
                          timestamp: new Date()
                        })
                        toast.success('Document received! Discuss the approach, then say "chunk it" when ready.')
                      })
                      .catch(err => {
                        console.error('Analysis error:', err)
                        addMessage({
                          id: (Date.now() + 1).toString(),
                          role: 'assistant',
                          content: "I've received your document. Say **'chunk it'** when you're ready to create knowledge base chunks.",
                          timestamp: new Date()
                        })
                      })
                      .finally(() => setIsLoading(false))
                  }
                }}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-[60vh] w-full p-4">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Bot className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg">Hey! I'm RIZZ, your AI co-founder.</p>
                  <p className="text-sm">What are we building today?</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" || message.role === "audio" ? "justify-end" : "justify-start"
                    }`}
                  >
                      <div
                        className={`flex items-start space-x-2 ${
                          message.kbChunks ? 'max-w-2xl w-full' : 'max-w-xs lg:max-w-md'
                        } ${
                          message.role === "user" || message.role === "audio" ? "flex-row-reverse space-x-reverse" : "flex-row"
                        }`}
                      >
                      <div className={`h-8 w-8 rounded-full ${
                        message.role === "user" ? "bg-secondary" : "bg-primary"
                      } flex items-center justify-center`}>
                        <span className="text-white font-semibold">
                          {message.role === "user" ? "👤" : "🤖"}
                        </span>
                      </div>
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {message.role === "audio" ? (
                          <div className="space-y-3">
                            {/* Audio Message Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-2 hover:bg-primary/10 transition-colors"
                                  >
                                    <Play className="h-5 w-5" />
                                  </Button>
                                  <span className="text-sm font-medium text-primary">
                                    {Math.floor(message.audioDuration || 0)}s
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                  <span className="text-xs text-muted-foreground">Audio Message</span>
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                            </div>

                            {/* Audio Waveform Visualization */}
                            <div className="flex items-end space-x-1 h-8">
                              {[...Array(8)].map((_, i) => (
                                <div
                                  key={i}
                                  className="flex-1 bg-muted rounded-sm"
                                  style={{
                                    height: `${Math.random() * 60 + 20}%`,
                                    animationDelay: `${i * 0.1}s`
                                  }}
                                >
                                  <div className="w-full h-full bg-primary rounded-sm animate-pulse" style={{ animationDuration: '1s' }}></div>
                                </div>
                              ))}
                            </div>

                            {/* Message Content */}
                            <div className="text-sm text-muted-foreground">
                              {message.content}
                            </div>

                            {/* Audio Controls */}
                            <div className="flex items-center justify-between pt-2 border-t border-border">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs flex items-center space-x-1"
                                >
                                  <Play className="h-3 w-3" />
                                  <span>Play</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs flex items-center space-x-1"
                                >
                                  <Pause className="h-3 w-3" />
                                  <span>Pause</span>
                                </Button>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <span>🔊</span>
                                <div className="w-16 bg-muted rounded-full h-1">
                                  <div className="bg-primary h-1 rounded-full w-1/3"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (message.role === "user" && message.imagePreview) ? (
                          <div className="space-y-3">
                            {/* Message Header */}
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{message.content}</span>
                              <span className="text-xs opacity-70">
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                            </div>

                            {/* Media Preview */}
                            {message.imagePreview && (
                              <div className="mt-2">
                                {/* Check if this is a video (screen recording) */}
                                {message.imageContext?.purpose?.toLowerCase().includes('screen recording') || 
                                 message.imageContext?.purpose?.toLowerCase().includes('screen capture') ||
                                 message.imageContext?.purpose?.toLowerCase().includes('video') ||
                                 message.content.toLowerCase().includes('screen recording') ||
                                 message.content.toLowerCase().includes('screen capture') ||
                                 message.content.toLowerCase().includes('video') ||
                                 message.imageContext?.category === 'tutorial' ||
                                 message.imageContext?.category === 'screen recording' ||
                                 message.imageContext?.category === 'video' ? (
                                  // Video Player for Screen Recordings
                                  <div className="group cursor-pointer">
                                    <div className="relative overflow-hidden rounded-lg border border-border bg-background shadow-sm hover:shadow-md transition-shadow">
                                      <video
                                        src={message.imagePreview}
                                        controls
                                        className="w-full h-auto rounded-lg"
                                        style={{ maxHeight: '200px' }}
                                        preload="metadata"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                                      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                                        <Video className="h-3 w-3 inline" />
                                        <span>Screen Recording</span>
                                      </div>
                                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                        {message.imageContext?.purpose || 'Recording'} • {message.audioDuration ? `${Math.floor(message.audioDuration)}s` : '0s'}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  // Image Preview for Regular Images
                                  <div className="group cursor-pointer" onClick={() => window.open(message.imagePreview!, '_blank')}>
                                    <div className="relative overflow-hidden rounded-lg border border-border bg-background shadow-sm hover:shadow-md transition-shadow">
                                      <img
                                        src={message.imagePreview}
                                        alt="Uploaded media"
                                        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                                        style={{ maxHeight: '200px' }}
                                      />
                                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-lg"></div>
                                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Eye className="h-3 w-3 inline mr-1" />
                                        View Full
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Description Text */}
                            {message.imageContext?.description && (
                              <div className="text-sm text-muted-foreground italic border-t border-border pt-2">
                                <span className="font-medium text-foreground">Description:</span> {message.imageContext.description}
                              </div>
                            )}

                            {/* Metadata and Context */}
                            <div className="space-y-2">
                              {message.imageMetadata && (
                                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                  <span className="bg-muted px-2 py-1 rounded">{message.imageMetadata.type}</span>
                                  <span className="bg-muted px-2 py-1 rounded">{message.imageMetadata.size}</span>
                                  {message.imageMetadata.dimensions !== 'Loading...' && (
                                    <span className="bg-muted px-2 py-1 rounded">{message.imageMetadata.dimensions}</span>
                                  )}
                                </div>
                              )}
                              
                              {message.imageContext && (
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {message.imageContext.category}
                                  </Badge>
                                  {message.imageContext.voiceContext && (
                                    <Badge variant="outline" className="text-xs text-green-600 border-green-200 flex items-center space-x-1">
                                      <Mic className="h-3 w-3" />
                                      <span>Voice: {Math.floor(message.imageContext.voiceContext.audioDuration || 0)}s</span>
                                    </Badge>
                                  )}
                                  {message.imageContext.purpose && (
                                    <Badge variant="outline" className="text-xs">
                                      {message.imageContext.purpose}
                                    </Badge>
                                  )}
                                  {message.imageContext.tags && (
                                    <Badge variant="outline" className="text-xs">
                                      Tags: {message.imageContext.tags}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Image Analysis Button - only show if not already analyzed */}
                            {!message.aiAnalysis && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => analyzeMedia(message)}
                                disabled={isLoading}
                                className="flex items-center space-x-1 text-xs"
                              >
                                <Brain className="h-3 w-3" />
                                <span>Analyze with Rizz</span>
                              </Button>
                            )}

                            {/* Action Buttons */}
                            <div className="flex space-x-2 pt-2 border-t border-border">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Download media
                                  if (message.imagePreview) {
                                    const link = document.createElement('a')
                                    link.href = message.imagePreview
                                    const isVideo = message.imageContext?.purpose?.toLowerCase().includes('screen') || 
                                                   message.content.toLowerCase().includes('screen') ||
                                                   message.imageContext?.category === 'tutorial'
                                    const extension = isVideo ? 'webm' : (message.imageMetadata?.type.toLowerCase() || 'jpg')
                                    link.download = `${message.content || 'media'}.${extension}`
                                    document.body.appendChild(link)
                                    link.click()
                                    document.body.removeChild(link)
                                    toast.success('Media saved to downloads!')
                                  }
                                }}
                                className="flex items-center space-x-1 text-xs"
                              >
                                <Download className="h-3 w-3" />
                                <span>Download</span>
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => analyzeMedia(message)}
                                disabled={isLoading}
                                className="flex items-center space-x-1 text-xs"
                              >
                                <Brain className="h-3 w-3" />
                                <span>Analyze with Rizz</span>
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSaveMediaToKB(message)}
                                className="flex items-center space-x-1 text-xs"
                              >
                                <Save className="h-3 w-3" />
                                <span>Save to KB</span>
                              </Button>
                            </div>
                          </div>
                        ) : message.isPastedDocument ? (
                          // ── Collapsed Pasted Document Preview ────────────────────────────────────
                          <div className="space-y-2 min-w-0 w-full">
                            <div className="flex items-center gap-2 pb-1">
                              <Badge variant="outline" className="text-xs bg-muted/50">📄 DOCUMENT</Badge>
                              <span className="text-xs text-muted-foreground">
                                {message.documentStats?.words?.toLocaleString()} words • {message.documentStats?.chars?.toLocaleString()} chars
                              </span>
                              <span className="text-xs opacity-60 ml-auto">{message.timestamp.toLocaleTimeString()}</span>
                            </div>
                            {message.documentName && (
                              <div className="text-sm font-medium">
                                {message.documentName}
                              </div>
                            )}
                            {message.documentContext && (
                              <div className="text-xs text-muted-foreground italic">
                                Context: {message.documentContext}
                              </div>
                            )}
                            {message.isExpanded && message.conversationContent && (
                              <div className="mt-2 p-2 bg-muted/30 rounded text-xs text-muted-foreground max-h-40 overflow-y-auto whitespace-pre-wrap">
                                {message.conversationContent}
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs h-6 px-2"
                              onClick={() => {
                                setMessages(prev => prev.map(m =>
                                  m.id === message.id ? { ...m, isExpanded: !m.isExpanded } : m
                                ))
                              }}
                            >
                              {message.isExpanded ? '▲ Collapse' : '▼ Expand'}
                            </Button>
                          </div>
                        ) : message.kbChunks && message.kbChunks.length > 0 ? (
                          // ── KB Chunk Proposal View ────────────────────────────────────
                          <div className="space-y-3 min-w-0 w-full">
                            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                              <BookOpen className="h-4 w-4 text-primary shrink-0" />
                              <span className="text-sm font-semibold">Knowledge Base Proposal</span>
                              <Badge variant="secondary" className="text-xs">{message.kbChunks.length} chunk{message.kbChunks.length !== 1 ? 's' : ''}</Badge>
                              <span className="text-xs opacity-60 ml-auto">{message.timestamp.toLocaleTimeString()}</span>
                            </div>

                            <div className="space-y-2">
                              {message.kbChunks.map((chunk) => {
                                const priorityColor = chunk.priority === 'High'
                                  ? 'text-red-500 border-red-200'
                                  : chunk.priority === 'Medium'
                                    ? 'text-yellow-600 border-yellow-200'
                                    : 'text-green-600 border-green-200'
                                const typeIcon = chunk.content_type === 'document' ? '📄' : chunk.content_type === 'conversation' ? '💬' : '👤'
                                const isChunkExpanded = expandedChunks.has(chunk.chunk_number)
                                return (
                                  <div key={chunk.chunk_number} className="rounded-md border border-border/60 bg-background/60 p-3 space-y-1.5">
                                    <div className="flex items-start gap-2">
                                      <span className="text-sm font-medium leading-snug">{typeIcon} {chunk.chunk_number}. {chunk.title}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      <Badge variant="outline" className={`text-xs ${priorityColor}`}>{chunk.priority}</Badge>
                                      <Badge variant="outline" className="text-xs">{chunk.content_type}</Badge>
                                      <Badge variant="secondary" className="text-xs">{chunk.category}</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                      {isChunkExpanded 
                                        ? chunk.content 
                                        : chunk.content.substring(0, 140).replace(/\n/g, ' ') + '…'}
                                    </p>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-xs h-6 px-2 mt-1"
                                      onClick={() => {
                                        setExpandedChunks(prev => {
                                          const next = new Set(prev)
                                          if (next.has(chunk.chunk_number)) {
                                            next.delete(chunk.chunk_number)
                                          } else {
                                            next.add(chunk.chunk_number)
                                          }
                                          return next
                                        })
                                      }}
                                    >
                                      {isChunkExpanded ? '▲ Collapse' : '▼ Expand'}
                                    </Button>
                                  </div>
                                )
                              })}
                            </div>

                            {message.kbPending && (
                              <div className="flex gap-2 pt-2 border-t border-border/50">
                                <Button
                                  size="sm"
                                  className="flex items-center gap-1 text-xs"
                                  onClick={() => {
                                    addMessage({ id: Date.now().toString(), role: 'user', content: 'approve', timestamp: new Date() })
                                    handleKBApproval()
                                  }}
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  Approve & Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs"
                                  onClick={() => {
                                    kbModeRef.current = false
                                    pendingChunksRef.current = []
                                    addMessage({ id: Date.now().toString(), role: 'user', content: 'cancel', timestamp: new Date() })
                                    addMessage({ id: (Date.now() + 1).toString(), role: 'assistant', content: "No problem, chunks discarded. What else can I help with? 👍", timestamp: new Date() })
                                  }}
                                >
                                  Discard
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">🤖</span>
                      </div>
                      <div className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="border-t p-4">
            {/* Mode Selection */}
            <div className="mb-3 border-b pb-3">
              <ModeSelector isCollapsed={false} />
            </div>
            
            {/* Dual-Flow AI Controls */}
            <div className="mb-3 border-b pb-3">
              <FlowSelector isCollapsed={false} />
            </div>
            
            {/* Secondary Actions Toolbar */}
            <div className="flex items-center gap-2 mb-3">
              <Button
                onClick={() => setShowDocumentModal(true)}
                disabled={isLoading}
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <FileText className="h-4 w-4" />
                <span className="text-xs">Document</span>
              </Button>
              <Button
                onClick={() => setShowImageModal(true)}
                disabled={isLoading}
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <ImageIcon className="h-4 w-4" />
                <span className="text-xs">Image</span>
              </Button>
              <Button
                onClick={() => setShowScreenRecordModal(true)}
                disabled={isLoading}
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Video className="h-4 w-4" />
                <span className="text-xs">Screen</span>
              </Button>
              <Button
                onClick={() => setShowAudioModal(true)}
                disabled={isLoading}
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Mic className="h-4 w-4" />
                <span className="text-xs">Voice</span>
              </Button>
            </div>
            
            {/* Chat Input Area */}
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                rows={1}
                placeholder="What do you want to build today? (Shift+Enter for new line)"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
                className="flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background resize-none overflow-y-auto leading-relaxed"
                style={{ minHeight: '40px', maxHeight: '160px' }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="flex items-center gap-2 h-10 px-4"
              >
                <Send className="h-4 w-4" />
                <span>Send</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
