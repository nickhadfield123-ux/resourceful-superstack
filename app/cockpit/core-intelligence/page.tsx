"use client"

import * as React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { 
  Zap, Eye, ChevronDown, ChevronUp, Layers, 
  Brain, Database, GitBranch, FolderOpen,
  Check, Circle
} from "lucide-react"
import { 
  SYSTEM_PROMPTS, 
  CONTEXT_LAYERS, 
  FLOW_TYPES,
  estimateTotalContext 
} from "@/lib/ai/prompts-config"

export default function CoreIntelligencePage() {
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>('rizz-standard')
  const [expandedLayer, setExpandedLayer] = useState<string | null>(null)

  const togglePrompt = (id: string) => {
    setExpandedPrompt(expandedPrompt === id ? null : id)
  }

  const toggleLayer = (id: string) => {
    setExpandedLayer(expandedLayer === id ? null : id)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">⚡ Core Intelligence</h1>
            <p className="text-muted-foreground">Rizz's prompts, context layers, and AI configuration</p>
          </div>
          <div className="flex space-x-2">
            <Badge variant="outline" className="text-sm">
              v1.04
            </Badge>
            <Badge className="bg-green-600">
              Active
            </Badge>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Base Prompts</p>
                  <p className="text-2xl font-bold">{Object.keys(SYSTEM_PROMPTS).length}</p>
                </div>
                <Brain className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Context Layers</p>
                  <p className="text-2xl font-bold">{Object.keys(CONTEXT_LAYERS).length}</p>
                </div>
                <Layers className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Always Included</p>
                  <p className="text-2xl font-bold">
                    {Object.values(CONTEXT_LAYERS).filter(l => l.alwaysIncluded).length}
                  </p>
                </div>
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Est. Tokens</p>
                  <p className="text-2xl font-bold">~{estimateTotalContext(false, false).toLocaleString()}</p>
                </div>
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Base System Prompts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Base System Prompts
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Core personality and behavior definitions for Rizz
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.values(SYSTEM_PROMPTS).map((prompt) => (
              <div 
                key={prompt.id}
                className="border rounded-lg overflow-hidden"
              >
                {/* Prompt Header */}
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                  onClick={() => togglePrompt(prompt.id)}
                >
                  <div className="flex items-center gap-3">
                    {prompt.isActive ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <h3 className="font-semibold">{prompt.name}</h3>
                      <p className="text-sm text-muted-foreground">{prompt.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {prompt.isDefault && (
                      <Badge variant="secondary">Default</Badge>
                    )}
                    <Badge variant="outline">{prompt.estimatedTokens.toLocaleString()} tokens</Badge>
                    {expandedPrompt === prompt.id ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>

                {/* Prompt Content */}
                {expandedPrompt === prompt.id && (
                  <div className="border-t p-4 bg-muted/30">
                    <Textarea
                      value={prompt.content}
                      readOnly
                      className="min-h-[300px] font-mono text-sm"
                    />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Context Layers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Context Layers
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Dynamic context injected into Rizz's system prompt
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.values(CONTEXT_LAYERS).map((layer) => (
              <div 
                key={layer.id}
                className="border rounded-lg overflow-hidden"
              >
                {/* Layer Header */}
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleLayer(layer.id)}
                >
                  <div className="flex items-center gap-3">
                    {layer.alwaysIncluded ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-yellow-500" />
                    )}
                    <div>
                      <h3 className="font-semibold">{layer.name}</h3>
                      <p className="text-sm text-muted-foreground">{layer.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {layer.alwaysIncluded ? (
                      <Badge className="bg-green-600">Always</Badge>
                    ) : (
                      <Badge variant="secondary">Conditional</Badge>
                    )}
                    <Badge variant="outline">{layer.estimatedTokens} tokens</Badge>
                    {expandedLayer === layer.id ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>

                {/* Layer Details */}
                {expandedLayer === layer.id && (
                  <div className="border-t p-4 bg-muted/30 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Trigger</p>
                        <p className="text-sm text-muted-foreground">{layer.trigger}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Source</p>
                        <p className="text-sm text-muted-foreground font-mono text-xs">
                          {layer.source}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={layer.isActive ? "default" : "secondary"}>
                        {layer.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Flow Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Flow Types
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Different AI configurations for various use cases
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(FLOW_TYPES).map((flow) => (
                <div key={flow.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{flow.name}</h3>
                    <Badge variant="outline">{flow.provider}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{flow.description}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-muted-foreground">Model: <code className="text-xs">{flow.model}</code></span>
                    <span className="text-muted-foreground">Max: {flow.maxTokens} tokens</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Context Building Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Context Building Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
                <div>
                  <p className="font-medium">Base System Prompt</p>
                  <p className="text-muted-foreground">Rizz Standard or Claude-Code (depending on mode)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
                <div>
                  <p className="font-medium">Git Context (Always)</p>
                  <p className="text-muted-foreground">Repository state, branch, commits, project info</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">3</div>
                <div>
                  <p className="font-medium">Strategic Knowledge (Always)</p>
                  <p className="text-muted-foreground">Docs with always_include: true from KB</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-yellow-600 text-white flex items-center justify-center font-bold">4</div>
                <div>
                  <p className="font-medium">KB Context (Conditional)</p>
                  <p className="text-muted-foreground">Semantic search results if user asks about KB</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-yellow-600 text-white flex items-center justify-center font-bold">5</div>
                <div>
                  <p className="font-medium">Colony Context (Conditional)</p>
                  <p className="text-muted-foreground">Reference repo summaries if Colony/DAO keywords detected</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}