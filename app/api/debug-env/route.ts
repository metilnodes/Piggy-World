import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    // Check all environment variables
    allEnvVars: Object.keys(process.env).sort(),

    // Check specific variables we need
    specificVars: {
      NEYNAR_API_KEY: process.env.NEYNAR_API_KEY ? "FOUND" : "NOT FOUND",
      NEXT_PUBLIC_DEV_MODE: process.env.NEXT_PUBLIC_DEV_MODE,
      NODE_ENV: process.env.NODE_ENV,
    },

    // Check if any Neynar-related vars exist
    neynarVars: Object.keys(process.env).filter((key) => key.toLowerCase().includes("neynar")),
  })
}
