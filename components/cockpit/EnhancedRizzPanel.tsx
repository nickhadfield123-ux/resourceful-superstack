"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { useCall, useRizz, useLayout } from "@/lib/cockpit/context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Users,
  Video,
  Calendar,
  Brain,
  Database,
  Eye,
  MessageSquare,
  Settings,
  Sparkles,
  Clock,
  FileText,
  Play,
  Pause,
  RefreshCw,
  Plus,
  Share2,
  Mic,
  Image as ImageIcon,
  Video as VideoIcon,
  CheckCircle,
  Target,
  TrendingUp,
  BarChart3,
  Zap,
  Cpu,
  Dot,
  Circle,
  CircleDot,
  Activity,
  Signal,
  Wifi,
  WifiOff,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
  Bot,
  Network,
  DollarSign,
  Search,
  Lightbulb,
  User,
  Globe,
  Shield,
  AlertTriangle,
  Check,
  X,
  CircleCheck,
  CircleX,
  ArrowUp,
  ArrowDown,
  TrendingUp as TrendingUpIcon,
  TrendingDown,
  Gauge,
  Thermometer,
  Flame,
  Snowflake,
  Zap as ZapIcon,
  Eye as EyeIcon,
  EyeOff,
  Radio,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Dot as DotIcon,
  Circle as CircleIcon,
  CircleDot as CircleDotIcon,
  Activity as ActivityIcon,
  Signal as SignalIcon
} from "lucide-react"

// Enhanced mode definitions with new design
type RizzMode = 
  | 'dashboard' 
  | 'team-meeting'
  | 'sales-call'
  | 'network-session'
  | 'pre-call' 
  | 'call' 
  | 'summary'
  | 'project-oversight'
  | 'research-knowledge'
  | 'personal-os'

interface RizzModeConfig {
  title: string
  icon: React.ReactNode
  color: string
  description: string
  emoji: string
}

const MODE_CONFIGS: Record<RizzMode, RizzModeConfig> = {
  dashboard: {
    title: "Rizz",
    icon: <Sparkles className="h-5 w-5" />,
    color: "from-blue-500 to-cyan-500",
    description: "Network Intelligence Runtime",
    emoji: "🧠"
  },
  "team-meeting": {
    title: "Team Meeting Intelligence",
    icon: <Users className="h-5 w-5" />,
    color: "from-blue-500 to-cyan-500",
    description: "Workspace insights and team collaboration context",
    emoji: "🔵"
  },
  "sales-call": {
    title: "Sales Call Intelligence",
    icon: <Eye className="h-5 w-5" />,
    color: "from-green-500 to-emerald-500",
    description: "Client context and deal pipeline insights",
    emoji: "🟢"
  },
  "network-session": {
    title: "Network Session Intelligence",
    icon: <Database className="h-5 w-5" />,
    color: "from-purple-500 to-pink-500",
    description: "Member activity and collaboration opportunities",
    emoji: "🟣"
  },
  "pre-call": {
    title: "Pre-Call Preparation",
    icon: <Calendar className="h-5 w-5" />,
    color: "from-green-500 to-emerald-500",
    description: "Meeting preparation and coordination",
    emoji: "🔵"
  },
  call: {
    title: "Active Call Intelligence",
    icon: <Video className="h-5 w-5" />,
    color: "from-purple-500 to-pink-500",
    description: "Real-time call assistance and insights",
    emoji: "🟣"
  },
  summary: {
    title: "Post-Call Summary",
    icon: <FileText className="h-5 w-5" />,
    color: "from-orange-500 to-red-500",
    description: "Meeting insights and action items",
    emoji: "🟠"
  },
  "project-oversight": {
    title: "Project Intelligence",
    icon: <Target className="h-5 w-5" />,
    color: "from-yellow-500 to-orange-500",
    description: "Project monitoring and risk detection",
    emoji: "🟨"
  },
  "research-knowledge": {
    title: "Knowledge Intelligence",
    icon: <Lightbulb className="h-5 w-5" />,
    color: "from-indigo-500 to-purple-500",
    description: "Multi-document analysis and synthesis",
    emoji: "🟪"
  },
  "personal-os": {
    title: "Personal Intelligence Layer",
    icon: <User className="h-5 w-5" />,
    color: "from-red-500 to-pink-500",
    description: "Personal productivity and pattern analysis",
    emoji: "🟧"
  }
}

