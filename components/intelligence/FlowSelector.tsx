"use client"

import * as React from "react"
import { useIntelligenceStore } from "@/stores/intelligenceStore"
import { Button } from "@/components/ui/button"
import { 
  Zap, 
  Cpu, 
  Cloud
} from "lucide-react"

interface ModelSelectorProps {
  isCollapsed?: boolean
}

export function FlowSelector({ isCollapsed = false }: ModelSelectorProps) {
  const { 
    modelPreference, 
    setModelPreference 
  } = useIntelligenceStore()

  const handleModelChange = (model: 'ollama' | 'groq' | null) => {
    setModelPreference(model)
  }

  const getModelDetails = (model: string) => {
    switch (model) {
      case 'ollama':
        return {
          name: 'Local (Ollama)',
          description: 'Fast, free, privacy-focused • llama3.2:3b • 2048 context',
          icon: Cpu,
          color: 'border-green-500/20 bg-green-500/10 text-green-600'
        }
      case 'groq':
        return {
          name: 'Cloud (Groq)',
          description: 'More powerful, handles complex tasks • llama3-70b • High performance',
          icon: Cloud,
          color: 'border-blue-500/20 bg-blue-500/10 text-blue-600'
        }
      default:
        return {
          name: 'Auto Routing',
          description: 'Smart task-based selection • Intelligent routing • Best of both',
          icon: Zap,
          color: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-600'
        }
    }
  }

  const currentModel = getModelDetails(modelPreference || 'auto')

  return (
    <div className="space-y-3">
      {/* Model Selection Row */}
      <div className="flex items-center justify-center space-x-2">
        <Button
          variant={modelPreference === null ? "default" : "outline"}
          onClick={() => handleModelChange(null)}
          className={`h-10 px-4 py-2 text-sm font-medium transition-all duration-200 ${
            modelPreference === null 
              ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
              : 'border-2 border-muted hover:bg-muted/50'
          }`}
        >
          <Zap className="h-4 w-4 mr-2" />
          Auto
        </Button>
        <Button
          variant={modelPreference === 'ollama' ? "default" : "outline"}
          onClick={() => handleModelChange('ollama')}
          className={`h-10 px-4 py-2 text-sm font-medium transition-all duration-200 ${
            modelPreference === 'ollama' 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'border-2 border-muted hover:bg-muted/50'
          }`}
        >
          <Cpu className="h-4 w-4 mr-2" />
          Local
        </Button>
        <Button
          variant={modelPreference === 'groq' ? "default" : "outline"}
          onClick={() => handleModelChange('groq')}
          className={`h-10 px-4 py-2 text-sm font-medium transition-all duration-200 ${
            modelPreference === 'groq' 
              ? 'bg-blue-500 text-white hover:bg-blue-600' 
              : 'border-2 border-muted hover:bg-muted/50'
          }`}
        >
          <Cloud className="h-4 w-4 mr-2" />
          Cloud
        </Button>
      </div>

      {/* Context Text */}
      <div className={`text-center text-sm p-2 rounded-md border-2 ${currentModel.color}`}>
        <span className="font-medium">{currentModel.name}</span>
        <span className="text-muted-foreground"> — {currentModel.description}</span>
      </div>
    </div>
  )
}