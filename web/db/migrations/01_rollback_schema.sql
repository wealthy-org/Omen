DROP POLICY IF EXISTS "Allow public read access on bets" ON bets;
DROP POLICY IF EXISTS "Allow public read access on markets" ON markets;
DROP POLICY IF EXISTS "Allow public read access on points_events" ON points_events;
DROP POLICY IF EXISTS "Allow public read access on quests" ON quests;
DROP POLICY IF EXISTS "Allow public read access on users" ON users;

DROP INDEX IF EXISTS idx_bets_tx_hash;
DROP INDEX IF EXISTS idx_bets_wallet_address;
DROP INDEX IF EXISTS idx_bets_market_id;
DROP INDEX IF EXISTS idx_markets_category;
DROP INDEX IF EXISTS idx_markets_status;
DROP INDEX IF EXISTS idx_markets_contract_market_id;
DROP INDEX IF EXISTS idx_points_events_quest_id;
DROP INDEX IF EXISTS idx_points_events_wallet_address;
DROP INDEX IF EXISTS idx_quests_is_active;
DROP INDEX IF EXISTS idx_users_total_points;
DROP INDEX IF EXISTS idx_users_wallet_address;

DROP TABLE IF EXISTS bets CASCADE;
DROP TABLE IF EXISTS points_events CASCADE;
DROP TABLE IF EXISTS markets CASCADE;
DROP TABLE IF EXISTS quests CASCADE;
DROP TABLE IF EXISTS users CASCADE;
