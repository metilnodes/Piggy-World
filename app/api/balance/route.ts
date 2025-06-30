export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { initializeDatabase } from "@/lib/init-db"

// GET handler: возвращает текущий баланс по fid
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 GET /api/balance: Starting request")
    await initializeDatabase()

    const { searchParams } = new URL(request.url)
    const fid = searchParams.get("fid")

    if (!fid) {
      console.log("❌ Missing fid parameter")
      return NextResponse.json({ error: "Missing fid parameter" }, { status: 400 })
    }

    console.log(`🔍 Fetching balance for fid=${fid}`)

    // Получаем баланс из базы данных по fid
    const balanceResult = await sql`
      SELECT balance FROM user_balances WHERE fid = ${fid}
    `

    let balance = balanceResult[0]?.balance || null

    // Если пользователя нет в базе, создаем с начальным балансом
    if (balance === null) {
      console.log(`👤 Creating new user with fid=${fid}`)
      const insertResult = await sql`
        INSERT INTO user_balances (fid, username, balance)
        VALUES (${fid}, ${"user_" + fid}, 1000)
        ON CONFLICT (fid) DO NOTHING
        RETURNING balance
      `
      balance = insertResult[0]?.balance || 1000
    }

    const numericBalance = Number(balance)
    console.log(`✅ Returning balance=${numericBalance} for fid=${fid}`)

    return NextResponse.json({ balance: numericBalance })
  } catch (error: any) {
    console.error("❌ Unexpected error in GET /api/balance:", error.message)
    return NextResponse.json(
      {
        balance: 1000,
        fallback: true,
        error: "Service temporarily unavailable",
      },
      { status: 500 },
    )
  }
}

// POST handler: обновляет баланс по fid
export async function POST(request: NextRequest) {
  try {
    console.log("🔄 POST /api/balance: Starting request")
    await initializeDatabase()

    const body = await request.json()
    const { fid, username, balanceChange, newBalance, reason } = body

    if (!fid) {
      return NextResponse.json({ error: "Missing fid parameter" }, { status: 400 })
    }

    if (balanceChange === undefined && newBalance === undefined) {
      return NextResponse.json({ error: "Missing balanceChange or newBalance parameter" }, { status: 400 })
    }

    console.log(
      `🔄 Updating balance: fid=${fid}, balanceChange=${balanceChange}, newBalance=${newBalance}, reason=${reason}`,
    )

    let updatedBalance: number

    if (newBalance !== undefined) {
      // Устанавливаем точное значение баланса по fid
      const result = await sql`
        INSERT INTO user_balances (fid, username, balance)
        VALUES (${fid}, ${username || "user_" + fid}, ${newBalance})
        ON CONFLICT (fid) 
        DO UPDATE SET 
          balance = ${newBalance},
          updated_at = CURRENT_TIMESTAMP
        RETURNING balance
      `
      updatedBalance = Number(result[0].balance)
    } else {
      // Добавляем/вычитаем из текущего баланса по fid
      const result = await sql`
        INSERT INTO user_balances (fid, username, balance)
        VALUES (${fid}, ${username || "user_" + fid}, ${1000 + balanceChange})
        ON CONFLICT (fid) 
        DO UPDATE SET 
          balance = GREATEST(0, user_balances.balance + ${balanceChange}),
          updated_at = CURRENT_TIMESTAMP
        RETURNING balance
      `
      updatedBalance = Number(result[0].balance)
    }

    console.log(`✅ Balance updated successfully: ${updatedBalance} for fid=${fid}`)

    return NextResponse.json({
      success: true,
      balance: updatedBalance,
      change: balanceChange || newBalance - 1000,
    })
  } catch (error: any) {
    console.error("❌ Unexpected error in POST /api/balance:", error.message)
    return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 500 })
  }
}
