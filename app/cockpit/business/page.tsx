"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Briefcase,
  Users,
  Target,
  Clock,
  MapPin,
  Video,
  Gift,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  DollarSign,
  Star,
  Plus,
  FolderKanban,
  Handshake,
  TestTube
} from "lucide-react"
import {
  ProjectRole,
  WorkAssignment,
  RoleReferral,
  NetworkSkillMatch,
  ProjectInfo,
  SAMPLE_PROJECT_INFO,
  SAMPLE_ROLES,
  SAMPLE_ASSIGNMENTS,
  SAMPLE_REFERRALS,
  SAMPLE_MATCHES,
  STATUS_COLORS,
  PRIORITY_COLORS,
  ProjectRoleStatus
} from "@/lib/business/types"

export default function BusinessPage() {
  const [expandedProject, setExpandedProject] = React.useState(true)
  const [expandedBounty, setExpandedBounty] = React.useState(false)
  const [expandedMatches, setExpandedMatches] = React.useState(false)
  const [expandedReferrals, setExpandedReferrals] = React.useState(false)

  // Use sample data for now
  const projectInfo = SAMPLE_PROJECT_INFO
  const roles = SAMPLE_ROLES
  const assignments = SAMPLE_ASSIGNMENTS
  const referrals = SAMPLE_REFERRALS
  const matches = SAMPLE_MATCHES

  // My projects (will come from DB later)
  const myProjects = [
    { id: 'resourceful', name: 'Resourceful', role: 'Owner', status: 'active', color: 'blue' }
  ]

  // Consulting openness
  const consultingOpenness = {
    available: true,
    hoursPerWeek: 10,
    skills: ['Product Strategy', 'AI/ML Integration', 'Team Building', 'Startup Advisory'],
    projectTypes: ['Early-stage startups', 'AI products', 'Community platforms'],
    rate: 'Negotiable / Equity'
  }

  // Testing openness
  const testingOpenness = {
    available: true,
    platforms: ['UserInterviews', 'Respondent', 'UserTesting'],
    types: ['User interviews', 'Beta testing', 'Usability studies'],
    topics: ['Developer tools', 'AI products', 'Productivity apps', 'Travel/Fitness apps'],
    compensation: '$50-150/hour typical'
  }

  // Group roles by status
  const rolesByStatus = React.useMemo(() => {
    const grouped: Record<ProjectRoleStatus, ProjectRole[]> = {
      searching: [],
      pipeline: [],
      found: [],
      active: [],
      filled: [],
      cancelled: []
    }
    roles.forEach(role => {
      grouped[role.status].push(role)
    })
    return grouped
  }, [roles])

  // Public roles for bounty board
  const publicRoles = roles.filter(r => r.is_public && r.status === 'searching')

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold">Business Overview</h1>
          <p className="text-muted-foreground mt-1">Your projects, consulting, and opportunities</p>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Quick Links */}
        <div className="grid grid-cols-4 gap-4">
          <Link href="/cockpit/business/bounties">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Bounty Board</p>
                    <p className="text-2xl font-bold">{publicRoles.length}</p>
                  </div>
                  <Gift className="h-6 w-6 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/cockpit/business/matches">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Network Matches</p>
                    <p className="text-2xl font-bold">{matches.length}</p>
                  </div>
                  <Star className="h-6 w-6 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/cockpit/business/work">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Work</p>
                    <p className="text-2xl font-bold">{assignments.filter(a => a.status === 'active').length}</p>
                  </div>
                  <Briefcase className="h-6 w-6 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/cockpit/business/referrals">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">My Referrals</p>
                    <p className="text-2xl font-bold">{referrals.length}</p>
                  </div>
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Open to Consulting */}
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Handshake className="h-5 w-5 text-green-600" />
              Open to Consulting
              {consultingOpenness.available && (
                <Badge variant="outline" className="bg-green-500/10 text-green-600">Available</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium mb-2">What I Can Help With</p>
                <div className="flex flex-wrap gap-2">
                  {consultingOpenness.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Project Types</p>
                <div className="flex flex-wrap gap-2">
                  {consultingOpenness.projectTypes.map((type) => (
                    <Badge key={type} variant="outline">{type}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Availability</p>
                <p className="text-muted-foreground">{consultingOpenness.hoursPerWeek} hours/week</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Rate</p>
                <p className="text-muted-foreground">{consultingOpenness.rate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Open to Testing */}
        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-purple-600" />
              Open to Testing Gigs
              {testingOpenness.available && (
                <Badge variant="outline" className="bg-purple-500/10 text-purple-600">Available</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium mb-2">Platforms</p>
                <div className="flex flex-wrap gap-2">
                  {testingOpenness.platforms.map((platform) => (
                    <Badge key={platform} variant="secondary">{platform}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Types</p>
                <div className="flex flex-wrap gap-2">
                  {testingOpenness.types.map((type) => (
                    <Badge key={type} variant="outline">{type}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Topics I Know Well</p>
                <div className="flex flex-wrap gap-2">
                  {testingOpenness.topics.map((topic) => (
                    <Badge key={topic} variant="outline">{topic}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Typical Compensation</p>
                <p className="text-muted-foreground">{testingOpenness.compensation}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5" />
              My Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myProjects.map((project) => (
                <div 
                  key={project.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-blue-500/5 border-blue-500/20 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setExpandedProject(!expandedProject)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">{project.role} • {project.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-600">
                      {rolesByStatus.active.length} active roles
                    </Badge>
                    {expandedProject ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Add New Project
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Expanded Project Detail - Resourceful */}
        {expandedProject && (
          <>
            {/* Project Vision & Milestones */}
            <Card>
              <CardContent className="p-6">
                <p className="text-lg text-muted-foreground mb-4">
                  {projectInfo.vision}
                </p>
                <div className="flex flex-wrap gap-3">
                  {projectInfo.milestones.map((milestone) => (
                    <div 
                      key={milestone.id}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm ${
                        milestone.completed 
                          ? 'bg-green-500/10 border-green-500/30 text-green-600' 
                          : 'bg-muted/50 border-border'
                      }`}
                    >
                      {milestone.completed ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                      <span className="font-medium">{milestone.title}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Roles Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Roles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {roles.map((role) => (
                    <RoleCard key={role.id} role={role} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bounty Board */}
            <Card>
              <button
                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedBounty(!expandedBounty)}
              >
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-yellow-500" />
                  Bounty Board
                  <Badge variant="secondary">{publicRoles.length}</Badge>
                </CardTitle>
                {expandedBounty ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              {expandedBounty && (
                <CardContent className="pt-0">
                  <div className="space-y-4 mt-4">
                    {publicRoles.map((role) => (
                      <div key={role.id} className="p-4 rounded-lg border bg-yellow-500/5 border-yellow-500/20">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{role.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                          </div>
                          <div className="text-right ml-4">
                            <div className="flex items-center gap-1 text-yellow-600 font-semibold">
                              <DollarSign className="h-4 w-4" />
                              {role.referral_bounty}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Network Matches */}
            <Card>
              <button
                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedMatches(!expandedMatches)}
              >
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-purple-500" />
                  Network Matches
                  <Badge variant="secondary">{matches.length}</Badge>
                </CardTitle>
                {expandedMatches ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              {expandedMatches && (
                <CardContent className="pt-0">
                  <div className="space-y-3 mt-4">
                    {matches.map((match) => (
                      <div key={`${match.role_id}-${match.offering_id}`} className="p-3 rounded-lg border bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <span className="text-sm font-medium text-purple-600">
                              {match.member_name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{match.member_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {match.skill_title} • {match.based_location}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* My Referrals */}
            <Card>
              <button
                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedReferrals(!expandedReferrals)}
              >
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  My Referrals
                  <Badge variant="secondary">{referrals.length}</Badge>
                </CardTitle>
                {expandedReferrals ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              {expandedReferrals && (
                <CardContent className="pt-0">
                  {referrals.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No referrals submitted yet</p>
                  ) : (
                    <div className="space-y-3 mt-4">
                      {referrals.map((referral) => (
                        <div key={referral.id} className="p-3 rounded-lg border bg-muted/30">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{referral.referred_person_name}</p>
                              <p className="text-xs text-muted-foreground">
                                Referred for: {referral.role?.title}
                              </p>
                            </div>
                            <Badge variant="outline">{referral.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

// Role Card Component
function RoleCard({ role }: { role: ProjectRole }) {
  const colors = STATUS_COLORS[role.status]
  const priorityColors = PRIORITY_COLORS[role.priority]

  return (
    <div className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">{role.title}</h4>
            <Badge variant="outline" className={`${priorityColors.bg} ${priorityColors.text} text-xs`}>
              {role.priority}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{role.description}</p>
        </div>
        <Badge className={`${colors.bg} ${colors.text} ml-2`}>
          {role.status}
        </Badge>
      </div>
      
      <div className="flex flex-wrap gap-1.5 mt-3">
        {role.required_skills?.slice(0, 4).map((skill) => (
          <Badge key={skill} variant="outline" className="text-xs">
            {skill}
          </Badge>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {role.location_requirement.replace('_', ' ')}
          </span>
          <span className="flex items-center gap-1">
            <Video className="h-3 w-3" />
            {role.meeting_mode}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {role.time_commitment_hours}h/wk
          </span>
        </div>
        {role.is_public && role.referral_bounty > 0 && (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 text-xs">
            <Gift className="h-3 w-3 mr-1" />
            ${role.referral_bounty}
          </Badge>
        )}
      </div>
    </div>
  )
}