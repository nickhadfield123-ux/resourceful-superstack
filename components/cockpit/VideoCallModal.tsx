"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useDailyCall } from "@/hooks/useDailyCall"
import { useCall } from "@/lib/cockpit/context"
import { toast } from "@/toast"
import { Mic, MicOff, Video, VideoOff, Monitor, Phone, PhoneOff, Users, Maximize2, Minimize2, Copy, Loader2, Sparkles } from "lucide-react"

interface VideoCallModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  roomUrl?: string
  roomToken?: string
  userName?: string
}

export function VideoCallModal({ 
  isOpen, 
  onOpenChange, 
  roomUrl: initialRoomUrl,
  roomToken,
  userName = "Guest"
}: VideoCallModalProps) {
  const [roomUrl, setRoomUrl] = React.useState(initialRoomUrl || "")
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [isCreatingRoom, setIsCreatingRoom] = React.useState(false)
  const videoContainerRef = React.useRef<HTMLDivElement>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  
  // Call state management
  const { state: callState, dispatch: callDispatch } = useCall()
  
  const {
    isJoining,
    isJoined,
    isMuted,
    isVideoOff,
    isScreenSharing,
    participants,
    error,
    trackEvent,
    joinCall,
    leaveCall,
    toggleMicrophone,
    toggleCamera,
    toggleScreenShare
  } = useDailyCall({ userName, videoRef })


  // Get participant count
  const participantCount = participants ? Object.keys(participants).length : 0

  // Handle join
  const handleJoin = async () => {
    if (!roomUrl) {
      toast.error('Please enter a room URL')
      return
    }
    await joinCall(roomUrl, roomToken)
    // Sync with global call state
    callDispatch({
      type: 'START_CALL',
      payload: { roomUrl, roomToken }
    })
  }

  // Create a new room
  const handleCreateRoom = async () => {
    setIsCreatingRoom(true)
    try {
      const response = await fetch('/api/daily/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName })
      })
      
      if (!response.ok) {
        throw new Error('Failed to create room')
      }
      
      const data = await response.json()
      setRoomUrl(data.roomUrl)
      toast.success('Room created! Joining...')
      
      // Auto-join the created room
      await joinCall(data.roomUrl, data.token)
    } catch (err) {
      toast.error('Failed to create room. Check if DAILY_API_KEY is set.')
      console.error(err)
    } finally {
      setIsCreatingRoom(false)
    }
  }

  // Handle leave
  const handleLeave = async () => {
    await leaveCall()
    // Sync with global call state
    callDispatch({ type: 'END_CALL' })
    onOpenChange(false)
  }

  // Copy room link
  const handleCopyLink = () => {
    if (roomUrl) {
      navigator.clipboard.writeText(roomUrl)
      toast.success('Room link copied!')
    }
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return
    
    if (!isFullscreen) {
      videoContainerRef.current.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
    setIsFullscreen(!isFullscreen)
  }

  // Clean up on close
  const handleClose = async () => {
    if (isJoined) {
      await leaveCall()
    }
    onOpenChange(false)
  }

  // Auto-join if URL provided
  React.useEffect(() => {
    if (isOpen && initialRoomUrl && !isJoined && !isJoining) {
      joinCall(initialRoomUrl, roomToken)
    }
  }, [isOpen, initialRoomUrl])

  // Handle track events to render video
  React.useEffect(() => {
    if (trackEvent && videoRef.current) {
      const { track, participant } = trackEvent
      
      // Only handle local video tracks for now
      if (participant && participant.local && track && track.kind === 'video') {
        console.log('🎥 Attaching local video track to video element:', track)
        
        // Create a new MediaStream with just this track
        const mediaStream = new MediaStream([track])
        
        // Attach to video element
        videoRef.current.srcObject = mediaStream
        
        // Handle cleanup when track stops
        track.addEventListener('ended', () => {
          console.log('🎥 Video track ended, clearing video element')
          videoRef.current!.srcObject = null
        })
      }
    }
  }, [trackEvent])

  if (!isOpen) return null

  return (
    <div>
      <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
        <AlertDialogContent className={`${isFullscreen ? 'max-w-full h-full' : 'max-w-5xl'} max-h-[95vh] overflow-hidden transition-all duration-300`}>
          <div ref={videoContainerRef} className="flex flex-col h-full">
            <AlertDialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <AlertDialogTitle>Video Call</AlertDialogTitle>
                  <AlertDialogDescription>
                    {isJoined 
                      ? `In call with ${participantCount} participant${participantCount !== 1 ? 's' : ''}`
                      : 'Join or create a video call room'
                    }
                  </AlertDialogDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {isJoined && (
                    <>
                      <Button onClick={toggleFullscreen} variant="outline" size="sm">
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </Button>
                      <Button onClick={handleCopyLink} variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </AlertDialogHeader>

            <div className="flex-1 overflow-hidden">
              {/* Video container with custom video element */}
              <div className={`w-full h-full rounded-lg overflow-hidden relative transition-all duration-300 ${
                isJoined 
                  ? 'bg-gray-900' 
                  : 'bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center'
              }`} style={{ minHeight: '200px' }}>
                {!isJoined && (
                  <div className="text-center text-gray-500">
                    <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Video will appear here when you join a call</p>
                  </div>
                )}
                
                {/* Custom video element for local video */}
                {isJoined && (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                )}
                
                {isJoined && (
                  <div className="absolute bottom-4 left-4 bg-black/50 rounded-lg px-3 py-2">
                    <div className="flex items-center space-x-2 text-white">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{participantCount} in call</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls and input area */}
              <div className="mt-4 space-y-4">
                {!isJoined ? (
                  <div className="w-full max-w-md space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="roomUrl" className="text-sm font-medium">
                        Room URL
                      </label>
                      <Input
                        id="roomUrl"
                        value={roomUrl}
                        onChange={(e) => setRoomUrl(e.target.value)}
                        placeholder="https://your-team.daily.co/room-name"
                        disabled={isJoining}
                      />
                      <p className="text-xs text-gray-500">
                        Enter a Daily.co room URL or create one from your dashboard
                      </p>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button
                        onClick={handleJoin}
                        disabled={!roomUrl || isJoining}
                        className="flex-1"
                        size="lg"
                      >
                        {isJoining ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Joining...
                          </>
                        ) : (
                          <>
                            <Phone className="h-5 w-5 mr-2" />
                            Join Call
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleCreateRoom}
                        disabled={isCreatingRoom || isJoining}
                        variant="outline"
                        size="lg"
                      >
                        {isCreatingRoom ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          'Create Room'
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Button
                      onClick={handleLeave}
                      variant="destructive"
                      size="lg"
                      className="rounded-full px-6"
                    >
                      <PhoneOff className="h-5 w-5 mr-2" />
                      Leave
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {!isJoined && (
              <div className="flex-shrink-0">
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={handleClose}>
                    Cancel
                  </AlertDialogCancel>
                </AlertDialogFooter>
              </div>
            )}
          </div>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
