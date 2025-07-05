import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("Frame event received:", body)

    // Обработка событий фрейма
    return NextResponse.json({
      success: true,
      message: "Frame event processed",
    })
  } catch (error) {
    console.error("Frame event error:", error)
    return NextResponse.json({ error: "Failed to process frame event" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Frame events endpoint is active",
    timestamp: new Date().toISOString(),
  })
}
