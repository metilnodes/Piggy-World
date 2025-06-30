export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { initializeDatabase } from "@/lib/init-db"

// Специальный API для операций с балансом (добавление/вычитание)
export async function POST(request: NextRequest) {
  try {
    await initializeDatabase()

    const body = await request.json()
    const { fid, username, operation, amount, reason } = body

    if (!fid || !username || !operation || amount === undefined) {
      return NextResponse.json(
        {
          error: "Missing required fields: fid, username, operation, amount",
        },
        { status: 400 },
      )
    }

    if (!["add", "subtract"].includes(operation)) {
      return NextResponse.json(
        {
          error: "Operation must be 'add' or 'subtract'",
        },
        { status: 400 },
      )
    }

    const changeAmount = operation === "add" ? Math.abs(amount) : -Math.abs(amount)

    // Используем UPSERT для безопасного обновления/создания баланса
    const result = await sql`
      INSERT INTO user_balances (fid, username, balance)
      VALUES (${fid}, ${username}, ${1000 + changeAmount})
      ON CONFLICT (fid) 
      DO UPDATE SET 
        balance = CASE 
          WHEN ${operation} = 'subtract' AND user_balances.balance < ${Math.abs(amount)} THEN user_balances.balance
          ELSE GREATEST(0, user_balances.balance + ${changeAmount})
        END,
        updated_at = CURRENT_TIMESTAMP
      RETURNING balance, (user_balances.balance >= ${Math.abs(amount)} OR ${operation} = 'add') as success
    `

    const { balance: newBalance, success } = result[0]

    if (!success && operation === "subtract") {
      return NextResponse.json(
        {
          error: "Insufficient balance",
          balance: newBalance,
        },
        { status: 400 },
      )
    }

    // Записываем транзакцию для истории
    if (reason && reason !== "sync") {
      await sql`
        INSERT INTO transactions (from_fid, to_fid, amount, message_id, reason)
        VALUES (${fid}, ${fid}, ${changeAmount}, null, ${reason})
      `
    }

    console.log(`✅ Balance ${operation}: ${amount}, new balance: ${newBalance}`)

    return NextResponse.json({
      success: true,
      balance: newBalance,
      operation,
      amount: Math.abs(amount),
    })
  } catch (error) {
    console.error("❌ Error in balance operation:", error)
    return NextResponse.json(
      {
        error: "Failed to process balance operation",
      },
      { status: 500 },
    )
  }
}
