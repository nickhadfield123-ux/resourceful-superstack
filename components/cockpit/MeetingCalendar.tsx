"use client"

import * as React from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import { MeetingService } from '@/lib/meetings/service'
import { 
  CalendarEvent, 
  MeetingType, 
  MEETING_TYPE_LABELS,
  MEETING_TYPE_COLORS 
} from '@/lib/meetings/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Video, 
  MapPin, 
  Users, 
  Clock,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  Grid3X3
} from 'lucide-react'
import { toast } from '@/toast'

interface MeetingCalendarProps {
  onJoinMeeting?: (meetingId: string, roomUrl: string) => void
  onCreateMeeting?: () => void
}

export function MeetingCalendar({ onJoinMeeting, onCreateMeeting }: MeetingCalendarProps) {
  const calendarRef = React.useRef<FullCalendar>(null)
  const [events, setEvents] = React.useState<CalendarEvent[]>([])
  const [loading, setLoading] = React.useState(true)
  const [currentView, setCurrentView] = React.useState('timeGridWeek')
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null)

  // Load meetings when calendar dates change
  const loadMeetings = React.useCallback(async (start: Date, end: Date) => {
    setLoading(true)
    try {
      const meetings = await MeetingService.getMeetings(start, end)
      const calendarEvents = MeetingService.toCalendarEvents(meetings)
      setEvents(calendarEvents)
    } catch (error) {
      console.error('Error loading meetings:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle date/time selection for creating new meeting
  const handleDateSelect = React.useCallback((selectInfo: any) => {
    const title = prompt('Enter meeting title:')
    if (title) {
      const meetingType = prompt('Meeting type (1:1, team-sync, workshop, podcast, co-creation, strategy, quick-sync, other):') as MeetingType || 'quick-sync'
      
      MeetingService.createMeeting({
        title,
        meeting_type: meetingType,
        start_time: selectInfo.start,
        end_time: selectInfo.end,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }).then(meeting => {
        if (meeting) {
          toast.success('Meeting created!')
          loadMeetings(selectInfo.start, selectInfo.end)
        }
      })
    }
    calendarRef.current?.getApi().unselect()
  }, [loadMeetings])

  // Handle event click
  const handleEventClick = React.useCallback((clickInfo: any) => {
    setSelectedEvent(clickInfo.event.extendedProps)
    
    // If meeting is now and has video room, offer to join
    const now = new Date()
    const eventStart = clickInfo.event.start
    const eventEnd = clickInfo.event.end
    
    if (eventStart && eventEnd && 
        now >= eventStart && now <= eventEnd && 
        clickInfo.event.extendedProps.videoRoomUrl) {
      if (confirm('Join this meeting now?')) {
        onJoinMeeting?.(clickInfo.event.id, clickInfo.event.extendedProps.videoRoomUrl)
      }
    }
  }, [onJoinMeeting])

  // Handle event drag and drop
  const handleEventDrop = React.useCallback((dropInfo: any) => {
    MeetingService.updateMeeting(dropInfo.event.id, {
      start_time: dropInfo.event.start,
      end_time: dropInfo.event.end
    }).then(success => {
      if (!success) {
        dropInfo.revert()
        toast.error('Failed to update meeting')
      }
    })
  }, [])

  // Handle event resize
  const handleEventResize = React.useCallback((resizeInfo: any) => {
    MeetingService.updateMeeting(resizeInfo.event.id, {
      end_time: resizeInfo.event.end
    }).then(success => {
      if (!success) {
        resizeInfo.revert()
        toast.error('Failed to update meeting')
      }
    })
  }, [])

  // Calendar dates change handler
  const handleDatesSet = React.useCallback((dateInfo: any) => {
    loadMeetings(dateInfo.start, dateInfo.end)
  }, [loadMeetings])

  // Navigation handlers
  const handlePrev = () => calendarRef.current?.getApi().prev()
  const handleNext = () => calendarRef.current?.getApi().next()
  const handleToday = () => calendarRef.current?.getApi().today()

  // View change handlers
  const handleViewChange = (view: string) => {
    setCurrentView(view)
    calendarRef.current?.getApi().changeView(view)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="ml-4 text-lg font-semibold">
            {calendarRef.current?.getApi()?.view?.title}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggles */}
          <div className="flex items-center border rounded-lg overflow-hidden">
            <Button 
              variant={currentView === 'timeGridDay' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => handleViewChange('timeGridDay')}
            >
              Day
            </Button>
            <Button 
              variant={currentView === 'timeGridWeek' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => handleViewChange('timeGridWeek')}
            >
              Week
            </Button>
            <Button 
              variant={currentView === 'dayGridMonth' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => handleViewChange('dayGridMonth')}
            >
              Month
            </Button>
            <Button 
              variant={currentView === 'listWeek' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => handleViewChange('listWeek')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={onCreateMeeting}>
            <Plus className="h-4 w-4 mr-2" />
            New Meeting
          </Button>
        </div>
      </div>

      {/* FullCalendar */}
      <div className="flex-1 p-4 overflow-auto">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="timeGridWeek"
          headerToolbar={false}
          events={events}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          nowIndicator={true}
          editable={true}
          droppable={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          datesSet={handleDatesSet}
          eventContent={(eventInfo) => (
            <div className="p-1 text-xs overflow-hidden">
              <div className="font-medium truncate">{eventInfo.event.title}</div>
              {eventInfo.event.extendedProps.meetingType && (
                <div className="text-[10px] opacity-75 truncate">
                  {MEETING_TYPE_LABELS[eventInfo.event.extendedProps.meetingType as MeetingType]}
                </div>
              )}
              {eventInfo.event.extendedProps.videoRoomUrl && (
                <Video className="h-3 w-3 mt-1 opacity-75" />
              )}
            </div>
          )}
          height="auto"
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={true}
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5],
            startTime: '09:00',
            endTime: '18:00'
          }}
        />
      </div>

      {/* Legend */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground">Meeting Types:</span>
          {Object.entries(MEETING_TYPE_COLORS).slice(0, 6).map(([type, colors]) => (
            <div key={type} className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-sm border"
                style={{ backgroundColor: colors.bg, borderColor: colors.border }}
              />
              <span className="text-xs">{MEETING_TYPE_LABELS[type as MeetingType]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MeetingCalendar