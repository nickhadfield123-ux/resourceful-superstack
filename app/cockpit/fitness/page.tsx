"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Dumbbell,
  Plus,
  Send,
  Calendar,
  TrendingUp,
  Target,
  Flame,
  Timer,
  Activity,
  Heart,
  MapPin,
  Users,
  Mountain,
  PersonStanding,
  Utensils,
  Truck,
  ShoppingBag,
  Sparkles,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Wind,
  Droplets,
  Leaf,
  Coffee,
  Crown
} from "lucide-react"

// Activity types
interface Workout {
  id: string
  name: string
  type: 'hiking' | 'running' | 'gym' | 'yoga' | 'circuits' | 'swimming' | 'cycling' | 'other'
  duration?: string
  distance?: string
  status: 'completed' | 'scheduled' | 'suggested'
  location?: string
  group?: boolean
  notes?: string
}

// Local fitness resource
interface FitnessResource {
  id: string
  name: string
  type: 'gym' | 'studio' | 'trainer' | 'class' | 'trail'
  location: string
  distance?: string
  rating?: number
  notes?: string
  contact?: string
  price?: string
}

// Wellness service
interface WellnessService {
  id: string
  type: 'massage' | 'physio' | 'breathwork' | 'meditation' | 'other'
  name: string
  location: string
  frequency: string
  lastVisit?: string
  nextDue?: string
  contact?: string
  notes?: string
}

// Food option
interface FoodOption {
  id: string
  name: string
  type: 'delivery' | 'restaurant' | 'cafe' | 'market'
  location: string
  healthyScore: number
  goodFor: string[]
  socialScore?: number
  notes?: string
}

// Current activities - Sacred Valley focused
const myWorkouts: Workout[] = [
  { id: '1', name: 'Inca Trail Hike', type: 'hiking', duration: '3 hrs', distance: '8 km', status: 'completed', location: 'Ollantaytambo', notes: 'Amazing views, need to do again' },
  { id: '2', name: 'Valley Run', type: 'running', duration: '45 min', distance: '6 km', status: 'completed', location: 'Urubamba' },
  { id: '3', name: 'Morning Run', type: 'running', duration: '30 min', status: 'scheduled', location: 'Sacred Valley' },
  { id: '4', name: 'Circuits Class', type: 'circuits', duration: '60 min', status: 'suggested', location: 'Local gym', group: true },
  { id: '5', name: 'Yoga Flow', type: 'yoga', duration: '75 min', status: 'suggested', location: 'Studio', group: true },
  { id: '6', name: 'Hill Sprints', type: 'running', duration: '20 min', status: 'suggested', location: 'Local hills' },
]

// Local resources by location
const localResources: Record<string, FitnessResource[]> = {
  'Sacred Valley': [
    { id: '1', name: 'Valley Fitness Gym', type: 'gym', location: 'Urubamba', distance: '5 min', notes: 'Basic equipment, good for circuits', price: 'Membership available' },
    { id: '2', name: 'Inca Trail Network', type: 'trail', location: 'Ollantaytambo', distance: '15 min', notes: 'World-class hiking, endless routes' },
    { id: '3', name: 'Yoga Sacred Valley', type: 'studio', location: 'Urubamba', distance: '10 min', notes: 'Morning classes, great community' },
    { id: '4', name: 'Mountain Running Routes', type: 'trail', location: 'Various', notes: 'Challenging elevation, stunning views' },
  ],
  'La Gomera': [
    { id: '1', name: 'Garajonay Trails', type: 'trail', location: 'National Park', notes: 'Ancient forest trails, magical hiking' },
    { id: '2', name: 'Coastal Path', type: 'trail', location: 'Valle Gran Rey', notes: 'Cliff walks, ocean views' },
  ],
  'Morzine': [
    { id: '1', name: 'Alpine Trails', type: 'trail', location: 'Portes du Soleil', notes: 'Summer hiking, ski fitness in winter' },
    { id: '2', name: 'Mountain Gym', type: 'gym', location: 'Morzine centre', notes: 'Good for strength training' },
  ],
}

