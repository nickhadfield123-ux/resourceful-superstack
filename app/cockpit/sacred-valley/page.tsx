"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Mountain,
  MapPin,
  Bed,
  Utensils,
  Dumbbell,
  Coffee,
  Loader2,
  AlertCircle,
  ChevronDown,
  Navigation,
  Edit2,
  Check,
  X,
  Clock,
  Save,
  Plus,
  Trash2,
  Building2
} from "lucide-react"
import { SACRED_VALLEY_AREAS, Area, SubArea } from "@/lib/locations"

// Venue type from API
interface Venue {
  id: string
  name: string
  type: 'venue' | 'accommodation' | 'restaurant' | 'coworking' | 'activity'
  description?: string
  latitude: number
  longitude: number
  address?: string
  area?: string
  hub?: string
  website?: string
  phone?: string
  email?: string
  image_url?: string
  price_range?: string
  rating?: number
  amenities?: string[]
  schedule?: Record<string, { open: string; close: string }>
  owner_name?: string
  owner_id?: string
  is_verified?: boolean
  created_at: string
  updated_at: string
}

// Venue type icons and colors
const venueTypeConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  accommodation: { icon: <Bed className="h-4 w-4" />, color: '#3b82f6', label: 'Accommodation' },
  restaurant: { icon: <Utensils className="h-4 w-4" />, color: '#f97316', label: 'Restaurant' },
  venue: { icon: <MapPin className="h-4 w-4" />, color: '#a855f7', label: 'Venue' },
  coworking: { icon: <Coffee className="h-4 w-4" />, color: '#22c55e', label: 'Coworking' },
  activity: { icon: <Dumbbell className="h-4 w-4" />, color: '#ec4899', label: 'Activity' },
}

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const DAY_LABELS: Record<string, string> = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' }

