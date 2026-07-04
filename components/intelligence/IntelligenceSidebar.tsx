"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { 
  Eye, 
  Brain, 
  Database, 
  TestTube, 
  Settings,
  ChevronRight,
  ChevronLeft
} from "lucide-react"
import { FlowSelector } from "./FlowSelector"

interface IntelligenceSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const sections = [
  {
    id: 'dashboard',
    name: 'Intelligence Dashboard',
    icon: Eye,
    description: 'Overview of your Rizz intelligence system'
  },
  {
    id: 'prompts',
    name: 'Core Intelligence',
    icon: Brain,
    description: 'Manage Rizz\'s core prompts and personality'
  },
  {
    id: 'knowledge',
    name: 'Knowledge Base',
    icon: Database,
    description: 'Organize and manage knowledge entries'
  },
  {
    id: 'testing',
    name: 'Testing & Simulation',
    icon: TestTube,
    description: 'Test and simulate Rizz intelligence'
  },
  {
    id: 'settings',
    name: 'System Management',
    icon: Settings,
    description: 'Configure system settings and preferences'
  }
]

export function IntelligenceSidebar({
  activeSection,
  onSectionChange,
  isCollapsed,
  onToggleCollapse
}: IntelligenceSidebarProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">🤖</span>
            </div>
            <div>
              <h2 className="font-semibold">Rizz Intelligence</h2>
              <p className="text-xs text-muted-foreground">Composition System</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-2">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "default" : "ghost"}
                className={`w-full justify-start ${
                  isCollapsed ? "px-2" : "px-3"
                }`}
                onClick={() => onSectionChange(section.id)}
              >
                <Icon className={`h-4 w-4 ${isCollapsed ? "mr-0" : "mr-2"}`} />
                {!isCollapsed && (
                  <span className="text-sm">{section.name}</span>
                )}
              </Button>
            )
          })}
        </div>
      </nav>

      {/* Flow Selector */}
      <FlowSelector isCollapsed={isCollapsed} />

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