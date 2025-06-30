-- Проверяем существование таблицы transactions
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_name = 'transactions';

-- Проверяем структуру таблицы transactions (если она существует)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'transactions' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Показываем все таблицы в базе данных
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
