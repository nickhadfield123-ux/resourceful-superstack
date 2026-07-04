"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/toast"
import { checkDatabaseHealth, testUnifiedStorage } from "@/lib/db/test-db"
import { testDatabase } from "@/lib/db/test-db"
import { unifiedStorage } from "@/lib/db/unified-storage"

export function DatabaseTest() {
  const [isTesting, setIsTesting] = React.useState(false)
  const [healthStatus, setHealthStatus] = React.useState<string>("")

  const handleHealthCheck = async () => {
    try {
      const isHealthy = await checkDatabaseHealth()
      setHealthStatus(isHealthy ? "✅ Database is healthy" : "❌ Database health check failed")
      toast.info(isHealthy ? "Database health check passed!" : "Database health check failed")
    } catch (error) {
      console.error("Health check error:", error)
      setHealthStatus("❌ Health check error")
      toast.error("Health check failed")
    }
  }

  const handleFullTest = async () => {
    setIsTesting(true)
    try {
      const success = await testDatabase()
      if (success) {
        toast.success("Full database test completed successfully!")
      } else {
        toast.error("Full database test failed")
      }
    } catch (error) {
      console.error("Full test error:", error)
      toast.error("Full test failed")
    } finally {
      setIsTesting(false)
    }
  }

  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      try {
        await unifiedStorage.clearAllData()
        toast.success("All data cleared successfully!")
      } catch (error) {
        console.error("Clear error:", error)
        toast.error("Failed to clear data")
      }
    }
  }

  const handleUnifiedStorageTest = async () => {
    setIsTesting(true)
    try {
      const success = await testUnifiedStorage()
      if (success) {
        toast.success("UnifiedStorage test completed successfully!")
      } else {
        toast.error("UnifiedStorage test failed")
      }
    } catch (error) {
      console.error("UnifiedStorage test error:", error)
      toast.error("UnifiedStorage test failed")
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Test & Health Check</CardTitle>
        <p className="text-sm text-muted-foreground">
          Test the new IndexedDB storage system and monitor database health
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleHealthCheck} variant="outline">
            Health Check
          </Button>
          <Button onClick={handleFullTest} disabled={isTesting}>
            {isTesting ? "Testing..." : "Full Test"}
          </Button>
          <Button onClick={handleUnifiedStorageTest} disabled={isTesting}>
            {isTesting ? "Testing..." : "UnifiedStorage Test"}
          </Button>
          <Button onClick={handleClearAll} variant="destructive">
            Clear All Data
          </Button>
        </div>
        
        {healthStatus && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm">{healthStatus}</p>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p><strong>What this tests:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>IndexedDB connection and basic operations</li>
            <li>Media entry creation, retrieval, and deletion</li>
            <li>Conversation entry management</li>
            <li>KB entry creation</li>
            <li>Blob storage and URL generation</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}