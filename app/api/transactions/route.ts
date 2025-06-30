export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
// Add import for database initialization
import { initializeDatabase } from "@/lib/init-db"

export async function POST(request: NextRequest) {
  try {
    // Initialize database tables if they don't exist
    await initializeDatabase()

    const body = await request.json()
    const { fromFid, toUsername, amount, messageId } = body

    // Валидация входных данных
    if (!fromFid || !toUsername || !amount || amount <= 0) {
      return NextResponse.json({ error: "Missing required fields or invalid amount" }, { status: 400 })
    }

    // Начинаем транзакцию
    await sql`BEGIN`

    try {
      // Оптимизированный запрос - получаем получателя и отправителя одним запросом
      const [recipientResult, senderResult] = await Promise.all([
        sql`
          SELECT fid FROM messages 
          WHERE username = ${toUsername} 
          LIMIT 1
        `,
        sql`
          SELECT balance, username FROM user_balances 
          WHERE fid = ${fromFid}
        `,
      ])

      if (recipientResult.length === 0) {
        await sql`ROLLBACK`
        return NextResponse.json({ error: "Recipient not found" }, { status: 404 })
      }

      const toFid = recipientResult[0].fid

      // Проверяем, что отправитель не пытается отправить монеты самому себе
      if (fromFid === toFid) {
        await sql`ROLLBACK`
        return NextResponse.json({ error: "Cannot send coins to yourself" }, { status: 400 })
      }

      // Обрабатываем баланс отправителя
      let senderBalance = 1000 // Начальный баланс по умолчанию
      if (senderResult.length === 0) {
        // Создаем запись для отправителя
        const senderInfoResult = await sql`
          SELECT username FROM messages 
          WHERE fid = ${fromFid} 
          LIMIT 1
        `

        if (senderInfoResult.length === 0) {
          await sql`ROLLBACK`
          return NextResponse.json({ error: "Sender not found" }, { status: 404 })
        }

        await sql`
          INSERT INTO user_balances (fid, username, balance)
          VALUES (${fromFid}, ${senderInfoResult[0].username}, 1000)
        `
      } else {
        senderBalance = senderResult[0].balance
      }

      // Проверяем, достаточно ли средств
      if (senderBalance < amount) {
        await sql`ROLLBACK`
        return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
      }

      // Проверяем получателя и создаем если нужно
      const recipientBalanceResult = await sql`
        SELECT balance FROM user_balances 
        WHERE fid = ${toFid}
      `

      if (recipientBalanceResult.length === 0) {
        await sql`
          INSERT INTO user_balances (fid, username, balance)
          VALUES (${toFid}, ${toUsername}, 1000)
        `
      }

      // Обновляем балансы одним запросом
      await Promise.all([
        sql`
          UPDATE user_balances
          SET balance = balance - ${amount}, updated_at = CURRENT_TIMESTAMP
          WHERE fid = ${fromFid}
        `,
        sql`
          UPDATE user_balances
          SET balance = balance + ${amount}, updated_at = CURRENT_TIMESTAMP
          WHERE fid = ${toFid}
        `,
        sql`
          INSERT INTO transactions (from_fid, to_fid, amount, message_id)
          VALUES (${fromFid}, ${toFid}, ${amount}, ${messageId})
        `,
      ])

      // Фиксируем транзакцию
      await sql`COMMIT`

      // Получаем обновленный баланс отправителя
      const updatedSenderBalance = await sql`
        SELECT balance FROM user_balances WHERE fid = ${fromFid}
      `

      return NextResponse.json({
        success: true,
        transaction: {
          fromFid,
          toFid,
          toUsername,
          amount,
          senderBalance: updatedSenderBalance[0].balance,
        },
      })
    } catch (error) {
      // В случае ошибки откатываем транзакцию
      await sql`ROLLBACK`
      throw error
    }
  } catch (error) {
    console.error("Error processing transaction:", error)
    return NextResponse.json({ error: "Failed to process transaction" }, { status: 500 })
  }
}

// GET - Получение баланса пользователя
export async function GET(request: NextRequest) {
  try {
    // Initialize database tables if they don't exist
    await initializeDatabase()

    const { searchParams } = new URL(request.url)
    const fid = searchParams.get("fid")

    if (!fid) {
      return NextResponse.json({ error: "Missing required parameter: fid" }, { status: 400 })
    }

    // Проверяем, есть ли пользователь в таблице балансов
    const balanceResult = await sql`
      SELECT balance FROM user_balances 
      WHERE fid = ${fid}
    `

    if (balanceResult.length === 0) {
      // Если пользователя нет в таблице балансов, используем UPSERT для безопасного создания
      try {
        // Получаем имя пользователя из сообщений или используем fallback
        const userInfoResult = await sql`
          SELECT username FROM messages 
          WHERE fid = ${fid} 
          LIMIT 1
        `

        const username = userInfoResult.length > 0 ? userInfoResult[0].username : `user_${fid}`

        // Используем ON CONFLICT для безопасного создания записи
        await sql`
          INSERT INTO user_balances (fid, username, balance)
          VALUES (${fid}, ${username}, 1000)
          ON CONFLICT (fid) DO NOTHING
        `

        // Получаем баланс после вставки (может быть существующий, если была коллизия)
        const finalBalanceResult = await sql`
          SELECT balance FROM user_balances 
          WHERE fid = ${fid}
        `

        return NextResponse.json({ balance: finalBalanceResult[0]?.balance || 1000 })
      } catch (insertError) {
        console.error("Error creating user balance:", insertError)
        // Если не удалось создать запись, возвращаем дефолтный баланс
        return NextResponse.json({ balance: 1000 })
      }
    }

    return NextResponse.json({ balance: balanceResult[0].balance })
  } catch (error) {
    console.error("Error fetching balance:", error)
    return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 })
  }
}
