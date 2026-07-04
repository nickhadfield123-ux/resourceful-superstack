"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { FileText, Info, Send } from "lucide-react"

interface DocumentUploadModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSendToChat: (document: { name: string; context: string; content: string; storageType: 'chunked' | 'always_on' }) => void
}

export function DocumentUploadModal({ isOpen, onOpenChange, onSendToChat }: DocumentUploadModalProps) {
  const [documentName, setDocumentName] = React.useState("")
  const [documentContext, setDocumentContext] = React.useState("")
  const [documentContent, setDocumentContent] = React.useState("")
  const [storageType, setStorageType] = React.useState<'chunked' | 'always_on'>('chunked')

  const handleSendToChat = () => {
    if (!documentContent.trim()) return
    if (!documentName.trim()) return

    onSendToChat({
      name: documentName.trim(),
      context: documentContext.trim(),
      content: documentContent.trim(),
      storageType
    })

    // Reset and close
    setDocumentName("")
    setDocumentContext("")
    setDocumentContent("")
    setStorageType('chunked')
    onOpenChange(false)
  }

  const handleClose = () => {
    setDocumentName("")
    setDocumentContext("")
    setDocumentContent("")
    onOpenChange(false)
  }

  const wordCount = documentContent.trim().split(/\s+/).filter(Boolean).length

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-3xl max-h-[85vh] overflow-hidden">
        <div className="overflow-y-auto max-h-[75vh]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload Document
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Provide a document to Rizz. It will be analyzed and chunked for the knowledge base using the chat flow.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            {/* Document Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Name</label>
              <Input
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="e.g., Zero Point Operational Structure"
              />
              <p className="text-xs text-muted-foreground">
                This name will be used to identify all chunks from this document.
              </p>
            </div>

            {/* Document Context */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Info className="h-4 w-4" />
                Document Context (Optional)
              </label>
              <Textarea
                value={documentContext}
                onChange={(e) => setDocumentContext(e.target.value)}
                placeholder="e.g., Vision document - aspirational goals, not currently implemented. This describes what we want to build, not what exists today."
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                Add context that helps Rizz understand the nature of this document.
              </p>
            </div>

            {/* Storage Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Storage Type</label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    storageType === 'always_on' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setStorageType('always_on')}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <input 
                      type="radio" 
                      name="storageType" 
                      value="always_on" 
                      checked={storageType === 'always_on'}
                      onChange={() => setStorageType('always_on')}
                      className="mr-2"
                    />
                    <span className="font-semibold">Always On (Strategic)</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Always included in Rizz's context. Best for core knowledge like history, architecture, and principles.
                  </div>
                </div>
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    storageType === 'chunked' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setStorageType('chunked')}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <input 
                      type="radio" 
                      name="storageType" 
                      value="chunked" 
                      checked={storageType === 'chunked'}
                      onChange={() => setStorageType('chunked')}
                      className="mr-2"
                    />
                    <span className="font-semibold">Chunked (Regular KB)</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Semantic search retrieval. Best for detailed information and recent updates.
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {storageType === 'always_on' 
                  ? "Strategic docs are stored whole and always available to Rizz. Recommended for 10-15 core documents."
                  : "Chunked docs are processed through semantic search. Unlimited capacity for detailed information."
                }
              </p>
            </div>

            {/* Document Content */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Content</label>
              <Textarea
                value={documentContent}
                onChange={(e) => setDocumentContent(e.target.value)}
                placeholder="Paste your document content here..."
                rows={10}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {wordCount} words
              </p>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleClose}>Cancel</AlertDialogCancel>
            <Button
              onClick={handleSendToChat}
              disabled={!documentContent.trim() || !documentName.trim()}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Send to Chat
            </Button>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}