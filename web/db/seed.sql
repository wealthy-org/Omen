-- ============================================================
-- Omen Protocol V1 - Seed Data Migration
-- Safe to execute in Supabase SQL Editor
-- All UUIDs are strictly valid hexadecimal (0-9, a-f)
-- ============================================================

-- 1. Insert Creator Users
INSERT INTO users (id, wallet_address, created_at)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', '0x1111111111111111111111111111111111111111', now() - interval '60 days'),
  ('a0000000-0000-0000-0000-000000000002', '0x2222222222222222222222222222222222222222', now() - interval '55 days'),
  ('a0000000-0000-0000-0000-000000000003', '0x3333333333333333333333333333333333333333', now() - interval '50 days'),
  ('a0000000-0000-0000-0000-000000000004', '0x4444444444444444444444444444444444444444', now() - interval '45 days'),
  ('a0000000-0000-0000-0000-000000000005', '0x5555555555555555555555555555555555555555', now() - interval '40 days'),
  ('a0000000-0000-0000-0000-000000000006', '0x6666666666666666666666666666666666666666', now() - interval '35 days'),
  ('a0000000-0000-0000-0000-000000000007', '0x7777777777777777777777777777777777777777', now() - interval '30 days'),
  ('a0000000-0000-0000-0000-000000000008', '0x8888888888888888888888888888888888888888', now() - interval '25 days'),
  ('a0000000-0000-0000-0000-000000000099', '0x9999999999999999999999999999999999999999', now() - interval '20 days')
ON CONFLICT (wallet_address) DO NOTHING;

-- 2. Insert Creator Profiles
INSERT INTO creator_profiles (id, wallet_address, handle, confirmed_beliefs_count, resolved_count, correct_count, created_at)
VALUES
  ('c0000000-0000-0000-0000-000000000001', '0x1111111111111111111111111111111111111111', '@TraderX', 47, 31, 24, now() - interval '60 days'),
  ('c0000000-0000-0000-0000-000000000002', '0x2222222222222222222222222222222222222222', '@macrodad', 28, 19, 15, now() - interval '55 days'),
  ('c0000000-0000-0000-0000-000000000003', '0x3333333333333333333333333333333333333333', '@onchainwitch', 35, 22, 17, now() - interval '50 days'),
  ('c0000000-0000-0000-0000-000000000004', '0x4444444444444444444444444444444444444444', '@satoshidisciple', 19, 14, 11, now() - interval '45 days'),
  ('c0000000-0000-0000-0000-000000000005', '0x5555555555555555555555555555555555555555', '@rollupmaxi', 24, 16, 13, now() - interval '40 days'),
  ('c0000000-0000-0000-0000-000000000006', '0x6666666666666666666666666666666666666666', '@offchaindev', 15, 10, 8, now() - interval '35 days'),
  ('c0000000-0000-0000-0000-000000000007', '0x7777777777777777777777777777777777777777', '@quantfern', 32, 21, 16, now() - interval '30 days'),
  ('c0000000-0000-0000-0000-000000000008', '0x8888888888888888888888888888888888888888', '@alphamacro', 21, 15, 12, now() - interval '25 days')
ON CONFLICT (wallet_address) DO UPDATE SET
  handle = EXCLUDED.handle,
  confirmed_beliefs_count = EXCLUDED.confirmed_beliefs_count,
  resolved_count = EXCLUDED.resolved_count,
  correct_count = EXCLUDED.correct_count;

