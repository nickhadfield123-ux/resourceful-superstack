"use client"

import { useCallback, useEffect, useState } from 'react'
import { useDaily, useDailyEvent, useParticipant } from '@daily-co/daily-react'

export interface DailyReactCallState {
  isJoining: boolean
  isJoined: boolean
  isMuted: boolean
  isVideoOff: boolean
  isScreenSharing: boolean
  participants: Record<string, unknown> | null
  error: string | null
  callObject: any | null
  videoTracks: Record<string, MediaStreamTrack>
  activeVideoStreams: Record<string, MediaStream>
}

export interface UseDailyReactCallOptions {
  userName?: string
}

export function useDailyReactCall(options: UseDailyReactCallOptions = {}) {
  const { userName } = options
  
  const [state, setState] = useState<DailyReactCallState>({
    isJoining: false,
    isJoined: false,
    isMuted: false,
    isVideoOff: false,
    isScreenSharing: false,
    participants: null,
    error: null,
    callObject: null,
    videoTracks: {},
    activeVideoStreams: {}
  })

  // Daily React hooks
  const daily = useDaily()
  const localParticipant = useParticipant('local')

  // Handle joined meeting event
  useDailyEvent('joined-meeting', useCallback((event) => {
    console.log('🚀 Daily React: Joined meeting', event)
    setState(prev => ({ 
      ...prev, 
      isJoined: true, 
      isJoining: false,
      error: null,
      callObject: daily
    }))
  }, [daily]))

  // Handle left meeting event
  useDailyEvent('left-meeting', useCallback(() => {
    console.log('👋 Daily React: Left meeting')
    setState(prev => ({ 
      ...prev, 
      isJoined: false, 
      isJoining: false,
      participants: null 
    }))
  }, []))

  // Handle error event
  useDailyEvent('error', useCallback((event) => {
    console.error('❌ Daily React error:', event)
    setState(prev => ({ 
      ...prev, 
      error: event?.errorMsg || 'An error occurred with the video call',
      isJoining: false 
    }))
  }, []))

  // Handle participant changes
  useDailyEvent('participant-joined', useCallback((event) => {
    console.log('👤 Participant joined:', event.participant)
    setState(prev => {
      const newParticipants = { ...prev.participants }
      if (event.participant) {
        newParticipants[event.participant.session_id] = event.participant
      }
      return { ...prev, participants: newParticipants }
    })
  }, []))

  useDailyEvent('participant-left', useCallback((event) => {
    console.log('👤 Participant left:', event.participant)
    setState(prev => {
      const newParticipants = { ...prev.participants }
      if (event.participant) {
        delete newParticipants[event.participant.session_id]
      }
      return { ...prev, participants: newParticipants }
    })
  }, []))

  useDailyEvent('participant-updated', useCallback((event) => {
    console.log('👤 Participant updated:', event.participant)
    setState(prev => {
      const newParticipants = { ...prev.participants }
      if (event.participant) {
        newParticipants[event.participant.session_id] = event.participant
      }
      return { ...prev, participants: newParticipants }
    })
  }, []))

  // Handle local participant changes
  useEffect(() => {
    if (localParticipant) {
      setState(prev => ({ 
        ...prev, 
        isMuted: !localParticipant.audio,
        isVideoOff: !localParticipant.video
      }))
    }
  }, [localParticipant])

  // Handle track events for video tracks
  useDailyEvent('track-started', useCallback((event) => {
    console.log('🎥 Track started:', event)
    if (event.track && event.track.kind === 'video') {
      const participantId = event.participant?.session_id || 'unknown'
      setState(prev => ({
        ...prev,
        videoTracks: {
          ...prev.videoTracks,
          [participantId]: event.track
        }
      }))
    }
  }, []))

  useDailyEvent('track-stopped', useCallback((event) => {
    console.log('🎥 Track stopped:', event)
    if (event.track && event.track.kind === 'video') {
      const participantId = event.participant?.session_id || 'unknown'
      setState(prev => {
        const newVideoTracks = { ...prev.videoTracks }
        delete newVideoTracks[participantId]
        return {
          ...prev,
          videoTracks: newVideoTracks
        }
      })
    }
  }, []))

  // Join the call
  const joinCall = useCallback(async (url: string, token?: string) => {
    console.log('🚀 Daily React JOIN CALL - URL:', url)
    console.log('📋 Token provided:', !!token)
    console.log('👤 Username:', userName || 'Guest')
    
    if (!url) {
      console.error('❌ No room URL provided')
      setState(prev => ({ ...prev, error: 'No room URL provided' }))
      return
    }

    try {
      setState(prev => ({ ...prev, isJoining: true, error: null }))
      console.log('🔄 Setting isJoining to true')

      if (daily) {
        console.log('📞 Attempting to join meeting with Daily React...')
        console.log('   URL:', url)
        console.log('   Username:', userName || 'Guest')
        console.log('   Token:', token ? 'provided' : 'none')
        
        // Daily React join options
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
        
        await daily.join(joinOptions)
        console.log('✅ Successfully joined call with Daily React!')
        setState(prev => ({ ...prev, callObject: daily }))
      } else {
        throw new Error('Daily React call object not available')
      }
    } catch (error: any) {
      console.error('❌ Failed to join call with Daily React:', error)
      console.error('   Error type:', error.type)
      console.error('   Error message:', error.message)
      console.error('   Error details:', error)
      
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Failed to join video call',
        isJoining: false 
      }))
    }
  }, [userName, daily])

  // Leave the call
  const leaveCall = useCallback(async () => {
    if (daily) {
      try {
        console.log('📞 Leaving call with Daily React...')
        await daily.leave()
        console.log('✅ Call left successfully with Daily React')
        
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
          activeVideoStreams: {}
        }))
      } catch (error) {
        console.error('❌ Error leaving call with Daily React:', error)
      }
    }
  }, [daily])

  // Toggle microphone
  const toggleMicrophone = useCallback(async () => {
    if (daily && localParticipant) {
      try {
        if (state.isMuted) {
          await daily.setLocalAudio(true)
          console.log('🎤 Microphone unmuted')
        } else {
          await daily.setLocalAudio(false)
          console.log('🎤 Microphone muted')
        }
        setState(prev => ({ ...prev, isMuted: !prev.isMuted }))
      } catch (error) {
        console.error('❌ Error toggling microphone:', error)
      }
    }
  }, [daily, localParticipant, state.isMuted])

  // Toggle camera
  const toggleCamera = useCallback(async () => {
    if (daily && localParticipant) {
      try {
        if (state.isVideoOff) {
          await daily.setLocalVideo(true)
          console.log('📹 Camera turned on')
        } else {
          await daily.setLocalVideo(false)
          console.log('📹 Camera turned off')
        }
        setState(prev => ({ ...prev, isVideoOff: !prev.isVideoOff }))
      } catch (error) {
        console.error('❌ Error toggling camera:', error)
      }
    }
  }, [daily, localParticipant, state.isVideoOff])

  // Toggle screen share
  const toggleScreenShare = useCallback(async () => {
    if (daily) {
      try {
        if (state.isScreenSharing) {
          await daily.stopScreenShare()
          console.log('🖥️  Screen share stopped')
          setState(prev => ({ ...prev, isScreenSharing: false }))
        } else {
          await daily.startScreenShare()
          console.log('🖥️  Screen share started')
          setState(prev => ({ ...prev, isScreenSharing: true }))
        }
      } catch (error) {
        console.error('❌ Error toggling screen share:', error)
      }
    }
  }, [daily, state.isScreenSharing])

  return {
    ...state,
    joinCall,
    leaveCall,
    toggleMicrophone,
    toggleCamera,
    toggleScreenShare
  }
}
