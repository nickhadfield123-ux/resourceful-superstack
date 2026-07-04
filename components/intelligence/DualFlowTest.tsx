"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Brain, Clock, MessageSquare } from "lucide-react"

interface DualFlowTestProps {
  onSendMessage: (message: string, flowPreference?: string) => void
  isLoading: boolean
  response: string
}

export function DualFlowTest({ onSendMessage, isLoading, response }: DualFlowTestProps) {
  const [message, setMessage] = React.useState('')
  const [selectedFlow, setSelectedFlow] = React.useState<'auto' | 'quick' | 'deep'>('auto')

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message, selectedFlow)
    }
  }

  const testMessages = [
    {
      text: "Write a simple React component for a todo list",
      type: 'quick' as const,
      description: 'Quick coding task - should use fast model'
    },
    {
      text: "Explain the architecture of a modern web application",
      type: 'deep' as const,
      description: 'Complex explanation - should use deep model'
    },
    {
      text: "Help me debug this error: TypeError: Cannot read property 'map' of undefined",
      type: 'quick' as const,
      description: 'Debugging task - should use fast model'
    },
    {
      text: "Design a scalable microservices architecture for an e-commerce platform",
      type: 'deep' as const,
      description: 'Architecture design - should use deep model'
    }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span>Dual-Flow AI Test</span>
          </CardTitle>
          <CardDescription>
            Test the dual-flow system with different types of requests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Flow Selection */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Flow Mode:</span>
            <div className="flex space-x-2">
              <Button
                variant={selectedFlow === 'auto' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFlow('auto')}
                className="text-xs"
              >
                <Clock className="h-3 w-3 mr-1" />
                Auto
              </Button>
              <Button
                variant={selectedFlow === 'quick' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFlow('quick')}
                className="text-xs"
              >
                <Zap className="h-3 w-3 mr-1 text-green-500" />
                Quick
              </Button>
              <Button
                variant={selectedFlow === 'deep' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFlow('deep')}
                className="text-xs"
              >
                <Brain className="h-3 w-3 mr-1 text-blue-500" />
                Deep
              </Button>
            </div>
          </div>

          {/* Test Messages */}
          <div className="grid grid-cols-2 gap-2">
            {testMessages.map((testMsg, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  setMessage(testMsg.text)
                  setSelectedFlow(testMsg.type)
                }}
                className="text-xs justify-start h-auto py-2"
              >
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 mt-0.5">
                    {testMsg.type === 'quick' ? (
                      <Zap className="h-3 w-3 text-green-500" />
                    ) : (
                      <Brain className="h-3 w-3 text-blue-500" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{testMsg.text}</div>
                    <div className="text-xs text-muted-foreground">{testMsg.description}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Message</label>
            <Textarea
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* Send Button */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Selected Flow:</span>
              <Badge variant="secondary" className="text-xs">
                {selectedFlow === 'auto' ? 'Auto (Smart Routing)' : 
                 selectedFlow === 'quick' ? 'Quick (1-2s)' : 'Deep (Complex)'}
              </Badge>
            </div>
            <Button 
              onClick={handleSend} 
              disabled={isLoading || !message.trim()}
              className="flex items-center space-x-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{isLoading ? 'Processing...' : 'Send Message'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Response Display */}
      {response && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>AI Response</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <p className="whitespace-pre-wrap">{response}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}