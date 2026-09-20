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
  ('a0000000-0000-0000-0000-000000000009', '0x9999999999999999999999999999999999999990', now() - interval '20 days'),
  ('a0000000-0000-0000-0000-000000000010', '0x1010101010101010101010101010101010101010', now() - interval '18 days'),
  ('a0000000-0000-0000-0000-000000000011', '0x1212121212121212121212121212121212121212', now() - interval '15 days'),
  ('a0000000-0000-0000-0000-000000000012', '0x1313131313131313131313131313131313131313', now() - interval '12 days')
ON CONFLICT (wallet_address) DO NOTHING;

INSERT INTO creator_profiles (id, wallet_address, handle, confirmed_beliefs_count, resolved_count, correct_count, created_at)
VALUES
  ('c0000000-0000-0000-0000-000000000001', '0x1111111111111111111111111111111111111111', '@traderx', 42, 28, 22, now() - interval '60 days'),
  ('c0000000-0000-0000-0000-000000000002', '0x2222222222222222222222222222222222222222', '@macrodad', 35, 20, 14, now() - interval '55 days'),
  ('c0000000-0000-0000-0000-000000000003', '0x3333333333333333333333333333333333333333', '@onchainwitch', 28, 18, 15, now() - interval '50 days'),
  ('c0000000-0000-0000-0000-000000000004', '0x4444444444444444444444444444444444444444', '@satoshidisciple', 19, 14, 11, now() - interval '45 days'),
  ('c0000000-0000-0000-0000-000000000005', '0x5555555555555555555555555555555555555555', '@rollupmaxi', 24, 16, 13, now() - interval '40 days'),
  ('c0000000-0000-0000-0000-000000000006', '0x6666666666666666666666666666666666666666', '@offchaindev', 15, 10, 8, now() - interval '35 days'),
  ('c0000000-0000-0000-0000-000000000007', '0x7777777777777777777777777777777777777777', '@quantfern', 32, 21, 16, now() - interval '30 days'),
  ('c0000000-0000-0000-0000-000000000008', '0x8888888888888888888888888888888888888888', '@alphamacro', 21, 15, 12, now() - interval '25 days'),
  ('c0000000-0000-0000-0000-000000000009', '0x9999999999999999999999999999999999999990', '@defiwizard', 18, 12, 10, now() - interval '20 days'),
  ('c0000000-0000-0000-0000-000000000010', '0x1010101010101010101010101010101010101010', '@vitaliketh', 52, 40, 36, now() - interval '18 days'),
  ('c0000000-0000-0000-0000-000000000011', '0x1212121212121212121212121212121212121212', '@aiarchitect', 16, 11, 9, now() - interval '15 days'),
  ('c0000000-0000-0000-0000-000000000012', '0x1313131313131313131313131313131313131313', '@cryptonor', 26, 17, 13, now() - interval '12 days')
ON CONFLICT (wallet_address) DO UPDATE SET
  handle = EXCLUDED.handle,
  confirmed_beliefs_count = EXCLUDED.confirmed_beliefs_count,
  resolved_count = EXCLUDED.resolved_count,
  correct_count = EXCLUDED.correct_count;

