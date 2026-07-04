"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Palmtree,
  MapPin,
  Bed,
  Utensils,
  Dumbbell,
  Coffee,
  Loader2,
  AlertCircle
} from "lucide-react"
import { fetchTestVenues, OldVenue } from "@/lib/db/old-supabase"

const venueTypeConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  accommodation: { icon: <Bed className="h-4 w-4" />, color: '#3b82f6', label: 'Accommodation' },
  restaurant: { icon: <Utensils className="h-4 w-4" />, color: '#f97316', label: 'Restaurant' },
  venue: { icon: <MapPin className="h-4 w-4" />, color: '#a855f7', label: 'Venue' },
  coworking: { icon: <Coffee className="h-4 w-4" />, color: '#22c55e', label: 'Coworking' },
  activity: { icon: <Dumbbell className="h-4 w-4" />, color: '#ec4899', label: 'Activity' },
}

const LEMBONGAN_AREAS = [
  { id: 'lembongan', name: 'Nusa Lembongan', center: [115.4667, -8.6667] as [number, number], zoom: 14, description: 'Bali, Indonesia' },
]

export default function LembonganPage() {
  const [venues, setVenues] = React.useState<OldVenue[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedVenue, setSelectedVenue] = React.useState<OldVenue | null>(null)
  const mapContainer = React.useRef<HTMLDivElement>(null)
  const map = React.useRef<any>(null)
  const markers = React.useRef<any[]>([])

  React.useEffect(() => { loadVenues() }, [])

  React.useEffect(() => {
    if (loading || venues.length === 0 || !mapContainer.current) return
    const initMap = async () => {
      try {
        const mapboxgl = (await import('mapbox-gl')).default
        const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        if (!mapboxToken) return
        mapboxgl.accessToken = mapboxToken
        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/satellite-streets-v12',
          center: LEMBONGAN_AREAS[0].center,
          zoom: LEMBONGAN_AREAS[0].zoom
        })
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
        markers.current.forEach(marker => marker.remove())
        markers.current = []
        venues.forEach(venue => {
          if (!map.current) return
          const config = venueTypeConfig[venue.type] || venueTypeConfig.venue
          const el = document.createElement('div')
          el.className = 'cursor-pointer'
          el.innerHTML = `<div style="background-color: ${config.color}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); border: 2px solid white;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>`
          const marker = new mapboxgl.Marker(el).setLngLat([venue.longitude, venue.latitude]).setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<div style="padding: 8px;"><h3 style="font-weight: 600;">${venue.name}</h3><p style="font-size: 12px; color: #666;">${config.label}</p></div>`)).addTo(map.current)
          el.addEventListener('click', () => setSelectedVenue(venue))
          markers.current.push(marker)
        })
        if (markers.current.length > 0) {
          const bounds = new mapboxgl.LngLatBounds()
          markers.current.forEach(marker => bounds.extend(marker.getLngLat()))
          map.current.fitBounds(bounds, { padding: 50 })
        }
      } catch (err) { console.error('Error initializing map:', err) }
    }
    initMap()
    return () => { markers.current.forEach(marker => marker.remove()); map.current?.remove() }
  }, [venues, loading])

  const loadVenues = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchTestVenues()
      const lembonganVenues = data.filter(v => v.hub === 'Lembongan')
      setVenues(lembonganVenues)
    } catch (err) { setError('Failed to load venues'); console.error(err) }
    finally { setLoading(false) }
  }

  const venuesByType = React.useMemo(() => {
    const grouped: Record<string, OldVenue[]> = {}
    venues.forEach(venue => { if (!grouped[venue.type]) grouped[venue.type] = []; grouped[venue.type].push(venue) })
    return grouped
  }, [venues])

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 overflow-auto">
        <div className="p-6 border-b bg-gradient-to-r from-teal-500/10 to-emerald-500/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center">
              <Palmtree className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Lembongan Hub</h1>
              <p className="text-muted-foreground">Nusa Lembongan, Bali - Island paradise</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Venues</p><p className="text-2xl font-bold">{venues.length}</p></div><MapPin className="h-6 w-6 text-teal-500" /></div></CardContent></Card>
            {Object.entries(venueTypeConfig).slice(0, 3).map(([type, config]) => (
              <Card key={type}><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{config.label}</p><p className="text-2xl font-bold">{venuesByType[type]?.length || 0}</p></div><div className={`p-2 rounded-lg text-white`} style={{ backgroundColor: config.color }}>{config.icon}</div></div></CardContent></Card>
            ))}
          </div>
          <Card className="h-[500px] relative overflow-hidden">
            {loading ? (<div className="absolute inset-0 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : error ? (<div className="absolute inset-0 flex flex-col items-center justify-center gap-4"><AlertCircle className="h-8 w-8 text-red-500" /><p className="text-muted-foreground">{error}</p><Button onClick={loadVenues}>Retry</Button></div>
            ) : venues.length === 0 ? (<div className="absolute inset-0 flex flex-col items-center justify-center gap-4"><Palmtree className="h-8 w-8 text-muted-foreground" /><p className="text-muted-foreground">No venues found for Lembongan hub</p><p className="text-sm text-muted-foreground">Add venues with hub="Lembongan" to see them here</p></div>
            ) : (<div ref={mapContainer} className="absolute inset-0" />)}
          </Card>
        </div>
      </div>
      {selectedVenue && (
        <div className="w-80 border-l bg-muted/30 flex flex-col">
          <div className="p-4 border-b bg-teal-500/5"><div className="flex items-center justify-between"><h3 className="font-semibold">{selectedVenue.name}</h3><Button variant="ghost" size="sm" onClick={() => setSelectedVenue(null)}>×</Button></div><Badge variant="outline" className="mt-2">{venueTypeConfig[selectedVenue.type]?.label || selectedVenue.type}</Badge></div>
          <div className="flex-1 overflow-auto p-4 space-y-4">{selectedVenue.description && <p className="text-sm text-muted-foreground">{selectedVenue.description}</p>}{selectedVenue.address && <p className="text-sm">{selectedVenue.address}</p>}</div>
        </div>
      )}
    </div>
  )
}