-- Создание таблицы daily_checkins если её нет
CREATE TABLE IF NOT EXISTS daily_checkins (
  id SERIAL PRIMARY KEY,
  fid TEXT NOT NULL,
  username TEXT NOT NULL,
  checkin_date DATE NOT NULL,
  streak INTEGER DEFAULT 1,
  reward INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(fid, checkin_date)
);

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_daily_checkins_fid ON daily_checkins(fid);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_date ON daily_checkins(checkin_date);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_fid_date ON daily_checkins(fid, checkin_date);

-- Создание таблицы user_balances если её нет
CREATE TABLE IF NOT EXISTS user_balances (
  id SERIAL PRIMARY KEY,
  fid TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  balance INTEGER DEFAULT 1000,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для user_balances
CREATE INDEX IF NOT EXISTS idx_user_balances_fid ON user_balances(fid);

-- Проверяем что таблицы созданы
SELECT 'daily_checkins table created' as status;
SELECT 'user_balances table created' as status;
