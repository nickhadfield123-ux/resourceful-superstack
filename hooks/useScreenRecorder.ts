import { useState, useRef, useCallback } from 'react'
import { toast } from '@/toast'

interface ScreenRecorderReturn {
  isRecording: boolean
  isRecordingScreen: boolean
  isRecordingAudio: boolean
  recordingTime: number
  videoUrl: string | null
  videoBlob: Blob | null
  startRecording: (audioSource?: MediaStream) => Promise<void>
  stopRecording: () => void
  reset: () => void
  error: string | null
}

export function useScreenRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [isRecordingScreen, setIsRecordingScreen] = useState(false)
  const [isRecordingAudio, setIsRecordingAudio] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const screenStreamRef = useRef<MediaStream | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const combinedStreamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startRecording = useCallback(async (audioSource?: MediaStream) => {
    try {
      setError(null)
      setIsRecording(true)
      setIsRecordingScreen(true)
      setIsRecordingAudio(false)

      // Request screen capture
      toast.info('Requesting screen access...')
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false // We'll handle audio separately
      })

      screenStreamRef.current = screenStream

      // Handle screen stream end
      screenStream.getVideoTracks()[0].addEventListener('ended', () => {
        toast.info('Screen capture stopped by user')
        stopRecording()
      })

      // Request audio capture if not provided
      let audioStream: MediaStream | null = null
      if (audioSource) {
        audioStream = audioSource
        setIsRecordingAudio(true)
      } else {
        try {
          toast.info('Requesting microphone access...')
          audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
          audioStreamRef.current = audioStream
          setIsRecordingAudio(true)
        } catch (audioError) {
          toast.error('Microphone access denied, recording screen only')
          setIsRecordingAudio(false)
        }
      }

      // Combine streams
      const combinedStream = new MediaStream()
      
      // Add video track
      const videoTrack = screenStream.getVideoTracks()[0]
      combinedStream.addTrack(videoTrack)
      
      // Add audio track if available
      if (audioStream) {
        const audioTrack = audioStream.getAudioTracks()[0]
        combinedStream.addTrack(audioTrack)
      }

      combinedStreamRef.current = combinedStream

      // Initialize MediaRecorder
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        
        setVideoBlob(blob)
        setVideoUrl(url)
        setIsRecording(false)
        setIsRecordingScreen(false)
        setIsRecordingAudio(false)
        
        toast.success('Recording saved successfully!')
      }

      // Start recording with 1-second intervals
      mediaRecorder.start(1000)

      // Start timer
      startTimeRef.current = Date.now()
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setRecordingTime(elapsed)
      }, 1000)

      toast.success('Recording started!')

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Screen recording error:', err)
      setIsRecording(false)
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // Stop streams
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop())
      screenStreamRef.current = null
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop())
      audioStreamRef.current = null
    }

    if (combinedStreamRef.current) {
      combinedStreamRef.current.getTracks().forEach(track => track.stop())
      combinedStreamRef.current = null
    }

    setRecordingTime(0)
  }, [isRecording])

  const reset = useCallback(() => {
    stopRecording()
    
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl)
    }
    
    setVideoUrl(null)
    setVideoBlob(null)
    setError(null)
    setRecordingTime(0)
  }, [videoUrl, stopRecording])

  return {
    isRecording,
    isRecordingScreen,
    isRecordingAudio,
    recordingTime: formatTime(recordingTime),
    videoUrl,
    videoBlob,
    startRecording,
    stopRecording,
    reset,
    error
  }
}