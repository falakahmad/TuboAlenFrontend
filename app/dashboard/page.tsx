"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Dashboard from "@/components/dashboard"
import AuthModal from "@/components/auth-modal"

export default function DashboardRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('refiner-auth-state')
      if (saved) {
        const st = JSON.parse(saved)
        setIsAuthenticated(!!st.isAuthenticated)
      }
      if (!isAuthenticated) {
        const user = localStorage.getItem('turbo-alan-user')
        if (user) {
          const u = JSON.parse(user)
          if (u && (u.isAuthenticated || u.email)) setIsAuthenticated(true)
        }
      }
    } catch {}
  }, [])

  useEffect(() => {
    // Persist auth state on this route as well
    localStorage.setItem('refiner-auth-state', JSON.stringify({ isAuthenticated }))
  }, [isAuthenticated])

  const handleAuthenticated = () => {
    setIsAuthenticated(true)
    setShowAuthModal(false)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        onLoginClick={() => setShowAuthModal(true)}
        showBackButton={true}
        onBackClick={() => history.length > 1 ? history.back() : window.location.assign('/product')}
        isAuthenticated={isAuthenticated}
      />
      {isAuthenticated ? (
        <Dashboard />
      ) : (
        <div className="max-w-2xl mx-auto px-6 py-12 text-center">
          <h1 className="text-2xl font-semibold mb-2">Sign in to access your dashboard</h1>
          <p className="text-muted-foreground">Your session will be remembered across pages.</p>
          <div className="mt-6">
            <button onClick={() => setShowAuthModal(true)} className="px-4 py-2 rounded-md bg-yellow-400 text-black font-medium hover:bg-yellow-500">Sign In</button>
          </div>
        </div>
      )}
      <Footer />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onAuthenticated={handleAuthenticated} />
    </div>
  )
}


