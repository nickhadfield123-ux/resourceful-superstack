"use client"

import { useState } from 'react'

interface SyncButtonProps {
  onSync?: () => Promise<void>
  label?: string
}

export function SyncButton({ onSync, label = "Sync with Kilo" }: SyncButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false)
  
  const handleSync = async () => {
    if (!onSync) return
    setIsSyncing(true)
    try {
      await onSync()
    } finally {
      setIsSyncing(false)
    }
  }
  
  return (
    <button
      onClick={handleSync}
      disabled={isSyncing || !onSync}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isSyncing ? (
        <>
          <span className="animate-spin">⟳</span>
          Syncing...
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6"/>
            <path d="M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </svg>
          {label}
        </>
      )}
    </button>
  )
}