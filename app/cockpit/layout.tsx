"use client"

import * as React from "react"
import { CockpitSidebar } from "@/components/cockpit/CockpitSidebar"
import { CockpitProvider } from "@/lib/cockpit/context"

function CockpitLayoutInner({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Left Sidebar (Navigation) */}
        <div className={`${
          isCollapsed ? "w-16" : "w-64"
        } bg-background border-r border-border transition-all duration-300`}>
          <CockpitSidebar
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CockpitLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <CockpitProvider>
      <CockpitLayoutInner>
        {children}
      </CockpitLayoutInner>
    </CockpitProvider>
  )
}