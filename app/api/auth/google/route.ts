import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN || 'http://localhost:3000'
const REDIRECT_URI = `${APP_ORIGIN}/api/auth/google/callback`

export async function GET(request: NextRequest) {
  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json(
      { error: 'Google OAuth is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment variables.' },
      { status: 500 }
    )
  }

  const { searchParams } = new URL(request.url)
  const state = searchParams.get('state') || Math.random().toString(36).substring(7)
  
  // Store state in a cookie for verification
  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent('openid email profile')}&` +
    `state=${state}&` +
    `access_type=offline&` +
    `prompt=consent`
  )
  
  // Store state in httpOnly cookie for security
  response.cookies.set('google_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600 // 10 minutes
  })
  
  return response
}

