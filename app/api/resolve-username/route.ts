import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { username } = await request.json()

  if (!username || typeof username !== "string") {
    return NextResponse.json({ error: "Missing or invalid username" }, { status: 400 })
  }

  const apiKey = process.env.NEYNAR_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Missing NEYNAR_API_KEY" }, { status: 500 })
  }

  try {
    console.log(`🔍 Searching for username: "${username}"`)

    const url = `https://api.neynar.com/v2/farcaster/user/search/?limit=10&q=${encodeURIComponent(username)}`
    console.log(`🔍 Request URL: ${url}`)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "x-neynar-experimental": "false",
      },
    })

    const data = await response.json()
    console.log("🔍 Neynar response:", JSON.stringify(data, null, 2))

    if (!response.ok) {
      console.error("❌ Neynar API error:", response.status, data)
      return NextResponse.json({ error: "Neynar API error", details: data }, { status: response.status })
    }

    // ✅ Правильная структура: data.result.users
    const users = data?.result?.users || []

    if (!users.length) {
      console.log("❌ No users found in search results")
      return NextResponse.json({ 
        error: "No users found in search results",
        searched_for: username,
        api_response: data 
      }, { status: 404 })
    }

    console.log(
      "🔍 Available users:",
      users.map((u: any) => `${u.username} (FID: ${u.fid})`),
    )

    // 🎯 Поиск точного совпадения
    const user = users.find((u: any) => {
      const apiUsername = u?.username?.toLowerCase()?.trim()
      const searchUsername = username.toLowerCase().trim()
      return apiUsername === searchUsername
    })

    if (!user || !user.fid) {
      console.log(`❌ Exact match not found for "${username}"`)
      return NextResponse.json({
        error: "User not found on Farcaster",
        searched_for: username,
        available_users: users.map((u: any) => u.username),
      }, { status: 404 })
    }

    console.log(`✅ Exact match found: "${user.username}" (FID: ${user.fid})`)

    return NextResponse.json({
      fid: user.fid,
      username: user.username,
      display_name: user.display_name,
      pfp_url: user.pfp_url,
      follower_count: user.follower_count,
      following_count: user.following_count,
      bio: user.profile?.bio?.text || "",
    })
  } catch (error: any) {
    console.error("❌ Failed to fetch from Neynar:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "resolve-username endpoint is live",
    hasKey: !!process.env.NEYNAR_API_KEY,
  })
}
