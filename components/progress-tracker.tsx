"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { PassMetrics } from "@/lib/refiner-client"

interface StageChip {
  name: string
  status: "pending" | "running" | "completed" | "error"
  duration?: number
}

interface PassData {
  passNumber: number
  stages: StageChip[]
  metrics?: PassMetrics
  sparklineData: {
    changePercent: number
    tensionPercent: number
    normalizedLatency: number
    previousPassRisk: number
  }
}

interface ProgressTrackerProps {
  fileId: string
  fileName: string
  currentPass: number
  totalPasses: number
  passData: PassData[]
  onToggleMetrics?: () => void
}

export default function ProgressTracker({
  fileId,
  fileName,
  currentPass,
  totalPasses,
  passData,
  onToggleMetrics,
}: ProgressTrackerProps) {
  const [showTooltip, setShowTooltip] = useState<{ passNumber: number; x: number; y: number } | null>(null)
  const [metricsAligned, setMetricsAligned] = useState(false)

  const getStageColor = (status: StageChip["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "running":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "error":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const renderSparkline = (data: number[], color: string, label: string) => {
    if (data.length < 2) return null

    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1

    const points = data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * 100
        const y = 100 - ((value - min) / range) * 100
        return `${x},${y}`
      })
      .join(" ")

    return (
      <div className="space-y-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <svg width="80" height="20" className="overflow-visible">
          <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} vectorEffect="non-scaling-stroke" />
          {data.map((_, index) => (
            <circle
              key={index}
              cx={(index / (data.length - 1)) * 80}
              cy={20 - ((data[index] - min) / range) * 20}
              r="1.5"
              fill={color}
            />
          ))}
        </svg>
      </div>
    )
  }

  const handleSparklineHover = (event: React.MouseEvent, passNumber: number) => {
    setShowTooltip({
      passNumber,
      x: event.clientX,
      y: event.clientY,
    })
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-card-foreground text-lg">{fileName}</CardTitle>
            <CardDescription className="text-muted-foreground">
              Pass {currentPass} of {totalPasses} • File ID: {fileId}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onToggleMetrics} className="text-muted-foreground hover:text-foreground">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Metrics
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {passData.map((pass) => (
          <div key={pass.passNumber} className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-foreground font-medium">Pass {pass.passNumber}</h4>
              {pass.passNumber === currentPass && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">Current</Badge>
              )}
            </div>

            {/* Stage Chips */}
            <div className="flex flex-wrap gap-2">
              {pass.stages.map((stage) => (
                <div key={stage.name} className={`px-2 py-1 rounded text-xs border ${getStageColor(stage.status)}`}>
                  <div className="flex items-center space-x-1">
                    <span>{stage.name}</span>
                    {stage.status === "running" && <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />}
                    {stage.duration && <span className="text-xs opacity-70">({stage.duration}ms)</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Sparklines */}
            {pass.sparklineData && (
              <div className="grid grid-cols-4 gap-4 p-3 bg-muted rounded-lg border border-border">
                <div
                  onMouseEnter={(e) => handleSparklineHover(e, pass.passNumber)}
                  onMouseLeave={() => setShowTooltip(null)}
                  className="cursor-pointer"
                >
                  {renderSparkline(
                    passData.slice(0, pass.passNumber).map((p) => p.sparklineData.changePercent),
                    "#60a5fa",
                    "Change %",
                  )}
                </div>
                <div
                  onMouseEnter={(e) => handleSparklineHover(e, pass.passNumber)}
                  onMouseLeave={() => setShowTooltip(null)}
                  className="cursor-pointer"
                >
                  {renderSparkline(
                    passData.slice(0, pass.passNumber).map((p) => p.sparklineData.tensionPercent),
                    "#34d399",
                    "Tension %",
                  )}
                </div>
                <div
                  onMouseEnter={(e) => handleSparklineHover(e, pass.passNumber)}
                  onMouseLeave={() => setShowTooltip(null)}
                  className="cursor-pointer"
                >
                  {renderSparkline(
                    passData.slice(0, pass.passNumber).map((p) => p.sparklineData.normalizedLatency),
                    "#fbbf24",
                    "Latency",
                  )}
                </div>
                <div
                  onMouseEnter={(e) => handleSparklineHover(e, pass.passNumber)}
                  onMouseLeave={() => setShowTooltip(null)}
                  className="cursor-pointer"
                >
                  {renderSparkline(
                    passData.slice(0, pass.passNumber).map((p) => p.sparklineData.previousPassRisk),
                    "#f87171",
                    "Risk %",
                  )}
                </div>
              </div>
            )}

            {/* Detailed Metrics (Toggle-aligned) */}
            {pass.metrics && metricsAligned && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted rounded-lg border border-border">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Punct/100w</div>
                  <div className="text-sm text-foreground font-medium">{pass.metrics.punctuationPer100Words.toFixed(1)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Sentences</div>
                  <div className="text-sm text-foreground font-medium">{pass.metrics.sentences}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Transitions</div>
                  <div className="text-sm text-foreground font-medium">{pass.metrics.transitions}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Rhythm CV</div>
                  <div className="text-sm text-foreground font-medium">{pass.metrics.rhythmCV.toFixed(2)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Keywords</div>
                  <div className="text-sm text-foreground font-medium">{pass.metrics.keywords}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Synonym Rate</div>
                  <div className="text-sm text-foreground font-medium">{(pass.metrics.synonymRate * 100).toFixed(1)}%</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Grammar Issues</div>
                  <div className="text-sm text-foreground font-medium">{pass.metrics.grammarIssues}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Edits/100w</div>
                  <div className="text-sm text-foreground font-medium">{pass.metrics.editsPer100Words.toFixed(1)}</div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Toggle for metrics alignment */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="metricsToggle"
              checked={metricsAligned}
              onChange={(e) => setMetricsAligned(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="metricsToggle" className="text-muted-foreground text-sm">
              Show detailed metrics
            </label>
          </div>
          <div className="text-xs text-muted-foreground">
            {passData.filter((p) => p.stages.every((s) => s.status === "completed")).length} of {passData.length} passes
            completed
          </div>
        </div>
      </CardContent>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="fixed z-50 p-2 bg-popover backdrop-blur-sm border border-border rounded text-xs text-foreground pointer-events-none shadow"
          style={{
            left: showTooltip.x + 10,
            top: showTooltip.y - 10,
          }}
        >
          <div className="font-medium text-foreground">Pass {showTooltip.passNumber} Metrics</div>
          {passData.find((p) => p.passNumber === showTooltip.passNumber)?.metrics && (
            <div className="mt-1 space-y-1">
              <div>
                Change:{" "}
                {passData.find((p) => p.passNumber === showTooltip.passNumber)?.sparklineData.changePercent.toFixed(1)}%
              </div>
              <div>
                Tension:{" "}
                {passData.find((p) => p.passNumber === showTooltip.passNumber)?.sparklineData.tensionPercent.toFixed(1)}
                %
              </div>
              <div>
                Risk:{" "}
                {passData
                  .find((p) => p.passNumber === showTooltip.passNumber)
                  ?.sparklineData.previousPassRisk.toFixed(1)}
                %
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
