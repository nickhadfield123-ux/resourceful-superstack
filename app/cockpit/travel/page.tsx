"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Plane,
  Plus,
  Send,
  Calendar,
  MapPin,
  Luggage,
  FileText,
  Hotel,
  Car,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  PlaneTakeoff,
  Home,
  Briefcase,
  Heart,
  Sparkles,
  ChevronRight,
  Globe,
  CreditCard,
  Building,
  Mountain,
  Palmtree,
  Coffee
} from "lucide-react"

// Trip data structure - reusable for others
interface Trip {
  id: string
  destination: string
  country: string
  dates: { start: string; end: string }
  status: 'confirmed' | 'planning' | 'idea'
  purpose: ('work' | 'family' | 'vacation' | 'wedding' | 'launch')[]
  flights?: { booked: boolean; details?: string }
  accommodation?: { booked: boolean; details?: string; link?: string }
  carRental?: { needed: boolean; booked: boolean }
  visa?: { needed: boolean; obtained: boolean }
  familyMembers?: string[]
  notes?: string
  color: string
}

// Your actual travel data - this would be stored in DB for users
const myTrips: Trip[] = [
  {
    id: '1',
    destination: 'Sacred Valley',
    country: 'Peru',
    dates: { start: 'Now', end: 'End of April' },
    status: 'confirmed',
    purpose: ['work'],
    flights: { booked: true },
    accommodation: { booked: true, details: 'Current base' },
    carRental: { needed: false, booked: false },
    visa: { needed: false, obtained: true },
    notes: 'Operational launch of global org. Working remotely.',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: '2',
    destination: 'La Gomera',
    country: 'Canary Islands, Spain',
    dates: { start: 'Early May', end: 'Early June' },
    status: 'planning',
    purpose: ['vacation', 'family', 'work'],
    flights: { booked: false, details: 'Need to book - via Tenerife or Gran Canaria' },
    accommodation: { booked: false, details: 'Valle Gran Rey - need to find' },
    carRental: { needed: true, booked: false },
    visa: { needed: true, obtained: false },
    familyMembers: ['Parents (staying other side of island - weekends)'],
    notes: 'Working remotely. See parents at weekends. Need credit card solution for car rental.',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: '3',
    destination: 'Morzine',
    country: 'French Alps',
    dates: { start: 'Late May', end: 'Early June' },
    status: 'planning',
    purpose: ['wedding', 'work', 'family'],
    flights: { booked: false, details: 'Fly to Geneva' },
    accommodation: { booked: false, details: 'Maybe stay at Dan\'s place' },
    carRental: { needed: true, booked: false },
    familyMembers: ['Friend Sam (wedding)', 'Friend Dan'],
    notes: 'Sam\'s wedding. Present Resourceful to friends. Plan autumn festival launch event.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: '4',
    destination: 'Marbella',
    country: 'Spain',
    dates: { start: 'June (TBC)', end: 'June' },
    status: 'idea',
    purpose: ['family'],
    flights: { booked: false },
    accommodation: { booked: false, details: 'Likely with parents' },
    carRental: { needed: true, booked: false },
    familyMembers: ['Parents', 'Brother', 'New baby Cameron'],
    notes: 'See brother and meet baby Cameron',
    color: 'from-green-500 to-teal-500'
  },
  {
    id: '5',
    destination: 'Malvern',
    country: 'UK',
    dates: { start: 'Summer', end: 'Various' },
    status: 'planning',
    purpose: ['work', 'family'],
    flights: { booked: false },
    accommodation: { booked: false, details: 'Sometimes with parents' },
    carRental: { needed: true, booked: false },
    visa: { needed: true, obtained: false },
    familyMembers: ['Sister & family', 'Parents'],
    notes: 'Work + family time. Need to establish UK stay limits.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: '6',
    destination: 'SW London',
    country: 'UK',
    dates: { start: 'Summer', end: 'Various' },
    status: 'planning',
    purpose: ['work'],
    flights: { booked: false },
    accommodation: { booked: false },
    carRental: { needed: false, booked: false },
    notes: 'Wandsworth/Clapham/Balham area',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    id: '7',
    destination: 'Alps',
    country: 'France/Switzerland',
    dates: { start: 'Later in year', end: 'TBC' },
    status: 'idea',
    purpose: ['work', 'vacation'],
    color: 'from-cyan-500 to-blue-500'
  },
  {
    id: '8',
    destination: 'Peru',
    country: 'Peru',
    dates: { start: 'Later in year', end: 'TBC' },
    status: 'idea',
    purpose: ['work'],
    color: 'from-red-500 to-orange-500'
  },
  {
    id: '9',
    destination: 'Bali',
    country: 'Indonesia',
    dates: { start: 'Later in year', end: 'TBC' },
    status: 'idea',
    purpose: ['work', 'vacation'],
    color: 'from-teal-500 to-green-500'
  }
]

