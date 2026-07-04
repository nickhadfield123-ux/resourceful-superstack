"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import DailyIframe, { DailyCall } from '@daily-co/daily-js'
import { dailyInstanceManager } from '@/lib/daily-co/instance-manager'

export interface DailyCallState {
  isJoining: boolean
  isJoined: boolean
  isMuted: boolean
  isVideoOff: boolean
  isScreenSharing: boolean
  participants: Record<string, unknown> | null
  error: string | null
  callObject: DailyCall | null
  trackEvent: any | null
  videoTracks: Record<string, MediaStreamTrack>
  activeVideoStreams: Record<string, MediaStream>
}

export interface UseDailyCallOptions {
  userName?: string
  containerRef?: React.RefObject<HTMLDivElement | null>
  videoRef?: React.RefObject<HTMLVideoElement | null>
}

export function useDailyCall(options: UseDailyCallOptions = {}) {
  const { userName, containerRef } = options
  
  const [state, setState] = useState<DailyCallState>({
    isJoining: false,
    isJoined: false,
    isMuted: false,
    isVideoOff: false,
    isScreenSharing: false,
    participants: null,
    error: null,
    callObject: null,
    trackEvent: null,
    videoTracks: {},
    activeVideoStreams: {}
  })
  
  const callObjectRef = useRef<DailyCall | null>(null)

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

  // Join the call
  const joinCall = useCallback(async (url: string, token?: string) => {
    console.log('🚀 JOIN CALL STARTED - URL:', url);
    console.log('📋 Token provided:', !!token);
    console.log('👤 Username:', userName || 'Guest');
    
    if (!url) {
      console.error('❌ No room URL provided')
      setState(prev => ({ ...prev, error: 'No room URL provided' }))
      return
    }

    try {
      setState(prev => ({ ...prev, isJoining: true, error: null }))
      console.log('🔄 Setting isJoining to true')

      // Fix ERROR 1: Use global instance manager to prevent duplicate DailyIframe instances
      if (!callObjectRef.current) {
        try {
          console.log('🏗️ Getting Daily.co call object from instance manager...')
          callObjectRef.current = await dailyInstanceManager.createCallObject()
          console.log('✅ Call object obtained from instance manager:', callObjectRef.current)
        } catch (createError: any) {
          console.error('❌ Failed to get call object from instance manager:', createError)
          throw createError
        }
        
        // Set up event listeners only if we have a valid call object
        if (callObjectRef.current) {
          console.log('📡 Setting up event listeners...')
          callObjectRef.current.on('joined-meeting', handleJoinedMeeting)
          callObjectRef.current.on('left-meeting', handleLeftMeeting)
          callObjectRef.current.on('error', handleError)
          callObjectRef.current.on('participant-joined', handleParticipantChange)
          callObjectRef.current.on('participant-left', handleParticipantChange)
          callObjectRef.current.on('participant-updated', handleParticipantChange)
          
          // Listen for track events to handle video rendering
          callObjectRef.current.on('track-started', (event) => {
            console.log('🎥 Track started:', event);
            console.log('   Participant ID:', event.participant?.session_id);
            console.log('   Track type:', event.type);
            console.log('   Track kind:', event.track?.kind);
            console.log('   Is local:', event.participant?.local);
            
            // Store the track in state
            if (event.track && event.track.kind === 'video') {
              const participantId = event.participant?.session_id || 'unknown';
              console.log(`📹 Storing video track for participant ${participantId}`);
              
              setState(prev => ({
                ...prev,
                videoTracks: {
                  ...prev.videoTracks,
                  [participantId]: event.track
                },
                trackEvent: event
              }));
            }
          });

          callObjectRef.current.on('track-stopped', (event: any) => {
            console.log('🎥 Track stopped:', event);
            console.log('   Participant ID:', event.participant?.session_id);
            console.log('   Track kind:', event.track?.kind);
            
            // Clean up track from state
            if (event.track && event.track.kind === 'video') {
              const participantId = event.participant?.session_id || 'unknown';
              console.log(`📹 Removing video track for participant ${participantId}`);
              
              setState(prev => {
                const newVideoTracks = { ...prev.videoTracks };
                delete newVideoTracks[participantId];
                
                return {
                  ...prev,
                  videoTracks: newVideoTracks,
                  trackEvent: event
                };
              });
            }
          });
          
          console.log('✅ All event listeners set up')
        }
      } else {
        console.log('🔄 Reusing existing call object:', callObjectRef.current)
      }

      console.log('📞 Attempting to join meeting...')
      console.log('   URL:', url)
      console.log('   Username:', userName || 'Guest')
      console.log('   Token:', token ? 'provided' : 'none')
      
      // Fix ERROR 2: Only pass token if it's a valid string
      const joinOptions: any = { 
        url, 
        userName: userName || 'Guest',
        startVideoOff: false,
        startAudioOff: false
      }
      
      // Only include token if it's a valid string
      if (token && typeof token === 'string') {
        joinOptions.token = token
        console.log('✅ Token included in join options:', token)
      } else {
        console.log('ℹ️  Token omitted from join options (not a valid string)')
      }
      
      if (callObjectRef.current) {
        await callObjectRef.current.join(joinOptions)
        console.log('✅ Successfully joined call!');
        console.log('🎯 Call object state:', callObjectRef.current);
        setState(prev => ({ ...prev, callObject: callObjectRef.current }))
      } else {
        throw new Error('Call object not available')
      }
    } catch (error: any) {
      console.error('❌ Failed to join call:', error)
      console.error('   Error type:', error.type)
      console.error('   Error message:', error.message)
      console.error('   Error details:', error)
      
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Failed to join video call',
        isJoining: false 
      }))
    }
  }, [userName, handleJoinedMeeting, handleLeftMeeting, handleError, handleParticipantChange])

  // Leave the call
  const leaveCall = useCallback(async () => {
    if (callObjectRef.current) {
      try {
        console.log('📞 Leaving call...')
        await callObjectRef.current.leave()
        
        // Use instance manager to properly destroy the call object
        console.log('🗑️  Destroying call object via instance manager...')
        await dailyInstanceManager.destroyCallObject()
        
        if (containerRef?.current) {
          containerRef.current.innerHTML = ''
        }
        
        callObjectRef.current = null
        console.log('✅ Call left successfully')
        
        // Reset all state
        setState(prev => ({ 
          ...prev, 
          callObject: null, 
          isJoined: false, 
          isJoining: false,
          participants: null,
          isMuted: false,
          isVideoOff: false,
          isScreenSharing: false,
          videoTracks: {},
          activeVideoStreams: {},
          trackEvent: null
        }))
      } catch (error) {
        console.error('❌ Error leaving call:', error)
      }
    }
  }, [containerRef])

  // Toggle microphone
  const toggleMicrophone = useCallback(async () => {
    if (callObjectRef.current) {
      if (state.isMuted) {
        await callObjectRef.current.setLocalAudio(true)
      } else {
        await callObjectRef.current.setLocalAudio(false)
      }
      setState(prev => ({ ...prev, isMuted: !prev.isMuted }))
    }
  }, [state.isMuted])

  // Toggle camera
  const toggleCamera = useCallback(async () => {
    if (callObjectRef.current) {
      if (state.isVideoOff) {
        await callObjectRef.current.setLocalVideo(true)
      } else {
        await callObjectRef.current.setLocalVideo(false)
      }
      setState(prev => ({ ...prev, isVideoOff: !prev.isVideoOff }))
    }
  }, [state.isVideoOff])

  // Toggle screen share
  const toggleScreenShare = useCallback(async () => {
    if (callObjectRef.current) {
      try {
        if (state.isScreenSharing) {
          await callObjectRef.current.stopScreenShare()
          setState(prev => ({ ...prev, isScreenSharing: false }))
        } else {
          await callObjectRef.current.startScreenShare()
          setState(prev => ({ ...prev, isScreenSharing: true }))
        }
      } catch (error) {
        console.error('Error toggling screen share:', error)
      }
    }
  }, [state.isScreenSharing])

  // Enhanced cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up Daily.co call object on unmount...')
      if (callObjectRef.current) {
        try {
          // Use instance manager to properly destroy the call object
          console.log('🗑️  Destroying call object via instance manager on unmount...')
          dailyInstanceManager.destroyCallObject()
          console.log('✅ Call object destroyed on unmount via instance manager')
        } catch (error) {
          console.error('❌ Error destroying call object on unmount:', error)
        }
        callObjectRef.current = null
      }
    }
  }, [])

  return {
    ...state,
    joinCall,
    leaveCall,
    toggleMicrophone,
    toggleCamera,
    toggleScreenShare
  }
}