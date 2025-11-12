"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const auth = (() => { try { return useAuth() } catch { return null } })()
  const isAuthed = !!(auth && auth.isAuthenticated)

  useEffect(() => {
    if (!isAuthed) {
      // Defer to next tick to avoid render-phase navigation
      const t = setTimeout(() => router.replace('/?login=1'), 0)
      return () => clearTimeout(t)
    }
  }, [isAuthed, router])

  if (!isAuthed) return null
  return <>{children}</>
}