// Status indicators
type StatusState = 'observing' | 'preparing' | 'monitoring' | 'structuring' | 'active' | 'error'

interface StatusConfig {
  text: string
  color: string
  emoji: string
  pulse?: boolean
}

const STATUS_CONFIGS: Record<StatusState, StatusConfig> = {
  observing: {
    text: "Observing Workspace",
    color: "text-green-500",
    emoji: "🟢",
    pulse: false
  },
  preparing: {
    text: "Preparing Session",
    color: "text-blue-500", 
    emoji: "🔵",
    pulse: true
  },
  monitoring: {
    text: "Monitoring Live",
    color: "text-purple-500",
    emoji: "🟣",
    pulse: true
  },
  structuring: {
    text: "Structuring Knowledge",
    color: "text-orange-500",
    emoji: "🟠",
    pulse: true
  },
  active: {
    text: "Active Intelligence",
    color: "text-cyan-500",
    emoji: "⚡",
    pulse: true
  },
  error: {
    text: "Connection Lost",
    color: "text-red-500",
    emoji: "🔴",
    pulse: false
  }
}

// Collapsible section component with enhanced styling
interface CollapsibleSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  badge?: string
  status?: 'active' | 'warning' | 'success' | 'error'
  onToggle?: () => void
}

function CollapsibleSection({ 
  title, 
  icon, 
  children, 
  defaultOpen = true, 
  badge, 
  status,
  onToggle 
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500'
      case 'warning': return 'bg-yellow-500'
      case 'success': return 'bg-green-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-300'
    }
  }

  const handleToggle = () => {
    setIsOpen(!isOpen)
    onToggle?.()
  }
  
  return (
    <Card className="mb-3 border-none shadow-none bg-transparent">
      <CardHeader 
        className={`p-3 cursor-pointer hover:bg-muted/50 transition-all duration-200 ${
          isOpen ? 'bg-muted/30 rounded-lg' : ''
        }`}
        onClick={handleToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(status)} ${
              status === 'active' ? 'animate-pulse' : ''
            }`}></div>
            {icon}
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {badge && (
              <Badge variant="secondary" className="text-xs ml-2">{badge}</Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 transition-transform duration-200"
          >
            {isOpen ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : (
              <ChevronDownIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="pt-0 animate-in slide-in-from-top-2 duration-200">
          {children}
        </CardContent>
      )}
    </Card>
  )
}

// Enhanced header component
function RizzHeader({ mode, status }: { mode: RizzMode; status: StatusState }) {
  const modeConfig = MODE_CONFIGS[mode]
  const statusConfig = STATUS_CONFIGS[status]
  
  return (
    <div className="p-4 border-b border-gray-200 bg-white">
      {/* Main Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Rizz</h1>
          <p className="text-sm text-gray-500">Dynamic Meeting Intelligence</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${statusConfig.pulse ? 'animate-pulse' : ''} bg-gray-300`}></div>
          <span className="text-sm font-medium text-gray-600">
            {statusConfig.emoji}
          </span>
        </div>
      </div>

      {/* Context Selector */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2 border border-gray-200">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-gray-500" />
          <span className="text-xs text-gray-500">Context:</span>
          <select className="bg-transparent border-none text-gray-700 text-sm focus:outline-none">
            <option>Team Meeting</option>
            <option>Sales Call</option>
            <option>Network gatherings</option>
            <option>Project Oversight</option>
            <option>Research & Knowledge</option>
            <option>Personal OS</option>
          </select>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <WifiIcon className="h-3 w-3" />
          <span>Event-driven cognition layer active</span>
        </div>
      </div>
    </div>
  )
}

