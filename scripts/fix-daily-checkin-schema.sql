-- ✅ Ensure 'daily_checkins' table has all required columns

DO $$
BEGIN
  -- Add 'streak' column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='daily_checkins' AND column_name='streak'
  ) THEN
    ALTER TABLE daily_checkins ADD COLUMN streak INTEGER DEFAULT 1;
  END IF;

  -- Add 'reward' column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='daily_checkins' AND column_name='reward'
  ) THEN
    ALTER TABLE daily_checkins ADD COLUMN reward INTEGER DEFAULT 10;
  END IF;
END$$;

-- ✅ Ensure 'user_balances' table exists and has all required columns

CREATE TABLE IF NOT EXISTS user_balances (
  id SERIAL PRIMARY KEY,
  fid TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  balance INTEGER DEFAULT 1000,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ✅ Ensure 'daily_checkins' table exists with required base structure

CREATE TABLE IF NOT EXISTS daily_checkins (
  id SERIAL PRIMARY KEY,
  fid TEXT NOT NULL,
  username TEXT NOT NULL,
  checkin_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(fid, checkin_date)
);

-- ✅ Update existing records to have default values
UPDATE daily_checkins SET streak = 1 WHERE streak IS NULL;
UPDATE daily_checkins SET reward = 10 WHERE reward IS NULL;

-- ✅ Verify table structure
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'daily_checkins' 
ORDER BY ordinal_position;
