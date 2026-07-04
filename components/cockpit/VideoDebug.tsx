"use client"

import * as React from "react"
import { useDailyCall } from "@/hooks/useDailyCall"

interface VideoDebugProps {
  roomUrl: string
  roomToken?: string
  userName?: string
}

export function VideoDebug({ roomUrl, roomToken, userName = "Debug User" }: VideoDebugProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  
  const {
    isJoining,
    isJoined,
    isMuted,
    isVideoOff,
    isScreenSharing,
    participants,
    error,
    joinCall,
    leaveCall,
    toggleMicrophone,
    toggleCamera,
    toggleScreenShare
  } = useDailyCall({ userName, containerRef })

  const participantCount = participants ? Object.keys(participants).length : 0

  const handleJoin = async () => {
    if (containerRef.current) {
      console.log('Container ref exists:', containerRef.current)
      console.log('Container children before join:', containerRef.current.children.length)
    }
    await joinCall(roomUrl, roomToken)
  }

  const handleLeave = async () => {
    await leaveCall()
  }

  React.useEffect(() => {
    if (isJoined && containerRef.current) {
      console.log('Container children after join:', containerRef.current.children.length)
      console.log('Container innerHTML:', containerRef.current.innerHTML)
      console.log('Container style:', containerRef.current.style)
    }
  }, [isJoined])

  return (
    <div className="p-4 border-2 border-blue-500 rounded-lg bg-blue-50">
      <h3 className="text-lg font-bold mb-2">Video Debug Panel</h3>
      
      <div className="space-y-2 mb-4">
        <div>Status: {isJoined ? 'Joined' : isJoining ? 'Joining...' : 'Not joined'}</div>
        <div>Participants: {participantCount}</div>
        <div>Microphone: {isMuted ? 'Muted' : 'Unmuted'}</div>
        <div>Camera: {isVideoOff ? 'Off' : 'On'}</div>
        <div>Screen Share: {isScreenSharing ? 'Sharing' : 'Not sharing'}</div>
        {error && <div className="text-red-600">Error: {error}</div>}
      </div>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={handleJoin}
          disabled={isJoining || isJoined}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        >
          Join Call
        </button>
        <button
          onClick={handleLeave}
          disabled={!isJoined}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
        >
          Leave Call
        </button>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Toggle Container
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <div className="text-sm text-muted-foreground">
          Note: Audio/Video controls are handled by Daily.co's prebuilt UI
        </div>
      </div>

      <div className="border-2 border-gray-400 rounded-lg p-2 bg-white">
        <div className="text-sm font-bold mb-2">Daily.co Container:</div>
        <div 
          ref={containerRef}
          className="w-full h-64 bg-gray-200 border-2 border-dashed rounded"
          style={{ minHeight: '200px', position: 'relative' }}
        >
          {isVisible && (
            <div className="text-center text-gray-500 pt-8">
              Daily.co iframe should appear here
            </div>
          )}
        </div>
      </div>
    </div>
  )
}