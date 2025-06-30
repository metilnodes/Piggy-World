import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fid = searchParams.get("fid")

    if (!fid) {
      return NextResponse.json({ error: "Missing fid parameter" }, { status: 400 })
    }

    console.log(`🔍 Neynar API request for FID: ${fid}`)
    // Проверяем наличие API ключа
    const apiKey = process.env.NEYNAR_API_KEY
    console.log(`🔑 API Key available: ${!!apiKey}`)
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`)

    console.log(`🔍 Fetching user data for FID: ${fid}`)

    if (!apiKey) {
      console.log("⚠️ NEYNAR_API_KEY not found, returning demo data")
      return NextResponse.json({
        users: [
          {
            fid: Number.parseInt(fid),
            username: `demo_user_${fid}`,
            display_name: `Demo User ${fid}`,
            pfp_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fid}`,
            bio: `Demo user with FID ${fid}`,
            follower_count: Math.floor(Math.random() * 1000),
            following_count: Math.floor(Math.random() * 500),
          },
        ],
      })
    }

    // Используем правильный endpoint для Neynar API v2
    const url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`

    console.log("📡 Making request to Neynar API:", url)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 секунд таймаут

    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        api_key: apiKey,
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    console.log("📡 Neynar API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Neynar API error: ${response.status} ${response.statusText}`)
      console.error("Error response:", errorText)

      // Возвращаем демо данные для любой ошибки API
      return NextResponse.json({
        users: [
          {
            fid: Number.parseInt(fid),
            username: `user_${fid}`,
            display_name: `User ${fid}`,
            pfp_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fid}`,
            bio: `User with FID ${fid}`,
            follower_count: Math.floor(Math.random() * 1000),
            following_count: Math.floor(Math.random() * 500),
          },
        ],
      })
    }

    const data = await response.json()
    console.log("✅ Neynar API response received")

    // Обрабатываем ответ от Neynar
    if (data.users && data.users.length > 0) {
      const user = data.users[0]

      const formattedUser = {
        fid: user.fid,
        username: user.username,
        display_name: user.display_name,
        pfp_url: user.pfp_url,
        bio: user.profile?.bio?.text || "",
        follower_count: user.follower_count || 0,
        following_count: user.following_count || 0,
      }

      console.log("✅ Returning formatted user data:", formattedUser)

      return NextResponse.json({
        users: [formattedUser],
      })
    } else {
      console.log("⚠️ No users found in Neynar response, returning demo data")

      // Возвращаем демо данные
      return NextResponse.json({
        users: [
          {
            fid: Number.parseInt(fid),
            username: `user_${fid}`,
            display_name: `User ${fid}`,
            pfp_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fid}`,
            bio: `User with FID ${fid}`,
            follower_count: Math.floor(Math.random() * 1000),
            following_count: Math.floor(Math.random() * 500),
          },
        ],
      })
    }
  } catch (error: any) {
    console.error("❌ Error in Neynar API route:", error)

    // В случае любой ошибки возвращаем демо данные
    const fid = new URL(request.url).searchParams.get("fid")
    return NextResponse.json({
      users: [
        {
          fid: Number.parseInt(fid || "0"),
          username: `error_user_${fid}`,
          display_name: `Error User ${fid}`,
          pfp_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fid}`,
          bio: `Error loading user with FID ${fid}`,
          follower_count: 0,
          following_count: 0,
        },
      ],
    })
  }
}
