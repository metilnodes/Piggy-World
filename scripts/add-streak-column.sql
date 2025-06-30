-- Добавляем колонку streak в таблицу daily_checkins
ALTER TABLE daily_checkins ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 1;

-- Проверяем структуру таблицы
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'daily_checkins' 
ORDER BY ordinal_position;

-- Обновляем существующие записи, если они есть (устанавливаем streak = 1 для всех существующих записей)
UPDATE daily_checkins SET streak = 1 WHERE streak IS NULL;

-- Проверяем данные
SELECT fid, username, checkin_date, streak, reward, created_at 
FROM daily_checkins 
ORDER BY created_at DESC 
LIMIT 10;
