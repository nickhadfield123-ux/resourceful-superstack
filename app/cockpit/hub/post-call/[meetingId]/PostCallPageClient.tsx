"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/toast'
import { useRizzIntelligence } from '@/hooks/useRizzIntelligence'
import { useDailyCall } from '@/hooks/useDailyCall'

interface PostCallPageClientProps {
  meetingId: string
  exitReason?: string
  duration?: string
  notes?: string
  returnTo?: string
}

export function PostCallPageClient({ meetingId, exitReason, duration, notes, returnTo }: PostCallPageClientProps) {
  const router = useRouter()
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const [notesContent, setNotesContent] = useState(notes || '')
  
  // Determine call status based on exit reason and duration
  const isCompletedCall = exitReason === 'completed' || exitReason === 'left' || (duration && parseInt(duration) > 300)
  const callStatus = isCompletedCall ? 'completed' : 'aborted'
  
  // Calculate duration in minutes
  const durationMinutes = duration ? Math.floor(parseInt(duration) / 60) : 0
  
  // Mock meeting data - in a real implementation, this would come from your database
  const meeting = {
    id: meetingId,
    title: 'Team Sync Meeting',
    meeting_type: 'team-sync',
    participants: ['Nick Hadfield', 'AI Assistant'],
    recording_enabled: true
  }

  // Mock Rizz summary - in a real implementation, this would come from your AI service
  const mockSummary = {
    keyPoints: [
      'Discussed project progress and next steps',
      'Identified potential blockers and solutions',
      'Agreed on action items for the week'
    ],
    decisions: [
      'Move forward with the new architecture approach',
      'Schedule follow-up meeting for next Monday'
    ],
    actions: [
      'Nick: Review the technical specifications',
      'Team: Prepare demo for stakeholders'
    ],
    questions: [
      'How will we handle the integration with existing systems?',
      'What are the performance requirements?'
    ]
  }

  const handleSaveNotes = async () => {
    if (!notesContent.trim()) {
      toast.info("No notes to save. Please add some notes before saving.")
      return
    }

    setIsSavingNotes(true)
    try {
      // In a real implementation, save notes to your database
      console.log('Saving notes:', notesContent)
      toast.success("Notes saved successfully. Your notes have been saved to the knowledge base.")
    } catch (error) {
      toast.error("Error saving notes. Please try again.")
    } finally {
      setIsSavingNotes(false)
    }
  }

  const handleScheduleFollowUp = () => {
    // Navigate to scheduling page or open scheduling modal
    toast.info("Scheduling feature. This would open the scheduling interface.")
  }

  const handleBackToHub = () => {
    const searchParams = new URLSearchParams(window.location.search)
    const returnTo = searchParams.get('returnTo')
    router.push(returnTo || '/cockpit/hub')
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 1) return '< 1 minute'
    if (minutes === 1) return '1 minute'
    return `${minutes} minutes`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {callStatus === 'completed' ? (
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Call Completed Successfully
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Call Ended Early
            </div>
          )}
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            {meeting.title}
          </h1>
          <p className="mt-2 text-gray-600">
            Session Summary & Next Steps
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Call Metadata Card */}
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
              <CardDescription>Key information about your call</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Duration</span>
                <span className="font-medium">{formatDuration(durationMinutes)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Participants</span>
                <div className="flex -space-x-2">
                  {meeting.participants.map((participant, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium border-2 border-white"
                      title={participant}
                    >
                      {participant.charAt(0)}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Recording</span>
                <Badge variant={meeting.recording_enabled ? "default" : "secondary"}>
                  {meeting.recording_enabled ? "Enabled" : "Not Started"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <Badge variant={callStatus === 'completed' ? "default" : "destructive"}>
                  {callStatus === 'completed' ? "Completed" : "Aborted"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Call Summary Card */}
          {callStatus === 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle>Rizz Intelligence Summary</CardTitle>
                <CardDescription>Key insights from your conversation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Key Points</h4>
                  <ul className="space-y-1">
                    {mockSummary.keyPoints.map((point, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <hr className="border-gray-200 my-4" />
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Decisions Made</h4>
                  <ul className="space-y-1">
                    {mockSummary.decisions.map((decision, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                        {decision}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <hr className="border-gray-200 my-4" />
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Action Items</h4>
                  <ul className="space-y-1">
                    {mockSummary.actions.map((action, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <hr className="border-gray-200 my-4" />
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Questions Raised</h4>
                  <ul className="space-y-1">
                    {mockSummary.questions.map((question, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes Section (for aborted calls) */}
          {callStatus === 'aborted' && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Save Your Notes</CardTitle>
                <CardDescription>Capture any thoughts or ideas before leaving</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <textarea
                    value={notesContent}
                    onChange={(e) => setNotesContent(e.target.value)}
                    placeholder="Type any notes, ideas, or thoughts here..."
                    className="w-full min-h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex gap-3">
                    <Button 
                      onClick={handleSaveNotes} 
                      disabled={isSavingNotes || !notesContent.trim()}
                    >
                      {isSavingNotes ? 'Saving...' : 'Save Notes'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setNotesContent('')}
                      disabled={!notesContent.trim()}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          {callStatus === 'completed' ? (
            <>
              <Button size="lg" onClick={() => router.push(`/cockpit/hub/post-call/${meetingId}?exit=${exitReason}&duration=${duration}&notes=${encodeURIComponent(notesContent)}`)}>
                View Full Summary
              </Button>
              <Button size="lg" variant="outline" onClick={handleScheduleFollowUp}>
                Schedule Follow-up
              </Button>
            </>
          ) : (
            <>
              <Button size="lg" onClick={handleSaveNotes} disabled={isSavingNotes}>
                {isSavingNotes ? 'Saving...' : 'Save Notes'}
              </Button>
              <Button size="lg" variant="outline" onClick={() => setNotesContent('')} disabled={!notesContent.trim()}>
                Clear
              </Button>
            </>
          )}
          <Button size="lg" variant="secondary" onClick={handleBackToHub}>
            Back to Hub
          </Button>
        </div>
      </div>
    </div>
  )
}