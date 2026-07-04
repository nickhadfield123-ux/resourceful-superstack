"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  TrendingUp,
  Users,
  Briefcase,
  Heart,
  Dumbbell,
  Plane,
  Network
} from "lucide-react"

export default function OverviewPage() {
  // Mock data - will connect to real data later
  const weeklyMetrics = {
    events: 12,
    completed: 8,
    urgent: 2
  }

  const upcomingEvents = [
    { time: "10:00 AM", title: "Team Sync", domain: "business" },
    { time: "2:00 PM", title: "Gym Session", domain: "fitness" },
    { time: "4:30 PM", title: "Call with Mom", domain: "family" },
  ]

  const domainColors: Record<string, string> = {
    business: "bg-blue-500/20 text-blue-600",
    family: "bg-pink-500/20 text-pink-600",
    fitness: "bg-green-500/20 text-green-600",
    travel: "bg-purple-500/20 text-purple-600",
    network: "bg-orange-500/20 text-orange-600"
  }

  const domainIcons: Record<string, any> = {
    business: Briefcase,
    family: Heart,
    fitness: Dumbbell,
    travel: Plane,
    network: Network
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold mb-2">Good morning, Nick 👋</h1>
          <p className="text-muted-foreground">Here's what's happening across your domains today.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid gap-6">
          
          {/* Weekly Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Week</p>
                    <p className="text-3xl font-bold">{weeklyMetrics.events}</p>
                    <p className="text-xs text-muted-foreground">events</p>
                  </div>
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-3xl font-bold text-green-600">{weeklyMetrics.completed}</p>
                    <p className="text-xs text-muted-foreground">tasks</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Urgent</p>
                    <p className="text-3xl font-bold text-red-600">{weeklyMetrics.urgent}</p>
                    <p className="text-xs text-muted-foreground">items</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today's Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event, i) => {
                  const Icon = domainIcons[event.domain] || Calendar
                  return (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="text-center min-w-[60px]">
                        <p className="text-sm font-medium">{event.time}</p>
                      </div>
                      <div className="h-8 w-px bg-border" />
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <p className="flex-1 font-medium">{event.title}</p>
                      <Badge className={domainColors[event.domain]}>
                        {event.domain}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Calendar className="h-5 w-5" />
              <span>Schedule Meeting</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <TrendingUp className="h-5 w-5" />
              <span>View Progress</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="h-5 w-5" />
              <span>Team Activity</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Clock className="h-5 w-5" />
              <span>Time Tracking</span>
            </Button>
          </div>

          {/* Smart Suggestions Placeholder */}
          <Card className="border-dashed">
            <CardContent className="pt-6 text-center">
              <div className="py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Smart Suggestions</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Rizz will analyze your patterns and suggest optimizations for your time, 
                  relationships, and goals across all domains.
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}