-- Простая версия скрипта для исправления таблицы transactions
-- Добавляем недостающие колонки если их нет

-- Добавляем recipient_username
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recipient_username VARCHAR(255);

-- Добавляем sender_username  
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS sender_username VARCHAR(255);

-- Обновляем существующие записи с NULL значениями
UPDATE transactions 
SET recipient_username = 'unknown' 
WHERE recipient_username IS NULL;

UPDATE transactions 
SET sender_username = 'unknown' 
WHERE sender_username IS NULL;

-- Проверяем финальную структуру таблицы
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
ORDER BY ordinal_position;
