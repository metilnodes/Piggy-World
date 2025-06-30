import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Log all environment variables related to database (for debugging)
    const dbEnvVars = Object.entries(process.env)
      .filter(([key]) => key.includes("DATABASE") || key.includes("POSTGRES") || key.includes("PG"))
      .map(([key]) => key)

    console.log("Available database environment variables:", dbEnvVars)

    // Try a simple query to test the connection
    const result = await sql`SELECT 1 as test`

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      result: result,
      dbEnvVarsAvailable: dbEnvVars,
    })
  } catch (error: any) {
    console.error("Database connection error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
