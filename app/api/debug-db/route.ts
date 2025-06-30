// Добавляем указание runtime для API-маршрута
export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function GET() {
  try {
    // Проверяем наличие переменной окружения
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          error: "DATABASE_URL is not set",
          hint: "Add DATABASE_URL to your Vercel environment variables",
        },
        { status: 500 },
      )
    }

    // Тестируем создание клиента Neon
    let sql
    try {
      sql = getSql()
      console.log("Neon client created successfully")
    } catch (error: any) {
      return NextResponse.json(
        {
          error: "Failed to create neon client",
          details: error.message,
        },
        { status: 500 },
      )
    }

    // Тестируем использование клиента
    try {
      const result = await sql`SELECT 1 as test`
      return NextResponse.json({
        success: true,
        message: "Database connection successful",
        result: result[0],
      })
    } catch (error: any) {
      return NextResponse.json(
        {
          error: "Failed to execute query",
          details: error.message,
          hint: "Make sure to use template literals: sql`SELECT ...`",
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Unexpected error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
