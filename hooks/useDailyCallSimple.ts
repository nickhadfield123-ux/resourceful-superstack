"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import DailyIframe, { DailyCall } from '@daily-co/daily-js'

export interface DailyCallState {
  isJoining: boolean
  isJoined: boolean
  isMuted: boolean
  isVideoOff: boolean
  isScreenSharing: boolean
  participants: Record<string, unknown> | null
  error: string | null
  callObject: DailyCall | null
}

export interface UseDailyCallOptions {
  userName?: string
  containerRef?: React.RefObject<HTMLDivElement | null>
}

export function useDailyCallSimple(options: UseDailyCallOptions = {}) {
  const { userName, containerRef } = options
  
  const [state, setState] = useState<DailyCallState>({
    isJoining: false,
    isJoined: false,
    isMuted: false,
    isVideoOff: false,
    isScreenSharing: false,
    participants: null,
    error: null,
    callObject: null
  })
  
  const callObjectRef = useRef<DailyCall | null>(null)
  const dailyContainerRef = useRef<HTMLDivElement | null>(null)

  // Handle participant changes
  const handleParticipantChange = useCallback(() => {
    if (callObjectRef.current) {
      const participants = callObjectRef.current.participants()
      setState(prev => ({ ...prev, participants }))
    }
  }, [])

  // Handle join
  const handleJoinedMeeting = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isJoined: true, 
      isJoining: false,
      error: null 
    }))
    handleParticipantChange()
  }, [handleParticipantChange])

  // Handle left meeting
  const handleLeftMeeting = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isJoined: false, 
      isJoining: false,
      participants: null 
    }))
  }, [])

  // Handle errors
  const handleError = useCallback((event: any) => {
    console.error('Daily.co error:', event)
    setState(prev => ({ 
      ...prev, 
      error: event?.errorMsg || 'An error occurred with the video call',
      isJoining: false 
    }))
  }, [])

  // Create new container for Daily.co iframe
  const createDailyContainer = useCallback(() => {
    if (dailyContainerRef.current) {
      return dailyContainerRef.current
    }
    
    const container = document.createElement('div')
    container.id = 'daily-co-container'
    container.style.position = 'fixed'
    container.style.top = '0'
    container.style.left = '0'
    container.style.width = '100vw'
    container.style.height = '100vh'
    container.style.zIndex = '9999'
    container.style.display = 'none'
    
    document.body.appendChild(container)
    dailyContainerRef.current = container
    return container
  }, [])

  // Remove Daily.co container
  const removeDailyContainer = useCallback(() => {
    if (dailyContainerRef.current) {
      document.body.removeChild(dailyContainerRef.current)
      dailyContainerRef.current = null
    }
  }, [])

  // Join the call
  const joinCall = useCallback(async (url: string, token?: string) => {
    if (!url) {
      setState(prev => ({ ...prev, error: 'No room URL provided' }))
      return
    }

    try {
      setState(prev => ({ ...prev, isJoining: true, error: null }))

      // Create new container that's completely separate from React
      const dailyContainer = createDailyContainer()
      
      // Show the container
      dailyContainer.style.display = 'block'

      // Create Daily iframe with auto-join configuration
      const dailyIframe = DailyIframe.createFrame(dailyContainer, {
        iframeStyle: {
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          border: '0',
        },
        showLeaveButton: true,
        showFullscreenButton: true,
        showLocalVideo: true,
        showParticipantsBar: true,
        userName: userName || 'Guest',
        // Auto-join configuration to skip "Start meeting" button
        startVideoOff: false,  // Ensure camera is ON
        startAudioOff: false,   // Ensure mic is ON
        activeSpeakerMode: true
      })

      console.log('Daily iframe created successfully', dailyIframe)

      // Set up event listeners before joining
      dailyIframe.on('joined-meeting', handleJoinedMeeting)
      dailyIframe.on('left-meeting', handleLeftMeeting)
      dailyIframe.on('error', handleError)
      dailyIframe.on('participant-joined', handleParticipantChange)
      dailyIframe.on('participant-left', handleParticipantChange)
      dailyIframe.on('participant-updated', handleParticipantChange)

      await dailyIframe.join({
        url,
        ...(token && { token }),
        userName: userName || 'Guest',
        // Auto-join configuration
        startVideoOff: false,
        startAudioOff: false
      })

      callObjectRef.current = dailyIframe
      setState(prev => ({ ...prev, callObject: dailyIframe }))
    } catch (error: any) {
      console.error('Failed to join call:', error)
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Failed to join video call',
        isJoining: false 
      }))
    }
  }, [userName, createDailyContainer, handleJoinedMeeting, handleLeftMeeting, handleError, handleParticipantChange])

  // Leave the call
  const leaveCall = useCallback(async () => {
    if (callObjectRef.current) {
      try {
        await callObjectRef.current.leave()
        
        // Destroy the frame and clear container
        await callObjectRef.current.destroy()
        if (containerRef?.current) {
          containerRef.current.innerHTML = ''
        }
        
        callObjectRef.current = null
        setState(prev => ({ 
          ...prev, 
          callObject: null, 
          isJoined: false, 
          isJoining: false,
          participants: null,
          isMuted: false,
          isVideoOff: false,
          isScreenSharing: false
        }))
      } catch (error) {
        console.error('Error leaving call:', error)
      }
    }
  }, [containerRef])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callObjectRef.current) {
        try {
          // Let Daily.co handle its own cleanup
          callObjectRef.current.destroy()
        } catch (error) {
          console.warn('Error destroying Daily iframe:', error)
        }
        
        // Remove our custom container
        removeDailyContainer()
        
        // Clear the original container if provided
        if (containerRef?.current) {
          containerRef.current.innerHTML = ''
        }
        
        callObjectRef.current = null
      }
    }
  }, [containerRef, removeDailyContainer])

  return {
    ...state,
    joinCall,
    leaveCall,
  }
}