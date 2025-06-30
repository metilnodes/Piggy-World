import { NextResponse } from "next/server"
import { resolveUsernameToFid } from "@/lib/client-neynar"

export async function GET() {
  try {
    console.log("🧪 Testing resolve username functionality...")

    // Test with a known username
    const testUsername = "misclick"
    const fid = await resolveUsernameToFid(testUsername)

    return NextResponse.json({
      success: true,
      test: {
        username: testUsername,
        fid: fid,
        timestamp: new Date().toISOString(),
      },
      message: fid ? "Username resolution working!" : "Username not found",
    })
  } catch (error: any) {
    console.error("❌ Test resolve error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
