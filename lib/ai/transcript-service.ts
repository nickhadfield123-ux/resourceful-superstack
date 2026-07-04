"use client"

import { useIntelligenceStore } from "@/stores/intelligenceStore"
import { unifiedAIService } from "./unified-service"

export interface TranscriptSegment {
  id: string
  text: string
  speaker: string
  timestamp: Date
  confidence: number
}

export interface MeetingInsights {
  keyPoints: string[]
  decisions: string[]
  actions: string[]
  questions: string[]
}

export class TranscriptService {
  private static instance: TranscriptService
  private transcripts: TranscriptSegment[] = []
  private insights: MeetingInsights = {
    keyPoints: [],
    decisions: [],
    actions: [],
    questions: []
  }
  private isProcessing = false
  private processingQueue: string[] = []
  private lastProcessedIndex = 0

  static getInstance(): TranscriptService {
    if (!TranscriptService.instance) {
      TranscriptService.instance = new TranscriptService()
    }
    return TranscriptService.instance
  }

  /**
   * Add a new transcript segment
   */
  addTranscript(text: string, speaker = "Participant"): void {
    const segment: TranscriptSegment = {
      id: Date.now().toString(),
      text: text.trim(),
      speaker,
      timestamp: new Date(),
      confidence: 0.95 // Default confidence
    }

    this.transcripts.push(segment)
    this.processQueue()
  }

  /**
   * Get current transcripts
   */
  getTranscripts(): TranscriptSegment[] {
    return [...this.transcripts]
  }

  /**
   * Get current insights
   */
  getInsights(): MeetingInsights {
    return { ...this.insights }
  }

  /**
   * Clear all transcripts and insights
   */
  clear(): void {
    this.transcripts = []
    this.insights = {
      keyPoints: [],
      decisions: [],
      actions: [],
      questions: []
    }
    this.processingQueue = []
    this.lastProcessedIndex = 0
  }

  /**
   * Process the transcript queue for insights
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return
    }

    this.isProcessing = true

    try {
      // Get new segments to process
      const newSegments = this.transcripts.slice(this.lastProcessedIndex)
      
      if (newSegments.length === 0) {
        this.isProcessing = false
        return
      }

      // Build transcript text
      const transcriptText = newSegments
        .map(seg => `${seg.speaker}: ${seg.text}`)
        .join('\n')

      // Process with AI for insights
      await this.analyzeTranscript(transcriptText)
      
      this.lastProcessedIndex = this.transcripts.length

    } catch (error) {
      console.error('Error processing transcript:', error)
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Analyze transcript with AI to extract insights
   */
  private async analyzeTranscript(transcript: string): Promise<void> {
    try {
      const unifiedService = unifiedAIService
      const modelPreference = useIntelligenceStore.getState().modelPreference

      if (!modelPreference) {
        console.warn('No AI model preference set for transcript analysis')
        return
      }

      // Prepare prompt for insight extraction
      const prompt = `
Analyze this meeting transcript and extract structured insights:

TRANSCRIPT:
${transcript}

Please categorize the content into these sections:

1. KEY POINTS: Important information, facts, or concepts discussed
2. DECISIONS: Any decisions made or agreed upon during the conversation
3. ACTIONS: Specific tasks, next steps, or action items mentioned
4. QUESTIONS: Questions asked that need follow-up or answers

For each category, provide 3-5 bullet points with the most relevant items.
Use clear, concise language and maintain the context of the original conversation.

Format your response as JSON:
{
  "keyPoints": ["point 1", "point 2", ...],
  "decisions": ["decision 1", "decision 2", ...],
  "actions": ["action 1", "action 2", ...],
  "questions": ["question 1", "question 2", ...]
}
`

      const response = await unifiedService.chatCompletion({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        model: modelPreference,
        temperature: 0.3,
        max_tokens: 1000
      })

      if (response.content) {
        try {
          // Extract JSON from response
          const jsonMatch = response.content.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const parsedInsights = JSON.parse(jsonMatch[0])
            
            // Update insights, keeping existing ones and adding new ones
            this.insights = {
              keyPoints: this.mergeInsights(this.insights.keyPoints, parsedInsights.keyPoints || []),
              decisions: this.mergeInsights(this.insights.decisions, parsedInsights.decisions || []),
              actions: this.mergeInsights(this.insights.actions, parsedInsights.actions || []),
              questions: this.mergeInsights(this.insights.questions, parsedInsights.questions || [])
            }
          }
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError)
        }
      }

    } catch (error) {
      console.error('Error analyzing transcript:', error)
    }
  }

  /**
   * Merge new insights with existing ones, avoiding duplicates
   */
  private mergeInsights(existing: string[], newInsights: string[]): string[] {
    const allInsights = [...existing, ...newInsights]
    const uniqueInsights = Array.from(new Set(allInsights))
    return uniqueInsights.slice(-10) // Keep last 10 items
  }
}

// Export singleton instance
export const transcriptService = TranscriptService.getInstance()