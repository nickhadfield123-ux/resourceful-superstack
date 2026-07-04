"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useDailyCallSimple } from "@/hooks/useDailyCallSimple"
import { toast } from "@/toast"

interface DailySimpleTestProps {
  roomUrl?: string
  roomToken?: string
  userName?: string
}

export function DailySimpleTest({ 
  roomToken,
  userName = "Test User"
}: DailySimpleTestProps) {
  const [roomUrl, setRoomUrl] = React.useState("")
  const [isCreatingRoom, setIsCreatingRoom] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  
  const {
    isJoining,
    isJoined,
    participants,
    error,
    joinCall,
    leaveCall
  } = useDailyCallSimple({ userName, containerRef })

  const participantCount = participants ? Object.keys(participants).length : 0

  const handleCreateRoom = async () => {
    setIsCreatingRoom(true)
    try {
      const response = await fetch('/api/daily/room', { method: 'POST' })
      const data = await response.json()
      
      if (data.roomUrl) {
        setRoomUrl(data.roomUrl)
        console.log('Created room:', data.roomUrl)
        
        // Join the created room immediately
        await joinCall(data.roomUrl, data.token)
      } else {
        toast.error('Failed to create room - no URL returned')
      }
    } catch (error) {
      console.error('Failed to create room:', error)
      toast.error('Failed to create room')
    } finally {
      setIsCreatingRoom(false)
    }
  }

  const handleJoin = async () => {
    if (!roomUrl) {
      toast.error('No room available - create one first')
      return
    }
    await joinCall(roomUrl, roomToken)
  }

  const handleLeave = async () => {
    await leaveCall()
  }

  return (
    <div className="p-4 border-2 border-green-500 rounded-lg bg-green-50">
      <h3 className="text-lg font-bold mb-2">Daily Simple Test</h3>
      
      <div className="space-y-4 mb-4">
        <div className="grid grid-cols-4 gap-2">
          <div>
            <label htmlFor="roomUrl" className="text-sm font-medium">
              Room URL
            </label>
            <Input
              id="roomUrl"
              value={roomUrl}
              onChange={(e) => setRoomUrl(e.target.value)}
              placeholder="https://your-team.daily.co/room-name"
              disabled={isJoining || isJoined}
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleCreateRoom}
              disabled={isCreatingRoom || isJoining || isJoined}
              className="w-full"
            >
              {isCreatingRoom ? 'Creating...' : 'Create Room'}
            </Button>
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleJoin}
              disabled={!roomUrl || isJoining || isJoined}
              className="w-full"
            >
              {isJoining ? 'Joining...' : 'Join Call'}
            </Button>
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleLeave}
              disabled={!isJoined}
              variant="destructive"
              className="w-full"
            >
              Leave Call
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-sm">
          <div>Status: {isJoined ? 'Joined' : isJoining ? 'Joining...' : 'Not joined'}</div>
          <div>Participants: {participantCount}</div>
          {error && <div className="text-red-600 col-span-2">Error: {error}</div>}
        </div>
      </div>

      <div className="border-2 border-gray-400 rounded-lg p-2 bg-white">
        <div className="text-sm font-bold mb-2">Daily.co Container:</div>
        <div 
          ref={containerRef}
          className="w-full h-64 bg-gray-200 border-2 border-dashed rounded"
          style={{ minHeight: '200px', position: 'relative' }}
        >
          {!isJoined && (
            <div className="text-center text-gray-500 pt-8">
              Daily.co iframe will appear here after joining
            </div>
          )}
        </div>
      </div>
    </div>
  )
}