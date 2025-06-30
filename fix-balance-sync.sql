-- Добавляем индекс для быстрого поиска транзакций
CREATE INDEX IF NOT EXISTS idx_transactions_to_fid ON transactions(to_fid);
CREATE INDEX IF NOT EXISTS idx_transactions_from_fid ON transactions(from_fid);

-- Добавляем триггер для обновления updated_at при изменении баланса
CREATE OR REPLACE FUNCTION update_balance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_balance_timestamp
BEFORE UPDATE ON user_balances
FOR EACH ROW
EXECUTE FUNCTION update_balance_timestamp();
