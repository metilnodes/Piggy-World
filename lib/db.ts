import { neon } from "@neondatabase/serverless"

// Функция с retry механизмом
const fetchWithRetry = async (url: string, options = {}, retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options)
      if (!res.ok) throw new Error(`Status ${res.status}`)
      return res
    } catch (err) {
      if (i === retries) throw err
      await new Promise((r) => setTimeout(r, 500)) // добавляем перед повтором
    }
  }
}

// Правильная интеграция с Neon
export function getSql() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set. Please check your Vercel settings.")
  }

  // Проверяем, что это действительно Neon URL
  if (!databaseUrl.includes("neon.tech")) {
    console.warn("⚠️ DATABASE_URL doesn't appear to be a Neon database URL")
  }

  console.log("🔗 Connecting to Neon database:", databaseUrl.replace(/:[^:@]*@/, ":***@"))

  return neon(databaseUrl)
}

// Для удобства экспортируем готовый экземпляр sql
export const sql = getSql()

// Helper function to format messages from the database
export function formatDbMessage(message: any) {
  // Добавляем проверку на null
  if (!message) {
    console.error("formatDbMessage received null message")
    return null
  }

  try {
    return {
      id: message.id?.toString() || "unknown",
      userId: message.fid || "unknown",
      username: message.username || "unknown",
      displayName: message.display_name || message.username || "Unknown User",
      pfp: message.pfp_url || null,
      message: message.message || "",
      timestamp: message.created_at || new Date().toISOString(),
      reactions: {
        likes: message.likes || 0,
        hasLiked: false,
      },
    }
  } catch (error) {
    console.error("Error formatting message:", error, message)
    return null
  }
}
