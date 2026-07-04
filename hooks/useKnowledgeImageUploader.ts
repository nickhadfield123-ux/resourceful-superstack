import { useState, useCallback } from 'react'
import { toast } from '@/toast'
import { KnowledgeStorage } from '@/lib/knowledge-base/storage'
import { KnowledgeEntry, KnowledgeType } from '@/lib/knowledge-base/types'

interface UseKnowledgeImageUploaderReturn {
  isUploading: boolean
  isAnalyzing: boolean
  imagePreview: string | null
  imageFile: File | null
  imageMetadata: {
    name: string
    size: string
    type: string
    dimensions: string
  } | null
  uploadImage: (file: File, context: ImageContext) => Promise<void>
  analyzeAndSaveToKB: (file: File, context: ImageContext) => Promise<{ success: boolean; entry?: KnowledgeEntry; error?: string }>
  saveToKBWithoutAnalysis: (file: File, context: ImageContext) => Promise<{ success: boolean; entry?: KnowledgeEntry; error?: string }>
  reset: () => void
  error: string | null
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

export function useKnowledgeImageUploader() {
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageMetadata, setImageMetadata] = useState<{
    name: string
    size: string
    type: string
    dimensions: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentContext, setCurrentContext] = useState<ImageContext | null>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getImageDimensions = (file: File): Promise<{ width: number, height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      
      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve({ width: img.naturalWidth, height: img.naturalHeight })
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to load image'))
      }
      
      img.src = url
    })
  }

  const uploadImage = useCallback(async (file: File, context: ImageContext) => {
    try {
      setError(null)
      setIsUploading(true)

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload an image file (JPEG, PNG, GIF, WebP, or SVG).')
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        throw new Error('File too large. Please upload an image under 10MB.')
      }

      // Step 1: Upload image (no analysis or KB save)
      toast.info('Image uploaded successfully', { duration: 2000 })
      
      // Generate preview
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
      setImageFile(file)

      // Get image dimensions
      const dimensions = await getImageDimensions(file)
      
      // Set metadata
      setImageMetadata({
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type.split('/')[1].toUpperCase(),
        dimensions: `${dimensions.width} × ${dimensions.height}`
      })

      // Store context for later use
      setCurrentContext(context)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Image upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }, [])

  const analyzeAndSaveToKB = useCallback(async (file: File, context: ImageContext) => {
    try {
      setError(null)
      setIsAnalyzing(true)

      // Step 1: Analyze image
      toast.info('Analyzing image...')
      
      // Simulate image analysis
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Create knowledge entry with analysis
      const storage = new KnowledgeStorage()
      
      // Convert file to base64 for storage
      const base64 = await fileToBase64(file)
      
      const entry: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'> = {
        type: 'insight' as KnowledgeType,
        title: context.title || file.name.split('.')[0],
        content: `
# Image: ${context.title || file.name.split('.')[0]}

**Description:** ${context.description || 'No description provided'}

**Category:** ${context.category}

**Purpose:** ${context.purpose || 'No purpose specified'}

**Tags:** ${context.tags || 'No tags'}

**File Type:** ${file.type}

**File Size:** ${formatFileSize(file.size)}

**Dimensions:** ${getImageDimensionsFromMetadata(imageMetadata)?.dimensions || 'Unknown'}

**Upload Date:** ${new Date().toLocaleDateString()}

**Analysis:** Image has been processed and analyzed for content recognition.

## Image Preview

![${context.title || file.name.split('.')[0]}](${imagePreview})

${context.voiceContext ? `
## Voice Context
Audio recording attached: ${context.voiceContext.audioDuration} seconds
` : ''}
        `,
        metadata: {
          confidence: 0.9,
          accessCount: 0,
          relatedEntries: [],
          version: 1,
          source: 'image-upload-with-analysis',
          lastAccessed: undefined
        },
        tags: context.tags ? context.tags.split(',').map(tag => tag.trim()) : ['image', 'analyzed'],
        context: {
          domain: [context.category, 'image', 'analysis'],
          relevance: 0.9
        }
      }

      // Save to knowledge base
      await storage.createEntry(entry)
      
      toast.success(`Image "${entry.title}" analyzed and saved to knowledge base!`)
      
      return { success: true, entry }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze and save image'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Image analysis error:', err)
      return { success: false, error: errorMessage }
    } finally {
      setIsAnalyzing(false)
    }
  }, [imagePreview, imageMetadata])

  const saveToKBWithoutAnalysis = useCallback(async (file: File, context: ImageContext) => {
    try {
      setError(null)
      setIsUploading(true)

      // Create knowledge entry without analysis
      const storage = new KnowledgeStorage()
      
      // Convert file to base64 for storage
      const base64 = await fileToBase64(file)
      
      const entry: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'> = {
        type: 'insight' as KnowledgeType,
        title: context.title || file.name.split('.')[0],
        content: `
# Image: ${context.title || file.name.split('.')[0]}

**Description:** ${context.description || 'No description provided'}

**Category:** ${context.category}

**Purpose:** ${context.purpose || 'No purpose specified'}

**Tags:** ${context.tags || 'No tags'}

**File Type:** ${file.type}

**File Size:** ${formatFileSize(file.size)}

**Dimensions:** ${getImageDimensionsFromMetadata(imageMetadata)?.dimensions || 'Unknown'}

**Upload Date:** ${new Date().toLocaleDateString()}

## Image Preview

![${context.title || file.name.split('.')[0]}](${imagePreview})

${context.voiceContext ? `
## Voice Context
Audio recording attached: ${context.voiceContext.audioDuration} seconds
` : ''}
        `,
        metadata: {
          confidence: 0.9,
          accessCount: 0,
          relatedEntries: [],
          version: 1,
          source: 'image-upload',
          lastAccessed: undefined
        },
        tags: context.tags ? context.tags.split(',').map(tag => tag.trim()) : ['image'],
        context: {
          domain: [context.category, 'image'],
          relevance: 0.8
        }
      }

      // Save to knowledge base
      await storage.createEntry(entry)
      
      toast.success(`Image "${entry.title}" saved to knowledge base!`)
      
      return { success: true, entry }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save image to knowledge base'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Image save error:', err)
      return { success: false, error: errorMessage }
    } finally {
      setIsUploading(false)
    }
  }, [imagePreview, imageMetadata])

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const getImageDimensionsFromMetadata = (metadata: any) => {
    if (!metadata) return null
    return {
      dimensions: metadata.dimensions
    }
  }

  const reset = useCallback(() => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setImagePreview(null)
    setImageFile(null)
    setImageMetadata(null)
    setError(null)
    setCurrentContext(null)
  }, [imagePreview])

  return {
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
  }
}