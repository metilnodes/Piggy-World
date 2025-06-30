import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { initializeDatabase } from "@/lib/init-db"

export async function GET() {
  try {
    console.log("🔍 Checking database tables...")

    await initializeDatabase()

    // Проверяем все таблицы
    const tables = await sql`
      SELECT 
        table_name,
        table_schema
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    // Проверяем структуру таблицы transactions
    const transactionsColumns = await sql`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'transactions' 
        AND table_schema = 'public'
      ORDER BY ordinal_position
    `

    // Проверяем количество записей в каждой таблице
    const tableCounts = {}
    for (const table of tables) {
      try {
        const count = await sql`SELECT COUNT(*) as count FROM ${sql(table.table_name)}`
        tableCounts[table.table_name] = count[0].count
      } catch (error) {
        tableCounts[table.table_name] = "Error: " + error.message
      }
    }

    return NextResponse.json({
      success: true,
      tables: tables,
      transactionsColumns: transactionsColumns,
      tableCounts: tableCounts,
      databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set",
    })
  } catch (error: any) {
    console.error("❌ Error checking tables:", error)
    return NextResponse.json(
      {
        error: error.message,
        success: false,
      },
      { status: 500 },
    )
  }
}
