import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 })
    }

    console.log(`🔍 Checking balance for username: ${username}`)

    // Ищем пользователя по username
    const users = await sql`
      SELECT fid, username, balance, created_at, updated_at 
      FROM user_balances 
      WHERE username ILIKE ${username}
      ORDER BY updated_at DESC
    `

    // Сначала проверим структуру таблицы transactions
    const tableStructure = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'transactions' 
      ORDER BY ordinal_position
    `

    // Получаем все транзакции (пока без фильтра по получателю)
    const allTransactions = await sql`
      SELECT * FROM transactions 
      ORDER BY created_at DESC 
      LIMIT 20
    `

    return NextResponse.json({
      success: true,
      username,
      found: users.length > 0,
      user: users[0] || null,
      allMatches: users,
      tableStructure,
      allTransactions,
      message:
        users.length > 0
          ? `Found user ${username} with balance: ${users[0].balance} OINK`
          : `User ${username} not found in database`,
    })
  } catch (error) {
    console.error("Error checking user balance:", error)
    return NextResponse.json(
      {
        error: "Failed to check balance",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
