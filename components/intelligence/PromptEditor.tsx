"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Save, 
  Edit, 
  Plus, 
  Trash2,
  Eye,
  EyeOff
} from "lucide-react"
import { useIntelligenceStore } from "@/stores/intelligenceStore"

interface PromptEditorProps {
  selectedPromptId?: string
}

export function PromptEditor({ selectedPromptId }: PromptEditorProps) {
  const { prompts, updatePrompt, addPrompt, deletePrompt } = useIntelligenceStore()
  
  const selectedPrompt = selectedPromptId 
    ? prompts.find(p => p.id === selectedPromptId)
    : null

  const [name, setName] = useState<string>(selectedPrompt?.name || '')
  const [content, setContent] = useState<string>(selectedPrompt?.content || '')
  const [isActive, setIsActive] = useState<boolean>(selectedPrompt?.isActive || true)
  const [isPreview, setIsPreview] = useState<boolean>(false)

  React.useEffect(() => {
    if (selectedPrompt) {
      setName(selectedPrompt.name)
      setContent(selectedPrompt.content)
      setIsActive(selectedPrompt.isActive)
    } else {
      setName('')
      setContent('')
      setIsActive(true)
    }
  }, [selectedPrompt])

  const handleSave = () => {
    if (selectedPrompt) {
      updatePrompt(selectedPrompt.id, { name, content, isActive })
    } else {
      addPrompt({ name, content, isActive })
    }
  }

  const handleDelete = () => {
    if (selectedPrompt) {
      deletePrompt(selectedPrompt.id)
      setName('')
      setContent('')
      setIsActive(true)
    }
  }

  const handleReset = () => {
    if (selectedPrompt) {
      setName(selectedPrompt.name)
      setContent(selectedPrompt.content)
      setIsActive(selectedPrompt.isActive)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            {selectedPrompt ? 'Edit Prompt Module' : 'Create New Prompt'}
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreview(!isPreview)}
            >
              {isPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {isPreview ? 'Edit' : 'Preview'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isPreview ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">{name}</h3>
              <Badge variant={isActive ? "default" : "secondary"}>
                {isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{content}</p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => setIsPreview(false)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="prompt-name">Prompt Name</Label>
              <Input
                id="prompt-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter prompt module name..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt-content">Prompt Content</Label>
              <Textarea
                id="prompt-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your prompt content..."
                className="min-h-[200px] font-mono text-sm"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="prompt-active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="prompt-active">Active</Label>
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedPrompt ? `Last modified: ${selectedPrompt.lastModified.toLocaleDateString()}` : 'New prompt'}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                {selectedPrompt ? 'Update' : 'Create'} Prompt
              </Button>
              {selectedPrompt && (
                <>
                  <Button variant="outline" onClick={handleReset}>
                    Reset
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDelete}
                    className="ml-auto"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}