INSERT INTO beliefs (id, author, statement, source_url, source_platform, source_timestamp, ai_confidence, status, created_at)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'TraderX', 'SOL will outperform ETH this month', 'https://x.com/TraderX/status/17890011223344', 'twitter', now() - interval '2 days', 0.94, 'CONFIRMED', now() - interval '2 days'),
  ('b0000000-0000-0000-0000-000000000002', 'MacroDad', 'ETH closes above $5,000 before year end', 'https://warpcast.com/macrodad/0x78901234', 'farcaster', now() - interval '3 days', 0.88, 'CONFIRMED', now() - interval '3 days'),
  ('b0000000-0000-0000-0000-000000000003', 'OnchainWitch', 'BTC prints a new all-time high in Q4', 'https://x.com/onchainwitch/status/17891122334455', 'twitter', now() - interval '4 days', 0.91, 'OPEN', now() - interval '4 days'),
  ('b0000000-0000-0000-0000-000000000004', 'SatoshiDisciple', 'US Bitcoin Strategic Reserve legislation passes this session', 'https://x.com/satoshidisciple/status/17892233445566', 'twitter', now() - interval '5 days', 0.85, 'CONFIRMED', now() - interval '5 days'),
  ('b0000000-0000-0000-0000-000000000005', 'RollupMaxi', 'Arbitrum TVL doubles following Stylus ecosystem deployment', 'https://warpcast.com/rollupmaxi/0x12345678', 'farcaster', now() - interval '6 days', 0.92, 'CONFIRMED', now() - interval '6 days'),
  ('b0000000-0000-0000-0000-000000000006', 'OffchainDev', 'Arbitrum Orbit ecosystem reaches 100 live chains by Q4', 'https://x.com/offchaindev/status/17893344556677', 'twitter', now() - interval '7 days', 0.79, 'OPEN', now() - interval '7 days'),
  ('b0000000-0000-0000-0000-000000000007', 'QuantFern', 'The Federal Reserve cuts interest rates at the next FOMC meeting', 'https://x.com/quantfern/status/17894455667788', 'twitter', now() - interval '8 days', 0.89, 'CONFIRMED', now() - interval '8 days'),
  ('b0000000-0000-0000-0000-000000000008', 'AlphaMacro', 'Core US CPI year-over-year prints below 2.5% in next release', 'https://x.com/alphamacro/status/17895566778899', 'twitter', now() - interval '9 days', 0.93, 'CONFIRMED', now() - interval '9 days'),
  ('b0000000-0000-0000-0000-000000000009', 'DeFiWizard', 'Uniswap v4 hooks process over $10B monthly volume', 'https://x.com/defiwizard/status/17896677889900', 'twitter', now() - interval '10 days', 0.87, 'CONFIRMED', now() - interval '10 days'),
  ('b0000000-0000-0000-0000-000000000010', 'vitaliketh', 'Ethereum Layer 1 gas fees remain sub-10 gwei after blob scaling upgrade', 'https://warpcast.com/vitaliketh/0x99887766', 'farcaster', now() - interval '11 days', 0.96, 'CONFIRMED', now() - interval '11 days'),
  ('b0000000-0000-0000-0000-000000000011', 'AIArchitect', 'Autonomous AI agents execute over 1M on-chain transactions daily', 'https://x.com/aiarchitect/status/17897788990011', 'twitter', now() - interval '12 days', 0.84, 'OPEN', now() - interval '12 days'),
  ('b0000000-0000-0000-0000-000000000012', 'Cryptonor', 'Base daily active users surpass Arbitrum One by Q4', 'https://x.com/cryptonor/status/17898899001122', 'twitter', now() - interval '13 days', 0.82, 'CONFIRMED', now() - interval '13 days'),
  ('b0000000-0000-0000-0000-000000000013', 'TraderX', 'ETH/BTC ratio bottoms and breaks above 0.06', 'https://x.com/TraderX/status/17899900112233', 'twitter', now() - interval '14 days', 0.90, 'CONFIRMED', now() - interval '14 days'),
  ('b0000000-0000-0000-0000-000000000014', 'MacroDad', 'US 10-Year Treasury Yield falls below 3.75%', 'https://warpcast.com/macrodad/0x88776655', 'farcaster', now() - interval '15 days', 0.86, 'CONFIRMED', now() - interval '15 days'),
  ('b0000000-0000-0000-0000-000000000015', 'OnchainWitch', 'Total stablecoin market cap prints a new record above $180B', 'https://x.com/onchainwitch/status/17901122334455', 'twitter', now() - interval '16 days', 0.95, 'CONFIRMED', now() - interval '16 days'),
  ('b0000000-0000-0000-0000-000000000016', 'SatoshiDisciple', 'Bitcoin dominance tops out below 62% during the current cycle', 'https://x.com/satoshidisciple/status/17902233445566', 'twitter', now() - interval '17 days', 0.81, 'OPEN', now() - interval '17 days'),
  ('b0000000-0000-0000-0000-000000000017', 'RollupMaxi', 'Arbitrum BOLD permissionless validation goes live on mainnet', 'https://warpcast.com/rollupmaxi/0x77665544', 'farcaster', now() - interval '18 days', 0.93, 'CONFIRMED', now() - interval '18 days'),
  ('b0000000-0000-0000-0000-000000000018', 'OffchainDev', 'Stylus contracts exceed 500 verified deployments', 'https://x.com/offchaindev/status/17903344556677', 'twitter', now() - interval '19 days', 0.78, 'OPEN', now() - interval '19 days'),
  ('b0000000-0000-0000-0000-000000000019', 'QuantFern', 'ECB cuts deposit facility rate by 50bps before Q4', 'https://x.com/quantfern/status/17904455667788', 'twitter', now() - interval '20 days', 0.83, 'CONFIRMED', now() - interval '20 days'),
  ('b0000000-0000-0000-0000-000000000020', 'AlphaMacro', 'Global central bank gold reserves reach new historical high', 'https://x.com/alphamacro/status/17905566778899', 'twitter', now() - interval '21 days', 0.91, 'CONFIRMED', now() - interval '21 days'),
  ('b0000000-0000-0000-0000-000000000021', 'DeFiWizard', 'Liquid restaking protocol TVL exceeds $20 Billion', 'https://x.com/defiwizard/status/17906677889900', 'twitter', now() - interval '22 days', 0.89, 'CONFIRMED', now() - interval '22 days'),
  ('b0000000-0000-0000-0000-000000000022', 'vitaliketh', 'Account Abstraction ERC-4337 smart accounts exceed 10M active users', 'https://warpcast.com/vitaliketh/0x66554433', 'farcaster', now() - interval '23 days', 0.94, 'CONFIRMED', now() - interval '23 days'),
  ('b0000000-0000-0000-0000-000000000023', 'AIArchitect', 'Open source AI model weights surpass proprietary LLMs on coding benchmarks', 'https://x.com/aiarchitect/status/17907788990011', 'twitter', now() - interval '24 days', 0.87, 'OPEN', now() - interval '24 days'),
  ('b0000000-0000-0000-0000-000000000024', 'Cryptonor', 'Ethereum ETF net inflows cross $15 Billion in 2026', 'https://x.com/cryptonor/status/17908899001122', 'twitter', now() - interval '25 days', 0.90, 'CONFIRMED', now() - interval '25 days')