// Flight preferences
const flightPreferences = {
  cabinClass: ['business', 'first'] as const,
  priorities: ['quickest', 'least connections', 'lounge access'],
  groupTravel: ['private jet option for groups'],
  airlines: ['Prefer airlines with good lounges']
}

// Legal/Visa tasks
const legalTasks = [
  { id: '1', title: 'EU Digital Nomad Visa', status: 'research', description: 'Need to research requirements for longer EU stays' },
  { id: '2', title: 'UK Stay Limits', status: 'research', description: 'Establish how long allowed to stay - digital nomad option?' },
  { id: '3', title: 'Credit Rating / Car Rental', status: 'action', description: 'Bad credit rating - need solution for car rentals (usually require credit card)' },
]

const purposeIcons: Record<string, React.ReactNode> = {
  work: <Briefcase className="h-3 w-3" />,
  family: <Heart className="h-3 w-3" />,
  vacation: <Palmtree className="h-3 w-3" />,
  wedding: <Heart className="h-3 w-3" />,
  launch: <Sparkles className="h-3 w-3" />
}

const statusColors: Record<string, string> = {
  confirmed: 'bg-green-500',
  planning: 'bg-yellow-500',
  idea: 'bg-gray-400'
}

export default function TravelPage() {
  const [message, setMessage] = React.useState("")
  const [messages, setMessages] = React.useState([
    { role: "assistant", content: "Hi! I'm your Travel assistant. I can help you plan trips, find flights, book accommodation, and sort out visas. What would you like help with?" }
  ])
  const [selectedTrip, setSelectedTrip] = React.useState<Trip | null>(null)
  const [activeTab, setActiveTab] = React.useState<'timeline' | 'flights' | 'accommodation' | 'visas'>('timeline')

  const handleSend = () => {
    if (!message.trim()) return
    setMessages([...messages, { role: "user", content: message }])
    setMessage("")
    // AI response would be handled by API
  }

  // Group trips by status
  const confirmedTrips = myTrips.filter(t => t.status === 'confirmed')
  const planningTrips = myTrips.filter(t => t.status === 'planning')
  const ideaTrips = myTrips.filter(t => t.status === 'idea')

  // Calculate stats
  const totalDestinations = myTrips.length
  const countriesVisited = new Set(myTrips.map(t => t.country)).size
  const familyTrips = myTrips.filter(t => t.purpose.includes('family')).length

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-sky-500/10 to-blue-600/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sky-500/20 rounded-xl flex items-center justify-center">
                <Plane className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Travel</h1>
                <p className="text-muted-foreground">Your journey planner</p>
              </div>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Trip
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Destinations</p>
                    <p className="text-2xl font-bold">{totalDestinations}</p>
                  </div>
                  <MapPin className="h-6 w-6 text-sky-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Countries</p>
                    <p className="text-2xl font-bold">{countriesVisited}</p>
                  </div>
                  <Globe className="h-6 w-6 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Family Visits</p>
                    <p className="text-2xl font-bold">{familyTrips}</p>
                  </div>
                  <Users className="h-6 w-6 text-pink-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">To Book</p>
                    <p className="text-2xl font-bold">{planningTrips.length}</p>
                  </div>
                  <AlertCircle className="h-6 w-6 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b pb-2">
            {(['timeline', 'flights', 'accommodation', 'visas'] as const).map((tab) => (
              <Button 
                key={tab} 
                variant={activeTab === tab ? 'default' : 'ghost'}
                onClick={() => setActiveTab(tab)}
                className="capitalize"
              >
                {tab === 'flights' && <Plane className="h-4 w-4 mr-2" />}
                {tab === 'accommodation' && <Hotel className="h-4 w-4 mr-2" />}
                {tab === 'visas' && <FileText className="h-4 w-4 mr-2" />}
                {tab === 'timeline' && <Calendar className="h-4 w-4 mr-2" />}
                {tab}
              </Button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              {/* Confirmed */}
              {confirmedTrips.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Confirmed
                  </h2>
                  <div className="grid gap-3">
                    {confirmedTrips.map((trip) => (
                      <Card key={trip.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedTrip(trip)}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${trip.color} flex items-center justify-center text-white`}>
                              <MapPin className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{trip.destination}</h3>
                                <span className="text-xs text-muted-foreground">{trip.country}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{trip.dates.start} → {trip.dates.end}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {trip.purpose.map((p) => (
                                  <Badge key={p} variant="outline" className="text-xs gap-1">
                                    {purposeIcons[p]}
                                    {p}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Planning */}
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  Planning
                </h2>
                <div className="grid gap-3">
                  {planningTrips.map((trip) => (
                    <Card key={trip.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedTrip(trip)}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${trip.color} flex items-center justify-center text-white`}>
                            <MapPin className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{trip.destination}</h3>
                              <span className="text-xs text-muted-foreground">{trip.country}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{trip.dates.start} → {trip.dates.end}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {trip.purpose.map((p) => (
                                <Badge key={p} variant="outline" className="text-xs gap-1">
                                  {purposeIcons[p]}
                                  {p}
                                </Badge>
                              ))}
                              {trip.familyMembers && (
                                <Badge variant="secondary" className="text-xs gap-1">
                                  <Users className="h-3 w-3" />
                                  {trip.familyMembers.length} family
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            {!trip.flights?.booked && <Badge variant="outline" className="text-xs">Flights</Badge>}
                            {!trip.accommodation?.booked && <Badge variant="outline" className="text-xs">Accom</Badge>}
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Ideas */}
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Ideas
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {ideaTrips.map((trip) => (
                    <Card key={trip.id} className="cursor-pointer hover:shadow-md transition-shadow opacity-75 hover:opacity-100" onClick={() => setSelectedTrip(trip)}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${trip.color} flex items-center justify-center text-white`}>
                            <MapPin className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">{trip.destination}</h3>
                            <p className="text-xs text-muted-foreground">{trip.dates.start}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'flights' && (
            <div className="space-y-6">
              {/* Flight Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PlaneTakeoff className="h-5 w-5" />
                    Your Flight Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Cabin Preference</h4>
                    <div className="flex gap-2">
                      {flightPreferences.cabinClass.map((c) => (
                        <Badge key={c} className="capitalize">{c} class</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Priorities</h4>
                    <div className="flex flex-wrap gap-2">
                      {flightPreferences.priorities.map((p) => (
                        <Badge key={p} variant="outline" className="capitalize">{p}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Group Travel</h4>
                    <Badge variant="secondary">Private jet options for groups</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Flight Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Flights To Book</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {planningTrips.filter(t => !t.flights?.booked).map((trip) => (
                    <div key={trip.id} className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${trip.color} flex items-center justify-center text-white`}>
                        <Plane className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{trip.destination}</h3>
                        <p className="text-xs text-muted-foreground">{trip.dates.start} • {trip.flights?.details || 'Route TBD'}</p>
                      </div>
                      <Button size="sm">Search Flights</Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'accommodation' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Hotel className="h-5 w-5" />
                    Accommodation Needs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {planningTrips.filter(t => !t.accommodation?.booked).map((trip) => (
                    <div key={trip.id} className="p-4 rounded-lg border bg-muted/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${trip.color} flex items-center justify-center text-white`}>
                            <Home className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium">{trip.destination}</h3>
                            <p className="text-xs text-muted-foreground">{trip.dates.start} → {trip.dates.end}</p>
                          </div>
                        </div>
                        <Button size="sm">Find</Button>
                      </div>
                      {trip.accommodation?.details && (
                        <p className="text-sm text-muted-foreground pl-13">{trip.accommodation.details}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Car Rentals */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Car Rentals Needed
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {planningTrips.filter(t => t.carRental?.needed && !t.carRental?.booked).map((trip) => (
                    <div key={trip.id} className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30">
                      <Car className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <h3 className="font-medium">{trip.destination}</h3>
                        <p className="text-xs text-muted-foreground">{trip.dates.start}</p>
                      </div>
                      <Button size="sm" variant="outline">Search</Button>
                    </div>
                  ))}
                  <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <p className="text-sm text-orange-600 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <strong>Note:</strong> Credit card needed for car rentals - need solution due to credit rating
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'visas' && (
            <div className="space-y-6">
              {/* Legal Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Legal & Visa Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {legalTasks.map((task) => (
                    <div key={task.id} className="p-4 rounded-lg border bg-muted/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {task.status === 'action' ? (
                            <AlertCircle className="h-5 w-5 text-orange-500" />
                          ) : (
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          )}
                          <h3 className="font-medium">{task.title}</h3>
                        </div>
                        <Badge variant={task.status === 'action' ? 'destructive' : 'secondary'}>
                          {task.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                      <Button size="sm" variant="outline" className="mt-2">Get Help</Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Visa Requirements by Destination */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Visa Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🇪🇺</span>
                        <span className="font-medium">EU / Schengen</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Digital Nomad Visa recommended for extended stays</p>
                      <Badge variant="outline" className="mt-2">Research needed</Badge>
                    </div>
                    <div className="p-3 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🇬🇧</span>
                        <span className="font-medium">United Kingdom</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Need to establish stay limits</p>
                      <Badge variant="outline" className="mt-2">Research needed</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Rizz AI + Trip Details */}
      <div className="w-96 border-l flex flex-col bg-muted/30">
        {selectedTrip ? (
          /* Trip Detail Panel */
          <div className="flex-1 flex flex-col">
            <div className={`p-4 bg-gradient-to-r ${selectedTrip.color} text-white`}>
              <Button variant="ghost" size="sm" className="text-white/80 mb-2" onClick={() => setSelectedTrip(null)}>
                ← Back
              </Button>
              <h2 className="text-xl font-bold">{selectedTrip.destination}</h2>
              <p className="text-white/80">{selectedTrip.country}</p>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {/* Dates */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Dates
                </h4>
                <p>{selectedTrip.dates.start} → {selectedTrip.dates.end}</p>
              </div>

              {/* Purpose */}
              <div>
                <h4 className="font-medium mb-2">Purpose</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTrip.purpose.map((p) => (
                    <Badge key={p} className="capitalize gap-1">
                      {purposeIcons[p]}
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Family */}
              {selectedTrip.familyMembers && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Family
                  </h4>
                  <ul className="text-sm space-y-1">
                    {selectedTrip.familyMembers.map((member, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Heart className="h-3 w-3 text-pink-500" />
                        {member}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Checklist */}
              <div>
                <h4 className="font-medium mb-2">Checklist</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {selectedTrip.flights?.booked ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    }
                    <span className="text-sm">Flights</span>
                    {selectedTrip.flights?.details && (
                      <span className="text-xs text-muted-foreground">({selectedTrip.flights.details})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedTrip.accommodation?.booked ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    }
                    <span className="text-sm">Accommodation</span>
                    {selectedTrip.accommodation?.details && (
                      <span className="text-xs text-muted-foreground">({selectedTrip.accommodation.details})</span>
                    )}
                  </div>
                  {selectedTrip.carRental?.needed && (
                    <div className="flex items-center gap-2">
                      {selectedTrip.carRental?.booked ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                      }
                      <span className="text-sm">Car Rental</span>
                    </div>
                  )}
                  {selectedTrip.visa?.needed && (
                    <div className="flex items-center gap-2">
                      {selectedTrip.visa?.obtained ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                      }
                      <span className="text-sm">Visa</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedTrip.notes && (
                <div>
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedTrip.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4">
                <Button size="sm" className="gap-1">
                  <Plane className="h-4 w-4" />
                  Find Flights
                </Button>
                <Button size="sm" variant="outline" className="gap-1">
                  <Hotel className="h-4 w-4" />
                  Find Accommodation
                </Button>
                {selectedTrip.carRental?.needed && (
                  <Button size="sm" variant="outline" className="gap-1">
                    <Car className="h-4 w-4" />
                    Find Car
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Rizz AI Chat */
          <>
            <div className="p-4 border-b bg-sky-500/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">R</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Rizz</p>
                  <p className="text-xs text-muted-foreground">Travel mode</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                    msg.role === 'user' ? 'bg-sky-500 text-white' : 'bg-muted'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask Rizz about travel..."
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