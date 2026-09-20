CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS beliefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author TEXT,
  statement TEXT NOT NULL,
  source_url TEXT,
  source_platform TEXT DEFAULT 'manual',
  source_timestamp TIMESTAMPTZ,
  ai_confidence NUMERIC,
  status TEXT NOT NULL DEFAULT 'DETECTED' CHECK (status IN ('DETECTED', 'OPEN', 'CONFIRMED', 'CLOSED', 'RESOLVED', 'SETTLED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS belief_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  belief_id UUID REFERENCES beliefs(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  submitted_by_wallet TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  belief_id UUID REFERENCES beliefs(id) ON DELETE CASCADE,
  contract_address TEXT,
  chain_id INTEGER NOT NULL DEFAULT 11155111,
  contract_market_id INTEGER,
  title TEXT,
  description TEXT,
  category TEXT DEFAULT 'crypto',
  agree_pool NUMERIC NOT NULL DEFAULT 0,
  disagree_pool NUMERIC NOT NULL DEFAULT 0,
  open_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  close_time TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  deadline TIMESTAMPTZ,
  resolution_type TEXT CHECK (resolution_type IN ('PRICE_ABOVE', 'PRICE_BELOW', 'RELATIVE_PERFORMANCE')),
  resolution_config JSONB,
  resolution_source TEXT,
  metadata_hash TEXT,
  status TEXT NOT NULL DEFAULT 'OPEN',
  winner TEXT CHECK (winner IN ('AGREE', 'DISAGREE', 'VOID')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS market_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID REFERENCES markets(id) ON DELETE CASCADE NOT NULL,
  wallet_address TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('AGREE', 'DISAGREE')),
  amount NUMERIC NOT NULL,
  claimed BOOLEAN NOT NULL DEFAULT false,
  tx_hash TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS market_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID REFERENCES markets(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  wallet_address TEXT,
  amount NUMERIC,
  tx_hash TEXT UNIQUE NOT NULL,
  block_number INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS market_resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID REFERENCES markets(id) ON DELETE CASCADE NOT NULL,
  oracle_source TEXT DEFAULT 'chainlink',
  start_price NUMERIC,
  end_price NUMERIC,
  resolved_outcome TEXT NOT NULL CHECK (resolved_outcome IN ('AGREE', 'DISAGREE', 'VOID')),
  resolution_tx_hash TEXT,
  resolved_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS market_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID REFERENCES markets(id) ON DELETE CASCADE NOT NULL,
  total_pool NUMERIC,
  distributable_pool NUMERIC,
  protocol_fee NUMERIC DEFAULT 0,
  settled_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS creator_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  handle TEXT,
  confirmed_beliefs_count INTEGER NOT NULL DEFAULT 0,
  resolved_count INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS creator_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  belief_id UUID REFERENCES beliefs(id) ON DELETE CASCADE NOT NULL,
  creator_wallet TEXT NOT NULL,
  confirmed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  signature TEXT NOT NULL,
  tx_hash TEXT
);

CREATE TABLE IF NOT EXISTS oracle_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID REFERENCES markets(id) ON DELETE CASCADE,
  source TEXT CHECK (source IN ('chainlink', 'robinhood_market_data')),
  asset TEXT NOT NULL,
  price NUMERIC NOT NULL,
  snapshot_type TEXT CHECK (snapshot_type IN ('START', 'END', 'DISPLAY', 'RESOLUTION', 'BASELINE')),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_beliefs_status ON beliefs(status);
CREATE INDEX IF NOT EXISTS idx_beliefs_author ON beliefs(author);
CREATE INDEX IF NOT EXISTS idx_belief_sources_belief_id ON belief_sources(belief_id);
CREATE INDEX IF NOT EXISTS idx_markets_belief_id ON markets(belief_id);
CREATE INDEX IF NOT EXISTS idx_markets_chain_id ON markets(chain_id);
CREATE INDEX IF NOT EXISTS idx_markets_contract_address ON markets(contract_address);
CREATE INDEX IF NOT EXISTS idx_markets_contract_market_id ON markets(contract_market_id);
CREATE INDEX IF NOT EXISTS idx_markets_status ON markets(status);
CREATE INDEX IF NOT EXISTS idx_markets_category ON markets(category);
CREATE INDEX IF NOT EXISTS idx_market_positions_market_id ON market_positions(market_id);
CREATE INDEX IF NOT EXISTS idx_market_positions_wallet_address ON market_positions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_market_positions_tx_hash ON market_positions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_market_events_market_id ON market_events(market_id);
CREATE INDEX IF NOT EXISTS idx_market_events_tx_hash ON market_events(tx_hash);
CREATE INDEX IF NOT EXISTS idx_market_resolutions_market_id ON market_resolutions(market_id);
CREATE INDEX IF NOT EXISTS idx_market_settlements_market_id ON market_settlements(market_id);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_wallet_address ON creator_profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_creator_confirmations_belief_id ON creator_confirmations(belief_id);
CREATE INDEX IF NOT EXISTS idx_oracle_snapshots_market_id ON oracle_snapshots(market_id);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE beliefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE belief_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracle_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on users" ON users;
CREATE POLICY "Allow public read access on users" ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on beliefs" ON beliefs;
CREATE POLICY "Allow public read access on beliefs" ON beliefs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on belief_sources" ON belief_sources;
CREATE POLICY "Allow public read access on belief_sources" ON belief_sources FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on markets" ON markets;
CREATE POLICY "Allow public read access on markets" ON markets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on market_positions" ON market_positions;
CREATE POLICY "Allow public read access on market_positions" ON market_positions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on market_events" ON market_events;
CREATE POLICY "Allow public read access on market_events" ON market_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on market_resolutions" ON market_resolutions;
CREATE POLICY "Allow public read access on market_resolutions" ON market_resolutions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on market_settlements" ON market_settlements;
CREATE POLICY "Allow public read access on market_settlements" ON market_settlements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on creator_profiles" ON creator_profiles;
CREATE POLICY "Allow public read access on creator_profiles" ON creator_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on creator_confirmations" ON creator_confirmations;
CREATE POLICY "Allow public read access on creator_confirmations" ON creator_confirmations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on oracle_snapshots" ON oracle_snapshots;
CREATE POLICY "Allow public read access on oracle_snapshots" ON oracle_snapshots FOR SELECT USING (true);
