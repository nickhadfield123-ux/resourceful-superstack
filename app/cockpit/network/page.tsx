"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  Plus,
  Send,
  Calendar,
  UserPlus,
  Mail,
  Link,
  Handshake,
  UserCheck,
  Search,
  MapPin,
  Briefcase,
  Sparkles,
  Globe,
  Clock,
  Filter,
  Loader2
} from "lucide-react"

interface Contact {
  id: string
  display_name: string
  role: string | null
  bio: string | null
  avatar_url: string | null
  email: string | null
  location: string | null
  timezone: string | null
  hub: string | null
  archetype: string | null
  core_need: string | null
  destiny_arc: string | null
  core_wound: string | null
  desire_primary: string | null
  shadow_pattern: string | null
  attachment_style: string | null
  relationship_to_nick: string | null
  skills: string[] | null
  specific_skills: string | null
  competence_level: number | null
  readiness_state: string | null
  communication_style: string | null
  current_offers: string | null
  can_provide: string | null
  interests: any | null
  role_tags: any | null
  availability_status: string | null
  availability_hours_per_week: number | null
  monthly_income_estimate: number | null
  investment_capacity: number | null
  hub_travel_history: any | null
  hub_travel_aspirations: any | null
  mobility_pattern: string | null
  follow_through_rate: number | null
  drama_flags: number | null
  age: number | null
  gender: string | null
  nationality: string | null
  languages: string | null
  status_emoji: string | null
  emotional_state: string | null
  current_state: string | null
  website_url: string | null
  linkedin_url: string | null
  twitter_handle: string | null
  last_active: string | null
  created_at: string
}

interface NetworkStats {
  total: number
  byHub: Record<string, number>
  available: number
}

interface NetworkResponse {
  contacts: Contact[]
  stats: NetworkStats
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export default function NetworkPage() {
  const [message, setMessage] = React.useState("")
  const [messages, setMessages] = React.useState([
    { role: "assistant", content: "Hi! I'm your Network domain assistant. I can help you maintain relationships, track follow-ups, and grow your connections. What would you like to explore?" }
  ])
  const [contacts, setContacts] = React.useState<Contact[]>([])
  const [stats, setStats] = React.useState<NetworkStats>({ total: 0, byHub: {}, available: 0 })
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedHub, setSelectedHub] = React.useState<string | null>(null)
  const [selectedContact, setSelectedContact] = React.useState<Contact | null>(null)
  const [hasMore, setHasMore] = React.useState(false)
  const [offset, setOffset] = React.useState(0)

