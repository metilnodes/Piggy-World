import { getSql } from "./db"

export async function withDatabase<T>(operation: (sql: any) => Promise<T>, fallback?: T): Promise<T> {
  try {
    const sql = getSql()
    return await operation(sql)
  } catch (error: any) {
    console.error("Database operation failed:", error.message)

    if (fallback !== undefined) {
      return fallback
    }

    throw error
  }
}

// Example usage:
// const messages = await withDatabase(
//   async (sql) => sql`SELECT * FROM messages`,
//   [] // fallback value if database fails
// )
