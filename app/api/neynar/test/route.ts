import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.NEYNAR_API_KEY

    console.log("🔍 Testing Neynar API Key...")
    console.log("API Key exists:", !!apiKey)
    console.log("API Key length:", apiKey?.length || 0)
    console.log("API Key first 10 chars:", apiKey?.substring(0, 10) || "none")

    if (!apiKey) {
      return NextResponse.json({
        error: "NEYNAR_API_KEY not found",
        hasKey: false,
      })
    }

    // Тестовый запрос к Neynar API
    const testFid = "3" // Тестовый FID (Dan Romero)
    const url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${testFid}`

    console.log("📡 Making test request to:", url)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        api_key: apiKey,
      },
    })

    console.log("📡 Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Neynar API error:", errorText)

      return NextResponse.json({
        error: `Neynar API error: ${response.status}`,
        status: response.status,
        errorText,
        hasKey: true,
        keyLength: apiKey.length,
      })
    }

    const data = await response.json()
    console.log("✅ Neynar API test successful")

    return NextResponse.json({
      success: true,
      hasKey: true,
      keyLength: apiKey.length,
      testUser: data.users?.[0]?.username || "unknown",
      message: "Neynar API working correctly",
    })
  } catch (error: any) {
    console.error("❌ Test error:", error)
    return NextResponse.json({
      error: error.message,
      hasKey: !!process.env.NEYNAR_API_KEY,
    })
  }
}
