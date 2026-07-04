"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Brain, Database, Activity, Eye, Zap, GitBranch, 
  Layers, FolderOpen, Check, Circle, FileText,
  MessageSquare, Cpu
} from "lucide-react"
import Link from "next/link"
import { 
  SYSTEM_PROMPTS, 
  CONTEXT_LAYERS, 
  FLOW_TYPES,
  estimateTotalContext,
  getAllPrompts,
  getActiveContextLayers
} from "@/lib/ai/prompts-config"

export default function IntelligencePage() {
  const prompts = getAllPrompts()
  const activeLayers = getActiveContextLayers()
  const activePrompt = prompts.find(p => p.isActive)
  const alwaysIncludedLayers = Object.values(CONTEXT_LAYERS).filter(l => l.alwaysIncluded)
  const conditionalLayers = Object.values(CONTEXT_LAYERS).filter(l => !l.alwaysIncluded)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">🧠 Intelligence Dashboard</h1>
            <p className="text-muted-foreground">System overview and health monitoring</p>
          </div>
          <div className="flex space-x-2">
            <Link href="/cockpit/core-intelligence">
              <Button className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Core Intelligence
              </Button>
            </Link>
            <Link href="/cockpit/knowledge">
              <Button variant="outline" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Manage KB
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-base">
                <Brain className="h-4 w-4" />
                <span>Active Prompt</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold">{activePrompt?.name || 'None'}</p>
                <p className="text-sm text-muted-foreground">
                  {activePrompt?.description}
                </p>
                <Badge variant="outline" className="mt-2">
                  {activePrompt?.estimatedTokens.toLocaleString()} tokens
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-base">
                <Layers className="h-4 w-4" />
                <span>Context Layers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold">{Object.keys(CONTEXT_LAYERS).length}</p>
                <p className="text-sm text-muted-foreground">
                  {alwaysIncludedLayers.length} always, {conditionalLayers.length} conditional
                </p>
                <div className="flex gap-1 mt-2">
                  {alwaysIncludedLayers.map(l => (
                    <Badge key={l.id} className="bg-green-600 text-xs">✓ {l.name}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-base">
                <Cpu className="h-4 w-4" />
                <span>Token Budget</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold">~{estimateTotalContext(false, false).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">
                  Base context per request
                </p>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (estimateTotalContext(false, false) / 128000) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {((estimateTotalContext(false, false) / 128000) * 100).toFixed(1)}% of 128K context
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-base">
                <Activity className="h-4 w-4" />
                <span>System Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-600">Healthy</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  All systems operational
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">Groq ✓</Badge>
                  <Badge variant="outline">Supabase ✓</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Context Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Context Sources</CardTitle>
              <p className="text-sm text-muted-foreground">
                Where Rizz gets its knowledge
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Git Context */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <GitBranch className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Git Context</p>
                      <p className="text-sm text-muted-foreground">Repo state, branch, commits</p>
                    </div>
                  </div>
                  <Badge className="bg-green-600">Always</Badge>
                </div>

                {/* Strategic Knowledge */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Strategic Knowledge</p>
                      <p className="text-sm text-muted-foreground">Colony strategy, SAFE plans</p>
                    </div>
                  </div>
                  <Badge className="bg-green-600">Always</Badge>
                </div>

                {/* KB Context */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Knowledge Base</p>
                      <p className="text-sm text-muted-foreground">Semantic search results</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Conditional</Badge>
                </div>

                {/* Colony Context */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FolderOpen className="h-5 w-5 text-cyan-600" />
                    <div>
                      <p className="font-medium">Colony Reference</p>
                      <p className="text-sm text-muted-foreground">DAO/governance patterns</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Conditional</Badge>
                </div>

                {/* Cline Tasks */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Cline Tasks</p>
                      <p className="text-sm text-muted-foreground">Task queue & results</p>
                    </div>
                  </div>
                  <Badge variant="secondary">On-demand</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Prompts */}
          <Card>
            <CardHeader>
              <CardTitle>System Prompts</CardTitle>
              <p className="text-sm text-muted-foreground">
                Available prompt modes for Rizz
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prompts.map((prompt) => (
                  <div 
                    key={prompt.id} 
                    className={`p-3 border rounded-lg ${prompt.isActive ? 'border-green-600 bg-green-50 dark:bg-green-900/20' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {prompt.isActive ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium">{prompt.name}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {prompt.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {prompt.isDefault && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                        <Badge variant="outline">{prompt.estimatedTokens} tok</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/cockpit/core-intelligence" className="block mt-4">
                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View Full Prompts
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Flow Types */}
        <Card>
          <CardHeader>
            <CardTitle>AI Flow Types</CardTitle>
            <p className="text-sm text-muted-foreground">
              Different configurations for different tasks
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(FLOW_TYPES).map((flow) => (
                <div key={flow.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{flow.name}</h3>
                    <Badge>{flow.provider}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{flow.description}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Model: <code className="text-xs bg-muted px-1 rounded">{flow.model}</code></span>
                    <span>Max: {flow.maxTokens} tokens</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/cockpit/core-intelligence">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-1">
                  <Brain className="h-5 w-5" />
                  <span className="text-xs">Edit Prompts</span>
                </Button>
              </Link>
              <Link href="/cockpit/knowledge">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-1">
                  <Database className="h-5 w-5" />
                  <span className="text-xs">Manage KB</span>
                </Button>
              </Link>
              <Link href="/cockpit/rizz-code">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-1">
                  <GitBranch className="h-5 w-5" />
                  <span className="text-xs">Git Status</span>
                </Button>
              </Link>
              <Link href="/cockpit/status">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-1">
                  <Activity className="h-5 w-5" />
                  <span className="text-xs">System Status</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}