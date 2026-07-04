"use client"

import * as React from "react"
import { useRizzCodeContext, useGitStatus, useGitRepository, useGitProject } from "@/lib/git-integration/client/hooks"
import { useGitIntegrationStore } from "@/stores/gitIntegrationStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  GitBranch, 
  GitPullRequest, 
  Code, 
  Database, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Plus,
  Edit,
  Trash2,
  TrendingUp
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface RizzCodeDashboardProps {
  className?: string
}

export function RizzCodeDashboard({ className }: RizzCodeDashboardProps) {
  // Git data from API hooks
  const { rizzCodeContext: apiContext, loading: apiLoading, error: apiError, refresh: refreshApi } = useRizzCodeContext()
  
  // Next Phase planning from store (client-side state)
  const {
    nextPhaseItems,
    addNextPhaseItem,
    updateNextPhaseItem,
    deleteNextPhaseItem
  } = useGitIntegrationStore()

  const [isAddingPhase, setIsAddingPhase] = React.useState(false)
  const [newPhaseTitle, setNewPhaseTitle] = React.useState("")
  const [newPhaseDescription, setNewPhaseDescription] = React.useState("")
  const [newPhasePriority, setNewPhasePriority] = React.useState<"high" | "medium" | "low">("medium")

  // Use API data or fallback to store data
  const rizzCodeContext = apiContext
  const isLoading = apiLoading
  const error = apiError

  const refreshContext = refreshApi

  const handleAddPhase = () => {
    if (newPhaseTitle.trim()) {
      addNextPhaseItem({
        title: newPhaseTitle,
        description: newPhaseDescription,
        priority: newPhasePriority,
        status: "planned",
        tags: [],
        relatedFeatures: [],
        blockers: []
      })
      setNewPhaseTitle("")
      setNewPhaseDescription("")
      setIsAddingPhase(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500"
      case "medium": return "bg-yellow-500"
      case "low": return "bg-green-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600"
      case "in_progress": return "text-blue-600"
      case "planned": return "text-gray-600"
      default: return "text-gray-600"
    }
  }

  if (isLoading && !rizzCodeContext) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">RIZZ Code</h2>
            <p className="text-muted-foreground">Deep git integration and project context</p>
          </div>
          <Button variant="outline" disabled>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-300 rounded"></div>
                  <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-300 rounded w-4/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">RIZZ Code</h2>
            <p className="text-muted-foreground">Deep git integration and project context</p>
          </div>
          <Button variant="outline" onClick={refreshContext}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Failed to load git integration: {error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">RIZZ Code</h2>
          <p className="text-muted-foreground">Deep git integration and project context</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={refreshContext} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsAddingPhase(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Phase
          </Button>
        </div>
      </div>

      {/* Repository Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Repository Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code className="h-5 w-5" />
              <span>Repository</span>
            </CardTitle>
            <CardDescription>{rizzCodeContext?.repository.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">URL</span>
              <span className="text-sm font-mono">{rizzCodeContext?.repository.url}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Branch</span>
              <Badge variant="secondary">{rizzCodeContext?.currentBranch.name}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={rizzCodeContext?.status.workingTree === 'clean' ? "default" : "destructive"}>
                {rizzCodeContext?.status.workingTree}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Latest Commit */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GitBranch className="h-5 w-5" />
              <span>Latest Commit</span>
            </CardTitle>
            <CardDescription>{rizzCodeContext?.latestCommit.shortHash}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">{rizzCodeContext?.latestCommit.message}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>by {rizzCodeContext?.latestCommit.author.name}</span>
              <span>{formatDistanceToNow(rizzCodeContext?.latestCommit.date || new Date())} ago</span>
            </div>
          </CardContent>
        </Card>

        {/* Project Context */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Project Context</span>
            </CardTitle>
            <CardDescription>{rizzCodeContext?.project.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Version</span>
              <span className="text-sm font-mono">{rizzCodeContext?.project.version}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Framework</span>
              <Badge>{rizzCodeContext?.project.architecture.framework}</Badge>
            </div>
            <div className="flex flex-wrap gap-1">
              {rizzCodeContext?.project.stack.map((tech, index) => (
                <Badge key={index} variant="outline" className="text-xs">{tech}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Phase Planning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Next Phase Planning</span>
          </CardTitle>
          <CardDescription>Upcoming work and priorities</CardDescription>
        </CardHeader>
        <CardContent>
          {isAddingPhase ? (
            <div className="space-y-4 p-4 border rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={newPhaseTitle}
                  onChange={(e) => setNewPhaseTitle(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter phase title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newPhaseDescription}
                  onChange={(e) => setNewPhaseDescription(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={3}
                  placeholder="Enter phase description..."
                />
              </div>
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    value={newPhasePriority}
                    onChange={(e) => setNewPhasePriority(e.target.value as any)}
                    className="p-2 border rounded"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="flex space-x-2 mt-6">
                  <Button onClick={handleAddPhase}>Add Phase</Button>
                  <Button variant="outline" onClick={() => setIsAddingPhase(false)}>Cancel</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {nextPhaseItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No next phase items yet. Add your first phase to start planning!
                </div>
              ) : (
                nextPhaseItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(item.priority)}`}></div>
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(item.createdAt)} ago
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateNextPhaseItem(item.id, { 
                          status: item.status === 'planned' ? 'in_progress' : 
                                 item.status === 'in_progress' ? 'completed' : 'planned' 
                        })}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNextPhaseItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Git Status Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>Git Status</span>
          </CardTitle>
          <CardDescription>Current working tree status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{rizzCodeContext?.status.staged.length}</div>
              <div className="text-sm text-muted-foreground">Staged</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{rizzCodeContext?.status.modified.length}</div>
              <div className="text-sm text-muted-foreground">Modified</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{rizzCodeContext?.status.untracked.length}</div>
              <div className="text-sm text-muted-foreground">Untracked</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{rizzCodeContext?.status.deleted.length}</div>
              <div className="text-sm text-muted-foreground">Deleted</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}