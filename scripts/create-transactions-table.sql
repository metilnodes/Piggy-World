-- Создаём таблицу transactions если её нет
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  from_fid VARCHAR(255),
  to_fid VARCHAR(255), 
  amount NUMERIC NOT NULL,
  message_id VARCHAR(255),
  reason VARCHAR(255) DEFAULT 'transfer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создаём индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_transactions_from_fid ON transactions(from_fid);
CREATE INDEX IF NOT EXISTS idx_transactions_to_fid ON transactions(to_fid);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Проверяем что таблица создалась
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'transactions' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Показываем количество записей
SELECT COUNT(*) as total_transactions FROM transactions;
