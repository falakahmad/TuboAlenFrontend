"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function GoogleAuthSuccessPage() {
  const router = useRouter()
  const { signin } = useAuth()

  useEffect(() => {
    const handleSuccess = () => {
      try {
        // Get token and user from URL hash
        const hash = window.location.hash.substring(1) // Remove #
        const params = new URLSearchParams(hash)
        const token = params.get('token')
        const userStr = params.get('user')

        if (token && userStr) {
          const user = JSON.parse(decodeURIComponent(userStr))
          
          // Set auth state via AuthContext
          signin(user, token)
          
          // Clear hash from URL
          window.history.replaceState({}, '', '/auth/google/success')
          
          // Redirect to dashboard
          setTimeout(() => {
            router.push('/dashboard')
          }, 100)
        } else {
          // Fallback: try to get from cookie
          const cookies = document.cookie.split(';')
          const authCookie = cookies.find(c => c.trim().startsWith('refiner_auth='))
          if (authCookie) {
            const cookieToken = authCookie.split('=')[1]?.trim()
            if (cookieToken) {
              // Token is in cookie, redirect to dashboard
              // AuthContext will pick it up on next page load
              router.push('/dashboard')
              return
            }
          }
          
          router.push('/?error=Failed to complete authentication&login=1')
        }
      } catch (error) {
        console.error('Error processing Google auth success:', error)
        router.push('/?error=Failed to process authentication&login=1')
      }
    }

    handleSuccess()
  }, [router, signin])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-2"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
}