// Wellness services
const wellnessServices: WellnessService[] = [
  { id: '1', type: 'massage', name: 'Sports Massage', location: 'Urubamba', frequency: 'Weekly', lastVisit: 'Last week', nextDue: 'This week' },
  { id: '2', type: 'physio', name: 'Physio Check', location: 'Cusco', frequency: 'Monthly', lastVisit: '2 weeks ago', nextDue: 'In 2 weeks' },
  { id: '3', type: 'breathwork', name: 'Wim Hof Breathing', location: 'Home', frequency: 'Daily', notes: 'Morning routine' },
  { id: '4', type: 'meditation', name: 'Morning Meditation', location: 'Home', frequency: 'Daily', notes: '10-20 mins with coffee' },
]

// Food options
const foodOptions: Record<string, FoodOption[]> = {
  'Sacred Valley': [
    { id: '1', name: 'Alma Restaurant', type: 'restaurant', location: 'Urubamba', healthyScore: 4, goodFor: ['Lunch', 'Dinner', 'Social'], socialScore: 4, notes: 'Great for meeting people' },
    { id: '2', name: 'Green Valley Delivery', type: 'delivery', location: 'Urubamba', healthyScore: 5, goodFor: ['Lunch', 'Dinner'], notes: 'Healthy meal prep delivery' },
    { id: '3', name: 'Organic Market', type: 'market', location: 'Pisac', healthyScore: 5, goodFor: ['Shopping'], notes: 'Sunday market - fresh produce' },
    { id: '4', name: 'Cafe Sacred', type: 'cafe', location: 'Ollantaytambo', healthyScore: 4, goodFor: ['Breakfast', 'Coffee', 'Working'], socialScore: 3 },
  ],
}

// Locations you're at
const locations = ['Sacred Valley', 'La Gomera', 'Morzine', 'Malvern', 'London']

const typeIcons: Record<string, React.ReactNode> = {
  hiking: <Mountain className="h-4 w-4" />,
  running: <Activity className="h-4 w-4" />,
  gym: <Dumbbell className="h-4 w-4" />,
  yoga: <PersonStanding className="h-4 w-4" />,
  circuits: <Zap className="h-4 w-4" />,
  swimming: <Droplets className="h-4 w-4" />,
  cycling: <Activity className="h-4 w-4" />,
  other: <Heart className="h-4 w-4" />,
}

const typeColors: Record<string, string> = {
  hiking: 'bg-green-500/20 text-green-600',
  running: 'bg-blue-500/20 text-blue-600',
  gym: 'bg-orange-500/20 text-orange-600',
  yoga: 'bg-purple-500/20 text-purple-600',
  circuits: 'bg-yellow-500/20 text-yellow-600',
  swimming: 'bg-cyan-500/20 text-cyan-600',
  cycling: 'bg-red-500/20 text-red-600',
}

