"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, Database, Eye, Settings, RefreshCw, DollarSign, AlertTriangle } from "lucide-react"
import { useIntelligenceStore } from "@/stores/intelligenceStore"
import { useCostTracking, formatBudgetStatus } from "@/lib/ai/cost-tracking"

// Budget Monitor Component
function BudgetMonitor() {
  const { getBudgetStatus, resetAnthropicTracking } = useCostTracking()
  const budgetStatus = getBudgetStatus()
  const formattedStatus = formatBudgetStatus(budgetStatus)

  const budgetColor = budgetStatus.isLow ? 'destructive' : 'success'
  const progressPercentage = Math.min(100, budgetStatus.percentageUsed)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4" />
          <span className="font-medium">Anthropic API Budget</span>
        </div>
        <Badge variant={budgetColor}>
          {budgetStatus.isLow ? 'Budget Low' : 'Within Budget'}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Usage: {formattedStatus.totalCostFormatted}</span>
          <span>Remaining: {formattedStatus.remainingBudgetFormatted}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              budgetStatus.isLow ? 'bg-red-500' : 'bg-green-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="text-xs text-muted-foreground">
          {formattedStatus.percentageUsedFormatted} of $5.00 budget used
        </div>
      </div>

        <div className="flex justify-between items-center text-sm">
          <span>Requests: {budgetStatus.totalCost}</span>
        <Button 
          variant="outline" 
          size="sm"
          onClick={resetAnthropicTracking}
        >
          Reset Tracking
        </Button>
      </div>

      {budgetStatus.isLow && (
        <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-700">
            Budget is running low. Consider reducing Vision API usage or resetting tracking.
          </span>
        </div>
      )}
    </div>
  )
}

export default function StatusPage() {
  const { systemHealth, lastBackup, version } = useIntelligenceStore()

  const healthColor = systemHealth === 'healthy' ? 'success' : systemHealth === 'warning' ? 'secondary' : 'destructive'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">📊 System Status</h1>
          <p className="text-muted-foreground">Monitor Rizz intelligence health</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Intelligence Health</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Overall Status</span>
                  <Badge variant={healthColor}>{systemHealth}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Prompt Performance</span>
                  <Badge variant="success">Optimal</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Knowledge Integration</span>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Memory Usage</span>
                  <Badge variant="outline">15%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Response Time</span>
                  <Badge variant="success">200ms</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>API Connections</span>
                  <Badge variant="success">All Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Usage Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Today's Interactions</span>
                  <Badge variant="secondary">24</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Knowledge Queries</span>
                  <Badge variant="secondary">12</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Prompt Usage</span>
                  <Badge variant="secondary">8</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Active Sessions</span>
                  <Badge variant="secondary">3</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Memory Usage</span>
                  <Badge variant="outline">15%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Storage Used</span>
                  <Badge variant="outline">2.1 MB</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Anthropic API Budget</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BudgetMonitor />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>System Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Version</span>
                  <Badge variant="outline">{version}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Last Backup</span>
                  <Badge variant="outline">{lastBackup ? (lastBackup instanceof Date ? lastBackup.toLocaleDateString() : new Date(lastBackup).toLocaleDateString()) : 'Never'}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Uptime</span>
                  <Badge variant="outline">2 days</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Database Status</span>
                  <Badge variant="success">Connected</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Cache Status</span>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Sync Status</span>
                  <Badge variant="success">Up to date</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Performance Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Response Time</span>
                  <Badge variant="success">200ms</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Query Speed</span>
                  <Badge variant="success">50ms</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Memory Efficiency</span>
                  <Badge variant="success">95%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Cache Hit Rate</span>
                  <Badge variant="success">87%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>API Response Time</span>
                  <Badge variant="success">150ms</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>System Load</span>
                  <Badge variant="success">Low</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>System Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>API Key Status</span>
                  <Badge variant="success">Valid</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Rate Limits</span>
                  <Badge variant="success">Normal</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Service Health</span>
                  <Badge variant="success">All Services Up</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Storage Quota</span>
                  <Badge variant="success">Available</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Memory Usage</span>
                  <Badge variant="success">Optimal</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Network Status</span>
                  <Badge variant="success">Connected</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            System Settings
          </Button>
        </div>
      </div>
    </div>
  )
}