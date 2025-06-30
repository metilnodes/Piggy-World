import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Получаем последние балансы
    const balances = await sql`
      SELECT fid, username, balance, updated_at 
      FROM user_balances 
      ORDER BY updated_at DESC 
      LIMIT 10
    `

    // Получаем последние транзакции
    const transactions = await sql`
      SELECT from_fid, to_fid, amount, reason, created_at 
      FROM transactions 
      WHERE reason = 'tip' 
      ORDER BY created_at DESC 
      LIMIT 10
    `

    return NextResponse.json({
      balances,
      transactions,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Debug tips error:", error)
    return NextResponse.json({ error: "Failed to debug tips" }, { status: 500 })
  }
}
