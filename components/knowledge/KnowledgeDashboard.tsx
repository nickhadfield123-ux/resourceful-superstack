"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Database, Brain, Users, Settings } from "lucide-react"
import { useIntelligenceStore } from "@/stores/intelligenceStore"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { supabase, contentItems, ContentItem, getDevUser } from "@/lib/db/supabase"

interface KnowledgeStats {
  totalEntries: number
  byType: Record<string, number>
  byDomain: Record<string, number>
  lastUpdated: Date
  averageConfidence: number
  clusters: number
}

export function KnowledgeDashboard() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [stats, setStats] = React.useState<KnowledgeStats | null>(null)

  // Initialize stats with store data
  React.useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setIsLoading(true)
    try {
      // Get knowledge entries from Supabase database
      const userId = getDevUser()
      const dbEntries = await contentItems.findByUserId(userId)
      
      const totalEntries = dbEntries?.length || 0
      
      // Group by type (using content_type)
      const byType = (dbEntries || []).reduce((acc: Record<string, number>, entry) => {
        const type = entry.content_type || entry.category || 'unknown'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {})

      // Group by domain (using category as domain)
      const byDomain = (dbEntries || []).reduce((acc: Record<string, number>, entry) => {
        const domain = entry.category || 'general'
        acc[domain] = (acc[domain] || 0) + 1
        return acc
      }, {})

      // Calculate average confidence (using priority as confidence indicator)
      const priorityToConfidence: Record<string, number> = {
        'high': 0.9,
        'medium': 0.7,
        'low': 0.5
      }
      
      const averageConfidence = (dbEntries || []).length > 0 
        ? (dbEntries || []).reduce((sum: number, entry) => sum + (priorityToConfidence[entry.priority || 'medium'] || 0.5), 0) / (dbEntries || []).length 
        : 0

      // Get clusters (placeholder for now)
      const clusterCount = 0

      setStats({
        totalEntries,
        byType,
        byDomain,
        lastUpdated: new Date(),
        averageConfidence,
        clusters: clusterCount
      })
    } catch (error) {
      console.error("Error loading stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      // Placeholder search implementation
      console.log("Search query:", searchQuery)
      // In a real implementation, you'd use the search system here
    } catch (error) {
      console.error("Search error:", error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading knowledge base...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground">Your intelligent knowledge management system</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadStats}>
            <Settings className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="flex items-center space-x-4 p-6">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
            Search
          </Button>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEntries || 0}</div>
            <p className="text-xs text-muted-foreground">
              Last updated: {stats?.lastUpdated.toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Confidence</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? Math.round(stats.averageConfidence * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Quality score across all entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Clusters</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.clusters || 0}</div>
            <p className="text-xs text-muted-foreground">
              Contextually organized groups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Domains</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(stats?.byDomain || {}).length}</div>
            <p className="text-xs text-muted-foreground">
              Knowledge areas covered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Type Distribution */}
      {stats && Object.keys(stats.byType).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Knowledge by Type</CardTitle>
            <p className="text-sm text-muted-foreground">Breakdown of your knowledge entries by category</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(stats.byType).map(([type, count]) => (
                <div key={type} className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-muted-foreground capitalize">{type}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Domain Distribution */}
      {stats && Object.keys(stats.byDomain).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Knowledge by Domain</CardTitle>
            <p className="text-sm text-muted-foreground">Areas of expertise and interest</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(stats.byDomain).map(([domain, count]) => (
                <div key={domain} className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-muted-foreground capitalize">{domain}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Knowledge Entries List */}
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Entries</CardTitle>
          <p className="text-sm text-muted-foreground">Your saved knowledge and conversations</p>
        </CardHeader>
        <CardContent>
          <KnowledgeEntriesList />
        </CardContent>
      </Card>
    </div>
  )
}

// Separate component for the entries list to handle state and interactions
function KnowledgeEntriesList() {
  const [selectedEntry, setSelectedEntry] = React.useState<any>(null)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [entryToDelete, setEntryToDelete] = React.useState<string | null>(null)
  const [dbEntries, setDbEntries] = React.useState<ContentItem[]>([])
  const [dbLoading, setDbLoading] = React.useState(false)
  
  const knowledgeEntries = useIntelligenceStore.getState().knowledgeEntries
  const deleteKnowledgeEntry = useIntelligenceStore.getState().deleteKnowledgeEntry

  // Load database entries
  React.useEffect(() => {
    loadDbEntries()
  }, [])

  const loadDbEntries = async () => {
    setDbLoading(true)
    try {
      // Use dev user ID for development (no auth required)
      const userId = getDevUser()
      const data = await contentItems.findByUserId(userId)
      setDbEntries(data || [])
    } catch (error) {
      console.error('Error loading database entries:', error)
    } finally {
      setDbLoading(false)
    }
  }

  const handleDelete = async (entryId: string) => {
    setEntryToDelete(entryId)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (entryToDelete) {
      try {
        // Delete from Supabase
        await contentItems.delete(entryToDelete)
        // Refresh the list
        await loadDbEntries()
        setShowDeleteDialog(false)
        setEntryToDelete(null)
      } catch (error) {
        console.error('Error deleting entry:', error)
      }
    }
  }

  if (dbLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading entries from database...</p>
      </div>
    )
  }

  if (dbEntries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No knowledge entries found. Save your first conversation or add an entry!</p>
        <p className="text-xs text-muted-foreground mt-2">Entries stored in Supabase: {dbEntries.length}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 text-sm text-muted-foreground">
        Showing {dbEntries.length} entries from Supabase database
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dbEntries.map((entry) => (
          <Card key={entry.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{entry.title}</CardTitle>
                  <p className="text-sm text-muted-foreground capitalize">{entry.category || entry.content_type}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    entry.priority === 'high' 
                      ? 'bg-red-100 text-red-800' 
                      : entry.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {entry.priority || 'medium'} priority
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {entry.content}
              </p>
              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag: string) => (
                    <span key={tag} className="text-xs bg-muted px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedEntry(entry)}
                  className="flex items-center space-x-2"
                >
                  <span>View</span>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(entry.id)}
                  className="flex items-center space-x-2"
                >
                  <span>Delete</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{selectedEntry.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEntry(null)}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-sm text-muted-foreground">Category</span>
                <p className="font-medium capitalize">{selectedEntry.category}</p>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Priority</span>
                <p className="font-medium">{selectedEntry.priority}</p>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Content</span>
                <p className="text-sm text-muted-foreground">{selectedEntry.content}</p>
              </div>

              {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">Tags</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedEntry.tags.map((tag: string) => (
                      <span key={tag} className="text-xs bg-muted px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedEntry(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className={showDeleteDialog ? '' : 'hidden'}>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this knowledge entry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Entry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
