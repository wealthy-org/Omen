CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  total_points NUMERIC NOT NULL DEFAULT 0,
  last_checkin_at TIMESTAMPTZ,
  streak_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  points_reward NUMERIC NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS points_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  quest_id UUID REFERENCES quests(id) ON DELETE SET NULL,
  source TEXT NOT NULL CHECK (source IN ('daily_checkin', 'quest', 'prediction_market', 'referral')),
  points NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_market_id INTEGER UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'crypto',
  deadline TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved_yes', 'resolved_no', 'cancelled')),
  total_pool_yes NUMERIC NOT NULL DEFAULT 0,
  total_pool_no NUMERIC NOT NULL DEFAULT 0,
  resolution_source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID REFERENCES markets(id) ON DELETE CASCADE NOT NULL,
  wallet_address TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('yes', 'no')),
  amount NUMERIC NOT NULL,
  claimed BOOLEAN NOT NULL DEFAULT false,
  tx_hash TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_total_points ON users(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_quests_is_active ON quests(is_active);
CREATE INDEX IF NOT EXISTS idx_points_events_wallet_address ON points_events(wallet_address);
CREATE INDEX IF NOT EXISTS idx_points_events_quest_id ON points_events(quest_id);
CREATE INDEX IF NOT EXISTS idx_markets_contract_market_id ON markets(contract_market_id);
CREATE INDEX IF NOT EXISTS idx_markets_status ON markets(status);
CREATE INDEX IF NOT EXISTS idx_markets_category ON markets(category);
CREATE INDEX IF NOT EXISTS idx_bets_market_id ON bets(market_id);
CREATE INDEX IF NOT EXISTS idx_bets_wallet_address ON bets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_bets_tx_hash ON bets(tx_hash);
