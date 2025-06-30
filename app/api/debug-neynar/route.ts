import { NextResponse } from "next/server"

export async function GET() {
  const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY

  return NextResponse.json({
    hasNeynarKey: !!NEYNAR_API_KEY,
    keyLength: NEYNAR_API_KEY?.length || 0,
    keyPreview: NEYNAR_API_KEY ? `${NEYNAR_API_KEY.slice(0, 8)}...` : "NOT_FOUND",
    allEnvKeys: Object.keys(process.env).filter((key) => key.includes("NEYNAR") || key.includes("API")),
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  })
}
