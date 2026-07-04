import { PreCallPageClient } from "./PreCallPageClient"

interface Props {
  params: Promise<{
    meetingId: string
  }>
}

// Server Component - unwraps params
export default async function PreCallPage({ params }: Props) {
  const { meetingId } = await params
  
  return <PreCallPageClient meetingId={meetingId} />
}