-- 3. Insert Social Beliefs
INSERT INTO beliefs (id, author, statement, source_url, source_platform, source_timestamp, ai_confidence, status, created_at)
VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    'TraderX',
    'SOL will outperform ETH this month',
    'https://x.com/TraderX/status/17890011223344',
    'twitter',
    now() - interval '2 days',
    0.94,
    'CONFIRMED',
    now() - interval '2 days'
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'MacroDad',
    'ETH closes above $5,000 before year end',
    'https://warpcast.com/macrodad/0x78901234',
    'farcaster',
    now() - interval '3 days',
    0.88,
    'CONFIRMED',
    now() - interval '3 days'
  ),
  (
    'b0000000-0000-0000-0000-000000000003',
    'OnchainWitch',
    'BTC prints a new all-time high in Q4',
    'https://x.com/onchainwitch/status/17891122334455',
    'twitter',
    now() - interval '4 days',
    0.91,
    'OPEN',
    now() - interval '4 days'
  ),
  (
    'b0000000-0000-0000-0000-000000000004',
    'SatoshiDisciple',
    'US Bitcoin Strategic Reserve legislation passes this session',
    'https://x.com/satoshidisciple/status/17892233445566',
    'twitter',
    now() - interval '5 days',
    0.85,
    'CONFIRMED',
    now() - interval '5 days'
  ),
  (
    'b0000000-0000-0000-0000-000000000005',
    'RollupMaxi',
    'Arbitrum TVL doubles following Stylus ecosystem deployment',
    'https://warpcast.com/rollupmaxi/0x12345678',
    'farcaster',
    now() - interval '6 days',
    0.92,
    'CONFIRMED',
    now() - interval '6 days'
  ),
  (
    'b0000000-0000-0000-0000-000000000006',
    'OffchainDev',
    'Arbitrum Orbit ecosystem reaches 100 live chains by Q4',
    'https://x.com/offchaindev/status/17893344556677',
    'twitter',
    now() - interval '7 days',
    0.79,
    'OPEN',
    now() - interval '7 days'
  ),
  (
    'b0000000-0000-0000-0000-000000000007',
    'QuantFern',
    'The Federal Reserve cuts interest rates at the next FOMC meeting',
    'https://x.com/quantfern/status/17894455667788',
    'twitter',
    now() - interval '8 days',
    0.89,
    'CONFIRMED',
    now() - interval '8 days'
  ),
  (
    'b0000000-0000-0000-0000-000000000008',
    'AlphaMacro',
    'Core US CPI year-over-year prints below 2.5% in next release',
    'https://x.com/alphamacro/status/17895566778899',
    'twitter',
    now() - interval '9 days',
    0.93,
    'CONFIRMED',
    now() - interval '9 days'
  )
ON CONFLICT (id) DO UPDATE SET
  statement = EXCLUDED.statement,
  author = EXCLUDED.author,
  status = EXCLUDED.status;

