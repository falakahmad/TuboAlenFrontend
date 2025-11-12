"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

type AuthUser = {
  id: string
  email: string
  firstName?: string
  lastName?: string
}

type AuthState = {
  isAuthenticated: boolean
  user: AuthUser | null
  token: string | null
  signin: (user: AuthUser, token: string) => void
  signout: () => Promise<void>
}

const Ctx = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)

  // Load from localStorage/cookie once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('turbo-alan-user')
      if (raw) setUser(JSON.parse(raw))
    } catch {}
    try {
      const raw = localStorage.getItem('refiner-auth-state')
      if (raw) {
        const s = JSON.parse(raw)
        if (s?.token) setToken(s.token)
      }
    } catch {}
  }, [])

  // Persist on change
  useEffect(() => {
    try {
      if (user) localStorage.setItem('turbo-alan-user', JSON.stringify(user))
    } catch {}
  }, [user])
  useEffect(() => {
    try {
      localStorage.setItem('refiner-auth-state', JSON.stringify({ isAuthenticated: !!token, token }))
    } catch {}
  }, [token])

  // Minimal expiry check (JWT exp if present)
  useEffect(() => {
    if (!token) return
    try {
      const parts = token.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]))
        const exp = payload?.exp ? Number(payload.exp) * 1000 : 0
        if (exp && Date.now() > exp) {
          // expired; do not auto-clear user, but mark token null
          setToken(null)
        }
      }
    } catch {}
  }, [token])

  const signin = useCallback((u: AuthUser, t: string) => {
    setUser(u)
    setToken(t)
    try { document.cookie = `refiner_auth=${t}; Path=/; SameSite=Lax` } catch {}
  }, [])

  const signout = useCallback(async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }) } catch {}
    try { localStorage.removeItem('refiner-auth-state') } catch {}
    try { localStorage.removeItem('turbo-alan-user') } catch {}
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo<AuthState>(() => ({
    isAuthenticated: !!token,
    user,
    token,
    signin,
    signout,
  }), [token, user, signin, signout])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}



