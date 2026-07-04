"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Bot, 
  Brain, 
  Database, 
  Eye, 
  Settings,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Zap,
  Activity,
  Code,
  Cpu,
  Cloud,
  Video,
  Calendar,
  LayoutGrid,
  Briefcase,
  Heart,
  Dumbbell,
  Plane,
  Users,
  Map,
  Mountain,
  Building2,
  Snowflake,
  Palmtree
} from "lucide-react"
import { useIntelligenceStore } from "@/stores/intelligenceStore"
import { contentItems } from "@/lib/db/supabase"

interface CockpitSidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
}

// Domain items (collapsible - context filter for entire system)
const domainItems = [
  {
    id: 'overview',
    name: 'Overview',
    icon: LayoutGrid,
    description: 'All domains combined',
    href: '/cockpit/overview'
  },
  {
    id: 'business',
    name: 'Business',
    icon: Briefcase,
    description: 'Work and projects',
    href: '/cockpit/business',
    subItems: [
      { id: 'business-overview', name: 'Overview', href: '/cockpit/business' },
      { id: 'bounties', name: 'Bounty Board', href: '/cockpit/business/bounties' },
      { id: 'matches', name: 'Network Matches', href: '/cockpit/business/matches' },
      { id: 'work', name: 'Active Work', href: '/cockpit/business/work' },
      { id: 'referrals', name: 'My Referrals', href: '/cockpit/business/referrals' }
    ]
  },
  {
    id: 'family',
    name: 'Family',
    icon: Heart,
    description: 'Family and relationships',
    href: '/cockpit/family'
  },
  {
    id: 'fitness',
    name: 'Fitness',
    icon: Dumbbell,
    description: 'Health and wellness',
    href: '/cockpit/fitness'
  },
  {
    id: 'travel',
    name: 'Travel',
    icon: Plane,
    description: 'Trips and adventures',
    href: '/cockpit/travel'
  },
  {
    id: 'network',
    name: 'Network',
    icon: Users,
    description: 'Connections and community',
    href: '/cockpit/network'
  }
]

// Top-level items (always visible)
const topLevelItems = [
  {
    id: 'hub',
    name: 'Hub',
    icon: Video,
    description: 'Always-on video space',
    href: '/cockpit/hub'
  },
  {
    id: 'hub-v2',
    name: 'Hub V2',
    icon: Video,
    description: 'New hub design (WIP)',
    href: '/cockpit/hub-v2'
  },
  {
    id: 'calendar',
    name: 'Calendar',
    icon: Calendar,
    description: 'Meeting scheduling',
    href: '/cockpit/calendar'
  },
  {
    id: 'chat',
    name: 'Rizz Chat',
    icon: MessageSquare,
    description: 'Main conversation interface',
    href: '/cockpit/chat'
  }
]

// Intelligence section items (collapsible)
const intelligenceItems = [
  {
    id: 'intelligence-dashboard',
    name: 'Intelligence Dashboard',
    icon: Brain,
    description: 'System overview and health',
    href: '/cockpit/intelligence'
  },
  {
    id: 'core-intelligence',
    name: 'Core Intelligence',
    icon: Zap,
    description: 'Manage Rizz prompts and personality',
    href: '/cockpit/core-intelligence'
  },
  {
    id: 'knowledge',
    name: 'Knowledge Base',
    icon: Database,
    description: 'Access knowledge entries',
    href: '/cockpit/knowledge'
  },
  {
    id: 'rizz-code',
    name: 'RIZZ Code',
    icon: Code,
    description: 'Deep git integration and project context',
    href: '/cockpit/rizz-code'
  },
  {
    id: 'status',
    name: 'System Status',
    icon: Activity,
    description: 'Monitor system health',
    href: '/cockpit/status'
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    description: 'Configure preferences',
    href: '/cockpit/settings'
  }
]

