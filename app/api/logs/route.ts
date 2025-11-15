import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lines = searchParams.get("lines") || "200"

    // Proxy the request to the backend API
    const backendUrl = process.env.NEXT_PUBLIC_REFINER_BACKEND_URL || process.env.REFINER_BACKEND_URL
    if (!backendUrl) {
      return NextResponse.json(
        { error: "Backend URL not configured" },
        { status: 500 }
      )
    }

    // Call backend API to get logs
    const backendApiUrl = `${backendUrl.replace(/\/$/, "")}/logs?lines=${lines}`
    
    const response = await fetch(backendApiUrl, {
      method: 'GET',
      headers: {
        'X-API-Key': process.env.BACKEND_API_KEY || '',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: errorText || `Backend returned ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Logs fetch error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch logs" },
      { status: 500 }
    )
  }
}
