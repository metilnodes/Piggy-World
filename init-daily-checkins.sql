-- Создаем таблицу для daily check-ins
CREATE TABLE IF NOT EXISTS daily_checkins (
  id SERIAL PRIMARY KEY,
  fid TEXT NOT NULL,
  username TEXT NOT NULL,
  checkin_date DATE NOT NULL,
  reward_amount INTEGER DEFAULT 10,
  streak_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(fid, checkin_date)
);

-- Создаем индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_daily_checkins_fid_date 
ON daily_checkins(fid, checkin_date);

-- Создаем индекс для поиска по FID
CREATE INDEX IF NOT EXISTS idx_daily_checkins_fid 
ON daily_checkins(fid);

-- Добавляем комментарии к таблице
COMMENT ON TABLE daily_checkins IS 'Stores daily check-in records for users';
COMMENT ON COLUMN daily_checkins.fid IS 'Farcaster ID of the user';
COMMENT ON COLUMN daily_checkins.checkin_date IS 'Date of check-in in GMT';
COMMENT ON COLUMN daily_checkins.streak_count IS 'Current consecutive check-in streak';
