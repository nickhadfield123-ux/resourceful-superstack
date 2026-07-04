import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

// Venue types derived from members table
export interface OldVenue {
  id: string
  name: string
  type: 'venue' | 'accommodation' | 'restaurant' | 'coworking' | 'activity'
  description?: string
  latitude: number
  longitude: number
  address?: string
  website?: string
  phone?: string
  email?: string
  image_url?: string
  price_range?: string
  rating?: number
  amenities?: string[]
  hub?: string
  owner_name?: string
  owner_id?: string
  created_at: string
  updated_at: string
}

// Map location strings to hub names
function extractHubFromLocation(location: string | null): string {
  if (!location) return 'Unknown'
  
  const locationLower = location.toLowerCase()
  
  if (locationLower.includes('sacred valley') || locationLower.includes('pisac') || locationLower.includes('urubamba') || locationLower.includes('calca') || locationLower.includes('ollanta')) {
    return 'Sacred Valley'
  }
  if (locationLower.includes('malvern') || locationLower.includes('worcs') || locationLower.includes('worcestershire')) {
    return 'Malvern'
  }
  if (locationLower.includes('london') || locationLower.includes('wandsworth') || locationLower.includes('clapham') || locationLower.includes('balham')) {
    return 'London'
  }
  if (locationLower.includes('morzine') || locationLower.includes('alps') || locationLower.includes('chamonix')) {
    return 'Morzine'
  }
  if (locationLower.includes('lembongan') || locationLower.includes('bali') || locationLower.includes('nusa')) {
    return 'Lembongan'
  }
  return 'Unknown'
}

// Approximate coordinates for Sacred Valley locations
function getCoordinatesForLocation(location: string | null): { lat: number; lng: number } {
  if (!location) return { lat: -13.3087, lng: -72.0428 } // Default Urubamba
  
  const locationLower = location.toLowerCase()
  
  if (locationLower.includes('pisac')) return { lat: -13.4226, lng: -71.8600 }
  if (locationLower.includes('urubamba')) return { lat: -13.3087, lng: -72.0428 }
  if (locationLower.includes('calca')) return { lat: -13.3328, lng: -71.9356 }
  if (locationLower.includes('ollanta')) return { lat: -13.2583, lng: -72.2642 }
  
  // Default Sacred Valley center
  return { lat: -13.3087, lng: -72.0428 }
}

// Map venue_ownership keys to venue types
function getVenueType(key: string): OldVenue['type'] {
  const keyLower = key.toLowerCase()
  if (keyLower.includes('restaurant') || keyLower.includes('food') || keyLower.includes('kitchen')) return 'restaurant'
  if (keyLower.includes('cowork') || keyLower.includes('office')) return 'coworking'
  if (keyLower.includes('wellness') || keyLower.includes('yoga') || keyLower.includes('spa')) return 'venue'
  if (keyLower.includes('accommodation') || keyLower.includes('hotel') || keyLower.includes('lodge')) return 'accommodation'
  return 'venue'
}

// Fetch venues from members table (venue_ownership field)
export async function fetchTestVenues(): Promise<OldVenue[]> {
  if (!supabase) {
    console.warn('Supabase not configured')
    return []
  }

  try {
    const { data: members, error } = await supabase
      .from('members')
      .select('id, name, location, venue_ownership, role_tags, specific_skills')
      .not('venue_ownership', 'is', null)

    if (error) {
      console.error('Error fetching members with venues:', error)
      return []
    }

    if (!members || members.length === 0) {
      return []
    }

    // Extract venues from venue_ownership JSON
    const venues: OldVenue[] = []
    
    members.forEach((member: any) => {
      if (member.venue_ownership && typeof member.venue_ownership === 'object') {
        Object.entries(member.venue_ownership).forEach(([key, venueName]) => {
          const coords = getCoordinatesForLocation(member.location)
          const hub = extractHubFromLocation(member.location)
          
          venues.push({
            id: `${member.id}-${key}`,
            name: String(venueName).replace(/_/g, ' '),
            type: getVenueType(key),
            description: `${member.name}'s ${key.replace(/_/g, ' ')}`,
            latitude: coords.lat + (Math.random() * 0.01 - 0.005), // Slight offset for visibility
            longitude: coords.lng + (Math.random() * 0.01 - 0.005),
            address: member.location,
            hub,
            owner_name: member.name,
            owner_id: member.id,
            amenities: member.role_tags || [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        })
      }
    })

    return venues
  } catch (err) {
    console.error('Error in fetchTestVenues:', err)
    return []
  }
}

// Fetch venues by type
export async function fetchVenuesByType(type: string): Promise<OldVenue[]> {
  const venues = await fetchTestVenues()
  return venues.filter(venue => venue.type === type)
}