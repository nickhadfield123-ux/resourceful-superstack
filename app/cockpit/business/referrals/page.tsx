"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { 
  Users,
  Gift,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Plus,
  Briefcase,
  TrendingUp
} from "lucide-react"

// Referral type
interface Referral {
  id: string
  referred_person_name: string
  referred_person_avatar: string | null
  role_title: string
  project_name: string
  status: 'pending' | 'reviewing' | 'interviewing' | 'hired' | 'rejected'
  referred_at: string
  bounty_eligible: boolean
  bounty_amount: number
  bounty_paid: boolean
  notes: string | null
}

// Sample referrals data
const myReferrals: Referral[] = [
  {
    id: '1',
    referred_person_name: 'Jamie Wilson',
    referred_person_avatar: null,
    role_title: 'Senior Full-Stack Developer',
    project_name: 'Resourceful',
    status: 'interviewing',
    referred_at: '2026-02-20',
    bounty_eligible: true,
    bounty_amount: 500,
    bounty_paid: false,
    notes: 'Strong React experience, previously at Vercel'
  },
  {
    id: '2',
    referred_person_name: 'Maya Patel',
    referred_person_avatar: null,
    role_title: 'UI/UX Designer',
    project_name: 'Resourceful',
    status: 'reviewing',
    referred_at: '2026-02-25',
    bounty_eligible: true,
    bounty_amount: 250,
    bounty_paid: false,
    notes: 'Great portfolio, interested in part-time'
  },
  {
    id: '3',
    referred_person_name: 'Chris Anderson',
    referred_person_avatar: null,
    role_title: 'Community Manager',
    project_name: 'Resourceful',
    status: 'pending',
    referred_at: '2026-02-27',
    bounty_eligible: true,
    bounty_amount: 300,
    bounty_paid: false,
    notes: 'Community building experience in tech startups'
  }
]

export default function ReferralsPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null)

  const filteredReferrals = myReferrals.filter(ref => {
    if (statusFilter && ref.status !== statusFilter) return false
    if (searchQuery && !ref.referred_person_name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const totalBounties = myReferrals.filter(r => r.bounty_eligible).reduce((sum, r) => sum + r.bounty_amount, 0)
  const paidBounties = myReferrals.filter(r => r.bounty_paid).reduce((sum, r) => sum + r.bounty_amount, 0)
  const hiredCount = myReferrals.filter(r => r.status === 'hired').length

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />
      case 'reviewing': return <Search className="h-3 w-3" />
      case 'interviewing': return <Users className="h-3 w-3" />
      case 'hired': return <CheckCircle className="h-3 w-3" />
      case 'rejected': return <XCircle className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-500/10 text-gray-600 border-gray-500/20'
      case 'reviewing': return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      case 'interviewing': return 'bg-purple-500/10 text-purple-600 border-purple-500/20'
      case 'hired': return 'bg-green-500/10 text-green-600 border-green-500/20'
      case 'rejected': return 'bg-red-500/10 text-red-600 border-red-500/20'
      default: return 'bg-muted'
    }
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-500/10 to-indigo-600/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">My Referrals</h1>
                <p className="text-muted-foreground">People you've referred for roles</p>
              </div>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Referral
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
                    <p className="text-sm text-muted-foreground">Total Referrals</p>
                    <p className="text-2xl font-bold">{myReferrals.length}</p>
                  </div>
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Hired</p>
                    <p className="text-2xl font-bold">{hiredCount}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Potential Bounties</p>
                    <p className="text-2xl font-bold text-yellow-600">${totalBounties}</p>
                  </div>
                  <Gift className="h-5 w-5 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Earned</p>
                    <p className="text-2xl font-bold text-green-600">${paidBounties}</p>
                  </div>
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {['pending', 'reviewing', 'interviewing', 'hired', 'rejected'].map((status) => (
                <Button 
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setStatusFilter(statusFilter === status ? null : status)}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          {/* Referrals List */}
          <div className="space-y-4">
            {filteredReferrals.map((referral) => (
              <Card key={referral.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={referral.referred_person_avatar || undefined} />
                      <AvatarFallback>{referral.referred_person_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">{referral.referred_person_name}</h3>
                        <Badge className={getStatusColor(referral.status)}>
                          {getStatusIcon(referral.status)}
                          <span className="ml-1 capitalize">{referral.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Referred for <span className="font-medium text-foreground">{referral.role_title}</span>
                        <span className="mx-2">•</span>
                        {referral.project_name}
                      </p>
                      {referral.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{referral.notes}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Referred {new Date(referral.referred_at).toLocaleDateString()}
                        </span>
                        {referral.bounty_eligible && (
                          <span className={`flex items-center gap-1 ${referral.bounty_paid ? 'text-green-600' : 'text-yellow-600'}`}>
                            <DollarSign className="h-3 w-3" />
                            ${referral.bounty_amount} bounty {referral.bounty_paid ? '(paid)' : '(pending)'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      {referral.status === 'interviewing' && (
                        <Button size="sm" className="gap-1">
                          <Users className="h-3 w-3" />
                          Schedule
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredReferrals.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No referrals found</h3>
                <p className="text-muted-foreground">Refer someone to a role to get started</p>
                <Button className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Make a Referral
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 border-l bg-muted/30 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Referral Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              <strong className="text-foreground">Best matches:</strong> Refer people whose skills match the role requirements
            </p>
            <p className="text-muted-foreground">
              <strong className="text-foreground">Add context:</strong> Include why you think they'd be great
            </p>
            <p className="text-muted-foreground">
              <strong className="text-foreground">Stay connected:</strong> Let them know you referred them
            </p>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Your Impact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">People Helped</span>
              <span className="font-medium">{hiredCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Success Rate</span>
              <span className="font-medium">
                {myReferrals.length > 0 ? Math.round((hiredCount / myReferrals.length) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Earned</span>
              <span className="font-medium text-green-600">${paidBounties}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Top Roles to Refer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-2 rounded-lg bg-background text-sm">
              <p className="font-medium">Senior Full-Stack Developer</p>
              <p className="text-xs text-muted-foreground">$500 bounty</p>
            </div>
            <div className="p-2 rounded-lg bg-background text-sm">
              <p className="font-medium">Community Manager</p>
              <p className="text-xs text-muted-foreground">$300 bounty</p>
            </div>
            <div className="p-2 rounded-lg bg-background text-sm">
              <p className="font-medium">UI/UX Designer</p>
              <p className="text-xs text-muted-foreground">$250 bounty</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}