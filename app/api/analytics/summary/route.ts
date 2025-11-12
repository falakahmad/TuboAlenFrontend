import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const backendUrl = process.env.REFINER_BACKEND_URL
  if (!backendUrl) {
    console.error("[Analytics] REFINER_BACKEND_URL environment variable is not set")
    return NextResponse.json({ 
      error: "backend not configured",
      message: "REFINER_BACKEND_URL environment variable is missing. Please configure it in Vercel project settings."
    }, { status: 500 })
  }
  
  try {
    const url = `${backendUrl.replace(/\/$/, "")}/analytics/summary`
    const upstream = await fetch(url, {
      headers: { "X-API-Key": process.env.BACKEND_API_KEY || "" },
    })
    
    if (!upstream.ok) {
      const errorText = await upstream.text()
      console.error(`[Analytics] Backend returned ${upstream.status}:`, errorText)
      return NextResponse.json({ 
        error: "backend_request_failed",
        message: `Backend returned ${upstream.status}: ${errorText}`,
        status: upstream.status
      }, { status: upstream.status })
    }
    
    const data = await upstream.json()
    return NextResponse.json(data, { status: upstream.status })
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Unknown error"
    console.error("[Analytics] Request failed:", errorMessage)
    return NextResponse.json({ 
      error: "analytics_request_failed",
      message: errorMessage
    }, { status: 500 })
  }
}
