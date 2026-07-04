"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Brain,
  Sparkles,
  Bot,
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  Plus,
  Save,
  Upload,
  FileText,
  Database,
  Users,
  Building,
  Heart,
  Mountain,
  Plane,
  Dumbbell,
  Zap,
  Shield,
  Globe,
  Moon,
  Sun
} from "lucide-react"
import { toast } from "@/toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Mode {
  id: string
  name: string
  description: string
  emoji: string
  color: string
  isActive: boolean
  context: string
  memory: string
  lastUsed: Date | null
}

interface ModeSelectorProps {
  isCollapsed?: boolean
}

export function ModeSelector({ isCollapsed = false }: ModeSelectorProps) {
  const [modes, setModes] = useState<Mode[]>([])
  const [isMemoryVisible, setIsMemoryVisible] = useState(false)
  const [showMemoryModal, setShowMemoryModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [importData, setImportData] = useState("")
  const [exportData, setExportData] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Load modes from localStorage
  useEffect(() => {
    const savedModes = localStorage.getItem("ai_modes")
    if (savedModes) {
      try {
        const parsed = JSON.parse(savedModes)
        // Convert lastUsed strings back to Date objects
        const modesWithDates = parsed.map((mode: any) => ({
          ...mode,
          lastUsed: mode.lastUsed ? new Date(mode.lastUsed) : null
        }))
        setModes(modesWithDates)
      } catch (error) {
        console.error("Error parsing saved modes:", error)
        initializeDefaultModes()
      }
    } else {
      initializeDefaultModes()
    }
  }, [])

  const initializeDefaultModes = () => {
    const defaultModes: Mode[] = [
      {
        id: "rizz",
        name: "Rizz",
        description: "Your charismatic co-founder with business acumen",
        emoji: "🔥",
        color: "from-red-500 to-pink-500",
        isActive: true,
        context: "You are Rizz, a charismatic AI co-founder with extensive business experience. You're witty, insightful, and always focused on building successful ventures. You have access to the user's strategic documents and business context.",
        memory: "Strategic business documents, product plans, market analysis, and user preferences.",
        lastUsed: new Date()
      },
      {
        id: "cline",
        name: "Cline",
        description: "Your technical co-founder and coding expert",
        emoji: "💻",
        color: "from-blue-500 to-cyan-500",
        isActive: false,
        context: "You are Cline, a technical co-founder and expert programmer. You specialize in software architecture, coding best practices, and technical problem-solving. You have access to the user's codebase and technical context.",
        memory: "Codebase structure, technical decisions, implementation details, and development patterns.",
        lastUsed: null
      },
      {
        id: "assistant",
        name: "Assistant",
        description: "Your general-purpose assistant",
        emoji: "🤖",
        color: "from-gray-500 to-gray-600",
        isActive: false,
        context: "You are a general-purpose AI assistant. You help with a wide variety of tasks and provide balanced, helpful responses.",
        memory: "General conversation history and user preferences.",
        lastUsed: null
      }
    ]
    setModes(defaultModes)
    localStorage.setItem("ai_modes", JSON.stringify(defaultModes))
  }

  const switchMode = (modeId: string) => {
    setModes(prev => {
      const newModes = prev.map(mode => ({
        ...mode,
        isActive: mode.id === modeId,
        lastUsed: mode.id === modeId ? new Date() : mode.lastUsed
      }))
      
      // Save to localStorage
      localStorage.setItem("ai_modes", JSON.stringify(newModes))
      
      toast.success(`Switched to ${newModes.find(m => m.id === modeId)?.name} mode`)
      return newModes
    })
  }

  const getCurrentMode = () => {
    if (modes.length === 0) {
      // Return a default mode if no modes are loaded yet
      return {
        id: "loading",
        name: "Loading...",
        description: "Initializing modes",
        emoji: "⏳",
        color: "from-gray-400 to-gray-500",
        isActive: true,
        context: "",
        memory: "",
        lastUsed: null
      }
    }
    return modes.find(m => m.isActive) || modes[0]
  }

  const exportModeData = () => {
    const data = {
      modes,
      exportDate: new Date().toISOString(),
      version: "1.0"
    }
    setExportData(JSON.stringify(data, null, 2))
    setShowExportModal(true)
  }

  const importModeData = async () => {
    if (!importData.trim()) {
      toast.error("Please paste mode data to import")
      return
    }

    try {
      const data = JSON.parse(importData)
      if (!data.modes || !Array.isArray(data.modes)) {
        throw new Error("Invalid mode data format")
      }

      setModes(data.modes)
      localStorage.setItem("ai_modes", JSON.stringify(data.modes))
      setImportData("")
      setShowImportModal(false)
      toast.success("Mode data imported successfully!")
    } catch (error) {
      toast.error("Failed to import mode data. Please check the format.")
    }
  }

  const resetModeMemory = (modeId: string) => {
    setModes(prev => prev.map(mode => 
      mode.id === modeId 
        ? { ...mode, memory: "", context: mode.context }
        : mode
    ))
    toast.success("Mode memory cleared")
  }

  const updateModeMemory = (modeId: string, newMemory: string) => {
    setModes(prev => prev.map(mode => 
      mode.id === modeId 
        ? { ...mode, memory: newMemory }
        : mode
    ))
    toast.success("Mode memory updated")
  }

  const addMode = () => {
    const newMode: Mode = {
      id: `mode_${Date.now()}`,
      name: "New Mode",
      description: "A new custom mode",
      emoji: "✨",
      color: "from-purple-500 to-pink-500",
      isActive: false,
      context: "Custom mode context",
      memory: "",
      lastUsed: null
    }
    
    setModes(prev => [...prev, newMode])
    toast.success("New mode created!")
  }

  if (isCollapsed) {
    const currentMode = getCurrentMode()
    return (
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${currentMode.color} shadow-sm`} />
        <span className="text-sm font-medium">{currentMode.emoji} {currentMode.name}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMemoryModal(true)}
          className="text-xs"
        >
          <Eye className="h-3 w-3 mr-1" />
          Memory
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5" />
            AI Mode Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {modes.map((mode) => (
              <Button
                key={mode.id}
                variant={mode.isActive ? "default" : "outline"}
                className={`h-auto p-4 text-left justify-start items-start gap-3 transition-all ${
                  mode.isActive ? `bg-gradient-to-r ${mode.color} text-white shadow-lg` : "hover:bg-muted/50"
                }`}
                onClick={() => switchMode(mode.id)}
              >
                <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${mode.color} flex items-center justify-center shadow-md`}>
                  <span className="text-xl">{mode.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{mode.name}</div>
                  <div className="text-xs opacity-80 mt-1 line-clamp-2">{mode.description}</div>
                  {mode.lastUsed && (
                    <div className="text-xs opacity-60 mt-1">
                      Last used: {mode.lastUsed.toLocaleDateString()}
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={addMode}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Mode
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportModeData}
              className="flex items-center gap-1"
            >
              <Upload className="h-4 w-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              Import
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mode Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" />
            Current Mode Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(() => {
            const currentMode = getCurrentMode()
            return (
              <>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${currentMode.color} flex items-center justify-center shadow-lg`}>
                    <span className="text-2xl">{currentMode.emoji}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg">{currentMode.name}</div>
                    <div className="text-sm text-muted-foreground">{currentMode.description}</div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Mode Context</Label>
                    <div className="p-3 bg-muted rounded-lg text-sm">
                      {currentMode.context}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Mode Memory</Label>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsMemoryVisible(!isMemoryVisible)}
                          className="text-xs"
                        >
                          {isMemoryVisible ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                          {isMemoryVisible ? "Hide" : "Show"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resetModeMemory(currentMode.id)}
                          className="text-xs"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Clear
                        </Button>
                      </div>
                    </div>
                    {isMemoryVisible && (
                      <div className="p-3 bg-muted rounded-lg text-sm max-h-32 overflow-y-auto">
                        {currentMode.memory || "No memory stored for this mode."}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )
          })()}
        </CardContent>
      </Card>

      {/* Memory Management Modal */}
      <AlertDialog open={showMemoryModal} onOpenChange={setShowMemoryModal}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Mode Memory Management
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Manage the memory for {(() => {
                const currentMode = getCurrentMode()
                return currentMode.name
              })()} mode. This memory is sent to the AI to provide context.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            {(() => {
              const currentMode = getCurrentMode()
              return (
                <>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${currentMode.color}`} />
                    <span className="font-semibold">{currentMode.emoji} {currentMode.name}</span>
                  </div>
                  <Textarea
                    value={currentMode.memory}
                    onChange={(e) => updateModeMemory(currentMode.id, e.target.value)}
                    placeholder="Enter memory content for this mode..."
                    className="min-h-[200px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => updateModeMemory(currentMode.id, "")}
                    >
                      Clear Memory
                    </Button>
                    <Button
                      onClick={() => {
                        setShowMemoryModal(false)
                        toast.success("Memory updated!")
                      }}
                    >
                      Save Changes
                    </Button>
                  </div>
                </>
              )
            })()}
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Modal */}
      <AlertDialog open={showImportModal} onOpenChange={setShowImportModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import Mode Data</AlertDialogTitle>
            <AlertDialogDescription>
              Paste your exported mode data below to import it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            <Textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder='Paste your exported mode data here...'
              className="min-h-[200px] font-mono text-sm"
            />
            <div className="flex gap-2">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button onClick={importModeData} disabled={isLoading}>
                {isLoading ? "Importing..." : "Import Data"}
              </Button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Export Modal */}
      <AlertDialog open={showExportModal} onOpenChange={setShowExportModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Export Mode Data</AlertDialogTitle>
            <AlertDialogDescription>
              Copy the data below to backup your mode configuration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            <Textarea
              value={exportData}
              readOnly
              className="min-h-[200px] font-mono text-sm bg-muted"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(exportData)
                  toast.success("Data copied to clipboard!")
                }}
              >
                Copy to Clipboard
              </Button>
              <AlertDialogCancel>Close</AlertDialogCancel>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}