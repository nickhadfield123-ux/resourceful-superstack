"use client"

import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Mic, 
  MicOff, 
  Eye, 
  EyeOff, 
  Sparkles,
  MessageSquare,
  CheckCircle,
  Flag,
  HelpCircle,
  RefreshCw,
  Copy,
  Download
} from "lucide-react"
import { transcriptService, type TranscriptSegment, type MeetingInsights } from "@/lib/ai/transcript-service"

interface RizzIntelligencePanelProps {
  isOpen: boolean
  onToggle: () => void
  isListening: boolean
  onToggleListening: () => void
  onAddTranscript: (text: string) => void
  meetingContext?: {
    participantNames: string[]
    meetingPurpose: string
    suggestedTopics: string[]
  }
  meetingId?: string
  participantCount?: number
  duration?: number
}

export function RizzIntelligencePanel({
  isOpen,
  onToggle,
  isListening,
  onToggleListening,
  onAddTranscript,
  meetingContext
}: RizzIntelligencePanelProps) {
  const [transcripts, setTranscripts] = React.useState<TranscriptSegment[]>([])
  const [insights, setInsights] = React.useState<MeetingInsights>({
    keyPoints: [],
    decisions: [],
    actions: [],
    questions: []
  })
  const [isVisible, setIsVisible] = React.useState(true)
  const [transcript, setTranscript] = React.useState('')
  
  // Chat functionality
  const [input, setInput] = React.useState('')
  const [messages, setMessages] = React.useState<Array<{role: 'user'|'assistant', content: string}>>([])
  const [loading, setLoading] = React.useState(false)

  // Speech recognition refs
  const mediaStreamRef = React.useRef<MediaStream | null>(null)
  const recognitionRef = React.useRef<any>(null)

  // Update transcripts and insights when they change
  React.useEffect(() => {
    const updateData = () => {
      const newTranscripts = transcriptService.getTranscripts()
      const newInsights = transcriptService.getInsights()
      
      // Only update state if data has actually changed
      if (JSON.stringify(newTranscripts) !== JSON.stringify(transcripts)) {
        setTranscripts(newTranscripts)
      }
      if (JSON.stringify(newInsights) !== JSON.stringify(insights)) {
        setInsights(newInsights)
      }
    }

    updateData()
    
    // Set up periodic updates
    const interval = setInterval(updateData, 1000)
    return () => clearInterval(interval)
  }, [transcripts, insights]) // ← Include transcripts and insights in dependencies

  // Handle new transcript additions
  React.useEffect(() => {
    if (transcripts.length > 0) {
      // Trigger analysis when new transcripts are added
      const latestTranscript = transcripts[transcripts.length - 1]
      if (latestTranscript) {
        transcriptService.addTranscript(latestTranscript.text, latestTranscript.speaker)
      }
    }
  }, [transcripts.length])

  // Speech recognition effect
  React.useEffect(() => {
    if (isListening) {
      // Use Web Speech API for transcription
      const SpeechRecognition = 
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition
      
      if (!SpeechRecognition) {
        console.warn('Speech recognition not supported')
        return
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join(' ')
        // Update transcript state with new content
        setTranscript(prev => prev + ' ' + transcript)
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
      }

      recognition.start()
      recognitionRef.current = recognition

    } else {
      // Stop recognition when paused
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [isListening])


  const ask = async () => {
    if (!input.trim() || loading) return
    const question = input.trim()
    setInput('')
    setMessages(prev => [...prev, {role: 'user', content: question}])
    setLoading(true)
    
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          system: 'You are Rizz, an AI assistant helping during a video call. Be concise and practical.',
          messages: [...messages, {role: 'user', content: question}]
        })
      })
      const data = await res.json()
      setMessages(prev => [...prev, {role: 'assistant', content: data.content[0].text}])
    } catch (error) {
      console.error('Error asking Rizz:', error)
      setMessages(prev => [...prev, {role: 'assistant', content: 'Sorry, I encountered an error. Please try again.'}])
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="flex flex-col h-full w-full bg-white border-l border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Sparkles className="h-6 w-6 text-blue-600" />
            {isListening && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Rizz Intelligence</h3>
            <p className={`text-xs ${isListening ? 'text-emerald-400' : 'text-slate-400'}`}>
              {isListening ? 'Listening...' : 'Paused'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleListening}
            className="text-gray-600 hover:text-gray-900"
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(!isVisible)}
            className="text-gray-600 hover:text-gray-900"
          >
            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-gray-600 hover:text-gray-900"
          >
            ✕
          </Button>
        </div>
      </div>

      {isVisible && (
        <div className="p-4 space-y-4">

          {/* Meeting Briefing */}
          {meetingContext && (
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <button
                onClick={() => setIsVisible(!isVisible)}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-gray-900">Meeting Brief</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {isVisible ? 'Hide' : 'Show'}
                  </span>
                </div>
              </button>
              
              {isVisible && (
                <div className="p-3 space-y-2">
                  <div>
                    <span className="text-xs text-gray-600">Purpose</span>
                    <p className="text-sm text-gray-800">{meetingContext.meetingPurpose}</p>
                  </div>
                  
                  <div>
                    <span className="text-xs text-gray-600">Participants</span>
                    <div className="flex flex-wrap gap-1">
                      {meetingContext.participantNames.map((name, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-xs text-gray-600">Suggested Topics</span>
                    <div className="space-y-1">
                      {meetingContext.suggestedTopics.map((topic, index) => (
                        <div key={index} className="text-xs text-gray-700 bg-gray-50 p-1 rounded">
                          • {topic}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Listening Indicator */}
          {isListening && (
            <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-blue-700 font-medium">Listening for conversation...</span>
            </div>
          )}

          {/* Insights Sections */}
          <div className="space-y-4">
            {/* Key Points */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Key Points</span>
                <Badge variant="secondary" className="ml-auto">{insights.keyPoints.length}</Badge>
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {insights.keyPoints.length > 0 ? (
                  insights.keyPoints.map((point, index) => (
                    <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      {point}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-400 italic">No key points detected yet</div>
                )}
              </div>
            </div>

            {/* Decisions */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Decisions</span>
                <Badge variant="secondary" className="ml-auto">{insights.decisions.length}</Badge>
              </div>
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {insights.decisions.length > 0 ? (
                  insights.decisions.map((decision, index) => (
                    <div key={index} className="text-xs text-gray-600 bg-green-50 p-2 rounded">
                      {decision}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-400 italic">No decisions detected yet</div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Flag className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">Actions</span>
                <Badge variant="secondary" className="ml-auto">{insights.actions.length}</Badge>
              </div>
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {insights.actions.length > 0 ? (
                  insights.actions.map((action, index) => (
                    <div key={index} className="text-xs text-gray-600 bg-orange-50 p-2 rounded">
                      {action}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-400 italic">No actions detected yet</div>
                )}
              </div>
            </div>

            {/* Questions */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <HelpCircle className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Questions</span>
                <Badge variant="secondary" className="ml-auto">{insights.questions.length}</Badge>
              </div>
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {insights.questions.length > 0 ? (
                  insights.questions.map((question, index) => (
                    <div key={index} className="text-xs text-gray-600 bg-purple-50 p-2 rounded">
                      {question}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-400 italic">No questions detected yet</div>
                )}
              </div>
            </div>
          </div>

          {/* Live Transcript Preview */}
          {transcript && (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-700">Live Transcript</span>
                <Badge variant="secondary" className="ml-auto">Live</Badge>
              </div>
              <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
                <p className="text-sm text-gray-700">{transcript}</p>
              </div>
            </div>
          )}

          {/* Transcript Preview */}
          {transcripts.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-700">Recent Transcript</span>
                <Badge variant="outline" className="ml-auto">{transcripts.length}</Badge>
              </div>
              <ScrollArea className="h-24 border border-gray-200 rounded-md p-2">
                {transcripts.slice(-5).map((segment) => (
                  <div key={segment.id} className="text-xs text-gray-600 mb-1">
                    <span className="font-medium text-gray-800">{segment.speaker}:</span>
                    <span className="ml-1">{segment.text}</span>
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}

          {/* Chat Interface */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Chat with Rizz</span>
              <Badge variant="outline" className="text-xs">{messages.length}</Badge>
            </div>
            
            {/* Message History */}
            <ScrollArea className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3 mb-2 bg-gray-50">
              {messages.length > 0 ? (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-2 p-2 rounded-lg ${
                      message.role === 'user'
                        ? 'ml-auto bg-blue-500 text-white max-w-[80%] text-right'
                        : 'mr-auto bg-white text-gray-800 max-w-[80%] text-left'
                    }`}
                  >
                    <div className="text-xs font-medium mb-1">
                      {message.role === 'user' ? 'You' : 'Rizz'}
                    </div>
                    <div className="text-sm">{message.content}</div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-400 italic">Start a conversation with Rizz...</div>
              )}
            </ScrollArea>

            {/* Input Area */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && ask()}
                placeholder="Ask Rizz a question..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={loading}
              />
              <Button
                onClick={ask}
                disabled={loading || !input.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Send'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
