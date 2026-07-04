"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useIntelligenceStore } from "@/stores/intelligenceStore"
import { toast } from "@/toast"
import { Database, Eye, Save } from "lucide-react"

interface ConversationToKBModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  messages: Array<{
    id: string
    role: "user" | "assistant" | "audio" | "image" | "video"
    content: string
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
  }>
}

export function ConversationToKBModal({ isOpen, onOpenChange, messages }: ConversationToKBModalProps) {
  const addKnowledgeEntry = useIntelligenceStore((state) => state.addKnowledgeEntry)

  const [title, setTitle] = React.useState("Conversation with RIZZ")
  const [category, setCategory] = React.useState("conversation")
  const [tags, setTags] = React.useState("conversation, chat, rizz")
  const [priority, setPriority] = React.useState<"high" | "medium" | "low">("medium")
  const [isSaving, setIsSaving] = React.useState(false)

  // Format conversation content
  const formatConversationContent = () => {
    const conversationText = messages.map(msg => {
      const time = msg.timestamp.toLocaleTimeString()
      const speaker = msg.role === "user" ? "You" : "RIZZ"
      return `[${time}] ${speaker}: ${msg.content}`
    }).join('\n\n')

    return `## Conversation Summary\n\n**Date:** ${new Date().toLocaleDateString()}\n**Participants:** You, RIZZ\n\n## Full Conversation\n\n${conversationText}`
  }

  const [content, setContent] = React.useState(formatConversationContent())

  React.useEffect(() => {
    setContent(formatConversationContent())
  }, [messages])

  const handleSaveToKB = () => {
    setIsSaving(true)
    try {
      addKnowledgeEntry({
        title,
        content,
        category,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        priority
      })
      onOpenChange(false)
      // Reset form
      setTitle("Conversation with RIZZ")
      setCategory("conversation")
      setTags("conversation, chat, rizz")
      setPriority("medium")
      setContent(formatConversationContent())
    } catch (error) {
      console.error("Error saving conversation to knowledge base:", error)
      alert("Failed to save conversation to knowledge base. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreview = () => {
    // Navigate to knowledge base
    window.location.href = "/knowledge"
  }

  if (!isOpen) return null

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Add Conversation to Knowledge Base</AlertDialogTitle>
          <AlertDialogDescription>
            Customize the entry details before saving your conversation to the knowledge base.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Entry Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Entry Title</label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a descriptive title for this conversation"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              >
                <option value="conversation">Conversation</option>
                <option value="insight">Insight</option>
                <option value="project">Project</option>
                <option value="strategy">Strategy</option>
                <option value="resource">Resource</option>
                <option value="memory">Memory</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="tags" className="text-sm font-medium">Tags (comma-separated)</label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., conversation, chat, rizz, project"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium">Priority</label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as "high" | "medium" | "low")}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Conversation Content Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Conversation Content</label>
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Preview</span>
                <Button variant="outline" size="sm" onClick={handlePreview}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Knowledge Base
                </Button>
              </div>
              <div className="bg-background rounded p-3 max-h-60 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap">{content}</pre>
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>Cancel</AlertDialogCancel>
          <Button
            onClick={handleSaveToKB}
            disabled={isSaving}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? "Saving..." : "Save to Knowledge Base"}</span>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}