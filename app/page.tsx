"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import PulsingCircle from "@/components/pulsing-circle"
import AuthModal from "@/components/auth-modal"
import Dashboard from "@/components/dashboard"
import HeroContent from "@/components/hero-content"
import FeaturesSection from "@/components/features-section"
import HowItWorksSection from "@/components/how-it-works-section"
import PricingSection from "@/components/pricing-section"
import Footer from "@/components/footer"
import { loadStripe } from "@stripe/stripe-js"

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
const stripePromise = stripeKey ? loadStripe(stripeKey) : null

function handleGetStarted(planName: string) {
  // Navigate to checkout page to collect details before starting Stripe flow
  window.location.assign(`/checkout?plan=${encodeURIComponent(planName)}`)
}

export default function TurboAlanRefiner() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [currentPage, setCurrentPage] = useState<"home" | "dashboard">("home")

  // Load authentication state from localStorage on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('refiner-auth-state')
    if (savedAuth) {
      try {
        const authState = JSON.parse(savedAuth)
        setIsAuthenticated(authState.isAuthenticated || false)
        setCurrentPage(authState.currentPage || "home")
      } catch (error) {
        console.error('Failed to load auth state:', error)
      }
    }
  }, [])

  // Save authentication state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('refiner-auth-state', JSON.stringify({
      isAuthenticated,
      currentPage
    }))
  }, [isAuthenticated, currentPage])

  const handleAuthenticated = () => {
    setIsAuthenticated(true)
    setShowAuthModal(false)
    setCurrentPage("dashboard")
  }

  const handleBackToHome = () => {
    setCurrentPage("home")
    // Preserve auth state so user is not prompted again
  }

  if (currentPage === "dashboard" && isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <Header
          onLoginClick={() => setShowAuthModal(true)}
          showBackButton={true}
          onBackClick={handleBackToHome}
          isAuthenticated={isAuthenticated}
        />
        <Dashboard />
        <Footer />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthenticated={handleAuthenticated}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="relative">
        <ShaderBackground>
          <Header
            onLoginClick={() => setShowAuthModal(true)}
            showBackButton={false}
            isAuthenticated={isAuthenticated}
          />
          <HeroContent onGetStarted={() => setShowAuthModal(true)} />
          <PulsingCircle />
        </ShaderBackground>
      </div>

      <div className="bg-white">
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection
          onGetStarted={handleGetStarted}
        />
        <Footer />
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onAuthenticated={handleAuthenticated} />
    </div>
  )
}
