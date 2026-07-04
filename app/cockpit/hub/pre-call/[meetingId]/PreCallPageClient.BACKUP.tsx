"use client"

import * as React from "react"
import { PreCallPage } from "@/components/cockpit/PreCallPage"
import { MeetingService } from "@/lib/meetings/service"
import { Meeting } from "@/lib/meetings/types"
import { toast } from "@/toast"
import { useRouter, useSearchParams } from "next/navigation"

interface Props {
  meetingId: string
}

export function PreCallPageClient({ meetingId }: Props) {
  const router = useRouter()
  const [isLinkCopied, setIsLinkCopied] = React.useState(false)
  const [meeting, setMeeting] = React.useState<Meeting | null>(null)
  const [roomUrl, setRoomUrl] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  // Load meeting details
  React.useEffect(() => {
    const loadMeetingAndRoom = async () => {
      try {
        // Validate meetingId
        if (!meetingId || typeof meetingId !== 'string') {
          toast.error("Invalid meeting ID")
          router.push("/cockpit/hub")
          return
        }

        // Create mock meeting object
        const mockMeeting: Meeting = {
          id: meetingId,
          title: 'Team Meeting',
          meeting_type: 'team-sync',
          status: 'scheduled',
          start_time: new Date(),
          end_time: new Date(Date.now() + 3600000),
          timezone: 'UTC',
          all_day: false,
          created_by: 'mock-user',
          recording_enabled: false,
          visibility: 'private',
          created_at: new Date(),
          updated_at: new Date()
        }
        setMeeting(mockMeeting)

        // Create room for the meeting
        const response = await fetch('/api/daily/room', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomName: meetingId,
            userName: "Pre-call User",
            isPrivate: false
          })
        })
        
        const data = await response.json()
        console.log('🏠 Daily room API response:', data)
        console.log('🔗 roomUrl from response:', data.roomUrl)
        if (!data.roomUrl) {
          console.error('❌ No roomUrl in response - room creation may have failed')
          console.error('Full response:', JSON.stringify(data))
        }
        if (data.roomUrl) {
          setRoomUrl(data.roomUrl)
        }
      } catch (error) {
        console.error('Error loading meeting or creating room:', error)
        toast.error("Failed to load meeting")
      } finally {
        setIsLoading(false)
      }
    }

    loadMeetingAndRoom()
  }, [meetingId, router])

  const handleJoinCall = () => {
    console.log('🚀 handleJoinCall called, roomUrl:', roomUrl)
    
    if (!roomUrl) {
      console.error('❌ No roomUrl available for navigation')
      toast.error("Room URL not available. Please wait for room creation.")
      return
    }
    
    const roomName = roomUrl.split('/').pop()
    if (roomName) {
      router.push(`/call/${roomName}`)
    }
  }

  const handleInviteUsers = (userIds: string[]) => {
    console.log('Inviting users:', userIds)
    toast.success(`Invited ${userIds.length} users`)
  }

  const handleCopyLink = async () => {
    if (roomUrl) {
      await navigator.clipboard.writeText(roomUrl)
      setIsLinkCopied(true)
      setTimeout(() => setIsLinkCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading meeting...</p>
        </div>
      </div>
    )
  }

  if (!meeting || !roomUrl) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500">Failed to load meeting details</p>
          <button 
            onClick={() => router.push("/cockpit/hub")}
            className="mt-2 text-primary hover:underline"
          >
            Back to Hub
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <div className="flex">
        <div className="flex-1 p-6 max-w-4xl mx-auto">
          <PreCallPage
            meeting={meeting}
            roomUrl={roomUrl}
            onJoinCall={handleJoinCall}
            onInviteUsers={handleInviteUsers}
            onCopyLink={handleCopyLink}
            isLinkCopied={isLinkCopied}
          />
        </div>
        <div className="fixed right-0 top-0 h-screen w-[360px] z-10">
          {/* RizzSidebar will be rendered by the layout */}
        </div>
      </div>
    </div>
  )
}