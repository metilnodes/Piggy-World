-- Fix transactions table schema by adding missing columns

-- Add reason column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='transactions' AND column_name='reason'
  ) THEN
    ALTER TABLE transactions ADD COLUMN reason VARCHAR(255) DEFAULT 'transfer';
    RAISE NOTICE 'Added reason column to transactions table';
  ELSE
    RAISE NOTICE 'Reason column already exists in transactions table';
  END IF;
END$$;

-- Update existing records to have default reason
UPDATE transactions SET reason = 'transfer' WHERE reason IS NULL;

-- Verify the table structure
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
ORDER BY ordinal_position;

-- Show sample data
SELECT id, from_fid, to_fid, amount, reason, created_at 
FROM transactions 
ORDER BY created_at DESC 
LIMIT 5;