  const fetchContacts = React.useCallback(async (reset = false) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('limit', '20')
      params.set('offset', reset ? '0' : String(offset))
      if (searchQuery) params.set('search', searchQuery)
      if (selectedHub) params.set('hub', selectedHub)
      
      const response = await fetch(`/api/network/contacts?${params}`)
      const data: NetworkResponse = await response.json()
      
      if (reset) {
        setContacts(data.contacts)
        setOffset(0)
      } else {
        // Deduplicate by ID when appending
        const existingIds = new Set(contacts.map(c => c.id))
        const newContacts = data.contacts.filter(c => !existingIds.has(c.id))
        setContacts(prev => [...prev, ...newContacts])
      }
      setStats(data.stats)
      setHasMore(data.pagination.hasMore)
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedHub, offset])

  React.useEffect(() => {
    fetchContacts(true)
  }, [selectedHub])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) fetchContacts(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSend = () => {
    if (!message.trim()) return
    setMessages([...messages, { role: "user", content: message }])
    setMessage("")
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getSkillBadge = (contact: Contact) => {
    if (contact.skills && contact.skills.length > 0) {
      return contact.skills[0]
    }
    if (contact.specific_skills) {
      const firstSkill = contact.specific_skills.split(',')[0]?.trim()
      if (firstSkill) return firstSkill
    }
    return contact.role || 'Member'
  }

  const hubs = Object.entries(stats?.byHub ?? {}).sort((a, b) => b[1] - a[1])

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-orange-500/10 to-orange-600/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Network</h1>
                <p className="text-muted-foreground">{stats.total} connections and growing</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-orange-500/10 to-transparent">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Network</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Users className="h-6 w-6 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-transparent">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Available</p>
                    <p className="text-2xl font-bold">{stats.available}</p>
                  </div>
                  <UserCheck className="h-6 w-6 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500/10 to-transparent">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Hubs</p>
                    <p className="text-2xl font-bold">{Object.keys(stats.byHub).length}</p>
                  </div>
                  <Globe className="h-6 w-6 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-transparent">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active This Week</p>
                    <p className="text-2xl font-bold">--</p>
                  </div>
                  <Handshake className="h-6 w-6 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, skills, or bio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedHub === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedHub(null)}
              >
                All
              </Button>
              {hubs.map(([hub, count]) => (
                <Button
                  key={hub}
                  variant={selectedHub === hub ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedHub(hub)}
                >
                  {hub} ({count})
                </Button>
              ))}
            </div>
          </div>

          {/* Contacts Grid */}
          {loading && contacts.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {contacts.map((contact) => (
                <Card 
                  key={contact.id} 
                  className="cursor-pointer hover:border-orange-500/50 transition-all"
                  onClick={() => setSelectedContact(contact)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Avatar className="h-14 w-14">
                        {contact.avatar_url && (
                          <AvatarImage src={contact.avatar_url} alt={contact.display_name} />
                        )}
                        <AvatarFallback className="bg-orange-500/20 text-orange-600 text-lg">
                          {getInitials(contact.display_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{contact.status_emoji || '🟢'}</span>
                          <h3 className="font-semibold truncate">{contact.display_name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {contact.role || contact.archetype || 'Community Member'}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {getSkillBadge(contact)}
                          </Badge>
                          {contact.hub && (
                            <Badge variant="outline" className="text-xs">
                              <MapPin className="h-3 w-3 mr-1" />
                              {contact.hub}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {contact.bio && (
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                        {contact.bio}
                      </p>
                    )}
                    {contact.specific_skills && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {contact.specific_skills.split(',').slice(0, 3).map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-muted/30">
                            {skill.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  setOffset(o => o + 20)
                }}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Load More
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Contact Detail + Rizz */}
      <div className="w-96 border-l flex flex-col bg-muted/30">
        {selectedContact ? (
          /* Contact Detail View */
          <div className="flex-1 overflow-auto">
            <div className="p-4 border-b bg-gradient-to-r from-orange-500/5 to-transparent">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedContact(null)}
                className="mb-2"
              >
                ← Back
              </Button>
              <div className="flex gap-4">
                <Avatar className="h-16 w-16">
                  {selectedContact.avatar_url && (
                    <AvatarImage src={selectedContact.avatar_url} alt={selectedContact.display_name} />
                  )}
                  <AvatarFallback className="bg-orange-500/20 text-orange-600 text-xl">
                    {getInitials(selectedContact.display_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{selectedContact.status_emoji || '🟢'}</span>
                    <h2 className="text-xl font-bold">{selectedContact.display_name}</h2>
                  </div>
                  <p className="text-muted-foreground">
                    {selectedContact.role || selectedContact.archetype || 'Community Member'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Quick Info */}
              <div className="space-y-2">
                {selectedContact.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedContact.location}</span>
                    {selectedContact.hub && (
                      <Badge variant="outline" className="ml-auto">{selectedContact.hub}</Badge>
                    )}
                  </div>
                )}
                {selectedContact.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{selectedContact.email}</span>
                  </div>
                )}
                {selectedContact.timezone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedContact.timezone}</span>
                  </div>
                )}
              </div>

              {/* Bio */}
              {selectedContact.bio && (
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">About</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {selectedContact.bio}
                  </CardContent>
                </Card>
              )}

              {/* Psychological Profile */}
              {(selectedContact.archetype || selectedContact.core_need || selectedContact.destiny_arc) && (
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Profile Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {selectedContact.archetype && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Archetype</span>
                        <span className="font-medium">{selectedContact.archetype}</span>
                      </div>
                    )}
                    {selectedContact.core_need && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Core Need</span>
                        <span className="font-medium">{selectedContact.core_need}</span>
                      </div>
                    )}
                    {selectedContact.destiny_arc && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Destiny Arc</span>
                        <span className="font-medium">{selectedContact.destiny_arc}</span>
                      </div>
                    )}
                    {selectedContact.relationship_to_nick && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Relationship</span>
                        <span className="font-medium">{selectedContact.relationship_to_nick}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Skills */}
              {selectedContact.specific_skills && (
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Skills & Offers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {selectedContact.specific_skills.split(',').map((skill, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {skill.trim()}
                        </Badge>
                      ))}
                    </div>
                    {selectedContact.current_offers && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {selectedContact.current_offers}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Availability */}
              {selectedContact.availability_status && (
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Availability</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <Badge variant={selectedContact.availability_status === 'available' ? 'default' : 'secondary'}>
                      {selectedContact.availability_status}
                    </Badge>
                    {selectedContact.availability_hours_per_week && (
                      <span className="ml-2 text-muted-foreground">
                        {selectedContact.availability_hours_per_week} hrs/week
                      </span>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button className="flex-1" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button variant="outline" className="flex-1" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Rizz Chat View */
          <>
            <div className="p-4 border-b bg-orange-500/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">R</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Rizz</p>
                  <p className="text-xs text-muted-foreground">Network Intelligence</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-b">
              <h3 className="font-semibold text-sm mb-3">Network Insights</h3>
              <div className="space-y-2">
                <Card className="bg-muted/50">
                  <CardContent className="py-3">
                    <p className="text-sm">
                      🌍 Your network spans <strong>{Object.keys(stats.byHub).length} hubs</strong> globally
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="py-3">
                    <p className="text-sm">
                      ✨ <strong>{stats.available} members</strong> are currently available for collaboration
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="py-3">
                    <p className="text-sm">
                      🤝 Top hubs: {hubs.slice(0, 3).map(([h, c]) => `${h} (${c})`).join(', ')}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                    msg.role === 'user' ? 'bg-orange-500 text-white' : 'bg-muted'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask Rizz..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1"
                />
                <Button size="icon" onClick={handleSend}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}