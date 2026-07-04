"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/toast"

export function ConversationPersistenceTest() {

  const testPersistence = () => {
    // Create test messages
    const testMessages = [
      {
        id: "test-1",
        role: "user" as const,
        content: "Hello RIZZ!",
        timestamp: new Date()
      },
      {
        id: "test-2", 
        role: "assistant" as const,
        content: "Hello! How can I help you today?",
        timestamp: new Date()
      }
    ]

    // Save to localStorage
    localStorage.setItem("rizz_conversation", JSON.stringify(testMessages))
    
    // Show success message
    toast.success("Test conversation saved to localStorage. Refresh the page to see persistence in action!")
  }

  const clearTestData = () => {
    localStorage.removeItem("rizz_conversation")
    toast.success("Test conversation removed from localStorage.")
  }

  const checkStorage = () => {
    const saved = localStorage.getItem("rizz_conversation")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        toast.info(`Found ${parsed.length} messages in localStorage`)
      } catch (error) {
        toast.error("Corrupted data in localStorage")
      }
    } else {
      toast.info("No conversation data found in localStorage")
    }
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Conversation Persistence Test</CardTitle>
        <p className="text-sm text-muted-foreground">
          Test the conversation persistence functionality
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button onClick={testPersistence} className="w-full">
            Create Test Data
          </Button>
          <Button onClick={checkStorage} variant="outline" className="w-full">
            Check Storage
          </Button>
          <Button onClick={clearTestData} variant="destructive" className="w-full">
            Clear Test Data
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          <p><strong>How to test:</strong></p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Click "Create Test Data" to save test messages</li>
            <li>Refresh the page</li>
            <li>Check if the test messages load automatically</li>
            <li>Use "Check Storage" to verify data is saved</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}