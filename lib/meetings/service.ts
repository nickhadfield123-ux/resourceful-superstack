// Meeting Service - Coordination Layer
import { getSupabase } from '@/lib/db/supabase'
import { 
  Meeting, 
  MeetingParticipant, 
  CalendarEvent, 
  MeetingType,
  MEETING_TYPE_COLORS 
} from './types'
import { generateInviteToken } from '@/lib/utils/token-generator'

const MOCK_USER_ID = 'mock-user-id'

export class MeetingService {
  private static getClient() {
    const client = getSupabase()
    if (!client) throw new Error('Supabase client not configured')
    return client
  }

  // Create a new meeting
  static async createMeeting(meeting: Partial<Meeting>): Promise<Meeting | null> {
    try {
      console.log('🔄 Creating meeting with data:', {
        title: meeting.title,
        meeting_type: meeting.meeting_type,
        start_time: meeting.start_time,
        end_time: meeting.end_time,
        created_by: MOCK_USER_ID
      })

      const { data, error } = await this.getClient()
        .from('meetings')
        .insert({
          title: meeting.title || 'New Meeting',
          description: meeting.description,
          meeting_type: meeting.meeting_type || 'other',
          status: 'scheduled',
          start_time: meeting.start_time,
          end_time: meeting.end_time,
          timezone: meeting.timezone || 'UTC',
          all_day: meeting.all_day || false,
          created_by: MOCK_USER_ID,
          video_provider: meeting.video_provider || 'daily',
          recording_enabled: meeting.recording_enabled ?? true,
          visibility: meeting.visibility || 'private',
          agenda: meeting.agenda,
          talking_points: meeting.talking_points,
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Database insert failed:', error)
        throw error
      }

      console.log('✅ Meeting created successfully:', data.id)

      // Create Daily.co room if video provider is daily
      if (meeting.video_provider !== 'none' && data) {
        console.log('📹 Creating video room for meeting:', data.id)
        const roomData = await this.createVideoRoom(data.id)
        if (roomData) {
          console.log('✅ Video room created:', roomData)
const { error: updateError } = await this.getClient()
          .from('meetings')
            .update({
              video_room_id: roomData.roomId,
              video_room_url: roomData.roomUrl
            })
            .eq('id', data.id)
          
          if (!updateError) {
            data.video_room_id = roomData.roomId
            data.video_room_url = roomData.roomUrl
            console.log('✅ Meeting updated with video room info')
          } else {
            console.error('❌ Failed to update meeting with video room:', updateError)
          }
        } else {
          console.warn('⚠️ Video room creation failed, continuing without video room')
        }
      }

      // Create meeting invite with random token
      if (data) {
        console.log('📨 Creating meeting invite for meeting:', data.id)
        const inviteToken = generateInviteToken()
        const inviteData = await this.createMeetingInvite(data.id, inviteToken)
        
        if (inviteData) {
          console.log('✅ Meeting invite created:', inviteData.invite_token)
          // Update meeting with invite token for reference
const { error: inviteUpdateError } = await this.getClient()
             .from('meetings')
            .update({ invite_token: inviteToken })
            .eq('id', data.id)
          
          if (!inviteUpdateError) {
            data.invite_token = inviteToken
            console.log('✅ Meeting updated with invite token')
          } else {
            console.error('❌ Failed to update meeting with invite token:', inviteUpdateError)
          }
        } else {
          console.warn('⚠️ Meeting invite creation failed, continuing without invite')
        }
      }

      return data
    } catch (error) {
      console.error('❌ Error creating meeting:', error)
      return null
    }
  }

  // Create Daily.co video room
  static async createVideoRoom(meetingId: string): Promise<{ roomId: string; roomUrl: string } | null> {
    try {
      const response = await fetch('/api/daily/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: `meeting-${meetingId}`,
          isPrivate: false
        })
      })

      if (!response.ok) throw new Error('Failed to create room')

