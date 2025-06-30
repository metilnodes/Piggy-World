import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    console.log("🧪 Testing Neon database connection...")

    // Проверяем переменные окружения
    const dbUrl = process.env.DATABASE_URL
    const postgresUrl = process.env.POSTGRES_URL

    console.log("Environment variables check:")
    console.log("- DATABASE_URL exists:", !!dbUrl)
    console.log("- POSTGRES_URL exists:", !!postgresUrl)
    console.log("- DATABASE_URL format:", dbUrl?.includes("neon.tech") ? "Neon format ✅" : "Not Neon format ❌")

    // Тестируем подключение
    const connectionTest = await sql`SELECT 
      version() as postgres_version,
      current_database() as database_name,
      current_user as user_name,
      inet_server_addr() as server_ip,
      current_timestamp as server_time
    `

    // Проверяем существующие таблицы
    const tables = await sql`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    // Проверяем структуру таблицы transactions
    const transactionsColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'transactions' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `

    return NextResponse.json({
      success: true,
      message: "Neon database connection successful",
      environment: {
        hasDatabaseUrl: !!dbUrl,
        hasPostgresUrl: !!postgresUrl,
        isNeonFormat: dbUrl?.includes("neon.tech"),
        databaseUrlMasked: dbUrl?.replace(/:[^:@]*@/, ":***@"),
      },
      connection: connectionTest[0],
      tables: tables.map((t) => ({ name: t.table_name, type: t.table_type })),
      transactionsSchema: transactionsColumns.map((c) => ({
        name: c.column_name,
        type: c.data_type,
        nullable: c.is_nullable,
        default: c.column_default,
      })),
    })
  } catch (error: any) {
    console.error("❌ Neon database test failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
        environment: {
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          hasPostgresUrl: !!process.env.POSTGRES_URL,
          isNeonFormat: process.env.DATABASE_URL?.includes("neon.tech"),
        },
      },
      { status: 500 },
    )
  }
}