export function CockpitSidebar({
  isCollapsed,
  onToggleCollapse
}: CockpitSidebarProps) {
  const { prompts, knowledgeEntries, systemHealth, modelPreference } = useIntelligenceStore()
  const [dbEntryCount, setDbEntryCount] = React.useState(0)
  const [dbLoading, setDbLoading] = React.useState(false)
  const [domainsExpanded, setDomainsExpanded] = React.useState(true)
  const [hubsExpanded, setHubsExpanded] = React.useState(true) // Default expanded - shows Sacred Valley
  const [intelligenceExpanded, setIntelligenceExpanded] = React.useState(false)
  const [activeDomain, setActiveDomain] = React.useState('overview')
  const [businessExpanded, setBusinessExpanded] = React.useState(false)

  // Load database entry count
  React.useEffect(() => {
    loadDbEntryCount()
  }, [])

  const loadDbEntryCount = async () => {
    setDbLoading(true)
    try {
      // Check if Supabase is properly configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase not configured - skipping database operations')
        setDbEntryCount(0)
        return
      }

      // For now, we'll use a mock user_id since we don't have auth set up
      const mockUserId = 'mock-user-id'
      const data = await contentItems.findByUserId(mockUserId)
      setDbEntryCount(data ? data.length : 0)
    } catch (error) {
      console.error('Error loading database entry count:', error)
      setDbEntryCount(0)
    } finally {
      setDbLoading(false)
    }
  }

  const getModelStatus = () => {
    if (!modelPreference) {
      return { label: 'Auto Routing', icon: Zap, color: 'bg-yellow-500/20 text-yellow-600' }
    }
    switch (modelPreference) {
      case 'ollama':
        return { label: 'Local (Ollama)', icon: Cpu, color: 'bg-green-500/20 text-green-600' }
      case 'groq':
        return { label: 'Cloud (Groq)', icon: Cloud, color: 'bg-blue-500/20 text-blue-600' }
      default:
        return { label: 'Auto Routing', icon: Zap, color: 'bg-yellow-500/20 text-yellow-600' }
    }
  }

  const modelStatus = getModelStatus()

  return (
    <div className={`${
      isCollapsed ? 'w-16' : 'w-64'
    } border-r bg-card transition-all duration-300 h-full`}>
      {/* Header */}
      <div className="p-4 border-b">
        {!isCollapsed && (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">🤖</span>
              </div>
              <div>
                <h2 className="font-semibold">Rizz Cockpit</h2>
                <p className="text-xs text-muted-foreground">Control Center</p>
              </div>
            </div>
            
            {/* Model Status Indicator */}
            <div className="flex items-center space-x-2">
              <modelStatus.icon className="h-4 w-4" />
              <span className={`text-xs px-2 py-1 rounded ${modelStatus.color} font-medium`}>
                {modelStatus.label}
              </span>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex flex-col items-center space-y-2">
            <span className="text-2xl">🤖</span>
            <modelStatus.icon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-2">
          
          {/* Domains Section */}
          {!isCollapsed && (
            <div className="pb-2">
              <Button
                variant="ghost"
                className="w-full justify-start px-3 h-9 text-muted-foreground hover:text-foreground hover:bg-accent"
                onClick={() => setDomainsExpanded(!domainsExpanded)}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                <span className="text-sm">Domains</span>
                {domainsExpanded ? (
                  <ChevronUp className="h-4 w-4 ml-auto" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-auto" />
                )}
              </Button>
            </div>
          )}

          {/* Domain Items */}
          {(!isCollapsed && domainsExpanded) && domainItems.map((item) => {
            const Icon = item.icon
            const isActive = activeDomain === item.id
            const hasSubItems = item.subItems && item.subItems.length > 0
            
            // Business with sub-items
            if (item.id === 'business') {
              return (
                <div key={item.id}>
                  <button
                    className={`flex items-center w-full px-3 pl-9 py-2 rounded-md text-sm transition-colors cursor-pointer select-text ${
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`}
                    onClick={() => {
                      setActiveDomain(item.id)
                      setBusinessExpanded(!businessExpanded)
                    }}
                  >
                    <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="select-text">{item.name}</span>
                    {businessExpanded ? (
                      <ChevronUp className="h-4 w-4 ml-auto" />
                    ) : (
                      <ChevronDown className="h-4 w-4 ml-auto" />
                    )}
                  </button>
                  
                  {/* Business Sub-items */}
                  {businessExpanded && item.subItems && (
                    <div className="ml-4 border-l border-border pl-2 mt-1">
                      {item.subItems.map((subItem) => (
                        <Link 
                          key={subItem.id}
                          href={subItem.href}
                          className="flex items-center px-3 py-1.5 rounded-md text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            }
            
            return (
              <Link 
                key={item.id} 
                href={item.href}
                className={`flex items-center px-3 pl-9 py-2 rounded-md text-sm transition-colors cursor-pointer select-text ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
                onClick={() => setActiveDomain(item.id)}
              >
                <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="select-text">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                )}
              </Link>
            )
          })}

          {/* Collapsed mode - Domains */}
          {isCollapsed && (
            <div className="pb-2 border-b mb-2">
              <div className="px-2 py-1">
                <LayoutGrid className="h-4 w-4 text-muted-foreground mx-auto" />
              </div>
              {domainItems.map((item) => {
                const Icon = item.icon
                const isActive = activeDomain === item.id
                return (
                  <Link key={item.id} href={item.href}>
                    <Button 
                      variant={isActive ? "secondary" : "ghost"} 
                      className={`w-full justify-center px-2 ${isActive ? 'bg-primary/10' : ''}`}
                      onClick={() => setActiveDomain(item.id)}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
                    </Button>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Divider */}
          {!isCollapsed && <div className="h-px bg-border my-2" />}

          {/* Regional Hubs Section */}
          {!isCollapsed && (
            <div className="px-3 py-2">
              <Button
                variant="ghost"
                className="w-full justify-start px-3 h-9 text-muted-foreground hover:text-foreground hover:bg-accent"
                onClick={() => setHubsExpanded(!hubsExpanded)}
              >
                <Map className="h-4 w-4 mr-2" />
                <span className="text-sm">Hubs</span>
                {hubsExpanded ? (
                  <ChevronUp className="h-4 w-4 ml-auto" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-auto" />
                )}
              </Button>
            </div>
          )}

          {/* Hub Items */}
          {(!isCollapsed && hubsExpanded) && (
            <div className="px-3 space-y-1">
              <Link 
                href="/cockpit/sacred-valley"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-amber-500/10 transition-colors"
              >
                <Mountain className="h-4 w-4 text-amber-600" />
                <span className="text-sm">Sacred Valley</span>
              </Link>
              <Link 
                href="/cockpit/malvern"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-green-500/10 transition-colors"
              >
                <Mountain className="h-4 w-4 text-green-600" />
                <span className="text-sm">Malvern</span>
              </Link>
              <Link 
                href="/cockpit/london"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-500/10 transition-colors"
              >
                <Building2 className="h-4 w-4 text-blue-600" />
                <span className="text-sm">London</span>
              </Link>
              <Link 
                href="/cockpit/morzine"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-cyan-500/10 transition-colors"
              >
                <Snowflake className="h-4 w-4 text-cyan-600" />
                <span className="text-sm">Morzine</span>
              </Link>
              <Link 
                href="/cockpit/lembongan"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-teal-500/10 transition-colors"
              >
                <Palmtree className="h-4 w-4 text-teal-600" />
                <span className="text-sm">Lembongan</span>
              </Link>
            </div>
          )}

          {/* Collapsed mode - Hubs */}
          {isCollapsed && (
            <div className="pb-2">
              <Link href="/cockpit/sacred-valley">
                <Button variant="ghost" className="w-full justify-center px-2">
                  <Mountain className="h-4 w-4 text-amber-600" />
                </Button>
              </Link>
            </div>
          )}

          {/* Divider */}
          {!isCollapsed && <div className="h-px bg-border my-2" />}

          {/* Top Level Items */}
          {topLevelItems.map((item) => {
            const Icon = item.icon
            
            return (
              <Link key={item.id} href={item.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${
                    isCollapsed ? "px-2" : "px-3"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isCollapsed ? "mr-0" : "mr-2"}`} />
                  {!isCollapsed && (
                    <span className="text-sm">{item.name}</span>
                  )}
                </Button>
              </Link>
            )
          })}

          {/* Intelligence Section Divider */}
          {!isCollapsed && (
            <div className="pt-2">
              <Button
                variant="ghost"
                className="w-full justify-start px-3 h-9 text-muted-foreground hover:text-foreground hover:bg-accent"
                onClick={() => setIntelligenceExpanded(!intelligenceExpanded)}
              >
                <Brain className="h-4 w-4 mr-2" />
                <span className="text-sm">Intelligence</span>
                {intelligenceExpanded ? (
                  <ChevronUp className="h-4 w-4 ml-auto" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-auto" />
                )}
              </Button>
            </div>
          )}

          {/* Intelligence Items (collapsible) */}
          {(!isCollapsed && intelligenceExpanded) && intelligenceItems.map((item) => {
            const Icon = item.icon
            
            return (
              <Link key={item.id} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-3 pl-9"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <span className="text-sm">{item.name}</span>
                  <div className="ml-auto">
                    {item.id === 'intelligence-dashboard' && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                        {prompts.filter(p => p.isActive).length} active
                      </span>
                    )}
                    {item.id === 'knowledge' && (
                      <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded">
                        {knowledgeEntries.length} local • {dbLoading ? '...' : dbEntryCount} db
                      </span>
                    )}
                    {item.id === 'status' && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        systemHealth === 'healthy' ? 'bg-green-500/20 text-green-600' :
                        systemHealth === 'warning' ? 'bg-yellow-500/20 text-yellow-600' :
                        'bg-red-500/20 text-red-600'
                      }`}>
                        {systemHealth}
                      </span>
                    )}
                  </div>
                </Button>
              </Link>
            )
          })}

          {/* Collapsed mode - Intelligence */}
          {isCollapsed && (
            <div className="pt-2 border-t mt-2">
              <div className="px-2 py-1">
                <Brain className="h-4 w-4 text-muted-foreground mx-auto" />
              </div>
              {intelligenceItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.id} href={item.href}>
                    <Button variant="ghost" className="w-full justify-center px-2">
                      <Icon className="h-4 w-4" />
                    </Button>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between"
          onClick={onToggleCollapse}
        >
          {!isCollapsed ? (
            <>
              <span>Collapse</span>
              <ChevronLeft className="h-4 w-4" />
            </>
          ) : (
            <ChevronRight className="h-4 w-4 mx-auto" />
          )}
        </Button>
      </div>
    </div>
  )
}