      const data = await response.json()
      return {
        roomId: data.roomId || data.roomName,
        roomUrl: data.roomUrl
      }
    } catch (error) {
      console.error('Error creating video room:', error)
      return null
    }
  }

  // Get meetings for a date range
  static async getMeetings(startDate: Date, endDate: Date): Promise<Meeting[]> {
    try {
      const { data, error } = await this.getClient()
        .from('meetings')
        .select('*')
        .gte('start_time', startDate.toISOString())
        .lte('end_time', endDate.toISOString())
        .is('deleted_at', null)
        .order('start_time', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching meetings:', error)
      return []
    }
  }

  // Get a single meeting by ID
  static async getMeeting(id: string): Promise<Meeting | null> {
    try {
      const { data, error } = await this.getClient()
        .from('meetings')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching meeting:', error)
      return null
    }
  }

  // Update a meeting
  static async updateMeeting(id: string, updates: Partial<Meeting>): Promise<Meeting | null> {
    try {
      const { data, error } = await this.getClient()
        .from('meetings')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating meeting:', error)
      return null
    }
  }

  // Delete a meeting (soft delete)
  static async deleteMeeting(id: string): Promise<boolean> {
    try {
      const { error } = await this.getClient()
        .from('meetings')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting meeting:', error)
      return false
    }
  }

  // Add participant to meeting
  static async addParticipant(participant: Partial<MeetingParticipant>): Promise<MeetingParticipant | null> {
    try {
      const { data, error } = await this.getClient()
        .from('meeting_participants')
        .insert({
          meeting_id: participant.meeting_id,
          user_id: participant.user_id || `user-${Date.now()}`,
          user_name: participant.user_name || 'Guest',
          user_email: participant.user_email,
          role: participant.role || 'attendee',
          response_status: 'pending'
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding participant:', error)
      return null
    }
  }

  // Get participants for a meeting
  static async getParticipants(meetingId: string): Promise<MeetingParticipant[]> {
    try {
      const { data, error } = await this.getClient()
        .from('meeting_participants')
        .select('*')
        .eq('meeting_id', meetingId)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching participants:', error)
      return []
    }
  }

  // Update participant status
  static async updateParticipantStatus(
    meetingId: string, 
    userId: string, 
    status: 'accepted' | 'declined' | 'tentative'
  ): Promise<boolean> {
    try {
      const { error } = await this.getClient()
        .from('meeting_participants')
        .update({ response_status: status })
        .eq('meeting_id', meetingId)
        .eq('user_id', userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating participant status:', error)
      return false
    }
  }

  // Convert meetings to calendar events for FullCalendar
  static toCalendarEvents(meetings: Meeting[]): CalendarEvent[] {
    return meetings.map(meeting => {
      const colors = MEETING_TYPE_COLORS[meeting.meeting_type as MeetingType] || MEETING_TYPE_COLORS.other
      return {
        id: meeting.id,
        title: meeting.title,
        start: new Date(meeting.start_time),
        end: new Date(meeting.end_time),
        allDay: meeting.all_day,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        textColor: colors.text,
        extendedProps: {
          meetingType: meeting.meeting_type as MeetingType,
          status: meeting.status,
          videoRoomUrl: meeting.video_room_url,
          locationType: meeting.location_type,
          participants: [], // Will be loaded separately
          isHost: meeting.created_by === MOCK_USER_ID,
          hasJoined: false,
          aiSummary: meeting.ai_summary
        }
      }
    })
  }

  // Create a meeting invite with random token
  static async createMeetingInvite(meetingId: string, inviteToken: string): Promise<any | null> {
    try {
      const { data, error } = await this.getClient()
        .from('meeting_invites')
        .insert({
          meeting_id: meetingId,
          invite_token: inviteToken,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          status: 'pending'
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Database insert failed for meeting invite:', error)
        throw error
      }

      console.log('✅ Meeting invite created successfully:', data.invite_token)
      return data
    } catch (error) {
      console.error('❌ Error creating meeting invite:', error)
      return null
    }
  }
}

export default MeetingService