import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if DATABASE_URL is available
    const hasDbUrl = !!process.env.DATABASE_URL

    // Try to import and use the database
    const { sql } = await import("@/lib/db")

    // Test the connection
    const result = await sql`SELECT 1 as test`

    return NextResponse.json({
      success: true,
      hasDbUrl,
      testResult: result,
      message: "Database connection successful!",
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        hasDbUrl: !!process.env.DATABASE_URL,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
