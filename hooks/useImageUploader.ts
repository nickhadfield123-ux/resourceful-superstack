import { useState, useCallback } from 'react'

interface UseImageUploaderReturn {
  isUploading: boolean
  imagePreview: string | null
  imageFile: File | null
  imageMetadata: {
    name: string
    size: string
    type: string
    dimensions: string
  } | null
  uploadImage: (file: File) => Promise<void>
  reset: () => void
  error: string | null
}

export function useImageUploader() {
  const [isUploading, setIsUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageMetadata, setImageMetadata] = useState<{
    name: string
    size: string
    type: string
    dimensions: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  const uploadImage = useCallback(async (file: File) => {
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

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
      console.error('Image upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }, [])

  const reset = useCallback(() => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setImagePreview(null)
    setImageFile(null)
    setImageMetadata(null)
    setError(null)
  }, [imagePreview])

  return {
    isUploading,
    imagePreview,
    imageFile,
    imageMetadata,
    uploadImage,
    reset,
    error
  }
}