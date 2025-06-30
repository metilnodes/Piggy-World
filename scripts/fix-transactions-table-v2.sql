-- Добавляем недостающие колонки в таблицу transactions
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS recipient_username VARCHAR(255),
ADD COLUMN IF NOT EXISTS sender_username VARCHAR(255),
ADD COLUMN IF NOT EXISTS tip_amount INTEGER DEFAULT 0;

-- Обновляем существующие записи (если есть данные в description)
UPDATE transactions 
SET 
  tip_amount = CASE 
    WHEN description LIKE '%tip%' THEN 
      CAST(REGEXP_REPLACE(description, '[^0-9]', '', 'g') AS INTEGER)
    ELSE amount 
  END,
  sender_username = CASE 
    WHEN description LIKE '%from %' THEN 
      SPLIT_PART(SPLIT_PART(description, 'from ', 2), ' ', 1)
    ELSE 'unknown'
  END,
  recipient_username = CASE 
    WHEN description LIKE '%to %' THEN 
      SPLIT_PART(SPLIT_PART(description, 'to ', 2), ' ', 1)
    ELSE 'unknown'
  END
WHERE recipient_username IS NULL;

-- Показываем результат
SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10;
