"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { refinerClient } from "@/lib/refiner-client"

interface LogEntry {
  timestamp: string
  level: "INFO" | "WARN" | "ERROR" | "DEBUG"
  message: string
}

export default function LogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [filter, setFilter] = useState<string>("all")

  const loadLogs = async () => {
    setIsLoading(true)
    try {
      const response = await refinerClient.getLogs(200)
      const rawLines = Array.isArray((response as any)?.lines) ? (response as any).lines as string[] : []
      const structured = Array.isArray((response as any)?.logs) ? (response as any).logs as LogEntry[] : []
      const fromLines: LogEntry[] = rawLines.map((line) => ({ timestamp: new Date().toISOString(), level: "INFO", message: line }))
      const merged = structured.length ? structured : fromLines
      setLogs(merged)
    } catch (error) {
      console.error("Failed to load logs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadLogs, 5000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "ERROR":
        return "bg-red-500/20 text-red-600 border-red-500/30"
      case "WARN":
        return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"
      case "INFO":
        return "bg-blue-500/20 text-blue-600 border-blue-500/30"
      case "DEBUG":
        return "bg-gray-500/20 text-gray-600 border-gray-500/30"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const safeLogs = Array.isArray(logs) ? logs : []

  const filteredLogs = safeLogs.filter((log) => {
    if (filter === "all") return true
    return log.level === filter
  })

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-card-foreground">System Logs</CardTitle>
            <CardDescription className="text-muted-foreground">
              Real-time processing logs and system events
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="autoRefresh" className="text-muted-foreground text-sm">
                Auto-refresh
              </label>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadLogs}
              disabled={isLoading}
              className="text-muted-foreground hover:text-foreground"
            >
              {isLoading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter Controls */}
        <div className="flex items-center space-x-2">
          <span className="text-muted-foreground text-sm">Filter:</span>
          {["all", "ERROR", "WARN", "INFO", "DEBUG"].map((level) => (
            <Button
              key={level}
              variant={filter === level ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter(level)}
              className={
                filter === level
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 h-7 px-2 text-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted h-7 px-2 text-xs"
              }
            >
              {level.toUpperCase()}
            </Button>
          ))}
        </div>

        {/* Log Entries */}
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">No logs found</p>
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-muted rounded text-sm">
                <Badge className={`${getLevelColor(log.level)} text-xs`}>{log.level}</Badge>
                <div className="flex-1 min-w-0">
                  <div className="text-foreground break-words">{log.message}</div>
                  <div className="text-muted-foreground text-xs mt-1">{formatTimestamp(log.timestamp)}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Log Statistics */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            Showing {filteredLogs.length} of {safeLogs.length} entries
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <span className="text-red-600">{safeLogs.filter((l) => l.level === "ERROR").length} errors</span>
            <span className="text-yellow-600">{safeLogs.filter((l) => l.level === "WARN").length} warnings</span>
            <span className="text-blue-600">{safeLogs.filter((l) => l.level === "INFO").length} info</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
