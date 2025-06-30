export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { initializeDatabase } from "@/lib/init-db"

export async function POST(request: NextRequest) {
  try {
    console.log("💸 POST /api/send-tip: Starting tip transaction")
    await initializeDatabase()

    const body = await request.json()
    const { fromFid, fromUsername, toFid, toUsername, amount } = body
    const tipAmount = Number(amount)

    console.log(`💸 Tip request: ${tipAmount} OINK from ${fromUsername} (${fromFid}) to ${toUsername} (${toFid})`)

    // Валидация входных данных
    if (!fromFid || !fromUsername || !toFid || !toUsername || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: fromFid, fromUsername, toFid, toUsername, amount" },
        { status: 400 },
      )
    }

    if (tipAmount <= 0 || isNaN(tipAmount)) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 })
    }

    // Проверяем, что отправитель не гость
    if (fromFid.startsWith("guest_")) {
      return NextResponse.json({ error: "Guest users cannot send tips" }, { status: 403 })
    }

    // Проверяем, что получатель не гость
    if (toFid.startsWith("guest_")) {
      return NextResponse.json({ error: "Cannot send tips to guest users" }, { status: 400 })
    }

    // Проверка баланса отправителя (только по FID)
    const senderResult = await sql`
      SELECT balance, username FROM user_balances WHERE fid = ${fromFid}
    `

    if (senderResult.length === 0) {
      return NextResponse.json({ error: "Sender not found in database" }, { status: 404 })
    }

    const senderBalance = Number(senderResult[0]?.balance) || 0

    if (senderBalance < tipAmount) {
      console.log(`❌ Insufficient balance: ${senderBalance} < ${tipAmount}`)
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    // НАЧИНАЕМ ТРАНЗАКЦИЮ
    await sql`BEGIN`

    try {
      // Списываем баланс у отправителя (только по FID)
      await sql`
        UPDATE user_balances 
        SET balance = balance - ${tipAmount}, updated_at = CURRENT_TIMESTAMP
        WHERE fid = ${fromFid}
      `

      console.log(`✅ Deducted ${tipAmount} OINK from ${fromUsername} (${fromFid})`)

      // Проверяем, есть ли получатель в базе (только по FID)
      const existingRecipient = await sql`
        SELECT fid, balance, username FROM user_balances 
        WHERE fid = ${toFid}
      `

      if (existingRecipient.length === 0) {
        // Создаем нового получателя с реальными данными
        await sql`
          INSERT INTO user_balances (fid, username, balance, created_at, updated_at)
          VALUES (${toFid}, ${toUsername}, ${tipAmount}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `
        console.log(`✅ Created new recipient ${toUsername} (${toFid}) with ${tipAmount} OINK`)
      } else {
        // Обновляем существующего получателя (только по FID)
        const oldBalance = Number(existingRecipient[0].balance) || 0
        await sql`
          UPDATE user_balances
          SET balance = balance + ${tipAmount}, updated_at = CURRENT_TIMESTAMP
          WHERE fid = ${toFid}
        `
        console.log(`✅ Updated ${toUsername} balance: ${oldBalance} -> ${oldBalance + tipAmount}`)
      }

      // Логируем транзакцию с реальными FID
      await sql`
        INSERT INTO transactions (from_fid, to_fid, amount, reason, created_at)
        VALUES (${fromFid}, ${toFid}, ${tipAmount}, 'tip', CURRENT_TIMESTAMP)
      `

      // КОММИТИМ ТРАНЗАКЦИЮ
      await sql`COMMIT`

      console.log(`✅ Transaction completed: ${fromFid} -> ${toFid}, amount: ${tipAmount}`)

      return NextResponse.json({
        success: true,
        message: "Tip sent successfully",
        tipAmount,
        from: fromUsername,
        to: toUsername,
        fromFid,
        toFid,
      })
    } catch (error) {
      // ОТКАТЫВАЕМ ТРАНЗАКЦИЮ В СЛУЧАЕ ОШИБКИ
      await sql`ROLLBACK`
      throw error
    }
  } catch (error: any) {
    console.error("❌ Send-tip error:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to send tip",
        details: error.toString(),
      },
      { status: 500 },
    )
  }
}