// Confidence meter component
function ConfidenceMeter({ confidence = 87 }: { confidence?: number }) {
  return (
    <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
        <span>Autonomous Confidence</span>
        <span>{confidence}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${confidence}%` }}
        ></div>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
        <span>Human Review Recommended: 2 items</span>
        <span className="flex gap-1">
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </span>
      </div>
    </div>
  )
}

// Active agents indicator
function ActiveAgents({ agents = ['Session', 'Knowledge', 'Recognition'] }: { agents?: string[] }) {
  return (
    <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
        <span>Agents Active</span>
        <span>{agents.length}/3</span>
      </div>
      <div className="flex gap-2 justify-center">
        {agents.map((agent, index) => (
          <div key={agent} className="flex flex-col items-center gap-1">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: `${index * 0.2}s` }}></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: `${(index * 0.2) + 0.1}s` }}></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: `${(index * 0.2) + 0.2}s` }}></div>
            </div>
            <span className="text-xs text-gray-600">{agent}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Team Meeting Mode Content with new design
function TeamMeetingModeContent() {
  const [sessionState, setSessionState] = React.useState<'pre' | 'live' | 'post'>('pre')
  
  return (
    <div className="space-y-4">
      {/* Status Badge with Animation */}
      <div className={`p-3 rounded-lg border-2 ${
        sessionState === 'live' 
          ? 'border-blue-500/50 bg-blue-500/5 animate-pulse' 
          : sessionState === 'post'
          ? 'border-orange-500/50 bg-orange-500/5'
          : 'border-blue-500/50 bg-blue-500/5'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {sessionState === 'live' && <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>}
            {sessionState === 'post' && <div className="w-3 h-3 bg-orange-500 rounded-full"></div>}
            {sessionState === 'pre' && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
            <span className="font-semibold text-lg text-gray-900">
              {sessionState === 'live' && '🔵 Live Monitoring Active'}
              {sessionState === 'post' && '🟠 Structuring Knowledge'}
              {sessionState === 'pre' && '🔵 Pre-Session Intelligence'}
            </span>
          </div>
          <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50" onClick={() => setSessionState(s => s === 'pre' ? 'live' : s === 'live' ? 'post' : 'pre')}>
            Switch State
          </Button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {sessionState === 'live' && '🧠 Real-time signal detection running'}
          {sessionState === 'post' && '🧠 Session complete. Processing outputs.'}
          {sessionState === 'pre' && '🧠 Context loaded for Sprint Planning'}
        </p>
      </div>

      {/* Signals Section */}
      <CollapsibleSection
        title={sessionState === 'live' ? "Live Signals" : sessionState === 'post' ? "Structured Outputs" : "Signals Identified"}
        icon={<SignalIcon className="h-4 w-4" />}
        status="active"
      >
        {sessionState === 'pre' && (
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CircleCheck className="h-4 w-4 text-green-500" />
              <span>3 unresolved action items from last session</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span>Budget discussion flagged as incomplete</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-red-500" />
              <span>API refactor dependency risk detected</span>
            </div>
          </div>
        )}
        
        {sessionState === 'live' && (
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CircleCheck className="h-4 w-4 text-green-500" />
              <span>Decision detected: Launch Phase 2 on March 15</span>
            </div>
            <div className="flex items-center gap-2">
              <CircleCheck className="h-4 w-4 text-blue-500" />
              <span>Action extracted: Nick to confirm vendor by Friday</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span>Unresolved question: Hosting capacity limits</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-purple-500" />
              <span>High-signal contribution: Sarah proposed phased rollout</span>
            </div>
          </div>
        )}

        {sessionState === 'post' && (
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CircleCheck className="h-4 w-4 text-green-500" />
              <span>4 decisions converted to system objects</span>
            </div>
            <div className="flex items-center gap-2">
              <CircleCheck className="h-4 w-4 text-blue-500" />
              <span>6 action items assigned</span>
            </div>
            <div className="flex items-center gap-2">
              <CircleCheck className="h-4 w-4 text-purple-500" />
              <span>3 member contribution scores updated</span>
            </div>
            <div className="flex items-center gap-2">
              <CircleCheck className="h-4 w-4 text-orange-500" />
              <span>2 new knowledge nodes created</span>
            </div>
          </div>
        )}
      </CollapsibleSection>

      {/* Suggested Actions */}
      <CollapsibleSection
        title="Suggested Actions"
        icon={<Target className="h-4 w-4" />}
        status="warning"
      >
        <div className="space-y-2 text-sm">
          <Button variant="outline" size="sm" className="w-full justify-start text-left">
            <ArrowUp className="h-3 w-3 mr-2 text-green-500" />
            Generate agenda draft
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start text-left">
            <Search className="h-3 w-3 mr-2 text-blue-500" />
            Surface prior commitments
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start text-left">
            <AlertTriangle className="h-3 w-3 mr-2 text-yellow-500" />
            Identify likely blockers
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start text-left">
            <FileText className="h-3 w-3 mr-2 text-purple-500" />
            Prepare decision summary for attendees
          </Button>
        </div>
      </CollapsibleSection>

      {/* Background Processes */}
      <CollapsibleSection
        title="Autonomous Background Processes"
        icon={<ActivityIcon className="h-4 w-4" />}
        status="active"
      >
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <WifiIcon className="h-3 w-3 text-blue-500" />
            <span>Monitoring participant availability</span>
          </div>
          <div className="flex items-center gap-2">
            <Search className="h-3 w-3 text-purple-500" />
            <span>Scanning related documents for contradictions</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUpIcon className="h-3 w-3 text-green-500" />
            <span>Updating commitment follow-through rates</span>
          </div>
        </div>
      </CollapsibleSection>

      {/* System Impact */}
      {sessionState === 'post' && (
        <CollapsibleSection
          title="System Impact"
          icon={<Gauge className="h-4 w-4" />}
          status="success"
        >
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CircleCheck className="h-4 w-4 text-green-500" />
              <span>Knowledge graph updated</span>
            </div>
            <div className="flex items-center gap-2">
              <CircleCheck className="h-4 w-4 text-blue-500" />
              <span>Sprint dashboard refreshed</span>
            </div>
            <div className="flex items-center gap-2">
              <CircleCheck className="h-4 w-4 text-purple-500" />
              <span>Follow-up email drafted</span>
            </div>
            <div className="flex items-center gap-2">
              <CircleCheck className="h-4 w-4 text-orange-500" />
              <span>Commitment tracking adjusted</span>
            </div>
          </div>
        </CollapsibleSection>
      )}
    </div>
  )
}

// Sales Call Mode Content
function SalesCallModeContent() {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg border-2 border-green-500/20 bg-green-500/5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-semibold text-lg text-gray-900">🟢 Pre-Call Intelligence</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">🧠 Preparing for call with Acme Corp</p>
      </div>

      <CollapsibleSection
        title="Context Signals"
        icon={<EyeIcon className="h-4 w-4" />}
        status="active"
      >
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span>2 previous objections: pricing + integration risk</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-green-500" />
            <span>Engagement spike after last proposal</span>
          </div>
          <div className="flex items-center gap-2">
            <EyeOff className="h-4 w-4 text-yellow-500" />
            <span>Decision-maker not yet confirmed</span>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Strategic Suggestions"
        icon={<Target className="h-4 w-4" />}
        status="warning"
      >
        <div className="space-y-2 text-sm">
          <Button variant="outline" size="sm" className="w-full justify-start text-left border-gray-300 text-gray-700 hover:bg-gray-50">
            <ArrowUp className="h-3 w-3 mr-2 text-green-500" />
            Lead with phased rollout narrative
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start text-left border-gray-300 text-gray-700 hover:bg-gray-50">
            <Search className="h-3 w-3 mr-2 text-blue-500" />
            Prepare case study for integration concern
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start text-left border-gray-300 text-gray-700 hover:bg-gray-50">
            <DollarSign className="h-3 w-3 mr-2 text-yellow-500" />
            Clarify procurement timeline
          </Button>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Monitoring"
        icon={<ActivityIcon className="h-4 w-4" />}
        status="active"
      >
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <WifiIcon className="h-3 w-3 text-green-500" />
            <span>Email response latency</span>
          </div>
          <div className="flex items-center gap-2">
            <EyeIcon className="h-3 w-3 text-blue-500" />
            <span>Proposal open rate</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="h-3 w-3 text-purple-500" />
            <span>Buying intent language signals</span>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  )
}

// Project Oversight Mode Content
function ProjectOversightModeContent() {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg border-2 border-yellow-500/20 bg-yellow-500/5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="font-semibold text-lg text-gray-900">🟨 Project Intelligence</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">🧠 Workspace scan complete</p>
      </div>

      <CollapsibleSection
        title="Detected Risks"
        icon={<AlertTriangle className="h-4 w-4" />}
        status="error"
      >
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-red-500" />
            <span>2 tasks overdue 5+ days</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span>Scope drift in onboarding module</span>
          </div>
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-yellow-500" />
            <span>Budget variance +8% vs forecast</span>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Suggested Actions"
        icon={<Target className="h-4 w-4" />}
        status="warning"
      >
        <div className="space-y-2 text-sm">
          <Button variant="outline" size="sm" className="w-full justify-start text-left border-gray-300 text-gray-700 hover:bg-gray-50">
            <ArrowUp className="h-3 w-3 mr-2 text-red-500" />
            Draft corrective plan
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start text-left border-gray-300 text-gray-700 hover:bg-gray-50">
            <Users className="h-3 w-3 mr-2 text-blue-500" />
            Notify stakeholders
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start text-left border-gray-300 text-gray-700 hover:bg-gray-50">
            <FileText className="h-3 w-3 mr-2 text-purple-500" />
            Generate sprint summary
          </Button>
        </div>
      </CollapsibleSection>
    </div>
  )
}