-- 4. Insert Belief Raw Sources
INSERT INTO belief_sources (id, belief_id, raw_text, submitted_by_wallet, created_at)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Conviction check: SOL is structurally outpacing ETH in active address growth and DEX velocity this month. Book it.', '0x9999999999999999999999999999999999999999', now() - interval '2 days'),
  ('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Macro liquidity conditions and institutional staking flows will push ETH over $5,000 before year end.', '0x9999999999999999999999999999999999999999', now() - interval '3 days'),
  ('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'On-chain accumulation patterns indicate Bitcoin is primed to print a fresh all-time high in Q4 2026.', '0x9999999999999999999999999999999999999999', now() - interval '4 days'),
  ('d0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'US Bitcoin Strategic Reserve bill has bipartisan momentum and will pass this legislative session.', '0x9999999999999999999999999999999999999999', now() - interval '5 days'),
  ('d0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 'Stylus multi-language support is going to double Arbitrum total value locked over the next quarter.', '0x9999999999999999999999999999999999999999', now() - interval '6 days'),
  ('d0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', 'Over 100 dedicated AppChains built on Arbitrum Orbit will be deployed and live on mainnets by Q4.', '0x9999999999999999999999999999999999999999', now() - interval '7 days'),
  ('d0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000007', 'Cooling labor market prints mean the Federal Reserve will lower benchmark interest rates at the next FOMC.', '0x9999999999999999999999999999999999999999', now() - interval '8 days'),
  ('d0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000008', 'Leading economic indicators point to Core US CPI YoY falling cleanly below 2.5% on the next print.', '0x9999999999999999999999999999999999999999', now() - interval '9 days')
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Creator EIP-712 Confirmations
INSERT INTO creator_confirmations (id, belief_id, creator_wallet, confirmed_at, signature, tx_hash)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '0x1111111111111111111111111111111111111111', now() - interval '2 days', '0x712sig_traderx_verified_sol_eth_outperform_001', '0xtx_confirm_traderx_001'),
  ('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', '0x2222222222222222222222222222222222222222', now() - interval '3 days', '0x712sig_macrodad_verified_eth_5000_close_002', '0xtx_confirm_macrodad_002'),
  ('e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', '0x4444444444444444444444444444444444444444', now() - interval '5 days', '0x712sig_satoshidisciple_verified_reserve_004', '0xtx_confirm_satoshidisciple_004'),
  ('e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', '0x5555555555555555555555555555555555555555', now() - interval '6 days', '0x712sig_rollupmaxi_verified_arb_tvl_005', '0xtx_confirm_rollupmaxi_005'),
  ('e0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000007', '0x7777777777777777777777777777777777777777', now() - interval '8 days', '0x712sig_quantfern_verified_fed_rates_007', '0xtx_confirm_quantfern_007'),
  ('e0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000008', '0x8888888888888888888888888888888888888888', now() - interval '9 days', '0x712sig_alphamacro_verified_cpi_25_008', '0xtx_confirm_alphamacro_008')
ON CONFLICT (id) DO NOTHING;

-- 6. Insert On-Chain Social Belief Markets
INSERT INTO markets (
  id,
  belief_id,
  contract_address,
  chain_id,
  contract_market_id,
  title,
  description,
  category,
  agree_pool,
  disagree_pool,
  total_pool_yes,
  total_pool_no,
  open_time,
  close_time,
  deadline,
  resolution_type,
  resolution_config,
  resolution_source,
  status,
  created_at
)
VALUES
  (
    'f0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    '0x1234567890123456789012345678901234567890',
    11155111,
    1,
    'SOL will outperform ETH this month',
    'Resolves AGREE if SOL 30-day return exceeds ETH return at settlement timestamp, as reported by Chainlink price feeds.',
    'eth',
    87.50,
    34.00,
    87.50,
    34.00,
    now() - interval '2 days',
    now() + interval '12 days',
    now() + interval '12 days',
    'RELATIVE_PERFORMANCE',
    '{"assetA": "SOL/USD", "assetB": "ETH/USD"}'::jsonb,
    'chainlink',
    'OPEN',
    now() - interval '2 days'
  ),
  (
    'f0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000002',
    '0x1234567890123456789012345678901234567890',
    11155111,
    2,
    'ETH closes above $5,000 before year end',
    'Resolves AGREE if ETH/USD spot price reaches or exceeds $5,000.00 before December 31, 2026 23:59:59 UTC.',
    'eth',
    41.20,
    59.80,
    41.20,
    59.80,
    now() - interval '3 days',
    now() + interval '85 days',
    now() + interval '85 days',
    'PRICE_ABOVE',
    '{"asset": "ETH/USD", "targetPrice": 5000}'::jsonb,
    'chainlink',
    'OPEN',
    now() - interval '3 days'
  ),
  (
    'f0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000003',
    '0x1234567890123456789012345678901234567890',
    11155111,
    3,
    'BTC prints a new all-time high in Q4',
    'Resolves AGREE if BTC/USD spot exceeds previous all-time high ($108,000) during Q4 2026.',
    'btc',
    63.00,
    37.00,
    63.00,
    37.00,
    now() - interval '4 days',
    now() + interval '68 days',
    now() + interval '68 days',
    'PRICE_ABOVE',
    '{"asset": "BTC/USD", "targetPrice": 108000}'::jsonb,
    'chainlink',
    'OPEN',
    now() - interval '4 days'
  ),
  (
    'f0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000004',
    '0x1234567890123456789012345678901234567890',
    11155111,
    4,
    'US Bitcoin Strategic Reserve legislation passes this session',
    'Resolves AGREE if official US government enacted legislation formally establishing a national Bitcoin strategic reserve is signed into law.',
    'btc',
    52.40,
    47.60,
    52.40,
    47.60,
    now() - interval '5 days',
    now() + interval '45 days',
    now() + interval '45 days',
    'PRICE_ABOVE',
    '{"asset": "BTC_RESERVE_ENACTED", "oracle": "congress.gov"}'::jsonb,
    'chainlink',
    'OPEN',
    now() - interval '5 days'
  ),
  (
    'f0000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000005',
    '0x1234567890123456789012345678901234567890',
    11155111,
    5,
    'Arbitrum TVL doubles following Stylus ecosystem deployment',
    'Resolves AGREE if DefiLlama verified Arbitrum One Total Value Locked exceeds 2x the baseline level at market creation.',
    'arb',
    78.00,
    22.00,
    78.00,
    22.00,
    now() - interval '6 days',
    now() + interval '90 days',
    now() + interval '90 days',
    'PRICE_ABOVE',
    '{"asset": "ARB_TVL_2X", "oracle": "defillama"}'::jsonb,
    'chainlink',
    'OPEN',
    now() - interval '6 days'
  ),
  (
    'f0000000-0000-0000-0000-000000000006',
    'b0000000-0000-0000-0000-000000000006',
    '0x1234567890123456789012345678901234567890',
    11155111,
    6,
    'Arbitrum Orbit ecosystem reaches 100 live chains by Q4',
    'Resolves AGREE if official Arbitrum Foundation dashboard counts 100 or more live L3/Orbit chains with active sequencer blocks.',
    'arb',
    45.00,
    55.00,
    45.00,
    55.00,
    now() - interval '7 days',
    now() + interval '60 days',
    now() + interval '60 days',
    'PRICE_ABOVE',
    '{"asset": "ARB_ORBIT_CHAINS_100", "oracle": "arbitrum.io"}'::jsonb,
    'chainlink',
    'OPEN',
    now() - interval '7 days'
  ),
  (
    'f0000000-0000-0000-0000-000000000007',
    'b0000000-0000-0000-0000-000000000007',
    '0x1234567890123456789012345678901234567890',
    11155111,
    7,
    'The Federal Reserve cuts interest rates at the next FOMC meeting',
    'Resolves AGREE if the Federal Open Market Committee officially lowers the Fed Funds target rate by at least 25 basis points at the conclusion of the upcoming meeting.',
    'macro',
    60.50,
    40.00,
    60.50,
    40.00,
    now() - interval '8 days',
    now() + interval '22 days',
    now() + interval '22 days',
    'PRICE_BELOW',
    '{"asset": "FED_FUNDS_RATE", "oracle": "federalreserve.gov"}'::jsonb,
    'chainlink',
    'OPEN',
    now() - interval '8 days'
  ),
  (
    'f0000000-0000-0000-0000-000000000008',
    'b0000000-0000-0000-0000-000000000008',
    '0x1234567890123456789012345678901234567890',
    11155111,
    8,
    'Core US CPI year-over-year prints below 2.5% in next release',
    'Resolves AGREE if the US Bureau of Labor Statistics prints Core CPI YoY below 2.50% in the upcoming official monthly release.',
    'macro',
    68.00,
    32.00,
    68.00,
    32.00,
    now() - interval '9 days',
    now() + interval '16 days',
    now() + interval '16 days',
    'PRICE_BELOW',
    '{"asset": "US_CORE_CPI", "target": 2.5}'::jsonb,
    'chainlink',
    'OPEN',
    now() - interval '9 days'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  agree_pool = EXCLUDED.agree_pool,
  disagree_pool = EXCLUDED.disagree_pool,
  status = EXCLUDED.status;

-- 7. Insert Initial Participant Market Positions (for realistic on-chain metrics & volume)
INSERT INTO market_positions (id, market_id, wallet_address, side, amount, claimed, tx_hash, created_at)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', '0x1111111111111111111111111111111111111111', 'AGREE', 15.00, false, '0xtx_pos_001_agree', now() - interval '2 days'),
  ('10000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', '0x2222222222222222222222222222222222222222', 'DISAGREE', 10.00, false, '0xtx_pos_002_disagree', now() - interval '1 day'),
  ('10000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000002', '0x3333333333333333333333333333333333333333', 'AGREE', 8.50, false, '0xtx_pos_003_agree', now() - interval '2 days'),
  ('10000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000003', '0x4444444444444444444444444444444444444444', 'AGREE', 12.00, false, '0xtx_pos_004_agree', now() - interval '3 days'),
  ('10000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000005', '0x5555555555555555555555555555555555555555', 'AGREE', 20.00, false, '0xtx_pos_005_agree', now() - interval '4 days'),
  ('10000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000007', '0x7777777777777777777777777777777777777777', 'AGREE', 14.50, false, '0xtx_pos_006_agree', now() - interval '5 days')
ON CONFLICT (tx_hash) DO NOTHING;