ON CONFLICT (id) DO UPDATE SET
  statement = EXCLUDED.statement,
  author = EXCLUDED.author,
  status = EXCLUDED.status;

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
  ('f0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 11155111, 1, 'SOL will outperform ETH this month', 'Resolves AGREE if SOL 30-day return exceeds ETH return at settlement timestamp, as reported by Chainlink price feeds.', 'eth', 87.50, 34.00, now() - interval '2 days', now() + interval '12 days', now() + interval '12 days', 'RELATIVE_PERFORMANCE', '{"assetA": "SOL/USD", "assetB": "ETH/USD"}'::jsonb, 'chainlink', 'OPEN', now() - interval '2 days'),
  ('f0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 11155111, 2, 'ETH closes above $5,000 before year end', 'Resolves AGREE if ETH/USD spot price reaches or exceeds $5,000.00 before December 31, 2026 23:59:59 UTC.', 'eth', 41.20, 59.80, now() - interval '3 days', now() + interval '85 days', now() + interval '85 days', 'PRICE_ABOVE', '{"asset": "ETH/USD", "targetPrice": 5000}'::jsonb, 'chainlink', 'OPEN', now() - interval '3 days'),
  ('f0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 11155111, 3, 'BTC prints a new all-time high in Q4', 'Resolves AGREE if BTC/USD spot exceeds previous all-time high ($108,000) during Q4 2026.', 'btc', 63.00, 37.00, now() - interval '4 days', now() + interval '68 days', now() + interval '68 days', 'PRICE_ABOVE', '{"asset": "BTC/USD", "targetPrice": 108000}'::jsonb, 'chainlink', 'OPEN', now() - interval '4 days'),
  ('f0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 11155111, 4, 'US Bitcoin Strategic Reserve legislation passes this session', 'Resolves AGREE if official US government enacted legislation formally establishing a national Bitcoin strategic reserve is signed into law.', 'btc', 52.40, 47.60, now() - interval '5 days', now() + interval '45 days', now() + interval '45 days', 'PRICE_ABOVE', '{"asset": "BTC_RESERVE_ENACTED", "oracle": "congress.gov"}'::jsonb, 'chainlink', 'OPEN', now() - interval '5 days'),
  ('f0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 11155111, 5, 'Arbitrum TVL doubles following Stylus ecosystem deployment', 'Resolves AGREE if DefiLlama verified Arbitrum One Total Value Locked exceeds 2x the baseline level at market creation.', 'arb', 78.00, 22.00, now() - interval '6 days', now() + interval '90 days', now() + interval '90 days', 'PRICE_ABOVE', '{"asset": "ARB_TVL_2X", "oracle": "defillama"}'::jsonb, 'chainlink', 'OPEN', now() - interval '6 days'),
  ('f0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 11155111, 6, 'Arbitrum Orbit ecosystem reaches 100 live chains by Q4', 'Resolves AGREE if official Arbitrum Foundation dashboard counts 100 or more live L3/Orbit chains with active sequencer blocks.', 'arb', 45.00, 55.00, now() - interval '7 days', now() + interval '60 days', now() + interval '60 days', 'PRICE_ABOVE', '{"asset": "ARB_ORBIT_CHAINS_100", "oracle": "arbitrum.io"}'::jsonb, 'chainlink', 'OPEN', now() - interval '7 days'),
  ('f0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000007', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 11155111, 7, 'The Federal Reserve cuts interest rates at the next FOMC meeting', 'Resolves AGREE if the Federal Open Market Committee officially lowers the Fed Funds target rate by at least 25 basis points at the conclusion of the upcoming meeting.', 'macro', 60.50, 40.00, now() - interval '8 days', now() + interval '22 days', now() + interval '22 days', 'PRICE_BELOW', '{"asset": "FED_FUNDS_RATE", "oracle": "federalreserve.gov"}'::jsonb, 'chainlink', 'OPEN', now() - interval '8 days'),
  ('f0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000008', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 11155111, 8, 'Core US CPI year-over-year prints below 2.5% in next release', 'Resolves AGREE if the US Bureau of Labor Statistics prints Core CPI YoY below 2.50% in the upcoming official monthly release.', 'macro', 68.00, 32.00, now() - interval '9 days', now() + interval '16 days', now() + interval '16 days', 'PRICE_BELOW', '{"asset": "US_CORE_CPI", "target": 2.5}'::jsonb, 'chainlink', 'OPEN', now() - interval '9 days'),
  ('f0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000009', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 46630, 9, 'Uniswap v4 hooks process over $10B monthly volume', 'Resolves AGREE if DefiLlama verifies total v4 pool monthly trading volume reaches or exceeds $10 Billion.', 'crypto', 55.20, 38.40, now() - interval '10 days', now() + interval '50 days', now() + interval '50 days', 'PRICE_ABOVE', '{"asset": "UNI_V4_VOL_10B"}'::jsonb, 'chainlink', 'OPEN', now() - interval '10 days'),
  ('f0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000010', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 11155111, 10, 'Ethereum Layer 1 gas fees remain sub-10 gwei after blob scaling upgrade', 'Resolves AGREE if median 7-day Ethereum base fee remains under 10 gwei as reported by Etherscan gas trackers.', 'eth', 72.80, 27.20, now() - interval '11 days', now() + interval '35 days', now() + interval '35 days', 'PRICE_BELOW', '{"asset": "ETH_GAS_MEDIAN", "target": 10}'::jsonb, 'chainlink', 'OPEN', now() - interval '11 days'),
  ('f0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000011', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 46630, 11, 'Autonomous AI agents execute over 1M on-chain transactions daily', 'Resolves AGREE if combined Artemis/Dune analytics show verified autonomous agent wallets submitting over 1M txs in 24 hours.', 'ai', 64.00, 46.00, now() - interval '12 days', now() + interval '75 days', now() + interval '75 days', 'PRICE_ABOVE', '{"asset": "AGENT_TX_1M"}'::jsonb, 'chainlink', 'OPEN', now() - interval '12 days'),
  ('f0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000012', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 11155111, 12, 'Base daily active users surpass Arbitrum One by Q4', 'Resolves AGREE if 30-day moving average of daily active addresses on Base flips Arbitrum One.', 'arb', 38.50, 61.50, now() - interval '13 days', now() + interval '42 days', now() + interval '42 days', 'RELATIVE_PERFORMANCE', '{"assetA": "BASE_DAU", "assetB": "ARB_DAU"}'::jsonb, 'chainlink', 'OPEN', now() - interval '13 days'),
  ('f0000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000013', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 11155111, 13, 'ETH/BTC ratio bottoms and breaks above 0.06', 'Resolves AGREE if ETH/BTC price ratio trades at or above 0.0600 on Binance/Coinbase feeds.', 'eth', 49.00, 51.00, now() - interval '14 days', now() + interval '30 days', now() + interval '30 days', 'PRICE_ABOVE', '{"asset": "ETH/BTC", "targetPrice": 0.06}'::jsonb, 'chainlink', 'OPEN', now() - interval '14 days'),
  ('f0000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000014', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 11155111, 14, 'US 10-Year Treasury Yield falls below 3.75%', 'Resolves AGREE if US 10-Year Treasury benchmark yield prints below 3.75% at market close.', 'macro', 57.30, 42.70, now() - interval '15 days', now() + interval '28 days', now() + interval '28 days', 'PRICE_BELOW', '{"asset": "US10Y", "target": 3.75}'::jsonb, 'chainlink', 'OPEN', now() - interval '15 days'),
  ('f0000000-0000-0000-0000-000000000015', 'b0000000-0000-0000-0000-000000000015', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 11155111, 15, 'Total stablecoin market cap prints a new record above $180B', 'Resolves AGREE if DefiLlama aggregate stablecoin market capitalization crosses $180 Billion USD.', 'crypto', 82.00, 18.00, now() - interval '16 days', now() + interval '65 days', now() + interval '65 days', 'PRICE_ABOVE', '{"asset": "STABLE_MCAP_180B"}'::jsonb, 'chainlink', 'OPEN', now() - interval '16 days'),
  ('f0000000-0000-0000-0000-000000000016', 'b0000000-0000-0000-0000-000000000016', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 11155111, 16, 'Bitcoin dominance tops out below 62% during the current cycle', 'Resolves AGREE if TradingView BTC.D index fails to exceed 62.00% before market settlement.', 'btc', 44.10, 55.90, now() - interval '17 days', now() + interval '80 days', now() + interval '80 days', 'PRICE_BELOW', '{"asset": "BTC_DOMINANCE", "target": 62}'::jsonb, 'chainlink', 'OPEN', now() - interval '17 days'),
  ('f0000000-0000-0000-0000-000000000017', 'b0000000-0000-0000-0000-000000000017', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 11155111, 17, 'Arbitrum BOLD permissionless validation goes live on mainnet', 'Resolves AGREE if Arbitrum DAO officially verifies BOLD validation live on Arbitrum One mainnet.', 'arb', 91.50, 18.50, now() - interval '18 days', now() + interval '38 days', now() + interval '38 days', 'PRICE_ABOVE', '{"asset": "ARB_BOLD_LIVE"}'::jsonb, 'chainlink', 'OPEN', now() - interval '18 days'),
  ('f0000000-0000-0000-0000-000000000018', 'b0000000-0000-0000-0000-000000000018', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 46630, 18, 'Stylus contracts exceed 500 verified deployments', 'Resolves AGREE if Arbiscan reports 500+ verified Rust/C/C++ Stylus smart contract deployments.', 'arb', 53.00, 47.00, now() - interval '19 days', now() + interval '55 days', now() + interval '55 days', 'PRICE_ABOVE', '{"asset": "STYLUS_500_CONTRACTS"}'::jsonb, 'chainlink', 'OPEN', now() - interval '19 days'),
  ('f0000000-0000-0000-0000-000000000019', 'b0000000-0000-0000-0000-000000000019', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 11155111, 19, 'ECB cuts deposit facility rate by 50bps before Q4', 'Resolves AGREE if the European Central Bank announces a 50 basis point reduction to the deposit facility rate.', 'macro', 40.00, 60.00, now() - interval '20 days', now() + interval '25 days', now() + interval '25 days', 'PRICE_BELOW', '{"asset": "ECB_RATE", "target": 50}'::jsonb, 'chainlink', 'OPEN', now() - interval '20 days'),
  ('f0000000-0000-0000-0000-000000000020', 'b0000000-0000-0000-0000-000000000020', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 11155111, 20, 'Global central bank gold reserves reach new historical high', 'Resolves AGREE if World Gold Council quarterly report shows net central bank gold purchases at record levels.', 'macro', 76.50, 23.50, now() - interval '21 days', now() + interval '70 days', now() + interval '70 days', 'PRICE_ABOVE', '{"asset": "CENTRAL_BANK_GOLD"}'::jsonb, 'chainlink', 'OPEN', now() - interval '21 days'),
  ('f0000000-0000-0000-0000-000000000021', 'b0000000-0000-0000-0000-000000000021', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 11155111, 21, 'Liquid restaking protocol TVL exceeds $20 Billion', 'Resolves AGREE if total LRT TVL (ether.fi, Renzo, Puffer) exceeds $20B on DefiLlama.', 'crypto', 62.40, 37.60, now() - interval '22 days', now() + interval '48 days', now() + interval '48 days', 'PRICE_ABOVE', '{"asset": "LRT_TVL_20B"}'::jsonb, 'chainlink', 'OPEN', now() - interval '22 days'),
  ('f0000000-0000-0000-0000-000000000022', 'b0000000-0000-0000-0000-000000000022', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 11155111, 22, 'Account Abstraction ERC-4337 smart accounts exceed 10M active users', 'Resolves AGREE if Dune Analytics verified ERC-4337 account abstraction wallets cross 10 Million on L1 & L2s.', 'eth', 85.00, 15.00, now() - interval '23 days', now() + interval '62 days', now() + interval '62 days', 'PRICE_ABOVE', '{"asset": "ERC4337_10M_USERS"}'::jsonb, 'chainlink', 'OPEN', now() - interval '23 days'),
  ('f0000000-0000-0000-0000-000000000023', 'b0000000-0000-0000-0000-000000000023', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 46630, 23, 'Open source AI model weights surpass proprietary LLMs on coding benchmarks', 'Resolves AGREE if an open-weights model achieves #1 on LMSYS Chatbot Arena coding leaderboard.', 'ai', 70.00, 30.00, now() - interval '24 days', now() + interval '40 days', now() + interval '40 days', 'PRICE_ABOVE', '{"asset": "OPEN_LLM_LEADER"}'::jsonb, 'chainlink', 'OPEN', now() - interval '24 days'),
  ('f0000000-0000-0000-0000-000000000024', 'b0000000-0000-0000-0000-000000000024', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 11155111, 24, 'Ethereum ETF net inflows cross $15 Billion in 2026', 'Resolves AGREE if Farside Investors / Bloomberg terminal data shows cumulative US Spot Ethereum ETF net inflows exceed $15 Billion.', 'eth', 66.80, 33.20, now() - interval '25 days', now() + interval '95 days', now() + interval '95 days', 'PRICE_ABOVE', '{"asset": "ETH_ETF_INFLOWS_15B"}'::jsonb, 'chainlink', 'OPEN', now() - interval '25 days')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  agree_pool = EXCLUDED.agree_pool,
  disagree_pool = EXCLUDED.disagree_pool,
  status = EXCLUDED.status;

INSERT INTO market_positions (id, market_id, wallet_address, side, amount, claimed, tx_hash, created_at)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', '0x1111111111111111111111111111111111111111', 'AGREE', 15.00, false, '0x1111111111111111111111111111111111111111111111111111111111111001', now() - interval '2 days'),
  ('10000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', '0x2222222222222222222222222222222222222222', 'DISAGREE', 10.00, false, '0x2222222222222222222222222222222222222222222222222222222222222002', now() - interval '1 day'),
  ('10000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000002', '0x3333333333333333333333333333333333333333', 'AGREE', 8.50, false, '0x3333333333333333333333333333333333333333333333333333333333333003', now() - interval '2 days'),
  ('10000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000003', '0x4444444444444444444444444444444444444444', 'AGREE', 12.00, false, '0x4444444444444444444444444444444444444444444444444444444444444004', now() - interval '3 days'),
  ('10000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000005', '0x5555555555555555555555555555555555555555', 'AGREE', 20.00, false, '0x5555555555555555555555555555555555555555555555555555555555555005', now() - interval '4 days'),
  ('10000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000007', '0x7777777777777777777777777777777777777777', 'AGREE', 14.50, false, '0x7777777777777777777777777777777777777777777777777777777777777006', now() - interval '5 days')
ON CONFLICT (tx_hash) DO NOTHING;
