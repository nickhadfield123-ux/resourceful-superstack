"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useScreenRecorder } from "@/hooks/useScreenRecorder"
import { toast } from "@/toast"
import { Mic, MicOff, Video, VideoOff, Download, RotateCcw, Save, X, FileText, Tag, Monitor, Camera, Square, Circle, Send } from "lucide-react"
import { AudioContextModal } from "./AudioContextModal"

interface ScreenRecordModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onVideoRecorded: (videoBlob: Blob, context: any) => void
  onSendToChat?: (videoBlob: Blob, context: any) => void
}

interface ScreenRecordContext {
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

export function ScreenRecordModal({ isOpen, onOpenChange, onVideoRecorded, onSendToChat }: ScreenRecordModalProps) {
  const {
    isRecording,
    isRecordingScreen,
    isRecordingAudio,
    recordingTime,
    videoUrl,
    videoBlob,
    startRecording,
    stopRecording,
    reset,
    error
  } = useScreenRecorder()

  const [context, setContext] = React.useState<ScreenRecordContext>({
    title: "",
    description: "",
    category: "general",
    tags: "",
    purpose: ""
  })

  const [showVoiceModal, setShowVoiceModal] = React.useState(false)
  const [hasVoiceContext, setHasVoiceContext] = React.useState(false)
  const [isPreparing, setIsPreparing] = React.useState(false)

  const handleVoiceRecorded = (audioBlob: Blob, audioUrl: string, audioDuration: number) => {
    setContext(prev => ({
      ...prev,
      voiceContext: { audioBlob, audioUrl, audioDuration }
    }))
    setHasVoiceContext(true)
  }

  const handleStartRecording = async () => {
    try {
      setIsPreparing(true)
      toast.info('Preparing recording...')
      
      // Use voice context audio if available
      const audioSource = hasVoiceContext ? await getAudioStreamFromBlob(context.voiceContext!.audioBlob) : undefined
      
      await startRecording(audioSource)
      
      // Set default title from current time
      const now = new Date()
      const timeString = now.toLocaleTimeString()
      setContext(prev => ({ ...prev, title: `Screen Recording - ${timeString}` }))
      
    } catch (error) {
      console.error("Failed to start recording:", error)
    } finally {
      setIsPreparing(false)
    }
  }

  const handleStopRecording = () => {
    stopRecording()
  }

  const handleSaveToKB = async () => {
    if (!videoBlob) {
      alert("Please record a video first.")
      return
    }

    try {
      // Save video to knowledge base
      onVideoRecorded(videoBlob, context)
      
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
    } catch (error) {
      console.error("Failed to save video to knowledge base:", error)
    }
  }

  const handleDownloadVideo = () => {
    if (!videoUrl) {
      alert("No video to download.")
      return
    }

    const link = document.createElement('a')
    link.href = videoUrl
    link.download = `${context.title || 'screen-recording'}.webm`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Video downloaded successfully!')
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
        <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="overflow-y-auto max-h-[80vh]">
            <AlertDialogHeader>
              <AlertDialogTitle>Screen Recording with Context</AlertDialogTitle>
              <AlertDialogDescription>
                Record your screen with voice narration and add context to save it to your knowledge base.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-6">
              {/* Recording Controls */}
              <div className="border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {isRecording ? (
                        <Circle className="h-6 w-6 text-red-500 animate-pulse" />
                      ) : (
                        <Circle className="h-6 w-6 text-gray-400" />
                      )}
                      <span className="text-sm font-medium">Recording</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isRecordingScreen ? (
                        <Monitor className="h-6 w-6 text-blue-500" />
                      ) : (
                        <Monitor className="h-6 w-6 text-gray-400" />
                      )}
                      <span className="text-sm font-medium">Screen</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isRecordingAudio ? (
                        <Mic className="h-6 w-6 text-green-500" />
                      ) : (
                        <MicOff className="h-6 w-6 text-gray-400" />
                      )}
                      <span className="text-sm font-medium">Audio</span>
                    </div>
                  </div>
                  
                  <div className="text-2xl font-mono font-bold text-gray-600">
                    {recordingTime}
                  </div>
                </div>

                <div className="flex justify-center space-x-4">
                  {!isRecording ? (
                    <Button
                      onClick={handleStartRecording}
                      disabled={isPreparing}
                      className="bg-red-500 hover:bg-red-600 text-white px-8 py-6 text-lg font-semibold"
                    >
                      <Video className="h-6 w-6 mr-3" />
                      {isPreparing ? "Preparing..." : "Start Recording"}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleStopRecording}
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-8 py-6 text-lg font-semibold"
                    >
                      <Square className="h-6 w-6 mr-3" />
                      Stop Recording
                    </Button>
                  )}
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
              </div>

              {/* Video Preview */}
              {videoUrl && (
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Recording Preview</span>
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleDownloadVideo}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </Button>
                      <Button
                        onClick={reset}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>Re-record</span>
                      </Button>
                    </div>
                  </div>
                  <video
                    src={videoUrl}
                    controls
                    className="w-full h-auto rounded max-h-96"
                    poster="/api/placeholder/800/450"
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
                    disabled={isRecording}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">Category</label>
                  <select
                    id="category"
                    value={context.category}
                    onChange={(e) => setContext(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    disabled={isRecording}
                  >
                    <option value="tutorial">Tutorial</option>
                    <option value="debugging">Debugging</option>
                    <option value="demo">Demo</option>
                    <option value="meeting">Meeting</option>
                    <option value="presentation">Presentation</option>
                    <option value="workflow">Workflow</option>
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
                  placeholder="Describe what this recording shows and why it's important..."
                  rows={3}
                  disabled={isRecording}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="purpose" className="text-sm font-medium">Purpose</label>
                <Textarea
                  id="purpose"
                  value={context.purpose}
                  onChange={(e) => setContext(prev => ({ ...prev, purpose: e.target.value }))}
                  placeholder="What is this recording for? (e.g., team training, documentation, bug report)"
                  rows={2}
                  disabled={isRecording}
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
                  placeholder="e.g., tutorial, bug, feature, meeting"
                  disabled={isRecording}
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
                      disabled={isRecording}
                    >
                      {hasVoiceContext ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      <span>{hasVoiceContext ? "Re-record" : "Add Voice"}</span>
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Add a voice explanation to provide additional context about this recording.
                </p>
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleClose}>
                <div className="flex items-center space-x-2">
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </div>
              </AlertDialogCancel>
              {videoBlob && (
                <Button
                  onClick={handleDownloadVideo}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </Button>
              )}
              {onSendToChat && videoBlob && (
                <Button
                  onClick={() => {
                    onSendToChat(videoBlob, context)
                    handleClose()
                  }}
                  disabled={isRecording}
                  className="flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Send to Chat</span>
                </Button>
              )}
              <Button
                onClick={handleSaveToKB}
                disabled={!videoBlob || isRecording}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save to Knowledge Base</span>
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

// Helper function to create MediaStream from Blob
async function getAudioStreamFromBlob(blob: Blob): Promise<MediaStream> {
  const arrayBuffer = await blob.arrayBuffer()
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
  
  const source = audioContext.createBufferSource()
  source.buffer = audioBuffer
  
  const streamDestination = audioContext.createMediaStreamDestination()
  source.connect(streamDestination)
  source.start()
  
  return streamDestination.stream
}