// Research & Knowledge Mode Content
function ResearchKnowledgeModeContent() {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg border-2 border-indigo-500/20 bg-indigo-500/5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
          <span className="font-semibold text-lg text-gray-900">🟪 Knowledge Intelligence</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">🧠 Multi-document synthesis active</p>
      </div>

      <CollapsibleSection
        title="Analysis Results"
        icon={<Lightbulb className="h-4 w-4" />}
        status="success"
      >
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <CircleCheck className="h-4 w-4 text-green-500" />
            <span>4 documents analyzed</span>
          </div>
          <div className="flex items-center gap-2">
            <CircleCheck className="h-4 w-4 text-blue-500" />
            <span>12 insight clusters extracted</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span>3 contradictions identified</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-purple-500" />
            <span>Executive brief generated</span>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  )
}

// Personal OS Mode Content
function PersonalOSModeContent() {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg border-2 border-red-500/20 bg-red-500/5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="font-semibold text-lg text-gray-900">🟧 Personal Intelligence Layer</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">🧠 Weekly pattern scan complete</p>
      </div>

      <CollapsibleSection
        title="Pattern Analysis"
        icon={<User className="h-4 w-4" />}
        status="warning"
      >
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-red-500" />
            <span>Energy drain detected Tuesday afternoons</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span>3 low-leverage meetings flagged</span>
          </div>
          <div className="flex items-center gap-2">
            <CircleX className="h-4 w-4 text-orange-500" />
            <span>2 relationship follow-ups overdue</span>
          </div>
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-green-500" />
            <span>Strategic goal alignment: 72%</span>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Suggested Adjustments"
        icon={<Target className="h-4 w-4" />}
        status="active"
      >
        <div className="space-y-2 text-sm">
          <Button variant="outline" size="sm" className="w-full justify-start text-left border-gray-300 text-gray-700 hover:bg-gray-50">
            <ArrowUp className="h-3 w-3 mr-2 text-green-500" />
            Batch deep work sessions
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start text-left border-gray-300 text-gray-700 hover:bg-gray-50">
            <X className="h-3 w-3 mr-2 text-red-500" />
            Decline recurring sync
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start text-left border-gray-300 text-gray-700 hover:bg-gray-50">
            <Users className="h-3 w-3 mr-2 text-blue-500" />
            Schedule investor follow-up
          </Button>
        </div>
      </CollapsibleSection>
    </div>
  )
}

