"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { useCallback } from "react"

interface ParticipantVideoProps {
  participant: any
  isLocal: boolean
  onVideoElementCreated?: (element: HTMLVideoElement) => void
}

export function ParticipantVideo({ 
  participant, 
  isLocal, 
  onVideoElementCreated 
}: ParticipantVideoProps) {
  const videoContainerRef = React.useRef<HTMLDivElement>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [isVideoReady, setIsVideoReady] = React.useState(false)

  // Use ref to hold the callback to prevent infinite renders
  const onVideoElementCreatedRef = React.useRef(onVideoElementCreated)

  // Update the ref when the prop changes
  React.useEffect(() => {
    onVideoElementCreatedRef.current = onVideoElementCreated
  }, [onVideoElementCreated])

  React.useEffect(() => {
    if (videoRef.current && videoContainerRef.current) {
      // Move video element to container if not already there
      if (videoRef.current.parentElement !== videoContainerRef.current) {
        videoContainerRef.current.appendChild(videoRef.current)
      }
      // Only set isVideoReady to true once, not on every render
      if (!isVideoReady) {
        setIsVideoReady(true)
      }
      onVideoElementCreatedRef.current?.(videoRef.current)
    }
  }, [videoRef, isVideoReady]) // Include isVideoReady in dependencies

  const displayName = isLocal 
    ? "You" 
    : (participant?.user_name || participant?.name || "Participant")

  return (
    <div 
      ref={videoContainerRef}
      className="relative group bg-slate-900 rounded-xl overflow-hidden aspect-video"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className="w-full h-full object-cover"
      />
      
      {/* Overlay Label */}
      <div className="absolute bottom-2 left-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
        <span className="text-white text-sm font-medium">
          {displayName}
        </span>
        {isLocal && (
          <Badge variant="secondary" className="ml-2 text-xs">
            You
          </Badge>
        )}
      </div>

      {/* Connection Status */}
      {!isVideoReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="text-white text-sm">Connecting...</div>
        </div>
      )}
    </div>
  )
}