export default function SacredValleyPage() {
  const [venues, setVenues] = React.useState<Venue[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedVenue, setSelectedVenue] = React.useState<Venue | null>(null)
  const [mapLoaded, setMapLoaded] = React.useState(false)
  const [selectedArea, setSelectedArea] = React.useState<Area>(SACRED_VALLEY_AREAS[0])
  const [selectedSubArea, setSelectedSubArea] = React.useState<SubArea | null>(null)
  const [areaDropdownOpen, setAreaDropdownOpen] = React.useState(false)
  const [expandedArea, setExpandedArea] = React.useState<string | null>(null)
  const [editingLocation, setEditingLocation] = React.useState(false)
  const [savingLocation, setSavingLocation] = React.useState(false)
  const [coordInput, setCoordInput] = React.useState('')
  const [coordError, setCoordError] = React.useState('')
  const [showAddVenue, setShowAddVenue] = React.useState(false)
  const [newVenue, setNewVenue] = React.useState({
    name: '',
    type: 'venue' as Venue['type'],
    area: 'Pisac',
    latitude: -13.4226,
    longitude: -71.8600,
    description: ''
  })
  const [savingVenue, setSavingVenue] = React.useState(false)
  const [deletingVenue, setDeletingVenue] = React.useState(false)
  const mapContainer = React.useRef<HTMLDivElement>(null)
  const map = React.useRef<any>(null)
  const markers = React.useRef<any[]>([])
  const editableMarker = React.useRef<any>(null)

  React.useEffect(() => {
    loadVenues()
  }, [])

  // Initialize map when venues are loaded
  React.useEffect(() => {
    if (loading || venues.length === 0 || !mapContainer.current) return

    const initMap = async () => {
      try {
        const mapboxgl = (await import('mapbox-gl')).default
        
        const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        if (!mapboxToken) {
          console.error('Mapbox token not found')
          return
        }

        mapboxgl.accessToken = mapboxToken

        // Initialize map
        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/outdoors-v12',
          center: selectedArea.center,
          zoom: selectedArea.zoom
        })

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

        // Clear existing markers
        markers.current.forEach(marker => marker.remove())
        markers.current = []

        // Add markers for each venue
        venues.forEach(venue => {
          if (!map.current) return
          
          const config = venueTypeConfig[venue.type] || venueTypeConfig.venue
          
          const el = document.createElement('div')
          el.className = 'cursor-pointer'
          el.innerHTML = `
            <div style="
              background-color: ${config.color};
              width: 30px;
              height: 30px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 12px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              border: 2px solid white;
              ${!venue.is_verified ? 'opacity: 0.7;' : ''}
            ">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
          `

          const marker = new mapboxgl.Marker(el)
            .setLngLat([venue.longitude, venue.latitude])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 })
                .setHTML(`
                  <div style="padding: 8px; min-width: 150px;">
                    <h3 style="font-weight: 600; margin-bottom: 4px;">${venue.name}</h3>
                    <p style="font-size: 12px; color: #666; margin-bottom: 8px;">${config.label}${!venue.is_verified ? ' ⚠️ Unverified' : ''}</p>
                    ${venue.area ? `<p style="font-size: 11px; color: #888;">${venue.area}</p>` : ''}
                  </div>
                `)
            )
            .addTo(map.current)

          el.addEventListener('click', () => {
            setSelectedVenue(venue)
          })

          markers.current.push(marker)
        })

        // Fit bounds to show all markers
        if (markers.current.length > 0) {
          const bounds = new mapboxgl.LngLatBounds()
          markers.current.forEach(marker => {
            bounds.extend(marker.getLngLat())
          })
          map.current.fitBounds(bounds, { padding: 50 })
        }

        setMapLoaded(true)
      } catch (err) {
        console.error('Error initializing map:', err)
      }
    }

    initMap()

    return () => {
      markers.current.forEach(marker => marker.remove())
      editableMarker.current?.remove()
      map.current?.remove()
    }
  }, [venues, loading])

  const loadVenues = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/venues?hub=Sacred Valley')
      const data = await response.json()
      
      if (response.ok) {
        setVenues(data.venues || [])
      } else {
        setError(data.error || 'Failed to load venues')
      }
    } catch (err) {
      setError('Failed to load venues')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateVenueLocation = async (venueId: string, lat: number, lng: number) => {
    setSavingLocation(true)
    try {
      const response = await fetch('/api/venues', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: venueId, latitude: lat, longitude: lng, is_verified: true })
      })
      
      if (response.ok) {
        // Update local state
        setVenues(prev => prev.map(v => 
          v.id === venueId ? { ...v, latitude: lat, longitude: lng, is_verified: true } : v
        ))
        if (selectedVenue?.id === venueId) {
          setSelectedVenue(prev => prev ? { ...prev, latitude: lat, longitude: lng, is_verified: true } : null)
        }
      }
    } catch (err) {
      console.error('Error updating venue:', err)
    } finally {
      setSavingLocation(false)
    }
  }

  // Start editing location
  const startEditingLocation = async () => {
    if (!selectedVenue || !map.current) return
    
    setEditingLocation(true)
    
    // Import mapbox-gl
    const mapboxgl = (await import('mapbox-gl')).default
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    mapboxgl.accessToken = mapboxToken!
    
    // Remove any existing editable marker
    editableMarker.current?.remove()
    
    // Create draggable marker
    const el = document.createElement('div')
    el.innerHTML = `
      <div style="
        background-color: #ef4444;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 14px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.4);
        border: 3px solid white;
        cursor: grab;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    `
    
    editableMarker.current = new mapboxgl.Marker({ element: el, draggable: true })
      .setLngLat([selectedVenue.longitude, selectedVenue.latitude])
      .addTo(map.current)
    
    // Fly to the venue
    map.current.flyTo({ center: [selectedVenue.longitude, selectedVenue.latitude], zoom: 16, duration: 1000 })
    
    // Listen for drag end
    editableMarker.current.on('dragend', () => {
      const lngLat = editableMarker.current.getLngLat()
      // Update preview
      setSelectedVenue(prev => prev ? { ...prev, latitude: lngLat.lat, longitude: lngLat.lng } : null)
    })
  }

  const saveLocation = async () => {
    if (!selectedVenue) return
    
    await updateVenueLocation(selectedVenue.id, selectedVenue.latitude, selectedVenue.longitude)
    setEditingLocation(false)
    editableMarker.current?.remove()
    editableMarker.current = null
  }

  const cancelEditing = () => {
    setEditingLocation(false)
    editableMarker.current?.remove()
    editableMarker.current = null
    // Reset to original values
    const originalVenue = venues.find(v => v.id === selectedVenue?.id)
    if (originalVenue) {
      setSelectedVenue(originalVenue)
    }
  }

  const addNewVenue = async () => {
    if (!newVenue.name) return
    
    setSavingVenue(true)
    try {
      const response = await fetch('/api/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newVenue,
          hub: 'Sacred Valley',
          is_verified: false
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setVenues(prev => [...prev, data.venue])
        setShowAddVenue(false)
        setNewVenue({
          name: '',
          type: 'venue',
          area: 'Pisac',
          latitude: -13.4226,
          longitude: -71.8600,
          description: ''
        })
      }
    } catch (err) {
      console.error('Error adding venue:', err)
    } finally {
      setSavingVenue(false)
    }
  }

  const deleteVenue = async () => {
    if (!selectedVenue) return
    
    if (!confirm(`Delete "${selectedVenue.name}"? This cannot be undone.`)) return
    
    setDeletingVenue(true)
    try {
      const response = await fetch(`/api/venues?id=${selectedVenue.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setVenues(prev => prev.filter(v => v.id !== selectedVenue.id))
        setSelectedVenue(null)
      }
    } catch (err) {
      console.error('Error deleting venue:', err)
    } finally {
      setDeletingVenue(false)
    }
  }

  const updateVenueField = async (field: string, value: any) => {
    if (!selectedVenue) return
    
    try {
      const response = await fetch('/api/venues', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedVenue.id, [field]: value })
      })
      
      if (response.ok) {
        setVenues(prev => prev.map(v => 
          v.id === selectedVenue.id ? { ...v, [field]: value } : v
        ))
        setSelectedVenue(prev => prev ? { ...prev, [field]: value } : null)
      }
    } catch (err) {
      console.error('Error updating venue:', err)
    }
  }

  // Group venues by type
  const venuesByType = React.useMemo(() => {
    const grouped: Record<string, Venue[]> = {}
    venues.forEach(venue => {
      if (!grouped[venue.type]) grouped[venue.type] = []
      grouped[venue.type].push(venue)
    })
    return grouped
  }, [venues])

  // Group venues by area
  const venuesByArea = React.useMemo(() => {
    const grouped: Record<string, Venue[]> = {}
    venues.forEach(venue => {
      const area = venue.area || 'Unknown'
      if (!grouped[area]) grouped[area] = []
      grouped[area].push(venue)
    })
    return grouped
  }, [venues])

  // Get today's schedule
  const getTodayHours = (schedule?: Record<string, { open: string; close: string }>) => {
    if (!schedule) return null
    const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]
    return schedule[today]
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-amber-500/10 to-orange-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <Mountain className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Sacred Valley Hub</h1>
                <p className="text-muted-foreground">Venues, accommodation, and experiences</p>
              </div>
              <Badge variant="outline" className="ml-4 bg-amber-500/10 text-amber-600">
                {venues.length} Venues
              </Badge>
              <Button 
                size="sm" 
                onClick={() => setShowAddVenue(true)}
                className="ml-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Venue
              </Button>
            </div>

            {/* Area Filter Dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                className="min-w-[200px] justify-between"
                onClick={() => setAreaDropdownOpen(!areaDropdownOpen)}
              >
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4" />
                  <span>{selectedSubArea ? `${selectedArea.name} - ${selectedSubArea.name}` : selectedArea.name}</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${areaDropdownOpen ? 'rotate-180' : ''}`} />
              </Button>

              {areaDropdownOpen && (
                <div className="absolute top-full mt-1 right-0 w-72 bg-background border rounded-lg shadow-lg z-50 overflow-hidden max-h-[400px] overflow-y-auto">
                  {SACRED_VALLEY_AREAS.map((area) => (
                    <div key={area.id}>
                      <button
                        className={`w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center justify-between ${
                          selectedArea.id === area.id && !selectedSubArea ? 'bg-amber-500/10' : ''
                        }`}
                        onClick={() => {
                          setSelectedArea(area)
                          setSelectedSubArea(null)
                          setAreaDropdownOpen(false)
                          if (map.current) {
                            map.current.flyTo({ center: area.center, zoom: area.zoom, duration: 1500 })
                          }
                        }}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{area.name}</span>
                          {area.description && (
                            <span className="text-xs text-muted-foreground">{area.description}</span>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {venuesByArea[area.name]?.length || 0}
                        </Badge>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Venues</p>
                    <p className="text-2xl font-bold">{venues.length}</p>
                  </div>
                  <MapPin className="h-6 w-6 text-amber-500" />
                </div>
              </CardContent>
            </Card>
            {Object.entries(venueTypeConfig).slice(0, 3).map(([type, config]) => (
              <Card key={type}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{config.label}</p>
                      <p className="text-2xl font-bold">{venuesByType[type]?.length || 0}</p>
                    </div>
                    <div className={`p-2 rounded-lg text-white`} style={{ backgroundColor: config.color }}>
                      {config.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Map */}
          <Card className="h-[500px] relative overflow-hidden">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <p className="text-muted-foreground">{error}</p>
                <Button onClick={loadVenues}>Retry</Button>
              </div>
            ) : venues.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <MapPin className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">No venues found</p>
                <p className="text-sm text-muted-foreground">Run the seed script to add venues</p>
              </div>
            ) : (
              <div ref={mapContainer} className="absolute inset-0" />
            )}
          </Card>

          {/* Venue List by Area */}
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(venuesByArea).map(([area, areaVenues]) => (
              <Card key={area}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-amber-500" />
                    {area}
                    <Badge variant="secondary" className="ml-auto">
                      {areaVenues.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {areaVenues.slice(0, 6).map(venue => {
                    const config = venueTypeConfig[venue.type] || venueTypeConfig.venue
                    const todayHours = getTodayHours(venue.schedule)
                    
                    return (
                      <div 
                        key={venue.id}
                        className={`p-2 rounded-lg border bg-muted/30 hover:bg-muted/50 cursor-pointer text-sm ${selectedVenue?.id === venue.id ? 'ring-2 ring-amber-500' : ''}`}
                        onClick={() => setSelectedVenue(venue)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-1 rounded text-white" style={{ backgroundColor: config.color }}>
                              {config.icon}
                            </div>
                            <div>
                              <p className="font-medium">{venue.name}</p>
                              {todayHours && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {todayHours.open} - {todayHours.close}
                                </p>
                              )}
                            </div>
                          </div>
                          {!venue.is_verified && (
                            <Badge variant="outline" className="text-xs text-yellow-600">
                              Unverified
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {areaVenues.length > 6 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{areaVenues.length - 6} more
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Venue Detail */}
      {selectedVenue && (
        <div className="w-80 border-l bg-muted/30 flex flex-col">
          <div className="p-4 border-b bg-amber-500/5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{selectedVenue.name}</h3>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={deleteVenue}
                  disabled={deletingVenue}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  {deletingVenue ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setSelectedVenue(null)
                    setEditingLocation(false)
                  }}
                >
                  ×
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">
                {venueTypeConfig[selectedVenue.type]?.label || selectedVenue.type}
              </Badge>
              {selectedVenue.area && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600">
                  {selectedVenue.area}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {/* Type & Area Editor */}
            <div className="p-3 rounded-lg bg-background border space-y-3">
              <p className="text-xs font-medium text-muted-foreground">Category</p>
              <div className="grid grid-cols-2 gap-2">
                <select 
                  value={selectedVenue.type}
                  onChange={(e) => updateVenueField('type', e.target.value)}
                  className="text-xs p-2 rounded border bg-background"
                >
                  {Object.entries(venueTypeConfig).map(([type, config]) => (
                    <option key={type} value={type}>{config.label}</option>
                  ))}
                </select>
                <select 
                  value={selectedVenue.area || 'Pisac'}
                  onChange={(e) => updateVenueField('area', e.target.value)}
                  className="text-xs p-2 rounded border bg-background"
                >
                  <option value="Pisac">Pisac</option>
                  <option value="Calca">Calca</option>
                  <option value="Urubamba">Urubamba</option>
                  <option value="Ollantaytambo">Ollantaytambo</option>
                </select>
              </div>
            </div>
            {selectedVenue.description && (
              <div>
                <p className="text-sm text-muted-foreground">{selectedVenue.description}</p>
              </div>
            )}
            
            {/* Location Editor */}
            <div className="p-3 rounded-lg bg-background border space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Location</p>
                {!editingLocation ? (
                  <Button size="sm" variant="outline" onClick={() => {
                    setEditingLocation(true)
                    setCoordInput('') // Start with empty input
                    setCoordError('')
                  }}>
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={cancelEditing}>
                      <X className="h-3 w-3" />
                    </Button>
                    <Button size="sm" onClick={saveLocation} disabled={savingLocation}>
                      {savingLocation ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Current coordinates display */}
              <p className="text-xs font-mono">
                {selectedVenue.latitude.toFixed(6)}, {selectedVenue.longitude.toFixed(6)}
              </p>
              
              {/* Coordinate input fields when editing */}
              {editingLocation && (
                <div className="space-y-2 pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Paste Google Maps coords (lat, lng):</p>
                  <Input
                    placeholder="-13.4226, -71.8600"
                    value={coordInput}
                    onChange={(e) => {
                      setCoordInput(e.target.value)
                      setCoordError('')
                    }}
                    className="text-xs h-8"
                    type="text"
                  />
                  {coordError && (
                    <p className="text-xs text-red-500">{coordError}</p>
                  )}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => {
                        // Parse coordinates - handles formats like "-13.4226, -71.8600" or "-13.4226,-71.8600"
                        const cleaned = coordInput.trim()
                        const match = cleaned.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/)
                        
                        if (match) {
                          const lat = parseFloat(match[1])
                          const lng = parseFloat(match[2])
                          
                          // Validate ranges
                          if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                            setSelectedVenue(prev => prev ? { ...prev, latitude: lat, longitude: lng } : null)
                            setCoordError('')
                            // Update map marker if map exists
                            if (map.current) {
                              map.current.flyTo({ center: [lng, lat], zoom: 16, duration: 1000 })
                            }
                          } else {
                            setCoordError('Invalid coordinates: lat must be -90 to 90, lng must be -180 to 180')
                          }
                        } else {
                          setCoordError('Format: -13.4226, -71.8600')
                        }
                      }}
                    >
                      Apply
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={startEditingLocation}
                    >
                      Drag on Map
                    </Button>
                  </div>
                </div>
              )}
              
              {!selectedVenue.is_verified && (
                <Badge variant="outline" className="text-xs text-yellow-600">
                  ⚠️ Location needs verification
                </Badge>
              )}
            </div>

            {/* Schedule */}
            {selectedVenue.schedule && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Hours</p>
                <div className="space-y-1">
                  {DAYS.map(day => {
                    const hours = selectedVenue.schedule?.[day]
                    const isToday = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1] === day
                    
                    return (
                      <div 
                        key={day} 
                        className={`flex justify-between text-xs p-1.5 rounded ${isToday ? 'bg-amber-500/10' : ''}`}
                      >
                        <span className={isToday ? 'font-medium text-amber-600' : ''}>{DAY_LABELS[day]}</span>
                        <span className="text-muted-foreground">
                          {hours ? `${hours.open} - ${hours.close}` : 'Closed'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {/* Amenities */}
            {selectedVenue.amenities && selectedVenue.amenities.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Amenities</p>
                <div className="flex flex-wrap gap-1">
                  {selectedVenue.amenities.map((amenity) => (
                    <Badge key={amenity} variant="secondary" className="text-xs">{amenity}</Badge>
                  ))}
                </div>
              </div>
            )}

            {selectedVenue.address && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Address</p>
                <p className="text-sm">{selectedVenue.address}</p>
              </div>
            )}
            
            {selectedVenue.phone && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Phone</p>
                <p className="text-sm">{selectedVenue.phone}</p>
              </div>
            )}
            
            {selectedVenue.website && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Website</p>
                <a 
                  href={selectedVenue.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline"
                >
                  {selectedVenue.website}
                </a>
              </div>
            )}
          </div>

          <div className="p-4 border-t">
            <Button className="w-full" variant="outline">
              Contact to Book
            </Button>
          </div>
        </div>
      )}

      {/* Add Venue Modal */}
      {showAddVenue && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add New Venue</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAddVenue(false)}>×</Button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Name</label>
                <Input
                  value={newVenue.name}
                  onChange={(e) => setNewVenue(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Venue name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Type</label>
                  <select 
                    value={newVenue.type}
                    onChange={(e) => setNewVenue(prev => ({ ...prev, type: e.target.value as Venue['type'] }))}
                    className="w-full p-2 rounded border bg-background text-sm"
                  >
                    {Object.entries(venueTypeConfig).map(([type, config]) => (
                      <option key={type} value={type}>{config.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Area</label>
                  <select 
                    value={newVenue.area}
                    onChange={(e) => setNewVenue(prev => ({ ...prev, area: e.target.value }))}
                    className="w-full p-2 rounded border bg-background text-sm"
                  >
                    <option value="Pisac">Pisac</option>
                    <option value="Calca">Calca</option>
                    <option value="Urubamba">Urubamba</option>
                    <option value="Ollantaytambo">Ollantaytambo</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground">Coordinates (lat, lng)</label>
                <Input
                  value={`${newVenue.latitude}, ${newVenue.longitude}`}
                  onChange={(e) => {
                    const match = e.target.value.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/)
                    if (match) {
                      setNewVenue(prev => ({
                        ...prev,
                        latitude: parseFloat(match[1]),
                        longitude: parseFloat(match[2])
                      }))
                    }
                  }}
                  placeholder="-13.4226, -71.8600"
                />
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground">Description</label>
                <Input
                  value={newVenue.description}
                  onChange={(e) => setNewVenue(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description"
                />
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddVenue(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={addNewVenue} disabled={savingVenue || !newVenue.name}>
                {savingVenue ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Venue'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
