export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function GET() {
  try {
    // Get the SQL client
    const sql = getSql()

    // Check if we can connect to the database
    await sql`SELECT 1 as connection_test`

    // Initialize tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        fid TEXT NOT NULL,
        username TEXT NOT NULL,
        display_name TEXT,
        pfp_url TEXT,
        message TEXT NOT NULL,
        likes INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS message_likes (
        id SERIAL PRIMARY KEY,
        message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
        fid TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(message_id, fid)
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS user_balances (
        id SERIAL PRIMARY KEY,
        fid TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL,
        balance INTEGER DEFAULT 1000,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        from_fid TEXT NOT NULL,
        to_fid TEXT NOT NULL,
        amount INTEGER NOT NULL,
        message_id INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
    })
  } catch (error: any) {
    console.error("Error initializing database:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
