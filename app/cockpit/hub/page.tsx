'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Video, Users, Plus, Clock, Play } from 'lucide-react';
import { Meeting, MeetingType, MeetingStatus } from '@/lib/meetings/types';
import { MeetingService } from '@/lib/meetings/service';

// Meeting type categories for the tabs
type MeetingCategory = 'team' | 'sales' | 'network';

const MEETING_CATEGORY_TYPES: Record<MeetingCategory, MeetingType[]> = {
  team: ['team-sync', 'standup', '1:1'],
  sales: ['strategy', 'quick-sync'],
  network: ['co-creation', 'podcast']
};

const CATEGORY_LABELS: Record<MeetingCategory, string> = {
  team: 'Team Meetings',
  sales: 'Sales Calls', 
  network: 'Network Sessions'
};

const CATEGORY_ICONS: Record<MeetingCategory, React.ReactNode> = {
  team: <Users className="h-4 w-4" />,
  sales: <Video className="h-4 w-4" />,
  network: <Calendar className="h-4 w-4" />
};

export default function HubPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<MeetingCategory>('team');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load meetings on component mount
  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      setIsLoading(true);
      
      // Get meetings for the next 7 days
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      
      const allMeetings = await MeetingService.getMeetings(startDate, endDate);
      
      // Filter meetings based on active category
      const categoryTypes = MEETING_CATEGORY_TYPES[activeCategory];
      const filteredMeetings = allMeetings.filter(meeting => 
        categoryTypes.includes(meeting.meeting_type as MeetingType)
      );
      
      // Sort by start time
      filteredMeetings.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
      
      setMeetings(filteredMeetings);
    } catch (error) {
      console.error('Error loading meetings:', error);
      toast.error('Failed to load meetings');
      
      // Create mock meetings for demonstration
      createMockMeetings();
    } finally {
      setIsLoading(false);
    }
  };

  const createMockMeetings = () => {
    const now = new Date();
    const categoryTypes = MEETING_CATEGORY_TYPES[activeCategory];
    
    const mockMeetings: Meeting[] = [
      {
        id: `mock-${Date.now()}-1`,
        title: activeCategory === 'team' ? 'Daily Standup' : 
               activeCategory === 'sales' ? 'Client Discovery Call' : 'Podcast Recording',
        meeting_type: categoryTypes[0],
        status: 'scheduled',
        start_time: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour from now
        end_time: new Date(now.getTime() + 90 * 60 * 1000), // 1.5 hours from now
        timezone: 'UTC',
        all_day: false,
        created_by: 'mock-user',
        recording_enabled: true,
        visibility: 'private',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: `mock-${Date.now()}-2`,
        title: activeCategory === 'team' ? 'Sprint Planning' : 
               activeCategory === 'sales' ? 'Demo Session' : 'Co-Creation Workshop',
        meeting_type: categoryTypes[1] || categoryTypes[0],
        status: 'scheduled',
        start_time: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
        end_time: new Date(now.getTime() + 24 * 60 * 60 * 1000 + 120 * 60 * 1000), // Tomorrow + 2 hours
        timezone: 'UTC',
        all_day: false,
        created_by: 'mock-user',
        recording_enabled: true,
        visibility: 'private',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    setMeetings(mockMeetings);
  };

  const handleCategoryChange = (category: MeetingCategory) => {
    setActiveCategory(category);
    loadMeetings();
  };

  const handleCreateMeeting = () => {
    // Generate temp ID
    const tempMeetingId = `temp-${Date.now()}`;
    // Go straight to pre-call
    router.push(`/cockpit/hub/pre-call/${tempMeetingId}`);
    toast.success('Starting meeting setup...');
  };

  const handleJoinMeeting = (meetingId: string) => {
    // Navigate to pre-call page
    router.push(`/cockpit/hub/pre-call/${meetingId}`);
  };

  const formatMeetingTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isMeetingActive = (meeting: Meeting) => {
    const now = new Date();
    const startTime = new Date(meeting.start_time);
    const endTime = new Date(meeting.end_time);
    return now >= startTime && now <= endTime;
  };

  const getMeetingStatus = (meeting: Meeting) => {
    if (isMeetingActive(meeting)) {
      return { label: 'Join Now', variant: 'success' as const };
    }
    return { label: 'Scheduled', variant: 'secondary' as const };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meeting Hub</h1>
              <p className="text-sm text-gray-600 mt-1">Your command center for meetings and collaborations</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/cockpit')}
                className="text-gray-600 hover:text-gray-900"
              >
                Back to Cockpit
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <div className="flex space-x-1">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                const category = key as MeetingCategory;
                const isActive = activeCategory === category;
                
                return (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {CATEGORY_ICONS[category]}
                    <span>{label}</span>
                    {isActive && (
                      <div className="w-1 h-1 bg-blue-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Create Meeting Button */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {CATEGORY_LABELS[activeCategory]}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Upcoming {CATEGORY_LABELS[activeCategory].toLowerCase()}
              </p>
            </div>
            <Button 
              onClick={handleCreateMeeting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create {CATEGORY_LABELS[activeCategory]}
            </Button>
          </div>

          {/* Meetings List */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              // Loading state
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </CardContent>
                </Card>
              ))
            ) : meetings.length === 0 ? (
              // Empty state
              <Card className="col-span-full">
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No {CATEGORY_LABELS[activeCategory].toLowerCase()} scheduled
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create your first meeting to get started
                  </p>
                  <Button
                    onClick={handleCreateMeeting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-semibold"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Meeting
                  </Button>
                </CardContent>
              </Card>
            ) : (
              // Meeting cards
              meetings.map((meeting) => {
                const status = getMeetingStatus(meeting);
                const isActive = isMeetingActive(meeting);
                
                return (
                  <Card 
                    key={meeting.id}
                    className="hover:shadow-lg transition-shadow duration-200 relative"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {meeting.title}
                        </CardTitle>
                        <Badge variant={status.variant}>
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatMeetingTime(new Date(meeting.start_time))}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          {meeting.meeting_type.replace('-', ' ')}
                        </div>
                      </div>
                    </CardContent>
                    
                    {/* Prominent Join Button */}
                    <div className="absolute top-4 right-4">
                      <Button
                        onClick={() => handleJoinMeeting(meeting.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-semibold text-sm shadow-lg"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Join Meeting
                      </Button>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}