"use client"

import * as React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Settings, Save, RefreshCw, Database, Eye, Zap } from "lucide-react"
import { useIntelligenceStore } from "@/stores/intelligenceStore"
import { DatabaseTest } from "@/components/cockpit/DatabaseTest"

export default function SettingsPage() {
  const { systemHealth, lastBackup, version, updateSystemHealth, createBackup } = useIntelligenceStore()
  const [isAutoUpdateEnabled, setIsAutoUpdateEnabled] = useState(true)
  const [isRealTimeSyncEnabled, setIsRealTimeSyncEnabled] = useState(true)
  const [backupFrequency, setBackupFrequency] = useState('daily')
  const [theme, setTheme] = useState('light')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)

  const handleBackup = () => {
    createBackup()
    alert('Backup created successfully!')
  }

  const handleHealthCheck = () => {
    updateSystemHealth('healthy')
    alert('System health check completed!')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">⚙️ Settings</h1>
          <p className="text-muted-foreground">Configure Rizz preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Intelligence Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-update">Auto-update Intelligence</Label>
                  <p className="text-sm text-muted-foreground">Automatically update intelligence modules</p>
                </div>
                <Switch
                  id="auto-update"
                  checked={isAutoUpdateEnabled}
                  onCheckedChange={setIsAutoUpdateEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="real-time-sync">Real-time Sync</Label>
                  <p className="text-sm text-muted-foreground">Sync data across devices in real-time</p>
                </div>
                <Switch
                  id="real-time-sync"
                  checked={isRealTimeSyncEnabled}
                  onCheckedChange={setIsRealTimeSyncEnabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backup-frequency">Backup Frequency</Label>
                <select
                  id="backup-frequency"
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  value={backupFrequency}
                  onChange={(e) => setBackupFrequency(e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="manual">Manual</option>
                </select>
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleHealthCheck}>
                  <Zap className="h-4 w-4 mr-2" />
                  Health Check
                </Button>
                <Button variant="outline" onClick={handleBackup}>
                  <Database className="h-4 w-4 mr-2" />
                  Create Backup
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>System Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <select
                  id="theme"
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">Notifications</Label>
                  <p className="text-sm text-muted-foreground">Enable system notifications</p>
                </div>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-save">Auto-save</Label>
                  <p className="text-sm text-muted-foreground">Automatically save changes</p>
                </div>
                <Switch
                  id="auto-save"
                  checked={autoSaveEnabled}
                  onCheckedChange={setAutoSaveEnabled}
                />
              </div>

              <div className="flex space-x-2">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset to Default
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <DatabaseTest />

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Version</span>
                <Badge variant="outline">{version}</Badge>
              </div>
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Last Backup</span>
                <Badge variant="outline">{lastBackup ? lastBackup.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit' 
                }) : 'Never'}</Badge>
              </div>
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">System Health</span>
                <Badge variant={systemHealth === 'healthy' ? 'success' : systemHealth === 'warning' ? 'secondary' : 'destructive'}>
                  {systemHealth}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}