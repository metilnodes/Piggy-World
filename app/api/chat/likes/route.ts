// Добавляем указание runtime для API-маршрута
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
    const { messageId, fid, action } = body

    // Validate required fields
    if (!messageId || !fid || !action) {
      return NextResponse.json({ error: "Missing required fields: messageId, fid, action" }, { status: 400 })
    }

    if (action === "like") {
      // Check if like already exists
      const existingLike = await sql`
        SELECT id FROM message_likes 
        WHERE message_id = ${messageId} AND fid = ${fid}
      `

      if (existingLike.length === 0) {
        // Insert new like
        await sql`
          INSERT INTO message_likes (message_id, fid)
          VALUES (${messageId}, ${fid})
        `

        // Update the likes count
        await sql`
          UPDATE messages
          SET likes = likes + 1
          WHERE id = ${messageId}
        `
      }
    } else if (action === "unlike") {
      // Delete the like
      const deleteResult = await sql`
        DELETE FROM message_likes
        WHERE message_id = ${messageId} AND fid = ${fid}
        RETURNING id
      `

      // Only decrease count if a like was actually deleted
      if (deleteResult.length > 0) {
        await sql`
          UPDATE messages
          SET likes = GREATEST(likes - 1, 0)
          WHERE id = ${messageId}
        `
      }
    }

    // Get the updated like count
    const result = await sql`
      SELECT likes FROM messages WHERE id = ${messageId}
    `

    return NextResponse.json({
      likes: result[0]?.likes || 0,
      messageId,
    })
  } catch (error) {
    console.error("Error handling like:", error)
    return NextResponse.json({ error: "Failed to process like" }, { status: 500 })
  }
}
