// Добавляем указание runtime для API-маршрута
export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { initializeDatabase } from "@/lib/init-db"

// Простая защита от флуда - хранит время последнего запроса для каждого пользователя
const lastRequestTime: Record<string, number> = {}

// Кэш для API ответов
const apiCache: Record<string, { data: any; timestamp: number }> = {}
const CACHE_DURATION = 3000 // 3 секунды

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fid = searchParams.get("fid") || ""
    const limit = Number.parseInt(searchParams.get("limit") || "30") // Уменьшаем лимит по умолчанию
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Создаем ключ для кэша
    const cacheKey = `messages_${fid}_${limit}_${offset}`
    const now = Date.now()

    // Проверяем кэш
    if (apiCache[cacheKey] && now - apiCache[cacheKey].timestamp < CACHE_DURATION) {
      return NextResponse.json(apiCache[cacheKey].data)
    }

    // Rate limiting (более мягкий)
    const clientIp = request.headers.get("x-forwarded-for") || "unknown"
    const requesterId = fid || clientIp
    const lastRequest = lastRequestTime[requesterId] || 0

    if (now - lastRequest < 1000) {
      // 1 секунда между запросами
      // Возвращаем кэшированные данные если есть
      if (apiCache[cacheKey]) {
        return NextResponse.json(apiCache[cacheKey].data)
      }
    }

    lastRequestTime[requesterId] = now

    // Initialize database tables if they don't exist
    const dbInitialized = await initializeDatabase()
    if (!dbInitialized) {
      return NextResponse.json({
        messages: [],
        error: "Database connection failed. Please try again later.",
      })
    }

    // Оптимизированный запрос - получаем только нужные поля
    const messagesResult = await sql`
      SELECT 
        m.id,
        m.fid,
        m.username,
        m.display_name,
        m.pfp_url,
        m.message,
        m.created_at,
        m.likes,
        CASE WHEN ml.id IS NOT NULL THEN true ELSE false END as has_liked
      FROM messages m
      LEFT JOIN message_likes ml ON m.id = ml.message_id AND ml.fid = ${fid || "none"}
      WHERE m.fid != 'system'
      ORDER BY m.created_at DESC
      LIMIT ${Math.min(limit, 50)} OFFSET ${offset}
    `

    // Быстрое форматирование сообщений
    const messages = messagesResult
      .map((msg: any) => ({
        id: msg.id?.toString() || "unknown",
        userId: msg.fid || "unknown",
        username: msg.username || "unknown",
        displayName: msg.display_name || msg.username || "Unknown User",
        pfp: msg.pfp_url || null,
        message: msg.message || "",
        timestamp: msg.created_at || new Date().toISOString(),
        reactions: {
          likes: msg.likes || 0,
          hasLiked: msg.has_liked || false,
        },
      }))
      .filter((msg) => msg.message && msg.username)

    const responseData = { messages: messages.reverse() }

    // Сохраняем в кэш
    apiCache[cacheKey] = {
      data: responseData,
      timestamp: now,
    }

    // Очищаем старые записи из кэша
    Object.keys(apiCache).forEach((key) => {
      if (now - apiCache[key].timestamp > CACHE_DURATION * 2) {
        delete apiCache[key]
      }
    })

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error fetching messages:", error)

    // Более детальная обработка ошибок
    if (error.message?.includes("timed out") || error.message?.includes("ECONNRESET")) {
      return NextResponse.json(
        {
          messages: [],
          error: "Database temporarily unavailable, retrying...",
          retry: true,
        },
        { status: 200 },
      )
    }

    return NextResponse.json(
      {
        messages: [],
        error: "Failed to fetch messages. Please refresh.",
        retry: false,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Initialize database tables if they don't exist
    const dbInitialized = await initializeDatabase()
    if (!dbInitialized) {
      return NextResponse.json(
        {
          error: "Database connection failed. Please try again later.",
        },
        { status: 500 },
      )
    }

    const body = await request.json()
    const { fid, username, displayName, pfpUrl, message } = body

    // Validate required fields
    if (!fid || !username || !message) {
      return NextResponse.json({ error: "Missing required fields: fid, username, message" }, { status: 400 })
    }

    // Очищаем кэш при добавлении нового сообщения
    Object.keys(apiCache).forEach((key) => {
      if (key.startsWith("messages_")) {
        delete apiCache[key]
      }
    })

    // Insert message into database
    const result = await sql`
      INSERT INTO messages (fid, username, display_name, pfp_url, message)
      VALUES (${fid}, ${username}, ${displayName || null}, ${pfpUrl || null}, ${message})
      RETURNING id, fid, username, display_name, pfp_url, message, created_at, likes
    `

    const newMessage = {
      id: result[0].id?.toString() || "unknown",
      userId: result[0].fid || "unknown",
      username: result[0].username || "unknown",
      displayName: result[0].display_name || result[0].username || "Unknown User",
      pfp: result[0].pfp_url || null,
      message: result[0].message || "",
      timestamp: result[0].created_at || new Date().toISOString(),
      reactions: {
        likes: result[0].likes || 0,
        hasLiked: false,
      },
    }

    return NextResponse.json({ message: newMessage })
  } catch (error) {
    console.error("Error posting message:", error)
    return NextResponse.json({ error: "Failed to post message. Database connection issue." }, { status: 500 })
  }
}
