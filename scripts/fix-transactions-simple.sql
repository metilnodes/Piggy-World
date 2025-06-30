-- Альтернативный простой скрипт для исправления таблицы transactions

-- Проверяем существование колонок и добавляем их
CREATE TABLE IF NOT EXISTS temp_transactions_check AS 
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'transactions';

-- Добавляем recipient_username если не существует
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'recipient_username') THEN
        EXECUTE 'ALTER TABLE transactions ADD COLUMN recipient_username VARCHAR(255)';
    END IF;
END $$;

-- Добавляем sender_username если не существует  
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'sender_username') THEN
        EXECUTE 'ALTER TABLE transactions ADD COLUMN sender_username VARCHAR(255)';
    END IF;
END $$;

-- Обновляем NULL значения
UPDATE transactions SET recipient_username = 'unknown' WHERE recipient_username IS NULL;
UPDATE transactions SET sender_username = 'unknown' WHERE sender_username IS NULL;

-- Очищаем временную таблицу
DROP TABLE IF EXISTS temp_transactions_check;