// Conversational Interface
function ConversationalInterface() {
  const [input, setInput] = React.useState('')
  const [messages, setMessages] = React.useState<Array<{ role: 'user' | 'assistant', content: string }>>([
    {
      role: 'assistant',
      content: 'Welcome to Rizz Intelligence. How can I assist you today?'
    }
  ])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = input
    setInput('')

    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Based on current commitments and risk exposure, vendor confirmation and onboarding scope drift require immediate attention. Would you like me to draft corrective actions?" 
      }])
    }, 1000)
  }

  return (
    <div className="space-y-4">
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Ask Rizz</span>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What should I focus on this week?"
            className="flex-1 bg-white border-gray-300 text-gray-900 placeholder-gray-400"
          />
          <Button type="submit" size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
            Send
          </Button>
        </form>
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-900'
            }`}>
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Main Enhanced Rizz Panel component
export function EnhancedRizzPanel() {
  const pathname = usePathname()
  const { state: callState } = useCall()
  const { state: rizzState, dispatch: rizzDispatch } = useRizz()
  const { state: layoutState, dispatch: layoutDispatch } = useLayout()

  // Determine current mode based on route
  const getCurrentMode = (): RizzMode => {
    if (callState.isInCall) return 'call'
    if (pathname.includes('/cockpit/hub/pre-call/')) return 'pre-call'
    if (pathname.includes('/call/')) return 'call'
    if (pathname.includes('/cockpit/hub/team')) return 'team-meeting'
    if (pathname.includes('/cockpit/hub/sales')) return 'sales-call'
    if (pathname.includes('/cockpit/hub/network')) return 'network-session'
    if (pathname.includes('/cockpit/hub/project')) return 'project-oversight'
    if (pathname.includes('/cockpit/hub/research')) return 'research-knowledge'
    if (pathname.includes('/cockpit/hub/personal')) return 'personal-os'
    if (pathname.includes('/cockpit/hub')) return 'dashboard'
    return 'dashboard'
  }

  const currentMode = getCurrentMode()
  const modeConfig = MODE_CONFIGS[currentMode]

  // Determine status based on mode and state
  const getStatus = (): StatusState => {
    if (callState.isInCall) return 'monitoring'
    if (pathname.includes('/cockpit/hub/pre-call/')) return 'preparing'
    if (pathname.includes('/cockpit/hub/team')) return 'active'
    if (pathname.includes('/cockpit/hub/project')) return 'active'
    if (pathname.includes('/cockpit/hub/research')) return 'active'
    if (pathname.includes('/cockpit/hub/personal')) return 'active'
    return 'observing'
  }

  const currentStatus = getStatus()

  return (
    <div className="fixed right-0 top-0 h-screen w-[360px] bg-white border-l border-gray-200 shadow-lg shadow-black/10 z-50">
      {/* Enhanced Header */}
      <RizzHeader mode={currentMode} status={currentStatus} />

      {/* Content Area */}
      <ScrollArea className="h-[calc(100%-120px)] p-4">
        {/* Conversational Interface - Now Primary */}
        <div className="mb-6">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="p-0 mb-3">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Ask Rizz</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ConversationalInterface />
            </CardContent>
          </Card>
        </div>

        {/* Mode-specific Content */}
        {currentMode === 'dashboard' && <TeamMeetingModeContent />}
        {currentMode === 'team-meeting' && <TeamMeetingModeContent />}
        {currentMode === 'sales-call' && <SalesCallModeContent />}
        {currentMode === 'network-session' && <TeamMeetingModeContent />}
        {currentMode === 'pre-call' && <TeamMeetingModeContent />}
        {currentMode === 'call' && <TeamMeetingModeContent />}
        {currentMode === 'summary' && <TeamMeetingModeContent />}
        {currentMode === 'project-oversight' && <ProjectOversightModeContent />}
        {currentMode === 'research-knowledge' && <ResearchKnowledgeModeContent />}
        {currentMode === 'personal-os' && <PersonalOSModeContent />}
      </ScrollArea>

      {/* Footer Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs border-gray-300 text-gray-700 hover:bg-gray-50">
            <Settings className="h-3 w-3 mr-1" />
            Settings
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs border-gray-300 text-gray-700 hover:bg-gray-50">
            <Shield className="h-3 w-3 mr-1" />
            Privacy
          </Button>
        </div>
      </div>
    </div>
  )
}
