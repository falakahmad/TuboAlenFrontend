"use client"

import { useAnalytics } from "@/contexts/AnalyticsContext"

export default function UsageSummary() {
  const { summary, loading, error } = useAnalytics()
  const jobs = Array.isArray(summary?.jobs) ? summary.jobs : []
  const completed = jobs.filter((j: any) => j.status === 'completed').length
  const running = jobs.filter((j: any) => j.status === 'running').length
  const failed = jobs.filter((j: any) => j.status === 'failed').length
  const totalReq = summary?.requests ?? 0
  const tokensIn = summary?.tokens_in ?? summary?.token_count ?? summary?.tokensIn ?? 0
  const tokensOut = summary?.tokens_out ?? summary?.tokensOut ?? 0

  const Item = ({ label, value }: { label: string; value: string | number }) => (
    <div className="p-3 rounded-lg bg-muted/50 border border-border">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-base font-medium">{value}</div>
    </div>
  )

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
      {(!summary && !loading) && (
        <div className="col-span-2 md:col-span-6 text-xs text-muted-foreground">Usage stats unavailable.</div>
      )}
      <Item label="Jobs" value={jobs.length} />
      <Item label="Completed" value={completed} />
      <Item label="Running" value={running} />
      <Item label="Failed" value={failed} />
      <Item label="OpenAI Requests (all time)" value={totalReq} />
      <div className="grid grid-cols-2 gap-2">
        <Item label="Tokens In" value={tokensIn} />
        <Item label="Tokens Out" value={tokensOut} />
      </div>
    </div>
  )
}


