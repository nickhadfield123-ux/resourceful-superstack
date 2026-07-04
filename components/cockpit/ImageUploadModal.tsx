"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useKnowledgeImageUploaderV2 } from "@/hooks/useKnowledgeImageUploaderV2"
import { Mic, MicOff, Image, RotateCcw, Save, X, FileText, Tag, FileImage } from "lucide-react"
import { AudioContextModal } from "./AudioContextModal"

interface ImageUploadModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onImageUploaded: (imageFile: File, context: ImageContext) => void
}

interface ImageContext {
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

export function ImageUploadModal({ isOpen, onOpenChange, onImageUploaded }: ImageUploadModalProps) {
  const {
    isUploading,
    isAnalyzing,
    imagePreview,
    imageFile,
    imageMetadata,
    uploadImage,
    analyzeAndSaveToKB,
    saveToKBWithoutAnalysis,
    reset,
    error
  } = useKnowledgeImageUploaderV2()

  const [context, setContext] = React.useState<ImageContext>({
    title: "",
    description: "",
    category: "general",
    tags: "",
    purpose: ""
  })

  const [showVoiceModal, setShowVoiceModal] = React.useState(false)
  const [hasVoiceContext, setHasVoiceContext] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      uploadImage(file, context)
      // Set default title from filename
      setContext(prev => ({ ...prev, title: file.name.split('.')[0] }))
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      uploadImage(files[0], context)
      // Set default title from filename
      setContext(prev => ({ ...prev, title: files[0].name.split('.')[0] }))
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleVoiceRecorded = (audioBlob: Blob, audioUrl: string, audioDuration: number) => {
    setContext(prev => ({
      ...prev,
      voiceContext: { audioBlob, audioUrl, audioDuration }
    }))
    setHasVoiceContext(true)
  }

  const handleSendToChat = async () => {
    if (!imageFile) {
      alert("Please select an image first.")
      return
    }

    try {
      // Analyze and save to knowledge base
      const result = await analyzeAndSaveToKB(imageFile, context)
      
      if (result.success) {
        // Send image to chat (this would need to be implemented based on your chat system)
        onImageUploaded(imageFile, context)
        
        onOpenChange(false)
        reset()
        setContext({
          title: "",
          description: "",
          category: "general",
          tags: "",
          purpose: ""
        })
        setHasVoiceContext(false)
      }
    } catch (error) {
      console.error("Failed to process image:", error)
    }
  }

  const handleSaveToKB = async () => {
    if (!imageFile) {
      alert("Please select an image first.")
      return
    }

    try {
      // Save to knowledge base without analysis
      const result = await saveToKBWithoutAnalysis(imageFile, context)
      
      if (result.success) {
        onOpenChange(false)
        reset()
        setContext({
          title: "",
          description: "",
          category: "general",
          tags: "",
          purpose: ""
        })
        setHasVoiceContext(false)
      }
    } catch (error) {
      console.error("Failed to save image to knowledge base:", error)
    }
  }

  const handleClose = () => {
    reset()
    setContext({
      title: "",
      description: "",
      category: "general",
      tags: "",
      purpose: ""
    })
    setHasVoiceContext(false)
    onOpenChange(false)
  }

  if (!isOpen) return null

  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
        <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <div className="overflow-y-auto max-h-[70vh]">
            <AlertDialogHeader>
              <AlertDialogTitle>Upload Image with Context</AlertDialogTitle>
              <AlertDialogDescription>
                Upload an image and add context to make it searchable and meaningful in your knowledge base.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-6">
              {/* File Upload Section */}
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging 
                    ? "border-primary bg-primary/5" 
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center space-y-4">
                  <FileImage className="h-12 w-12 text-gray-400" />
                  <div className="space-y-2">
                    <Button
                      onClick={handleButtonClick}
                      variant="outline"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 border-0"
                    >
                      Choose Image
                    </Button>
                    <input
                      ref={fileInputRef}
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <p className="text-sm text-gray-500">or drag and drop your image here</p>
                    <p className="text-sm text-gray-500">Supports JPEG, PNG, GIF, WebP, SVG</p>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {imageMetadata && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="font-medium">Name:</span> {imageMetadata.name}
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="font-medium">Size:</span> {imageMetadata.size}
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="font-medium">Type:</span> {imageMetadata.type}
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="font-medium">Dimensions:</span> {imageMetadata.dimensions}
                    </div>
                  </div>
                )}
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Image Preview</span>
                    <Button
                      onClick={reset}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Re-select</span>
                    </Button>
                  </div>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-auto rounded max-h-64 object-contain"
                  />
                </div>
              )}

              {/* Context Input Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Title</span>
                  </label>
                  <Input
                    id="title"
                    value={context.title}
                    onChange={(e) => setContext(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter a descriptive title"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">Category</label>
                  <select
                    id="category"
                    value={context.category}
                    onChange={(e) => setContext(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  >
                    <option value="debugging">Debugging</option>
                    <option value="design">Design</option>
                    <option value="code">Code</option>
                    <option value="documentation">Documentation</option>
                    <option value="inspiration">Inspiration</option>
                    <option value="progress">Progress</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Description</span>
                </label>
                <Textarea
                  id="description"
                  value={context.description}
                  onChange={(e) => setContext(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this image shows and why it's important..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="purpose" className="text-sm font-medium">Purpose</label>
                <Textarea
                  id="purpose"
                  value={context.purpose}
                  onChange={(e) => setContext(prev => ({ ...prev, purpose: e.target.value }))}
                  placeholder="What is this image for? (e.g., debugging help, design reference, code explanation)"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="tags" className="text-sm font-medium flex items-center space-x-2">
                  <Tag className="h-4 w-4" />
                  <span>Tags (comma-separated)</span>
                </label>
                <Input
                  id="tags"
                  value={context.tags}
                  onChange={(e) => setContext(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="e.g., bug, ui, feature, reference"
                />
              </div>

              {/* Voice Context Section */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium flex items-center space-x-2">
                    <Mic className="h-4 w-4" />
                    <span>Voice Context</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    {hasVoiceContext && (
                      <span className="text-xs text-green-600">✓ Voice context added</span>
                    )}
                    <Button
                      onClick={() => setShowVoiceModal(true)}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      {hasVoiceContext ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      <span>{hasVoiceContext ? "Re-record" : "Add Voice"}</span>
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Add a voice explanation to provide additional context about this image.
                </p>
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleClose}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </AlertDialogCancel>
              <Button
                onClick={handleSaveToKB}
                disabled={!imageFile || isUploading}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{isUploading ? "Processing..." : "Save to KB"}</span>
              </Button>
              <Button
                onClick={handleSendToChat}
                disabled={!imageFile || isUploading}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{isUploading ? "Processing..." : "Send to Chat"}</span>
              </Button>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Voice Recording Modal */}
      <AudioContextModal
        isOpen={showVoiceModal}
        onOpenChange={setShowVoiceModal}
        onAudioRecorded={handleVoiceRecorded}
      />
    </>
  )
}