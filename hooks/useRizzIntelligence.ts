"use client"

import { useState, useEffect, useCallback } from 'react'
import { transcriptService } from '@/lib/ai/transcript-service'

export interface RizzIntelligenceState {
  isPanelOpen: boolean
  isListening: boolean
  transcripts: Array<{
    id: string
    text: string
    speaker: string
    timestamp: Date
    confidence: number
  }>
  insights: {
    keyPoints: string[]
    decisions: string[]
    actions: string[]
    questions: string[]
  }
}

export function useRizzIntelligence() {
  const [state, setState] = useState<RizzIntelligenceState>({
    isPanelOpen: false,
    isListening: false,
    transcripts: [],
    insights: {
      keyPoints: [],
      decisions: [],
      actions: [],
      questions: []
    }
  })

  // Update state when transcript service data changes
  useEffect(() => {
    const updateState = () => {
      const transcripts = transcriptService.getTranscripts()
      const insights = transcriptService.getInsights()
      
      setState(prev => ({
        ...prev,
        transcripts,
        insights
      }))
    }

    // Initial update
    updateState()

    // Set up periodic updates
    const interval = setInterval(updateState, 1000)
    return () => clearInterval(interval)
  }, [])

  const togglePanel = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPanelOpen: !prev.isPanelOpen
    }))
  }, [])

  const toggleListening = useCallback(() => {
    setState(prev => ({
      ...prev,
      isListening: !prev.isListening
    }))
  }, [])

  const addTranscript = useCallback((text: string, speaker = "Participant") => {
    if (state.isListening) {
      transcriptService.addTranscript(text, speaker)
    }
  }, [state.isListening])

  const clearData = useCallback(() => {
    transcriptService.clear()
    setState(prev => ({
      ...prev,
      transcripts: [],
      insights: {
        keyPoints: [],
        decisions: [],
        actions: [],
        questions: []
      }
    }))
  }, [])

  const exportInsights = useCallback(() => {
    const insightsText = `
MEETING INSIGHTS
${new Date().toLocaleString()}

KEY POINTS:
${state.insights.keyPoints.map(point => `- ${point}`).join('\n')}

DECISIONS:
${state.insights.decisions.map(decision => `- ${decision}`).join('\n')}

ACTIONS:
${state.insights.actions.map(action => `- ${action}`).join('\n')}

QUESTIONS:
${state.insights.questions.map(question => `- ${question}`).join('\n')}
    `.trim()

    return insightsText
  }, [state.insights])

  const downloadInsights = useCallback(() => {
    const insightsText = exportInsights()
    const blob = new Blob([insightsText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `meeting-insights-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [exportInsights])

  const copyInsights = useCallback(async () => {
    const insightsText = exportInsights()
    try {
      await navigator.clipboard.writeText(insightsText)
      return true
    } catch (error) {
      console.error('Failed to copy insights:', error)
      return false
    }
  }, [exportInsights])

  return {
    ...state,
    togglePanel,
    toggleListening,
    addTranscript,
    clearData,
    exportInsights,
    downloadInsights,
    copyInsights
  }
}