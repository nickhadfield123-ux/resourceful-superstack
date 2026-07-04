"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Save, Edit, Trash2, Search } from "lucide-react"
import { useIntelligenceStore } from "@/stores/intelligenceStore"

interface KnowledgeEntry {
  id: string
  type: string
  title: string
  content: string
  tags: string[]
  domain: string[]
  confidence: number
}

export function EntryManager() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedEntry, setSelectedEntry] = React.useState<KnowledgeEntry | null>(null)
  const [isEditing, setIsEditing] = React.useState(false)

  // Form state
  const [formData, setFormData] = React.useState({
    type: 'insight',
    title: '',
    content: '',
    tags: '',
    domain: '',
    confidence: 0.8
  })

  // Get entries from intelligence store using proper hook
  const entries = useIntelligenceStore((state) => state.knowledgeEntries.map(entry => ({
    id: entry.id,
    type: entry.category,
    title: entry.title,
    content: entry.content,
    tags: entry.tags || [],
    domain: [entry.category], // Use category as domain
    confidence: entry.priority === 'high' ? 0.9 : entry.priority === 'medium' ? 0.7 : 0.5
  })))

  const addKnowledgeEntry = useIntelligenceStore((state) => state.addKnowledgeEntry)
  const updateKnowledgeEntry = useIntelligenceStore((state) => state.updateKnowledgeEntry)
  const deleteKnowledgeEntry = useIntelligenceStore((state) => state.deleteKnowledgeEntry)

  const saveEntries = (newEntries: KnowledgeEntry[]) => {
    // This is a fallback for direct entry management, but we should use store methods
    console.log("Entries updated:", newEntries)
  }

  const handleAddEntry = () => {
    setIsEditing(true)
    setSelectedEntry(null)
    setFormData({
      type: 'insight',
      title: '',
      content: '',
      tags: '',
      domain: '',
      confidence: 0.8
    })
  }

  const handleEditEntry = (entry: KnowledgeEntry) => {
    setIsEditing(true)
    setSelectedEntry(entry)
    setFormData({
      type: entry.type,
      title: entry.title,
      content: entry.content,
      tags: entry.tags.join(', '),
      domain: entry.domain.join(', '),
      confidence: entry.confidence
    })
  }

  const handleDeleteEntry = (entryId: string) => {
    deleteKnowledgeEntry(entryId)
  }

  const handleSaveEntry = () => {
    const priority = formData.confidence >= 0.8 ? 'high' : formData.confidence >= 0.6 ? 'medium' : 'low'
    
    const storeEntry = {
      id: selectedEntry?.id || Date.now().toString(),
      title: formData.title,
      content: formData.content,
      category: formData.type,
      priority: priority as 'high' | 'medium' | 'low',
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    if (selectedEntry) {
      // Update existing entry
      updateKnowledgeEntry(selectedEntry.id, {
        title: storeEntry.title,
        content: storeEntry.content,
        category: storeEntry.category,
        priority: storeEntry.priority,
        tags: storeEntry.tags
      })
    } else {
      // Add new entry
      addKnowledgeEntry(storeEntry)
    }

    setIsEditing(false)
    setSelectedEntry(null)
  }

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
    entry.domain.some(domain => domain.toLowerCase().includes(searchQuery.toLowerCase()))
  )


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Knowledge Entries</h2>
          <p className="text-muted-foreground">Manage your knowledge base entries</p>
        </div>
        <Button onClick={handleAddEntry} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Entry</span>
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="flex items-center space-x-4 p-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search entries by title, content, tags, or domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </CardContent>
      </Card>

      {/* Entry List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEntries.map((entry) => (
          <Card key={entry.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{entry.title}</CardTitle>
                  <p className="text-sm text-muted-foreground capitalize">{entry.type}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                    {Math.round(entry.confidence * 100)}% confidence
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {entry.content}
              </p>
              <div className="flex flex-wrap gap-2">
                {entry.tags.map(tag => (
                  <span key={tag} className="text-xs bg-muted px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {entry.domain.map(domain => (
                  <span key={domain} className="text-xs bg-muted px-2 py-1 rounded">
                    {domain}
                  </span>
                ))}
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditEntry(entry)}
                  className="flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteEntry(entry.id)}
                  className="flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit/Add Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectedEntry ? 'Edit Entry' : 'Add New Entry'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label htmlFor="type" className="text-sm font-medium">Type</label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value="persona">Persona</option>
                  <option value="project">Project</option>
                  <option value="strategy">Strategy</option>
                  <option value="insight">Insight</option>
                  <option value="resource">Resource</option>
                  <option value="memory">Memory</option>
                  <option value="context">Context</option>
                  <option value="skill">Skill</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="confidence" className="text-sm font-medium">Confidence</label>
                <Input
                  id="confidence"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.confidence}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, confidence: parseFloat(e.target.value)})}
                />
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, title: e.target.value})}
                placeholder="Enter entry title"
              />
            </div>

            <div className="space-y-2 mb-4">
              <label htmlFor="content" className="text-sm font-medium">Content</label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, content: e.target.value})}
                placeholder="Enter entry content"
                rows={6}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <label htmlFor="tags" className="text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, tags: e.target.value})}
                  placeholder="e.g., ai, productivity, strategy"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="domain" className="text-sm font-medium">Domain (comma-separated)</label>
                <Input
                  id="domain"
                  value={formData.domain}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, domain: e.target.value})}
                  placeholder="e.g., technology, business, personal"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEntry}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{selectedEntry ? 'Update' : 'Save'} Entry</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}