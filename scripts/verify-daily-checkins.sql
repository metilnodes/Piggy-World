-- Проверка структуры таблиц
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('daily_checkins', 'user_balances');

-- Проверка существующих check-ins
SELECT * FROM daily_checkins 
ORDER BY checkin_date DESC 
LIMIT 10;

-- Проверка балансов пользователей
SELECT * FROM user_balances 
ORDER BY updated_at DESC 
LIMIT 10;

-- Проверка streak для пользователей
SELECT fid, username, MAX(streak) as max_streak, COUNT(*) as total_checkins
FROM daily_checkins
GROUP BY fid, username
ORDER BY max_streak DESC;

-- Проверка последних check-ins по пользователям
SELECT fid, MAX(checkin_date) as last_checkin
FROM daily_checkins
GROUP BY fid
ORDER BY last_checkin DESC;
