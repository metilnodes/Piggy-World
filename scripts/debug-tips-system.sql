-- Проверяем структуру таблицы user_balances
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_balances';

-- Проверяем все балансы пользователей
SELECT fid, username, balance, created_at, updated_at 
FROM user_balances 
ORDER BY updated_at DESC 
LIMIT 20;

-- Проверяем последние транзакции
SELECT from_fid, to_fid, amount, reason, created_at 
FROM transactions 
WHERE reason = 'tip' 
ORDER BY created_at DESC 
LIMIT 10;

-- Проверяем есть ли дублирующиеся пользователи
SELECT username, COUNT(*) as count 
FROM user_balances 
GROUP BY username 
HAVING COUNT(*) > 1;
