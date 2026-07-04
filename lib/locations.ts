// Area configuration for Sacred Valley map

export interface SubArea {
  id: string
  name: string
  slug: string
  center: [number, number]
  zoom: number
  description?: string
}

export interface Area {
  id: string
  name: string
  slug: string
  center: [number, number]
  zoom: number
  description?: string
  bounds?: {
    ne: [number, number]
    sw: [number, number]
  }
  subAreas?: SubArea[]
}

export const SACRED_VALLEY_AREAS: Area[] = [
  {
    id: 'sacred-valley',
    name: 'Sacred Valley',
    slug: 'sacred-valley',
    center: [-72.11, -13.33],
    zoom: 11,
    description: 'Overview of the entire Sacred Valley',
    bounds: { ne: [-71.75, -13.20], sw: [-72.50, -13.55] }
  },
  {
    id: 'cusco',
    name: 'Cusco',
    slug: 'cusco',
    center: [-71.9675, -13.5319],
    zoom: 13,
    description: 'Historic capital of the Inca Empire',
    bounds: { ne: [-71.93, -13.50], sw: [-72.00, -13.56] }
  },
  {
    id: 'pisac',
    name: 'Pisac',
    slug: 'pisac',
    center: [-71.8519, -13.4258],
    zoom: 14,
    description: 'Famous for its Inca ruins and artisan market',
    bounds: { ne: [-71.80, -13.40], sw: [-71.90, -13.46] },
    subAreas: [
      { id: 'pisac-town', name: 'Pisac Town', slug: 'pisac-town', center: [-71.8519, -13.4258], zoom: 15, description: 'Main town center' },
      { id: 'taray', name: 'Taray', slug: 'taray', center: [-71.8467, -13.4417], zoom: 15, description: 'Traditional village near Pisac' },
      { id: 'rinconada', name: 'Rinconada', slug: 'rinconada', center: [-71.8533, -13.4333], zoom: 15, description: 'Scenic area' },
      { id: 'cuyo-chico', name: 'Cuyo Chico', slug: 'cuyo-chico', center: [-71.8600, -13.4200], zoom: 15, description: 'Rural community' },
      { id: 'maska', name: 'Maska', slug: 'maska', center: [-71.8433, -13.4300], zoom: 15, description: 'Traditional community' },
      { id: 'cuyo-grande', name: 'Cuyo Grande', slug: 'cuyo-grande', center: [-71.8667, -13.4167], zoom: 15, description: 'Larger community area' }
    ]
  },
  {
    id: 'calca',
    name: 'Calca',
    slug: 'calca',
    center: [-71.9422, -13.3333],
    zoom: 14,
    description: 'Gateway to the Sacred Valley',
    bounds: { ne: [-71.92, -13.32], sw: [-71.97, -13.35] }
  },
  {
    id: 'urubamba',
    name: 'Urubamba',
    slug: 'urubamba',
    center: [-72.1167, -13.3167],
    zoom: 14,
    description: 'Heart of the Sacred Valley',
    bounds: { ne: [-72.09, -13.30], sw: [-72.14, -13.34] }
  },
  {
    id: 'ollantaytambo',
    name: 'Ollantaytambo',
    slug: 'ollantaytambo',
    center: [-72.2639, -13.2581],
    zoom: 14,
    description: 'Ancient Inca town and fortress',
    bounds: { ne: [-72.25, -13.24], sw: [-72.28, -13.28] }
  },
  {
    id: 'chinchero',
    name: 'Chinchero',
    slug: 'chinchero',
    center: [-72.0500, -13.4167],
    zoom: 14,
    description: 'Traditional Andean village with Inca ruins',
    bounds: { ne: [-72.03, -13.40], sw: [-72.07, -13.44] }
  },
  {
    id: 'maras-moray',
    name: 'Maras & Moray',
    slug: 'maras-moray',
    center: [-72.2000, -13.3300],
    zoom: 14,
    description: 'Salt mines and circular Inca terraces',
    bounds: { ne: [-72.17, -13.31], sw: [-72.23, -13.35] }
  }
]

export function getAreaBySlug(slug: string): Area | undefined {
  return SACRED_VALLEY_AREAS.find(area => area.slug === slug)
}

export function getDefaultArea(): Area {
  return SACRED_VALLEY_AREAS[0]
}
