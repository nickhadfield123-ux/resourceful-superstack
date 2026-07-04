"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Heart,
  Plus,
  Send,
  Calendar,
  Phone,
  Gift,
  Users,
  MapPin,
  Clock,
  Mail,
  Sparkles,
  Loader2
} from "lucide-react"

interface FamilyMember {
  id: string
  display_name: string
  relationship_to_nick: string | null
  bio: string | null
  avatar_url: string | null
  email: string | null
  location: string | null
  timezone: string | null
  hub: string | null
  archetype: string | null
  core_need: string | null
  destiny_arc: string | null
  specific_skills: string | null
  availability_status: string | null
  status_emoji: string | null
  age: number | null
  gender: string | null
  nationality: string | null
  languages: string | null
  last_active: string | null
}

export default function FamilyPage() {
  const [message, setMessage] = React.useState("")
  const [messages, setMessages] = React.useState([
    { role: "assistant", content: "Hi! I'm your Family domain assistant. I can help you stay connected with loved ones, remember important dates, and nurture family relationships. What would you like to explore?" }
  ])
  const [familyMembers, setFamilyMembers] = React.useState<FamilyMember[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedMember, setSelectedMember] = React.useState<FamilyMember | null>(null)

  const fetchFamilyMembers = React.useCallback(async () => {
    setLoading(true)
    try {
      // Fetch all contacts and filter for family
      const response = await fetch('/api/network/contacts?limit=500')
      const data = await response.json()
      
      // Filter for family relationships
      const familyKeywords = ['family', 'sister', 'brother', 'dad', 'mom', 'mum', 'mother', 'father', 
                              'parent', 'cousin', 'aunt', 'uncle', 'niece', 'nephew', 'grandma', 
                              'grandpa', 'grandmother', 'grandfather', 'wife', 'husband', 'partner',
                              'daughter', 'son', 'in-law']
      
      const family = (data.contacts || []).filter((contact: FamilyMember) => {
        if (!contact.relationship_to_nick) return false
        const rel = contact.relationship_to_nick.toLowerCase()
        return familyKeywords.some(keyword => rel.includes(keyword))
      })
      
      setFamilyMembers(family)
    } catch (error) {
      console.error('Failed to fetch family members:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchFamilyMembers()
  }, [])

  const handleSend = () => {
    if (!message.trim()) return
    setMessages([...messages, { role: "user", content: message }])
    setMessage("")
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getRelationshipLabel = (relationship: string | null) => {
    if (!relationship) return 'Family'
    return relationship.charAt(0).toUpperCase() + relationship.slice(1)
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-pink-500/10 to-pink-600/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Family</h1>
                <p className="text-muted-foreground">{familyMembers.length} family members in your network</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-pink-500/10 to-transparent">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Family Members</p>
                    <p className="text-2xl font-bold">{familyMembers.length}</p>
                  </div>
                  <Users className="h-6 w-6 text-pink-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-transparent">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Hubs</p>
                    <p className="text-2xl font-bold">{new Set(familyMembers.map(m => m.hub).filter(Boolean)).size}</p>
                  </div>
                  <MapPin className="h-6 w-6 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500/10 to-transparent">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Available</p>
                    <p className="text-2xl font-bold">{familyMembers.filter(m => m.availability_status === 'available').length}</p>
                  </div>
                  <Phone className="h-6 w-6 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Family Members Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : familyMembers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No family members found in your network yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Add contacts with family relationships to see them here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {familyMembers.map((member) => (
                <Card 
                  key={member.id} 
                  className="cursor-pointer hover:border-pink-500/50 transition-all"
                  onClick={() => setSelectedMember(member)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Avatar className="h-14 w-14">
                        {member.avatar_url && (
                          <AvatarImage src={member.avatar_url} alt={member.display_name} />
                        )}
                        <AvatarFallback className="bg-pink-500/20 text-pink-600 text-lg">
                          {getInitials(member.display_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{member.status_emoji || '❤️'}</span>
                          <h3 className="font-semibold truncate">{member.display_name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {getRelationshipLabel(member.relationship_to_nick)}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge variant="secondary" className="text-xs bg-pink-500/10">
                            {getRelationshipLabel(member.relationship_to_nick)}
                          </Badge>
                          {member.hub && (
                            <Badge variant="outline" className="text-xs">
                              <MapPin className="h-3 w-3 mr-1" />
                              {member.hub}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {member.bio && (
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                        {member.bio}
                      </p>
                    )}
                    {member.location && (
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {member.location}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Member Detail + Rizz */}
      <div className="w-96 border-l flex flex-col bg-muted/30">
        {selectedMember ? (
          /* Member Detail View */
          <div className="flex-1 overflow-auto">
            <div className="p-4 border-b bg-gradient-to-r from-pink-500/5 to-transparent">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedMember(null)}
                className="mb-2"
              >
                ← Back
              </Button>
              <div className="flex gap-4">
                <Avatar className="h-16 w-16">
                  {selectedMember.avatar_url && (
                    <AvatarImage src={selectedMember.avatar_url} alt={selectedMember.display_name} />
                  )}
                  <AvatarFallback className="bg-pink-500/20 text-pink-600 text-xl">
                    {getInitials(selectedMember.display_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{selectedMember.status_emoji || '❤️'}</span>
                    <h2 className="text-xl font-bold">{selectedMember.display_name}</h2>
                  </div>
                  <p className="text-muted-foreground">
                    {getRelationshipLabel(selectedMember.relationship_to_nick)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Quick Info */}
              <div className="space-y-2">
                {selectedMember.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedMember.location}</span>
                    {selectedMember.hub && (
                      <Badge variant="outline" className="ml-auto">{selectedMember.hub}</Badge>
                    )}
                  </div>
                )}
                {selectedMember.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{selectedMember.email}</span>
                  </div>
                )}
                {selectedMember.timezone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedMember.timezone}</span>
                  </div>
                )}
                {selectedMember.age && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedMember.age} years old</span>
                  </div>
                )}
              </div>

              {/* Bio */}
              {selectedMember.bio && (
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">About</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {selectedMember.bio}
                  </CardContent>
                </Card>
              )}

              {/* Profile Insights */}
              {(selectedMember.archetype || selectedMember.core_need || selectedMember.destiny_arc) && (
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Profile Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {selectedMember.archetype && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Archetype</span>
                        <span className="font-medium">{selectedMember.archetype}</span>
                      </div>
                    )}
                    {selectedMember.core_need && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Core Need</span>
                        <span className="font-medium">{selectedMember.core_need}</span>
                      </div>
                    )}
                    {selectedMember.destiny_arc && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Destiny Arc</span>
                        <span className="font-medium">{selectedMember.destiny_arc}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Skills */}
              {selectedMember.specific_skills && (
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Skills & Interests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {selectedMember.specific_skills.split(',').map((skill, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {skill.trim()}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button className="flex-1" size="sm">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
                <Button variant="outline" className="flex-1" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Rizz Chat View */
          <>
            <div className="p-4 border-b bg-pink-500/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">R</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Rizz</p>
                  <p className="text-xs text-muted-foreground">Family mode</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-b">
              <h3 className="font-semibold text-sm mb-3">Family Insights</h3>
              <div className="space-y-2">
                <Card className="bg-muted/50">
                  <CardContent className="py-3">
                    <p className="text-sm">
                      ❤️ You have <strong>{familyMembers.length} family members</strong> in your network
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="py-3">
                    <p className="text-sm">
                      🌍 Family across <strong>{new Set(familyMembers.map(m => m.hub).filter(Boolean)).size} hubs</strong>
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="py-3">
                    <p className="text-sm">
                      ✨ <strong>{familyMembers.filter(m => m.availability_status === 'available').length} available</strong> for connection
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                    msg.role === 'user' ? 'bg-pink-500 text-white' : 'bg-muted'
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