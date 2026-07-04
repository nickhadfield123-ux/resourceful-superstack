"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDailyCall } from "@/hooks/useDailyCall"
import { MeetingCalendar } from "@/components/cockpit/MeetingCalendar"
import { MeetingService } from "@/lib/meetings/service"
import { MeetingType, MEETING_TYPE_LABELS } from "@/lib/meetings/types"
import { toast } from "@/toast"
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  Phone, 
  PhoneOff, 
  Users, 
  Loader2,
  Camera,
  ScreenShare,
  FileText,
  Database,
  Brain,
  Send,
  Settings,
  X,
  Calendar,
  Clock,
  MapPin
} from "lucide-react"

export default function VideoHubPage() {
  // Video container ref for Daily.co iframe
  const videoContainerRef = React.useRef<HTMLDivElement>(null)
  
  // Video call state
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
  } = useDailyCall({ userName: "User", containerRef: videoContainerRef })

  // Chat state
  const [chatInput, setChatInput] = React.useState("")
  const [chatMessages, setChatMessages] = React.useState<Array<{ role: string; content: string }>>([])
  const [isSending, setIsSending] = React.useState(false)

  // Meeting creation modal state
  const [showCreateModal, setShowCreateModal] = React.useState(false)
  const [newMeeting, setNewMeeting] = React.useState({
    title: "",
    meeting_type: "quick-sync" as MeetingType,
    date: "",
    time: "",
    duration: 30
  })
  const [isCreating, setIsCreating] = React.useState(false)

  const participantCount = participants ? Object.keys(participants).length : 0

  // Handle creating a new meeting
  const handleCreateMeeting = async () => {
    if (!newMeeting.title || !newMeeting.date || !newMeeting.time) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsCreating(true)
    try {
      const startTime = new Date(`${newMeeting.date}T${newMeeting.time}`)
      const endTime = new Date(startTime.getTime() + newMeeting.duration * 60000)

      const meeting = await MeetingService.createMeeting({
        title: newMeeting.title,
        meeting_type: newMeeting.meeting_type,
        start_time: startTime,
        end_time: endTime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      })

      if (meeting) {
        toast.success("Meeting created!")
        setShowCreateModal(false)
        setNewMeeting({
          title: "",
          meeting_type: "quick-sync",
          date: "",
          time: "",
          duration: 30
        })
      } else {
        toast.error("Failed to create meeting")
      }
    } catch (error) {
      console.error("Error creating meeting:", error)
      toast.error("Failed to create meeting")
    } finally {
      setIsCreating(false)
    }
  }

  // Handle joining a meeting from calendar
  const handleJoinMeeting = async (meetingId: string, roomUrl: string) => {
    if (roomUrl) {
      await joinCall(roomUrl)
    }
  }

  // Send chat message
  const handleSendMessage = async () => {
    if (!chatInput.trim() || isSending) return

    const userMessage = chatInput.trim()
    setChatInput("")
    setChatMessages(prev => [...prev, { role: "user", content: userMessage }])
    setIsSending(true)

    try {
      const response = await fetch('/api/ai/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      setChatMessages(prev => [...prev, { role: "assistant", content: data.response || "I received your message." }])
    } catch (error) {
      console.error('Chat error:', error)
      setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, I had trouble processing that." }])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex h-full">
      {/* Left: Calendar/Video Area (70%) */}
      <div className="w-[70%] border-r flex flex-col">
        {isJoined ? (
          // Active Video Call
          <>
            <div ref={videoContainerRef} className="flex-1 bg-gray-900 relative">
              {/* Daily.co iframe will be injected here */}
              
              {/* Participant overlay */}
              <div className="absolute bottom-4 left-4 bg-black/50 rounded-lg px-3 py-2">
                <div className="flex items-center space-x-2 text-white">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{participantCount} in call</span>
                </div>
              </div>

              {/* Video Controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-3">
                <Button
                  onClick={toggleMicrophone}
                  variant={isMuted ? "destructive" : "secondary"}
                  size="lg"
                  className="rounded-full h-12 w-12"
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>

                <Button
                  onClick={toggleCamera}
                  variant={isVideoOff ? "destructive" : "secondary"}
                  size="lg"
                  className="rounded-full h-12 w-12"
                >
                  {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </Button>

                <Button
                  onClick={toggleScreenShare}
                  variant={isScreenSharing ? "default" : "secondary"}
                  size="lg"
                  className="rounded-full h-12 w-12"
                >
                  <Monitor className="h-5 w-5" />
                </Button>

                <Button
                  onClick={leaveCall}
                  variant="destructive"
                  size="lg"
                  className="rounded-full px-6"
                >
                  <PhoneOff className="h-5 w-5 mr-2" />
                  Leave
                </Button>
              </div>
            </div>
          </>
        ) : (
          // Calendar View
          <MeetingCalendar 
            onJoinMeeting={handleJoinMeeting}
            onCreateMeeting={() => setShowCreateModal(true)}
          />
        )}
      </div>

      {/* Right: Functions + Chat (30%) */}
      <div className="w-[30%] flex flex-col">
        {/* Quick Functions Top */}
        <div className="border-b p-4">
          <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start"
              onClick={() => setShowCreateModal(true)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Camera className="h-4 w-4 mr-2" />
              Record
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Notes
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Database className="h-4 w-4 mr-2" />
              KB
            </Button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="p-3 border-b">
            <h3 className="text-sm font-semibold">Chat with Rizz</h3>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {chatMessages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Ask me to schedule a meeting...</p>
                <p className="text-xs mt-1">"Book a 30min call tomorrow at 2pm"</p>
              </div>
            ) : (
              chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t">
            <div className="flex gap-2">
              <Textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask Rizz to schedule..."
                className="min-h-[40px] max-h-[120px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
              <Button 
                size="icon" 
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || isSending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Schedule Meeting</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Meeting Title</Label>
                <Input
                  id="title"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Quick sync with team"
                />
              </div>

              <div>
                <Label htmlFor="type">Meeting Type</Label>
                <select
                  id="type"
                  value={newMeeting.meeting_type}
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, meeting_type: e.target.value as MeetingType }))}
                  className="w-full p-2 border rounded-md"
                >
                  {Object.entries(MEETING_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="duration">Duration</Label>
                <select
                  id="duration"
                  value={newMeeting.duration}
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateMeeting} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}