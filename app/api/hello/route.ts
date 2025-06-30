import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "Hello from Piggy World API!",
    timestamp: new Date().toISOString(),
    status: "healthy",
  })
}
