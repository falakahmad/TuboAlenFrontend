"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

interface UserInfo {
  id: string
  email: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
}

export default function UserMenu() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    try {
      // Check authentication state
      let authStatus = false
      const authState = localStorage.getItem("refiner-auth-state")
      if (authState) {
        const state = JSON.parse(authState)
        authStatus = !!state.isAuthenticated
        setIsAuthenticated(authStatus)
      }
      
      // Check for user data
      const raw = localStorage.getItem("turbo-alan-user")
      if (raw) {
        const userData = JSON.parse(raw)
        // Only set user if we have valid user data
        if (userData && userData.email) {
          // Show user menu if authenticated OR if user data indicates authentication
          // (Dashboard component only renders when authenticated, so this is a safety check)
          if (authStatus || userData.isAuthenticated) {
            setUser(userData)
            if (!authStatus && userData.isAuthenticated) {
              setIsAuthenticated(true)
            }
          } else {
            // User data exists but not authenticated - clear it
            setUser(null)
            setIsAuthenticated(false)
          }
        }
      } else if (!authStatus) {
        // No user data and not authenticated
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch {
      setUser(null)
      setIsAuthenticated(false)
    }
  }, [])


  // Only show user menu if user exists AND is authenticated
  if (!user || !isAuthenticated) return null

  return (
    <div className="relative">
      <button
        aria-label="User menu"
        className="rounded-full overflow-hidden w-9 h-9 border border-border"
        onClick={() => setOpen(v => !v)}
      >
        {user.avatarUrl ? (
          <Image src={user.avatarUrl} alt="avatar" width={36} height={36} />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-foreground">
            {(user.firstName?.[0] || user.email?.[0] || "U").toUpperCase()}
          </div>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-popover border border-border rounded-md shadow-xl z-50 p-3 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-border">
              {user.avatarUrl ? (
                <Image src={user.avatarUrl} alt="avatar" width={48} height={48} />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-sm text-foreground">
                  {(user.firstName?.[0] || user.email?.[0] || "U").toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{user.firstName ? `${user.firstName} ${user.lastName || ""}` : user.email}</div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setOpen(false)}>Close</button>
            <button
              className="text-xs px-2 py-1 rounded bg-destructive text-destructive-foreground hover:opacity-90"
              onClick={async () => {
                try { localStorage.removeItem('refiner-auth-state') } catch {}
                try { localStorage.removeItem('turbo-alan-user') } catch {}
                try { await fetch('/api/auth/logout', { method: 'POST' }) } catch {}
                window.location.href = '/'
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}





