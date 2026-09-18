export interface BeliefSourceRecord {
  id: string;
  raw_text: string;
  submitted_by_wallet: string | null;
  created_at: string;
}

export interface CreatorConfirmationRecord {
  id: string;
  creator_wallet: string;
  confirmed_at: string;
  signature: string;
  tx_hash: string | null;
}

export interface BeliefRecord {
  id: string;
  author: string | null;
  statement: string;
  source_url: string | null;
  source_platform: string | null;
  source_timestamp: string | null;
  ai_confidence: number | null;
  status: string;
  created_at: string;
  belief_sources?: BeliefSourceRecord[];
  creator_confirmations?: CreatorConfirmationRecord[];
}

export interface MarketResolutionRecord {
  id: string;
  market_id: string;
  oracle_source: string | null;
  start_price: number | null;
  end_price: number | null;
  resolved_outcome: string;
  resolution_tx_hash: string | null;
  resolved_at: string;
}

export interface MarketRecord {
  id: string;
  belief_id: string | null;
  contract_address: string | null;
  chain_id: number;
  contract_market_id: number | null;
  title: string | null;
  description: string | null;
  category: string | null;
  agree_pool: number | string;
  disagree_pool: number | string;
  total_pool_yes: number | string | null;
  total_pool_no: number | string | null;
  open_time: string;
  close_time: string;
  deadline: string | null;
  resolution_type: string | null;
  resolution_config: Record<string, unknown> | null;
  resolution_source: string | null;
  metadata_hash: string | null;
  status: string;
  winner: string | null;
  created_at: string;
  beliefs?: BeliefRecord | null;
  market_resolutions?: MarketResolutionRecord[];
  oracle_snapshots?: unknown[];
  market_positions?: unknown[];
}

export interface FormattedMarketDetail {
  id: string;
  belief_id: string | null;
  contract_address: string | null;
  chain_id: number;
  contract_market_id: number | null;
  title: string | null;
  description: string | null;
  category: string | null;
  agree_pool: number;
  disagree_pool: number;
  total_pool_yes: number | string | null;
  total_pool_no: number | string | null;
  open_time: string;
  close_time: string;
  deadline: string | null;
  resolution_type: string | null;
  resolution_config: Record<string, unknown> | null;
  resolution_source: string | null;
  metadata_hash: string | null;
  status: string;
  winner: string | null;
  created_at: string;
  statement: string;
  author: string | null;
  authorHandle: string | null;
  creatorAddress: string | null;
  sourceUrl: string | null;
  sourcePlatform: string | null;
  createdAt: string;
  closesAt: string;
  isConfirmed: boolean;
  winningSide: string | null;
  agreePoolEth: number;
  disagreePoolEth: number;
  totalVolumeEth: number;
  socialConsensusPct: number;
  marketAddress: string | null;
  chainId: number;
  oracleFeed: string | null;
  targetPrice: number | null;
  total_pool: number;
  capital_consensus: number;
}

export interface MarketDetailApiResponse {
  success: boolean;
  market?: FormattedMarketDetail;
  error?: string;
}
