"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function TestPreCallPage() {
  const router = useRouter()

  const testMeetingId = "test-meeting-123"

  const handleTestTeamSync = () => {
    router.push(`/cockpit/hub/pre-call/${testMeetingId}`)
  }

  const handleTestSalesCall = () => {
    router.push(`/cockpit/hub/pre-call/${testMeetingId}`)
  }

  const handleTestNetworkSession = () => {
    router.push(`/cockpit/hub/pre-call/${testMeetingId}`)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Pre-Call Page Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This is a test page to verify the pre-call functionality works correctly.
            Note: The meeting ID used here is a test ID and may not exist in the database.
          </p>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Test Scenarios:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={handleTestTeamSync}
                className="w-full"
              >
                Test Team Sync Meeting
              </Button>
              <Button 
                onClick={handleTestSalesCall}
                className="w-full"
              >
                Test Sales Call
              </Button>
              <Button 
                onClick={handleTestNetworkSession}
                className="w-full"
              >
                Test Network Session
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Expected Behavior:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Should navigate to the pre-call page</li>
              <li>• Should attempt to load meeting details</li>
              <li>• Should attempt to create a Daily.co room</li>
              <li>• Should display appropriate error handling if meeting doesn't exist</li>
              <li>• Should show the RizzSidebar on the right side</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Integration Points:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• MeetingService.getMeeting() - loads meeting details</li>
              <li>• /api/daily/room - creates video room</li>
              <li>• RizzSidebar - should be visible on the right</li>
              <li>• Context providers - should be available</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}