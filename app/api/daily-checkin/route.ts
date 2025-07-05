export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// Функция для получения текущей даты в GMT
function getCurrentGMTDate(): string {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, "0")
  const day = String(now.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// Функция для получения вчерашней даты в GMT
function getYesterdayGMTDate(): string {
  const yesterday = new Date()
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  const year = yesterday.getUTCFullYear()
  const month = String(yesterday.getUTCMonth() + 1).padStart(2, "0")
  const day = String(yesterday.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// Функция для получения даты N дней назад
function getDateNDaysAgo(days: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - days)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// Функция для расчета текущего streak-а
async function calculateCurrentStreak(fid: string): Promise<{ streak: number; streakDates: string[] }> {
  try {
    // Получаем все check-ins пользователя, отсортированные по дате (по убыванию)
    const allCheckins = await sql`
      SELECT checkin_date FROM daily_checkins 
      WHERE fid = ${fid} 
      ORDER BY checkin_date DESC
    `

    if (allCheckins.length === 0) {
      return { streak: 0, streakDates: [] }
    }

    const today = getCurrentGMTDate()
    const yesterday = getYesterdayGMTDate()

    // Преобразуем даты в строки для сравнения
    const checkinDates = allCheckins.map((row) => {
      const date = new Date(row.checkin_date)
      const year = date.getUTCFullYear()
      const month = String(date.getUTCMonth() + 1).padStart(2, "0")
      const day = String(date.getUTCDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    })

    console.log("📊 All checkin dates:", checkinDates)
    console.log("📅 Today:", today, "Yesterday:", yesterday)

    let streak = 0
    const streakDates: string[] = []

    // Начинаем с сегодняшнего дня или вчерашнего
    const currentDate = checkinDates.includes(today) ? today : yesterday

    // Если нет check-in ни сегодня, ни вчера - streak = 0
    if (!checkinDates.includes(currentDate)) {
      return { streak: 0, streakDates: [] }
    }

    // Считаем streak назад от текущей даты
    let dayOffset = 0
    while (true) {
      const checkDate = getDateNDaysAgo(dayOffset)

      if (checkinDates.includes(checkDate)) {
        streak++
        streakDates.push(checkDate)
        dayOffset++
      } else {
        break
      }
    }

    console.log("🔥 Calculated streak:", streak, "Streak dates:", streakDates)

    return { streak, streakDates: streakDates.reverse() } // Возвращаем в хронологическом порядке
  } catch (error) {
    console.error("❌ Error calculating streak:", error)
    return { streak: 0, streakDates: [] }
  }
}

// Инициализация и проверка схемы таблиц
async function ensureTablesExist() {
  try {
    console.log("🔧 Ensuring database schema is correct...")

    // Создаем базовую таблицу daily_checkins если её нет
    await sql`
      CREATE TABLE IF NOT EXISTS daily_checkins (
        id SERIAL PRIMARY KEY,
        fid TEXT NOT NULL,
        username TEXT NOT NULL,
        checkin_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(fid, checkin_date)
      )
    `

    // Создаем таблицу user_balances если её нет
    await sql`
      CREATE TABLE IF NOT EXISTS user_balances (
        id SERIAL PRIMARY KEY,
        fid TEXT UNIQUE NOT NULL,
        username TEXT NOT NULL,
        balance INTEGER DEFAULT 1000,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Добавляем недостающие колонки в daily_checkins
    try {
      await sql`ALTER TABLE daily_checkins ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 1`
      console.log("✅ Added streak column")
    } catch (error) {
      console.log("ℹ️ Streak column already exists or error:", error)
    }

    try {
      await sql`ALTER TABLE daily_checkins ADD COLUMN IF NOT EXISTS reward INTEGER DEFAULT 10`
      console.log("✅ Added reward column")
    } catch (error) {
      console.log("ℹ️ Reward column already exists or error:", error)
    }

    // Обновляем NULL значения
    await sql`UPDATE daily_checkins SET streak = 1 WHERE streak IS NULL`
    await sql`UPDATE daily_checkins SET reward = 10 WHERE reward IS NULL`

    console.log("✅ Database schema verified and updated")
  } catch (error) {
    console.error("❌ Error ensuring tables exist:", error)
    throw error
  }
}

// GET - получить статус daily check-in
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fid = searchParams.get("fid")

    if (!fid) {
      return NextResponse.json({ error: "Missing fid parameter" }, { status: 400 })
    }

    console.log(`📅 GET /api/daily-checkin: Getting status for FID ${fid}`)

    await ensureTablesExist()

    const today = getCurrentGMTDate()

    // Проверяем check-in сегодня
    const todayCheckin = await sql`
      SELECT * FROM daily_checkins 
      WHERE fid = ${fid} AND checkin_date = ${today}
    `

    // Рассчитываем текущий streak
    const { streak: currentStreak, streakDates } = await calculateCurrentStreak(fid)

    // Получаем общее количество check-ins
    const totalCheckins = await sql`
      SELECT COUNT(*) as count FROM daily_checkins 
      WHERE fid = ${fid}
    `

    // Получаем последний check-in для информации
    const lastCheckin = await sql`
      SELECT checkin_date FROM daily_checkins 
      WHERE fid = ${fid} 
      ORDER BY checkin_date DESC 
      LIMIT 1
    `

    const hasCheckedInToday = todayCheckin.length > 0
    const totalCount = totalCheckins[0]?.count || 0
    const lastCheckInDate = lastCheckin.length > 0 ? lastCheckin[0].checkin_date : null

    console.log(`📊 Daily check-in status for ${fid}:`, {
      hasCheckedInToday,
      currentStreak,
      totalCount,
      lastCheckInDate,
      streakDates,
    })

    return NextResponse.json({
      hasCheckedInToday,
      currentStreak,
      totalCheckins: Number.parseInt(totalCount.toString()),
      lastCheckInDate,
      streakDates, // Добавляем массив дат streak-а
    })
  } catch (error: any) {
    console.error("❌ Error getting daily check-in status:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - выполнить daily check-in
export async function POST(request: NextRequest) {
  try {
    console.log("📅 POST /api/daily-checkin: Starting daily check-in process")

    const body = await request.json()
    const { fid, username } = body

    console.log("📅 Request data:", { fid, username })

    if (!fid || !username) {
      console.error("❌ Missing required fields:", { fid, username })
      return NextResponse.json({ error: "Missing required fields: fid, username" }, { status: 400 })
    }

    await ensureTablesExist()

    const today = getCurrentGMTDate()
    const reward = 10

    console.log(`📅 Processing check-in for ${username} (${fid}) on ${today}`)

    // РУЧНАЯ ТРАНЗАКЦИЯ для Neon Serverless
    try {
      // Начинаем транзакцию
      await sql`BEGIN`

      // 1. Проверяем, есть ли уже check-in сегодня
      const existingCheckin = await sql`
        SELECT * FROM daily_checkins 
        WHERE fid = ${fid} AND checkin_date = ${today}
      `

      if (existingCheckin.length > 0) {
        await sql`ROLLBACK`
        console.log("⚠️ Already checked in today")
        return NextResponse.json(
          {
            error: "Already checked in today",
            message: "You have already claimed your daily reward today. Come back tomorrow!",
          },
          { status: 400 },
        )
      }

      // 2. Рассчитываем новый streak ПЕРЕД добавлением сегодняшнего check-in
      const { streak: currentStreak } = await calculateCurrentStreak(fid)

      // Если есть текущий streak и последний check-in был вчера, увеличиваем на 1
      // Если нет streak или был перерыв, начинаем с 1
      const yesterday = getYesterdayGMTDate()
      const lastCheckin = await sql`
        SELECT checkin_date FROM daily_checkins 
        WHERE fid = ${fid} AND checkin_date = ${yesterday}
      `

      const newStreak = currentStreak > 0 && lastCheckin.length > 0 ? currentStreak + 1 : 1

      console.log(`📈 Current streak: ${currentStreak}, New streak: ${newStreak}`)

      // 3. Вставляем новый check-in с правильным streak
      const checkinResult = await sql`
        INSERT INTO daily_checkins (fid, username, checkin_date, streak, reward, created_at)
        VALUES (${fid}, ${username}, ${today}, ${newStreak}, ${reward}, CURRENT_TIMESTAMP)
        RETURNING id, fid, username, checkin_date, streak, reward
      `

      if (checkinResult.length === 0) {
        await sql`ROLLBACK`
        throw new Error("Failed to create check-in record")
      }

      console.log("✅ Check-in record created:", checkinResult[0])

      // 4. Обновляем или создаем баланс пользователя
      const existingUser = await sql`
        SELECT balance FROM user_balances WHERE fid = ${fid}
      `

      let newBalance
      if (existingUser.length > 0) {
        // Обновляем баланс существующего пользователя
        const balanceResult = await sql`
          UPDATE user_balances 
          SET balance = balance + ${reward}, updated_at = CURRENT_TIMESTAMP
          WHERE fid = ${fid}
          RETURNING balance
        `

        if (balanceResult.length === 0) {
          await sql`ROLLBACK`
          throw new Error("Failed to update user balance")
        }

        newBalance = balanceResult[0]?.balance
        console.log(`💰 Updated existing user balance: ${newBalance}`)
      } else {
        // Создаем нового пользователя с начальным балансом + reward
        const newUserResult = await sql`
          INSERT INTO user_balances (fid, username, balance, created_at, updated_at)
          VALUES (${fid}, ${username}, ${1000 + reward}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING balance
        `

        if (newUserResult.length === 0) {
          await sql`ROLLBACK`
          throw new Error("Failed to create user balance")
        }

        newBalance = newUserResult[0]?.balance
        console.log(`👤 Created new user with balance: ${newBalance}`)
      }

      // Подтверждаем транзакцию
      await sql`COMMIT`

      // 5. Рассчитываем обновленные streak данные для ответа
      const { streak: updatedStreak, streakDates } = await calculateCurrentStreak(fid)

      console.log(`✅ Daily check-in transaction completed successfully`)

      return NextResponse.json({
        success: true,
        reward: reward,
        streak: updatedStreak,
        streakDates, // Добавляем массив дат streak-а
        date: today,
        message: `Daily check-in successful! +${reward} OINK (Day ${updatedStreak})`,
      })
    } catch (txError: any) {
      // Откатываем транзакцию в случае ошибки
      try {
        await sql`ROLLBACK`
      } catch (rollbackError) {
        console.error("❌ Rollback error:", rollbackError)
      }

      console.error("❌ Transaction error:", txError)
      throw txError
    }
  } catch (error: any) {
    console.error("❌ Error in daily-checkin:", error)
    console.error("❌ Error stack:", error.stack)

    return NextResponse.json(
      {
        error: error.message || "Daily check-in failed",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
