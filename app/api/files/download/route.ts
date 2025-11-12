import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

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

    // Security: resolve the path to prevent directory traversal
    const projectRoot = process.cwd()
    const repoRoot = path.resolve(projectRoot, "..")
    // If an absolute path was provided (e.g., /var/folders/... from backend temp), use it as-is,
    // otherwise resolve relative to project root
    const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(projectRoot, filePath)
    
    // Allowlist of base directories
    const allowList = [
      projectRoot,
      repoRoot,                                  // repo root (parent of Frontend)
      path.join(repoRoot, 'output'),             // default LocalSink output dir
      '/var/folders',                            // macOS temp
      '/private/var/folders',                    // macOS temp (prefixed path)
      '/tmp',                                    // generic temp
    ]
    const isAllowed = allowList.some(base => resolvedPath.startsWith(base))
    if (!isAllowed) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    // Check if file exists
    if (!fs.existsSync(resolvedPath)) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      )
    }

    // Read the file
    const fileBuffer = fs.readFileSync(resolvedPath)
    const fileName = path.basename(resolvedPath)
    const ext = path.extname(fileName).toLowerCase()
    const contentType =
      ext === '.txt' ? 'text/plain; charset=utf-8' :
      ext === '.md' ? 'text/markdown; charset=utf-8' :
      ext === '.json' ? 'application/json; charset=utf-8' :
      ext === '.pdf' ? 'application/pdf' :
      ext === '.docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
      'application/octet-stream'

    // Return the file as a download
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": fileBuffer.length.toString(),
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

