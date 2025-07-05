// app/api/frame/route.ts

import { type NextRequest, NextResponse } from "next/server"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://piggyworld.xyz"

export async function GET() {
  // Теперь основной <meta name="fc:frame"> перенесён в app/page.tsx,
  // поэтому GET здесь может возвращать простой HTML без этого тега.
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Piggy World API Frame</title>
        <meta name="description" content="This endpoint is used for Farcaster POST requests only." />
      </head>
      <body>
        <h1>Piggy World API Frame</h1>
        <p>Use this endpoint for handling Farcaster frame POST callbacks.</p>
      </body>
    </html>
  `

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { untrustedData } = data
    const { fid, buttonIndex = 0 } = untrustedData || {}

    // Когда пользователь нажал кнопку внутри Farcaster превью
    if (buttonIndex === 1) {
      return NextResponse.json({
        type: "frame",
        frameUrl: `${BASE_URL}/?fid=${fid || ""}`,
      })
    }

    // По умолчанию возвращаем редирект на корень
    return NextResponse.json({
      type: "frame",
      frameUrl: BASE_URL,
    })
  } catch (error) {
    console.error("Frame error:", error)
    return NextResponse.json({
      type: "frame",
      frameUrl: BASE_URL,
    })
  }
}
