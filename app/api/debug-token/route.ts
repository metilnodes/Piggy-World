import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    const authToken = token.startsWith("Bearer ") ? token.split(" ")[1] : token

    console.log("🔍 Debug: Raw token length:", authToken.length)
    console.log("🔍 Debug: Token start:", authToken.substring(0, 50) + "...")

    // Попробуем декодировать JWT
    const parts = authToken.split(".")
    console.log("🔍 Debug: JWT parts count:", parts.length)

    if (parts.length === 3) {
      try {
        // Декодируем header
        const headerPadded = parts[0] + "=".repeat((4 - (parts[0].length % 4)) % 4)
        const header = JSON.parse(Buffer.from(headerPadded, "base64url").toString("utf-8"))

        // Декодируем payload
        const payloadPadded = parts[1] + "=".repeat((4 - (parts[1].length % 4)) % 4)
        const payload = JSON.parse(Buffer.from(payloadPadded, "base64url").toString("utf-8"))

        return NextResponse.json({
          success: true,
          tokenInfo: {
            header,
            payload,
            partsCount: parts.length,
            tokenLength: authToken.length,
          },
        })
      } catch (decodeError: any) {
        return NextResponse.json({
          success: false,
          error: "JWT decode failed",
          details: decodeError.message,
          partsCount: parts.length,
          tokenLength: authToken.length,
        })
      }
    } else {
      return NextResponse.json({
        success: false,
        error: "Invalid JWT format",
        partsCount: parts.length,
        tokenLength: authToken.length,
      })
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
