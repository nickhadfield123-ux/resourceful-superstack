"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Gift,
  DollarSign,
  MapPin,
  Video,
  Clock,
  Search,
  Filter,
  ExternalLink,
  Users,
  Calendar
} from "lucide-react"

// Bounty role type
interface BountyRole {
  id: string
  title: string
  description: string
  project_name: string
  required_skills: string[]
  location_requirement: string
  meeting_mode: string
  time_commitment_hours: number
  referral_bounty: number
  bounty_type: string
  referral_deadline: string | null
  priority: string
}

// Sample bounty data - would come from API
const bountyRoles: BountyRole[] = [
  {
    id: '1',
    title: 'Senior Full-Stack Developer',
    description: 'Lead development of our community platform. Looking for someone with strong React/Next.js experience and a passion for building products that connect people.',
    project_name: 'Resourceful',
    required_skills: ['React', 'Next.js', 'TypeScript', 'PostgreSQL', 'Supabase'],
    location_requirement: 'remote',
    meeting_mode: 'async-first',
    time_commitment_hours: 20,
    referral_bounty: 500,
    bounty_type: 'one-time',
    referral_deadline: '2026-03-15',
    priority: 'high'
  },
  {
    id: '2',
    title: 'UI/UX Designer',
    description: 'Design beautiful, intuitive interfaces for our cockpit dashboard. Experience with design systems and developer tools a plus.',
    project_name: 'Resourceful',
    required_skills: ['Figma', 'Design Systems', 'UI/UX', 'Prototyping'],
    location_requirement: 'remote',
    meeting_mode: 'flexible',
    time_commitment_hours: 10,
    referral_bounty: 250,
    bounty_type: 'one-time',
    referral_deadline: '2026-03-30',
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Community Manager',
    description: 'Help build and nurture our community of change-makers. Organize events, facilitate connections, and spread the word.',
    project_name: 'Resourceful',
    required_skills: ['Community Building', 'Event Planning', 'Social Media', 'Communication'],
    location_requirement: 'remote',
    meeting_mode: 'regular-syncs',
    time_commitment_hours: 15,
    referral_bounty: 300,
    bounty_type: 'one-time',
    referral_deadline: null,
    priority: 'medium'
  }
]

export default function BountyBoardPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedBounty, setSelectedBounty] = React.useState<BountyRole | null>(null)

  const filteredBounties = bountyRoles.filter(bounty => 
    bounty.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bounty.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bounty.required_skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const totalBounties = bountyRoles.reduce((sum, b) => sum + b.referral_bounty, 0)

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-yellow-500/10 to-amber-600/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Gift className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Bounty Board</h1>
                <p className="text-muted-foreground">Earn rewards for referring talented people</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Available</p>
                <p className="text-2xl font-bold text-yellow-600">${totalBounties}</p>
              </div>
              <Button className="gap-2">
                <Users className="h-4 w-4" />
                Post a Bounty
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bounties by skill, title, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Open Bounties</p>
                    <p className="text-2xl font-bold">{bountyRoles.length}</p>
                  </div>
                  <Gift className="h-5 w-5 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">High Priority</p>
                    <p className="text-2xl font-bold">{bountyRoles.filter(b => b.priority === 'high').length}</p>
                  </div>
                  <DollarSign className="h-5 w-5 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">With Deadlines</p>
                    <p className="text-2xl font-bold">{bountyRoles.filter(b => b.referral_deadline).length}</p>
                  </div>
                  <Calendar className="h-5 w-5 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bounty List */}
          <div className="space-y-4">
            {filteredBounties.map((bounty) => (
              <Card 
                key={bounty.id} 
                className="cursor-pointer hover:shadow-md transition-shadow border-yellow-500/20"
                onClick={() => setSelectedBounty(bounty)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{bounty.title}</h3>
                        <Badge variant={bounty.priority === 'high' ? 'destructive' : 'secondary'}>
                          {bounty.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {bounty.project_name}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-4">{bounty.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {bounty.required_skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {bounty.location_requirement}
                        </span>
                        <span className="flex items-center gap-1">
                          <Video className="h-3 w-3" />
                          {bounty.meeting_mode}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {bounty.time_commitment_hours}h/week
                        </span>
                      </div>
                    </div>

                    <div className="text-right ml-6">
                      <div className="flex items-center gap-1 text-2xl font-bold text-yellow-600">
                        <DollarSign className="h-5 w-5" />
                        {bounty.referral_bounty}
                      </div>
                      <p className="text-xs text-muted-foreground">{bounty.bounty_type}</p>
                      {bounty.referral_deadline && (
                        <p className="text-xs text-red-500 mt-2">
                          Deadline: {new Date(bounty.referral_deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button size="sm" className="gap-1">
                      <Users className="h-3 w-3" />
                      Refer Someone
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredBounties.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No bounties found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Right Sidebar - Info */}
      <div className="w-80 border-l bg-muted/30 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How Bounties Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-2">
              <p className="font-medium">1. Find a Role</p>
              <p className="text-muted-foreground">Browse open roles with referral bounties</p>
            </div>
            <div className="space-y-2">
              <p className="font-medium">2. Refer Someone</p>
              <p className="text-muted-foreground">Submit a referral for someone you know</p>
            </div>
            <div className="space-y-2">
              <p className="font-medium">3. Get Paid</p>
              <p className="text-muted-foreground">When they're hired, you receive the bounty</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Your Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Referrals Made</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Successful Hires</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Earned</span>
              <span className="font-medium">$0</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}