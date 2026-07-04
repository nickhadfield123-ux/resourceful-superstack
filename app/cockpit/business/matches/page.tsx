"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Star,
  MapPin,
  Clock,
  Search,
  Filter,
  Users,
  MessageSquare,
  Briefcase,
  Globe,
  Zap,
  Loader2
} from "lucide-react"

// Contact type from API
interface Contact {
  id: string
  display_name: string | null
  role: string | null
  bio: string | null
  avatar_url: string | null
  location: string | null
  hub: string | null
  specific_skills: string[] | null
  role_tags: string[] | null
  availability_status: string | null
  availability_hours_per_week: number | null
  current_offers: string[] | null
  can_provide: string[] | null
  interests: string[] | null
  languages: string[] | null
  competence_level: string | null
  readiness_state: string | null
  communication_style: string | null
}

interface ContactsResponse {
  contacts: Contact[]
  stats: {
    total: number
    byHub: Record<string, number>
    available: number
  }
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export default function NetworkMatchesPage() {
  const [contacts, setContacts] = React.useState<Contact[]>([])
  const [stats, setStats] = React.useState({ total: 0, byHub: {} as Record<string, number>, available: 0 })
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedHub, setSelectedHub] = React.useState<string | null>(null)
  const [selectedContact, setSelectedContact] = React.useState<Contact | null>(null)

  // Fetch contacts from API
  React.useEffect(() => {
    loadContacts()
  }, [selectedHub])

  const loadContacts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedHub) params.append('hub', selectedHub)
      if (searchQuery) params.append('search', searchQuery)
      
      const response = await fetch(`/api/network/contacts?${params.toString()}`)
      const data: ContactsResponse = await response.json()
      
      if (response.ok) {
        setContacts(data.contacts)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to load contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    loadContacts()
  }

  // Filter contacts by skills match (simplified)
  const skillsWeNeed = ['React', 'Next.js', 'TypeScript', 'UI/UX', 'Community', 'Marketing']
  
  const getMatchingSkills = (contact: Contact): string[] => {
    const skills = contact.specific_skills
    if (!skills || !Array.isArray(skills)) return []
    return skills.filter(skill => 
      skillsWeNeed.some(needed => 
        skill.toLowerCase().includes(needed.toLowerCase())
      )
    )
  }

  // Helper to safely get skills array
  const getSkillsArray = (skills: string[] | string | null | undefined): string[] => {
    if (!skills) return []
    if (Array.isArray(skills)) return skills
    if (typeof skills === 'string') {
      // If it's a string, try to parse it or split it
      try {
        const parsed = JSON.parse(skills)
        return Array.isArray(parsed) ? parsed : [skills]
      } catch {
        return skills.split(',').map(s => s.trim()).filter(Boolean)
      }
    }
    return []
  }

  const hubs = ['Peru', 'UK', 'Bali', 'Canaries', 'Alps']

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-purple-500/10 to-indigo-600/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Network Matches</h1>
                <p className="text-muted-foreground">People in your network who match your needs</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Network Size</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Button className="gap-2">
                <Users className="h-4 w-4" />
                Find More
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
                placeholder="Search by name, skills, or bio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>

          {/* Hub Filters */}
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant={selectedHub === null ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSelectedHub(null)}
            >
              All ({stats.total})
            </Button>
            {hubs.map(hub => (
              <Button 
                key={hub}
                variant={selectedHub === hub ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedHub(hub)}
              >
                {hub} ({stats.byHub[hub] || 0})
              </Button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Available</p>
                    <p className="text-2xl font-bold">{stats.available}</p>
                  </div>
                  <Zap className="h-5 w-5 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">In Peru</p>
                    <p className="text-2xl font-bold">{stats.byHub['Peru'] || 0}</p>
                  </div>
                  <Globe className="h-5 w-5 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">In UK</p>
                    <p className="text-2xl font-bold">{stats.byHub['UK'] || 0}</p>
                  </div>
                  <Globe className="h-5 w-5 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Skill Matches</p>
                    <p className="text-2xl font-bold">{contacts.filter(c => getMatchingSkills(c).length > 0).length}</p>
                  </div>
                  <Briefcase className="h-5 w-5 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Contacts Grid */}
          {!loading && (
            <div className="grid grid-cols-2 gap-4">
              {contacts.slice(0, 20).map((contact) => {
                const matchingSkills = getMatchingSkills(contact)
                
                return (
                  <Card 
                    key={contact.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedContact(contact)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={contact.avatar_url || undefined} />
                          <AvatarFallback>
                            {contact.display_name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">{contact.display_name || 'Unknown'}</h3>
                            {contact.availability_status === 'available' && (
                              <Badge variant="outline" className="bg-green-500/10 text-green-600 text-xs">
                                Available
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {contact.role || contact.bio?.slice(0, 50) || 'No role set'}
                          </p>
                          
                          {/* Skills */}
                          {(() => {
                            const skillsArray = getSkillsArray(contact.specific_skills)
                            return skillsArray.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {skillsArray.slice(0, 4).map((skill) => (
                                  <Badge 
                                    key={skill} 
                                    variant={matchingSkills.includes(skill) ? 'default' : 'outline'} 
                                    className="text-xs"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                                {skillsArray.length > 4 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{skillsArray.length - 4}
                                  </Badge>
                                )}
                              </div>
                            )
                          })()}

                          {/* Location & Availability */}
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            {contact.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {contact.location}
                              </span>
                            )}
                            {contact.availability_hours_per_week && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {contact.availability_hours_per_week}h/week
                              </span>
                            )}
                          </div>

                          {/* Matching indicator */}
                          {matchingSkills.length > 0 && (
                            <div className="mt-2 pt-2 border-t">
                              <p className="text-xs text-purple-600 flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                Matches {matchingSkills.length} skills you need
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {!loading && contacts.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No contacts found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Right Sidebar - Contact Detail */}
      <div className="w-80 border-l bg-muted/30">
        {selectedContact ? (
          <div className="p-4">
            <div className="text-center mb-4">
              <Avatar className="h-20 w-20 mx-auto mb-3">
                <AvatarImage src={selectedContact.avatar_url || undefined} />
                <AvatarFallback className="text-2xl">
                  {selectedContact.display_name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-semibold">{selectedContact.display_name}</h2>
              <p className="text-sm text-muted-foreground">{selectedContact.role}</p>
              {selectedContact.hub && (
                <Badge variant="secondary" className="mt-2">{selectedContact.hub}</Badge>
              )}
            </div>

            <div className="space-y-4">
              {/* Bio */}
              {selectedContact.bio && (
                <div>
                  <p className="text-sm font-medium mb-1">About</p>
                  <p className="text-sm text-muted-foreground">{selectedContact.bio}</p>
                </div>
              )}

              {/* Skills */}
              {(() => {
                const skillsArray = getSkillsArray(selectedContact.specific_skills)
                return skillsArray.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {skillsArray.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {/* Can Provide */}
              {selectedContact.can_provide && selectedContact.can_provide.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Can Provide</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedContact.can_provide.map((item) => (
                      <Badge key={item} variant="secondary" className="text-xs">{item}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability */}
              <div className="p-3 rounded-lg bg-background">
                <p className="text-sm font-medium mb-2">Availability</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="capitalize">{selectedContact.availability_status || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hours/week</span>
                    <span>{selectedContact.availability_hours_per_week || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span>{selectedContact.location || 'Not set'}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button className="flex-1 gap-1">
                  <MessageSquare className="h-4 w-4" />
                  Message
                </Button>
                <Button variant="outline" className="flex-1">
                  Refer
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center p-6">
            <div>
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Select a contact to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}