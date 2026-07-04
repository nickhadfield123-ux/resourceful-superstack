import { PostCallPageClient } from './PostCallPageClient'

interface PostCallPageProps {
  params: {
    meetingId: string
  }
  searchParams?: {
    exit?: string
    duration?: string
    notes?: string
    returnTo?: string
  }
}

export default function PostCallPage({ params, searchParams }: PostCallPageProps) {
  return (
    <PostCallPageClient 
      meetingId={params.meetingId}
      exitReason={searchParams?.exit}
      duration={searchParams?.duration}
      notes={searchParams?.notes}
      returnTo={searchParams?.returnTo}
    />
  )
}
