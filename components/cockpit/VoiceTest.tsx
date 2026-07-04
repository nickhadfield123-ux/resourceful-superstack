"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AudioContextModal } from "@/components/cockpit/AudioContextModal"
import { useAudioRecorder } from "@/hooks/useAudioRecorder"
import { Mic, MicOff, Play, Pause, RotateCcw, Save } from "lucide-react"

export function VoiceTest() {
  const [showAudioModal, setShowAudioModal] = React.useState(false)
  const [testMessages, setTestMessages] = React.useState<any[]>([])

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

  const handleTestAudio = () => {
    setShowAudioModal(true)
  }

  const handleAudioRecorded = (audioBlob: Blob, audioUrl: string, audioDuration: number) => {
    const testMessage = {
      id: Date.now().toString(),
      content: "Test voice message",
      timestamp: new Date(),
      audioBlob,
      audioUrl,
      audioDuration
    }
    setTestMessages(prev => [...prev, testMessage])
    console.log("Test audio message created:", testMessage)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Voice Recording Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Test Controls */}
          <div className="flex space-x-2">
            <Button
              onClick={handleTestAudio}
              className="flex items-center space-x-2"
            >
              <Mic className="h-4 w-4" />
              <span>Test Voice Recording</span>
            </Button>
            
            {!isRecording ? (
              <Button
                onClick={startRecording}
                disabled={isRecording}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600"
              >
                <Mic className="h-4 w-4" />
                <span>Start Recording</span>
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
              >
                <MicOff className="h-4 w-4" />
                <span>Stop Recording</span>
              </Button>
            )}
            
            {audioUrl && (
              <Button
                onClick={isPlaying ? stopAudio : playAudio}
                variant="outline"
                className="flex items-center space-x-2"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span>{isPlaying ? "Stop" : "Play"}</span>
              </Button>
            )}
            
            {audioUrl && (
              <Button
                onClick={reset}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </Button>
            )}
          </div>

          {/* Status Display */}
          <div className="space-y-2">
            {isRecording && (
              <div className="flex items-center space-x-2 text-red-600">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                <span className="font-medium">Recording...</span>
                <span className="text-sm text-gray-600">({Math.floor(Date.now() / 1000)}s)</span>
              </div>
            )}
            
            {audioUrl && (
              <div className="flex items-center space-x-4 text-green-600">
                <span className="font-medium">Audio Ready</span>
                <span className="text-sm">Duration: {Math.floor(audioDuration)}s</span>
              </div>
            )}
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Test Messages */}
          {testMessages.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Test Messages:</h4>
              {testMessages.map((msg) => (
                <div key={msg.id} className="flex items-center space-x-3 p-2 border rounded">
                  <span className="text-sm font-medium">{msg.content}</span>
                  <span className="text-xs text-gray-600">{Math.floor(msg.audioDuration)}s</span>
                  <span className="text-xs text-gray-600">{msg.timestamp.toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audio Context Modal */}
      <AudioContextModal
        isOpen={showAudioModal}
        onOpenChange={setShowAudioModal}
        onAudioRecorded={handleAudioRecorded}
      />
    </div>
  )
}