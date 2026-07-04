"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useAudioRecorder } from "@/hooks/useAudioRecorder"
import { Mic, MicOff, Play, Pause, RotateCcw, Save, X } from "lucide-react"

interface AudioContextModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onAudioRecorded: (audioBlob: Blob, audioUrl: string, audioDuration: number) => void
}

export function AudioContextModal({ isOpen, onOpenChange, onAudioRecorded }: AudioContextModalProps) {
  const {
    isRecording,
    isPlaying,
    audioUrl,
    audioDuration,
    startRecording,
    stopRecording,
    playAudio,
    stopAudio,
    reset,
    error
  } = useAudioRecorder()

  const handleSaveAudio = () => {
    if (audioUrl) {
      // Create a blob from the audio URL
      fetch(audioUrl)
        .then(res => res.blob())
        .then(blob => {
          onAudioRecorded(blob, audioUrl, audioDuration)
          onOpenChange(false)
          reset()
        })
        .catch(err => {
          console.error("Error saving audio:", err)
          alert("Failed to save audio. Please try again.")
        })
    }
  }

  const handleClose = () => {
    stopAudio()
    reset()
    onOpenChange(false)
  }

  if (!isOpen) return null

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Record Audio Message</AlertDialogTitle>
          <AlertDialogDescription>
            Record a voice message to send to RIZZ. You can preview and edit before sending.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Recording Controls */}
          <div className="flex items-center justify-center space-x-4">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                disabled={isRecording}
                className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 text-white"
              >
                <Mic className="h-8 w-8" />
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 text-white"
              >
                <MicOff className="h-8 w-8" />
              </Button>
            )}
            
            {isRecording && (
              <div className="flex items-center space-x-2 text-red-600">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                <span className="font-medium">Recording...</span>
              </div>
            )}
          </div>

          {/* Audio Preview */}
          {audioUrl && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Audio Preview</span>
                <span className="text-sm text-muted-foreground">
                  {Math.floor(audioDuration)}s
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  onClick={isPlaying ? stopAudio : playAudio}
                  variant="outline"
                  size="sm"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isPlaying ? "Stop" : "Play"}
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
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </AlertDialogCancel>
          <Button
            onClick={handleSaveAudio}
            disabled={!audioUrl || isRecording}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Send Audio</span>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}