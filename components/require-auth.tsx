"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const auth = (() => { try { return useAuth() } catch { return null } })()
  const isAuthed = !!(auth && auth.isAuthenticated)
  const isInitialized = auth?.isInitialized ?? false
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    // Wait for auth to initialize before redirecting
    if (isInitialized && !isAuthed && !hasRedirected) {
      // Add a small delay to ensure state is fully restored
      const t = setTimeout(() => {
        setHasRedirected(true)
        router.replace('/?login=1')
      }, 100)
      return () => clearTimeout(t)
    }
  }, [isAuthed, isInitialized, hasRedirected, router])

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show loading while redirecting
  if (!isAuthed && hasRedirected) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-2"></div>
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    )
  }

  if (!isAuthed) return null
  return <>{children}</>
}



