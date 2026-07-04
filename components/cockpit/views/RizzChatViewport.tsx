"use client"

import * as React from "react"

/**
 * DATA CONTRACT for RizzChatViewport
 * 
 * Props:
 * - userId?: string - Current user ID (from context bundle)
 * - memberTier?: 'free' | 'pioneer' | 'architect' | 'community' | 'ai-company'
 * - onboardingStage?: 'invited' | 'started' | 'complete'
 * - onSendMessage?: (message: string) => void - Callback for message submission
 * - onHintClick?: (hint: string) => void - Callback for quick action hints
 * 
 * State Consumers:
 * - useViewportStore().activeView - Should render when activeView === 'chat'
 * - useViewportStore().currentRoom - Optional room context
 * 
 * Expected Message Structure:
 * ```
 * {
 *   role: 'rizz' | 'user'
 *   text: string
 *   ts: number
 * }
 * ```
 * 
 * CSS Classes Required (from OpenDesign):
 * - .rizz-col, .message-area, .bubble, .hint-row, .input-area, .ibar, .cinput
 */

interface RizzChatViewportProps {
  userId?: string
  memberTier?: 'free' | 'pioneer' | 'architect' | 'community' | 'ai-company'
  onboardingStage?: 'invited' | 'started' | 'complete'
  onSendMessage?: (message: string) => void
  onHintClick?: (hint: string) => void
}

export function RizzChatViewport({ 
  userId, 
  memberTier = 'free', 
  onboardingStage = 'invited',
  onSendMessage,
  onHintClick 
}: RizzChatViewportProps) {
  return (
    <div className="rizz-col">
      <div className="message-area">
        {/* Messages will be rendered here */}
      </div>
      
      <div className="hint-row">
        {/* Quick action hints */}
      </div>
      
      <div className="input-area">
        <div className="ibar">
          <input 
            className="cinput" 
            placeholder="Reply to Rizz..."
          />
        </div>
      </div>
    </div>
  )
}