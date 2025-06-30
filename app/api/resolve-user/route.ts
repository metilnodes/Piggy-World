import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ error: "Missing username parameter" }, { status: 400 })
    }

    // Redirect to the correct resolve-username endpoint
    const resolveResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "https://v0-eban9in.vercel.app"}/api/resolve-username`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      },
    )

    const data = await resolveResponse.json()
    return NextResponse.json(data, { status: resolveResponse.status })
  } catch (error: any) {
    console.error("❌ Error in resolve-user endpoint:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "resolve-user endpoint (redirects to resolve-username)",
    timestamp: new Date().toISOString(),
    note: "Use POST with {username: 'username'} in body",
  })
}
