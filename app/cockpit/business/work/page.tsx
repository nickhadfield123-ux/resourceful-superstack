"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Briefcase,
  Clock,
  Video,
  MapPin,
  ExternalLink,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  DollarSign
} from "lucide-react"

// Active work assignment
interface WorkAssignment {
  id: string
  role_title: string
  project_name: string
  person_name: string
  person_avatar: string | null
  deliverables: string
  status: 'active' | 'paused' | 'at-risk' | 'completed'
  started_at: string
  expected_end_at: string | null
  actual_hours_worked: number
  expected_hours: number
  meeting_mode: string
  online_meeting_url: string | null
  next_milestone: string | null
  progress_percentage: number
}

// Sample active work data
const activeWork: WorkAssignment[] = [
  {
    id: '1',
    role_title: 'Lead Developer',
    project_name: 'Resourceful',
    person_name: 'Alex Chen',
    person_avatar: null,
    deliverables: 'Build core cockpit dashboard features, implement AI integration, set up database architecture',
    status: 'active',
    started_at: '2026-01-15',
    expected_end_at: '2026-04-30',
    actual_hours_worked: 120,
    expected_hours: 200,
    meeting_mode: 'async-first',
    online_meeting_url: null,
    next_milestone: 'Complete travel & fitness pages',
    progress_percentage: 60
  },
  {
    id: '2',
    role_title: 'UI/UX Designer',
    project_name: 'Resourceful',
    person_name: 'Sarah Miller',
    person_avatar: null,
    deliverables: 'Design system, component library, responsive layouts',
    status: 'active',
    started_at: '2026-02-01',
    expected_end_at: '2026-03-31',
    actual_hours_worked: 45,
    expected_hours: 80,
    meeting_mode: 'weekly-sync',
    online_meeting_url: 'https://meet.google.com/abc-defg-hij',
    next_milestone: 'Mobile responsive designs',
    progress_percentage: 56
  }
]

export default function ActiveWorkPage() {
  const [selectedWork, setSelectedWork] = React.useState<WorkAssignment | null>(null)

  const totalHoursThisWeek = activeWork.reduce((sum, w) => sum + Math.min(w.actual_hours_worked, 40), 0)
  const activeCount = activeWork.filter(w => w.status === 'active').length
  const atRiskCount = activeWork.filter(w => w.status === 'at-risk').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-600 border-green-500/20'
      case 'paused': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
      case 'at-risk': return 'bg-red-500/10 text-red-600 border-red-500/20'
      case 'completed': return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      default: return 'bg-muted'
    }
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-green-500/10 to-emerald-600/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Active Work</h1>
                <p className="text-muted-foreground">Currently active assignments and progress</p>
              </div>
            </div>
            <Button className="gap-2">
              <Users className="h-4 w-4" />
              Assign New
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold">{activeCount}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">At Risk</p>
                    <p className="text-2xl font-bold">{atRiskCount}</p>
                  </div>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Hours This Week</p>
                    <p className="text-2xl font-bold">{totalHoursThisWeek}h</p>
                  </div>
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Progress</p>
                    <p className="text-2xl font-bold">{Math.round(activeWork.reduce((s, w) => s + w.progress_percentage, 0) / activeWork.length)}%</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Work Cards */}
          <div className="space-y-4">
            {activeWork.map((work) => (
              <Card 
                key={work.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedWork(work)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={work.person_avatar || undefined} />
                          <AvatarFallback>{work.person_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{work.role_title}</h3>
                          <p className="text-sm text-muted-foreground">{work.person_name}</p>
                        </div>
                        <Badge variant="outline" className="ml-2">{work.project_name}</Badge>
                        <Badge className={getStatusColor(work.status)}>{work.status}</Badge>
                      </div>

                      <p className="text-muted-foreground mb-4">{work.deliverables}</p>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-muted-foreground">Progress</span>
                          <span className="text-sm font-medium">{work.progress_percentage}%</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full">
                          <div 
                            className="h-full bg-green-500 rounded-full transition-all"
                            style={{ width: `${work.progress_percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {work.actual_hours_worked}h / {work.expected_hours}h
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {work.meeting_mode}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Started {new Date(work.started_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Next Milestone */}
                      {work.next_milestone && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm">
                            <span className="text-muted-foreground">Next: </span>
                            <span className="font-medium">{work.next_milestone}</span>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="ml-6 flex flex-col gap-2">
                      {work.online_meeting_url && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={work.online_meeting_url} target="_blank" rel="noopener noreferrer">
                            <Video className="h-3 w-3 mr-1" />
                            Join Call
                          </a>
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {activeWork.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No active work</h3>
                <p className="text-muted-foreground">Assign someone to a role to get started</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 border-l bg-muted/30 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">This Week</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Hours</span>
              <span className="font-medium">{totalHoursThisWeek}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Projects</span>
              <span className="font-medium">{activeCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">People Working</span>
              <span className="font-medium">{activeWork.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Calendar className="h-4 w-4" />
              Schedule Sync
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <DollarSign className="h-4 w-4" />
              Log Hours
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <CheckCircle className="h-4 w-4" />
              Mark Complete
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}