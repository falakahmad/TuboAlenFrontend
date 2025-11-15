import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filePath = searchParams.get("path")

    if (!filePath) {
      return NextResponse.json(
        { error: "File path is required" },
        { status: 400 }
      )
    }

    // Proxy the request to the backend API
    const backendUrl = process.env.NEXT_PUBLIC_REFINER_BACKEND_URL || process.env.REFINER_BACKEND_URL
    if (!backendUrl) {
      return NextResponse.json(
        { error: "Backend URL not configured" },
        { status: 500 }
      )
    }

    // Extract just the filename if path is absolute (e.g., /tmp/data/output/file.md -> file.md)
    let fileName = filePath
    if (filePath.includes('/')) {
      fileName = filePath.split('/').pop() || filePath
    }

    // Call backend API to serve the file
    const backendApiUrl = `${backendUrl.replace(/\/$/, "")}/files/serve?file_path=${encodeURIComponent(fileName)}`
    
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

    // Get the file content and headers from backend response
    const fileBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const contentDisposition = response.headers.get('content-disposition') || `attachment; filename="${fileName}"`

    // Return the file with proper headers
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
        "Content-Length": fileBuffer.byteLength.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    console.error("File download error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to download file" },
      { status: 500 }
    )
  }
}

