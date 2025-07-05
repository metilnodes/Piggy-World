import { type NextRequest, NextResponse } from "next/server"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://piggyworld.xyz"

export async function GET() {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>OINK World Frame</title>
        <meta property="og:title" content="OINK World" />
        <meta property="og:description" content="Enter the world of Piggy" />
        <meta property="og:image" content="${BASE_URL}/og.jpg" />
        
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${BASE_URL}/og.jpg" />
        <meta property="fc:frame:button:1" content="Open Piggy World" />
        <meta property="fc:frame:button:1:action" content="post_redirect" />
        <meta property="fc:frame:button:1:target" content="${BASE_URL}" />

        <meta property="fc:frame:embed" content='{
          "appId": "0P-ysyDsD4fn",
          "url": "${BASE_URL}",
          "version": "vNext"
        }' />
      </head>
      <body>
        <h1>OINK World Frame</h1>
        <p>You're being redirected... or click the button above 👆</p>
      </body>
    </html>
  `

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
    },
  })
}
