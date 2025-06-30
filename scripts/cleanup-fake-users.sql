-- Cleanup fake users with prefixes
-- Remove users with user_, temp_, guest_ prefixes that are not real FIDs

-- Show current fake users before cleanup
SELECT 'Before cleanup - Fake users:' as status;
SELECT fid, username, balance FROM user_balances 
WHERE fid LIKE 'user_%' OR fid LIKE 'temp_%' OR fid LIKE 'guest_%';

-- Show current real users before cleanup  
SELECT 'Before cleanup - Real users:' as status;
SELECT fid, username, balance FROM user_balances 
WHERE fid NOT LIKE 'user_%' AND fid NOT LIKE 'temp_%' AND fid NOT LIKE 'guest_%';

-- Delete fake user balances
DELETE FROM user_balances 
WHERE fid LIKE 'user_%' OR fid LIKE 'temp_%' OR fid LIKE 'guest_%';

-- Delete fake user transactions (as sender)
DELETE FROM transactions 
WHERE from_fid LIKE 'user_%' OR from_fid LIKE 'temp_%' OR from_fid LIKE 'guest_%';

-- Delete fake user transactions (as recipient)  
DELETE FROM transactions 
WHERE to_fid LIKE 'user_%' OR to_fid LIKE 'temp_%' OR to_fid LIKE 'guest_%';

-- Show results after cleanup
SELECT 'After cleanup - Remaining users:' as status;
SELECT fid, username, balance FROM user_balances;

SELECT 'After cleanup - Remaining transactions:' as status;
SELECT from_fid, to_fid, amount, reason, created_at FROM transactions ORDER BY created_at DESC LIMIT 10;
