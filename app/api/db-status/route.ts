export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function GET() {
  try {
    const sql = getSql()

    // Test connection
    const connectionTest = await sql`SELECT 1 as test`

    // Initialize database tables if they don't exist
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/db-init`)

    // Get table counts
    const messageCount = await sql`SELECT COUNT(*) as count FROM messages`
    const userCount = await sql`SELECT COUNT(DISTINCT fid) as count FROM user_balances`
    const likeCount = await sql`SELECT COUNT(*) as count FROM message_likes`
    const transactionCount = await sql`SELECT COUNT(*) as count FROM transactions`

    return NextResponse.json({
      status: "connected",
      database: "Neon PostgreSQL",
      tables: {
        messages: messageCount[0].count,
        users: userCount[0].count,
        likes: likeCount[0].count,
        transactions: transactionCount[0].count,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
