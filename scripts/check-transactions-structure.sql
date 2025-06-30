-- Проверяем структуру таблицы transactions
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
ORDER BY ordinal_position;

-- Показываем последние транзакции
SELECT * FROM transactions 
ORDER BY created_at DESC 
LIMIT 10;
