import { getSql } from "./db"

export async function initializeDatabase() {
  try {
    console.log("🔍 Checking database connection...")

    // Проверяем наличие DATABASE_URL
    if (!process.env.DATABASE_URL) {
      console.error("❌ DATABASE_URL environment variable is not set")
      throw new Error("Database configuration missing")
    }

    // Get the SQL client
    let sql
    try {
      sql = getSql()
      console.log("✅ SQL client created successfully")
    } catch (error: any) {
      console.error("❌ Failed to get database connection:", error.message)
      throw new Error(`Database connection failed: ${error.message}`)
    }

    // Test connection with a simple query
    try {
      console.log("🔄 Testing database connection...")
      const result = await sql`SELECT 1 as connection_test`
      console.log("✅ Database connection successful:", result)

      // Check if required tables exist
      const tablesExist = await sql`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('user_balances', 'transactions', 'daily_checkins')
      `

      const tableCount = Number.parseInt(tablesExist[0].count)
      console.log(`📊 Found ${tableCount} required tables in database`)

      // Create tables if they don't exist
      if (tableCount < 3) {
        console.log("🔧 Creating missing tables...")
        await createRequiredTables(sql)
      }

      // Check and update table schemas
      await updateTableSchemas(sql)

      return true
    } catch (connectionError: any) {
      console.error("❌ Database connection test failed:", connectionError.message)
      throw new Error(`Database connection failed: ${connectionError.message}`)
    }
  } catch (error: any) {
    console.error("❌ Error during database initialization:", error.message)
    throw error
  }
}

async function createRequiredTables(sql: any) {
  try {
    // Create user_balances table
    await sql`
      CREATE TABLE IF NOT EXISTS user_balances (
        id SERIAL PRIMARY KEY,
        fid VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(255),
        balance NUMERIC DEFAULT 1000,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create transactions table with all required columns
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        from_fid VARCHAR(255),
        to_fid VARCHAR(255),
        amount NUMERIC NOT NULL,
        message_id VARCHAR(255),
        reason VARCHAR(255) DEFAULT 'transfer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create daily_checkins table
    await sql`
      CREATE TABLE IF NOT EXISTS daily_checkins (
        id SERIAL PRIMARY KEY,
        fid VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        reward_amount NUMERIC DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(fid, date)
      )
    `

    console.log("✅ All required tables created successfully")
  } catch (error: any) {
    console.error("❌ Error creating tables:", error.message)
    throw error
  }
}

async function updateTableSchemas(sql: any) {
  try {
    // Check if reason column exists in transactions table
    const reasonColumnExists = await sql`
      SELECT COUNT(*) as count
      FROM information_schema.columns 
      WHERE table_name = 'transactions' 
      AND column_name = 'reason'
      AND table_schema = 'public'
    `

    if (Number.parseInt(reasonColumnExists[0].count) === 0) {
      console.log("🔧 Adding missing 'reason' column to transactions table...")
      await sql`
        ALTER TABLE transactions 
        ADD COLUMN reason VARCHAR(255) DEFAULT 'transfer'
      `
      console.log("✅ Added 'reason' column to transactions table")
    }

    // Check if streak column exists in daily_checkins table
    const streakColumnExists = await sql`
      SELECT COUNT(*) as count
      FROM information_schema.columns 
      WHERE table_name = 'daily_checkins' 
      AND column_name = 'streak'
      AND table_schema = 'public'
    `

    if (Number.parseInt(streakColumnExists[0].count) === 0) {
      console.log("🔧 Adding missing 'streak' column to daily_checkins table...")
      await sql`
        ALTER TABLE daily_checkins 
        ADD COLUMN streak INTEGER DEFAULT 1
      `
      console.log("✅ Added 'streak' column to daily_checkins table")
    }

    // Check if reward column exists in daily_checkins table
    const rewardColumnExists = await sql`
      SELECT COUNT(*) as count
      FROM information_schema.columns 
      WHERE table_name = 'daily_checkins' 
      AND column_name = 'reward'
      AND table_schema = 'public'
    `

    if (Number.parseInt(rewardColumnExists[0].count) === 0) {
      console.log("🔧 Adding missing 'reward' column to daily_checkins table...")
      await sql`
        ALTER TABLE daily_checkins 
        ADD COLUMN reward INTEGER DEFAULT 10
      `
      console.log("✅ Added 'reward' column to daily_checkins table")
    }
  } catch (error: any) {
    console.error("❌ Error updating table schemas:", error.message)
    throw error
  }
}