export default function FitnessPage() {
  const [message, setMessage] = React.useState("")
  const [messages, setMessages] = React.useState([
    { role: "assistant", content: "Hey! Ready to amp up your fitness? I can help you find hiking trails, running routes, gyms, yoga classes, or wellness services. What are you looking for?" }
  ])
  const [activeTab, setActiveTab] = React.useState<'activity' | 'train' | 'wellness' | 'food'>('activity')
  const [selectedLocation, setSelectedLocation] = React.useState('Sacred Valley')

  const handleSend = () => {
    if (!message.trim()) return
    setMessages([...messages, { role: "user", content: message }])
    setMessage("")
  }

  // Stats
  const thisWeekStats = {
    workouts: 5,
    hikingKm: 24,
    runningKm: 18,
    activeMin: 320,
    goalProgress: 71
  }

  const completedWorkouts = myWorkouts.filter(w => w.status === 'completed')
  const scheduledWorkouts = myWorkouts.filter(w => w.status === 'scheduled')
  const suggestedWorkouts = myWorkouts.filter(w => w.status === 'suggested')

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-green-500/10 to-emerald-600/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Dumbbell className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Fitness & Wellness</h1>
                <p className="text-muted-foreground">Health, movement, and feeling great</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select 
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-3 py-2 rounded-lg border bg-background text-sm"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Log Activity
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">This Week</p>
                    <p className="text-2xl font-bold">{thisWeekStats.workouts}</p>
                    <p className="text-xs text-muted-foreground">workouts</p>
                  </div>
                  <Activity className="h-5 w-5 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Hiking</p>
                    <p className="text-2xl font-bold">{thisWeekStats.hikingKm}km</p>
                    <p className="text-xs text-muted-foreground">trails</p>
                  </div>
                  <Mountain className="h-5 w-5 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Running</p>
                    <p className="text-2xl font-bold">{thisWeekStats.runningKm}km</p>
                    <p className="text-xs text-muted-foreground">distance</p>
                  </div>
                  <Zap className="h-5 w-5 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold">{thisWeekStats.activeMin}</p>
                    <p className="text-xs text-muted-foreground">minutes</p>
                  </div>
                  <Timer className="h-5 w-5 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Goal</p>
                    <p className="text-2xl font-bold">{thisWeekStats.goalProgress}%</p>
                    <div className="w-full h-1.5 bg-muted rounded-full mt-1">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${thisWeekStats.goalProgress}%` }} />
                    </div>
                  </div>
                  <Target className="h-5 w-5 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b pb-2">
            {(['activity', 'train', 'wellness', 'food'] as const).map((tab) => (
              <Button 
                key={tab} 
                variant={activeTab === tab ? 'default' : 'ghost'}
                onClick={() => setActiveTab(tab)}
                className="capitalize"
              >
                {tab === 'activity' && <Activity className="h-4 w-4 mr-2" />}
                {tab === 'train' && <Dumbbell className="h-4 w-4 mr-2" />}
                {tab === 'wellness' && <Heart className="h-4 w-4 mr-2" />}
                {tab === 'food' && <Utensils className="h-4 w-4 mr-2" />}
                {tab}
              </Button>
            ))}
          </div>

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              {/* Completed */}
              {completedWorkouts.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Completed
                  </h2>
                  <div className="grid gap-3">
                    {completedWorkouts.map((workout) => (
                      <Card key={workout.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg ${typeColors[workout.type]} flex items-center justify-center`}>
                              {typeIcons[workout.type]}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{workout.name}</h3>
                              <p className="text-xs text-muted-foreground">
                                {workout.duration} {workout.distance && `• ${workout.distance}`} • {workout.location}
                              </p>
                            </div>
                            <Badge variant="default" className="bg-green-500">Done</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Scheduled */}
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Up Next
                </h2>
                <div className="grid gap-3">
                  {scheduledWorkouts.map((workout) => (
                    <Card key={workout.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg ${typeColors[workout.type]} flex items-center justify-center`}>
                            {typeIcons[workout.type]}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{workout.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {workout.duration} • {workout.location}
                            </p>
                          </div>
                          <Button size="sm">Start</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Suggested */}
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Suggested
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {suggestedWorkouts.map((workout) => (
                    <Card key={workout.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${typeColors[workout.type]} flex items-center justify-center`}>
                            {typeIcons[workout.type]}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-sm">{workout.name}</h3>
                            <p className="text-xs text-muted-foreground">{workout.duration} {workout.group && '• Group'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Train Tab */}
          {activeTab === 'train' && (
            <div className="space-y-6">
              {/* Local Resources */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Fitness in {selectedLocation}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(localResources[selectedLocation] || []).map((resource) => (
                    <div key={resource.id} className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-600">
                        {resource.type === 'gym' && <Dumbbell className="h-5 w-5" />}
                        {resource.type === 'studio' && <PersonStanding className="h-5 w-5" />}
                        {resource.type === 'trail' && <Mountain className="h-5 w-5" />}
                        {resource.type === 'class' && <Users className="h-5 w-5" />}
                        {resource.type === 'trainer' && <Crown className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{resource.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {resource.location} {resource.distance && `• ${resource.distance}`}
                        </p>
                        {resource.notes && <p className="text-xs text-muted-foreground mt-1">{resource.notes}</p>}
                      </div>
                      <Button size="sm" variant="outline">Details</Button>
                    </div>
                  ))}
                  {(!localResources[selectedLocation] || localResources[selectedLocation].length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <MapPin className="h-8 w-8 mx-auto mb-2" />
                      <p>No resources saved for {selectedLocation} yet</p>
                      <Button size="sm" variant="outline" className="mt-2">Find Local Fitness</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Group Classes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Group Classes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <Button variant="outline" className="h-auto py-3 flex-col gap-1">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm">Circuits</span>
                      <span className="text-xs text-muted-foreground">HIIT</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-3 flex-col gap-1">
                      <PersonStanding className="h-5 w-5 text-purple-500" />
                      <span className="text-sm">Yoga</span>
                      <span className="text-xs text-muted-foreground">Flow</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-3 flex-col gap-1">
                      <Wind className="h-5 w-5 text-blue-500" />
                      <span className="text-sm">Breathwork</span>
                      <span className="text-xs text-muted-foreground">Wim Hof</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Training */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Personal Training
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30">
                    <Crown className="h-5 w-5 text-amber-500" />
                    <div className="flex-1">
                      <h3 className="font-medium">Find a PT</h3>
                      <p className="text-xs text-muted-foreground">Get stronger with personalized training</p>
                    </div>
                    <Button size="sm">Search</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Wellness Tab */}
          {activeTab === 'wellness' && (
            <div className="space-y-6">
              {/* Wellness Services */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Recovery & Wellness
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {wellnessServices.map((service) => (
                    <div key={service.id} className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        service.type === 'massage' ? 'bg-pink-500/20 text-pink-600' :
                        service.type === 'physio' ? 'bg-blue-500/20 text-blue-600' :
                        service.type === 'breathwork' ? 'bg-cyan-500/20 text-cyan-600' :
                        'bg-purple-500/20 text-purple-600'
                      }`}>
                        {service.type === 'massage' && <Droplets className="h-5 w-5" />}
                        {service.type === 'physio' && <Activity className="h-5 w-5" />}
                        {service.type === 'breathwork' && <Wind className="h-5 w-5" />}
                        {service.type === 'meditation' && <Sparkles className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{service.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {service.location} • {service.frequency}
                        </p>
                      </div>
                      <div className="text-right">
                        {service.nextDue && (
                          <Badge variant={service.nextDue === 'This week' ? 'default' : 'secondary'}>
                            {service.nextDue}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Book Services */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Book Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-auto py-3 flex-col gap-1">
                      <Droplets className="h-5 w-5 text-pink-500" />
                      <span className="text-sm">Massage</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-3 flex-col gap-1">
                      <Activity className="h-5 w-5 text-blue-500" />
                      <span className="text-sm">Physio</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Food Tab */}
          {activeTab === 'food' && (
            <div className="space-y-6">
              {/* Food Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Leaf className="h-5 w-5" />
                    Healthy Food in {selectedLocation}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(foodOptions[selectedLocation] || []).map((option) => (
                    <div key={option.id} className="p-4 rounded-lg border bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {option.type === 'delivery' && <Truck className="h-4 w-4 text-orange-500" />}
                          {option.type === 'restaurant' && <Utensils className="h-4 w-4 text-blue-500" />}
                          {option.type === 'cafe' && <Coffee className="h-4 w-4 text-amber-500" />}
                          {option.type === 'market' && <ShoppingBag className="h-4 w-4 text-green-500" />}
                          <h3 className="font-medium">{option.name}</h3>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < option.healthyScore ? 'text-green-500' : 'text-muted'}>★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{option.location}</p>
                      <div className="flex flex-wrap gap-1">
                        {option.goodFor.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                        {option.socialScore && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <Users className="h-3 w-3" />
                            Social
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-16 flex-col gap-1">
                  <Truck className="h-5 w-5" />
                  <span className="text-sm">Find Delivery</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col gap-1">
                  <Users className="h-5 w-5" />
                  <span className="text-sm">Social Spots</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Rizz + Schedule */}
      <div className="w-80 border-l flex flex-col bg-muted/30">
        {/* Today's Schedule */}
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Today's Plan
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-background text-sm">
              <span className="text-muted-foreground text-xs w-12">6:30 AM</span>
              <Mountain className="h-4 w-4 text-green-500" />
              <span className="flex-1">Morning Hike</span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-background text-sm">
              <span className="text-muted-foreground text-xs w-12">5:00 PM</span>
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="flex-1">Circuits</span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-background text-sm">
              <span className="text-muted-foreground text-xs w-12">7:00 PM</span>
              <Wind className="h-4 w-4 text-cyan-500" />
              <span className="flex-1">Breathwork</span>
            </div>
          </div>
        </div>

        {/* Rizz Chat */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b bg-green-500/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">R</span>
              </div>
              <div>
                <p className="font-medium text-sm">Rizz</p>
                <p className="text-xs text-muted-foreground">Fitness mode</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
                  msg.role === 'user' ? 'bg-green-500 text-white' : 'bg-muted'
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
        </div>
      </div>
    </div>
  )
}