import { useState, useRef, useCallback } from 'react'

interface UseAudioRecorderReturn {
  isRecording: boolean
  isPlaying: boolean
  audioUrl: string | null
  audioDuration: number
  startRecording: () => Promise<void>
  stopRecording: () => void
  playAudio: () => void
  stopAudio: () => void
  reset: () => void
  error: string | null
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioDuration, setAudioDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const startTimeRef = useRef<number>(0)

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorderRef.current.onstart = () => {
        startTimeRef.current = Date.now()
        setIsRecording(true)
      }
      
      mediaRecorderRef.current.onstop = () => {
        const duration = (Date.now() - startTimeRef.current) / 1000
        setAudioDuration(duration)
        setIsRecording(false)
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        
        // Clean up stream
        stream.getTracks().forEach(track => track.stop())
      }
      
      // Setup audio analysis for visual feedback
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      analyserRef.current.fftSize = 256
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount)
      
      mediaRecorderRef.current.start()
    } catch (err) {
      setError('Failed to access microphone. Please check your permissions.')
      console.error('Audio recording error:', err)
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
  }, [isRecording])

  const playAudio = useCallback(() => {
    if (audioUrl && !isPlaying) {
      audioElementRef.current = new Audio(audioUrl)
      audioElementRef.current.onplay = () => setIsPlaying(true)
      audioElementRef.current.onended = () => setIsPlaying(false)
      audioElementRef.current.play()
    }
  }, [audioUrl, isPlaying])

  const stopAudio = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause()
      audioElementRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }, [])

  const reset = useCallback(() => {
    stopAudio()
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    setAudioDuration(0)
    setError(null)
  }, [audioUrl, stopAudio])

  return {
    isRecording,
    isPlaying,
    audioUrl,
    audioDuration,
    startRecording,
    stopRecording,
    playAudio,
    stopAudio,
    reset,
    error
  }
}