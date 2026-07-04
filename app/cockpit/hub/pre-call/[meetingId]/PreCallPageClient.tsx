"use client"

import * as React from "react"
import { PreCallPage } from "@/components/cockpit/PreCallPage"
import { MeetingService } from "@/lib/meetings/service"
import { Meeting } from "@/lib/meetings/types"
import { toast } from "@/toast"
import { useRouter, useSearchParams } from "next/navigation"
import { RizzIntelligencePanel } from "@/components/cockpit/RizzIntelligencePanel"

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
    <div className="flex h-[calc(100vh-0px)]">
      {/* TV Frame — left/center area */}
      <div className="flex-1 bg-slate-900 p-6 flex flex-col min-w-0">
        {/* Thin bezel frame */}
        <div className="flex-1 rounded-2xl border border-slate-700/50 bg-slate-800/50 
                        overflow-hidden flex flex-col">
          
          {/* Frame header bar — like a TV status bar */}
          <div className="flex items-center justify-between px-6 py-3 
                          border-b border-slate-700/50 bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 text-sm font-medium">{meetingId}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="text-slate-300">📹</span> Cam
                <span className="text-emerald-400 font-medium">✓</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="text-slate-300">🎤</span> Mic
                <span className="text-emerald-400 font-medium">✓</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="text-slate-300">🌐</span> Net
                <span className="text-emerald-400 font-medium">✓</span>
              </span>
            </div>
          </div>

          {/* Frame content — two column layout */}
          <div className="flex flex-row gap-4 p-6 h-full">
            {/* LEFT COLUMN: Practical "ready to join" info */}
            <div className="flex-1 flex flex-col gap-4">
              {/* "Prepare for your call" heading */}
              <h2 className="text-white text-lg font-semibold">Prepare for your call</h2>

              {/* Call Agenda Card */}
              <div className="bg-slate-800/60 rounded-xl border border-slate-700/40 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">📋</span>
                    <h3 className="text-white font-semibold">Agenda</h3>
                  </div>
                  <span className="text-slate-500 text-xs hover:text-slate-300 cursor-pointer">Edit</span>
                </div>
                <div className="space-y-1 text-slate-400 text-sm">
                  <div>• Project status update</div>
                  <div>• Next sprint planning</div>
                  <div>• Technical blockers discussion</div>
                  <div>• Action items review</div>
                </div>
              </div>

              {/* NEW: Your notes textarea */}
              <div className="bg-slate-800/60 rounded-xl border border-slate-700/40 p-4">
                <textarea
                  className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-3 text-slate-300 placeholder-slate-500 w-full h-28 resize-none"
                  placeholder="Jot down anything before the call..."
                />
              </div>

              {/* Join Call Button - Pinned to bottom */}
              <div className="mt-auto">
                <button
                  onClick={handleJoinCall}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 text-lg font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  Join Call
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Intelligence layer */}
            <div className="w-64 flex-shrink-0 space-y-4">
              {/* Participants Card */}
              <div className="bg-slate-800/60 rounded-xl border border-slate-700/40 p-4">
                <h3 className="text-white font-semibold mb-3">Participants</h3>
                
                {/* Expected Participants */}
                <div className="mb-3">
                  <div className="text-slate-500 text-xs mb-2">EXPECTED</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-sm font-medium text-white">
                          Y
                        </div>
                        <div>
                          <div className="text-slate-300 text-sm">You</div>
                          <div className="text-slate-500 text-xs">Host</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-sm font-medium text-white">
                          A
                        </div>
                        <div>
                          <div className="text-slate-300 text-sm">Alex Chen</div>
                          <div className="text-slate-500 text-xs">Product Manager</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-sm font-medium text-white">
                          S
                        </div>
                        <div>
                          <div className="text-slate-300 text-sm">Sarah Kim</div>
                          <div className="text-slate-500 text-xs">Designer</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-700/40 my-3"></div>

                {/* In Call Now */}
                <div>
                  <div className="text-slate-500 text-xs mb-2">IN CALL NOW</div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-sm font-medium text-white">
                      Y
                    </div>
                    <div>
                      <div className="text-slate-300 text-sm">You</div>
                      <div className="text-slate-500 text-xs">Ready to join</div>
                    </div>
                    <div className="ml-auto w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Last Minute Card */}
              <div className="bg-slate-800/60 rounded-xl border border-slate-700/40 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-slate-400">✦</span>
                  <h3 className="text-white font-semibold">Before You Join</h3>
                </div>
                <div className="space-y-2 text-slate-400 text-sm">
                  <div>• Review the agenda above</div>
                  <div>• Check your background and lighting</div>
                  <div>• Have your notes ready</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rizz sidebar */}
      <div className="w-80 flex-shrink-0 bg-white border-l border-slate-200 
                      flex flex-col overflow-hidden">
        <RizzIntelligencePanel 
          isOpen={true}
          onToggle={() => {}}
          isListening={false}
          onToggleListening={() => {}}
          onAddTranscript={() => {}}
          meetingContext={{
            participantNames: [],
            meetingPurpose: 'Pre-call preparation',
            suggestedTopics: ['Tech check', 'Meeting agenda', 'Participant context']
          }}
        />
      </div>
    </div>
  )
}