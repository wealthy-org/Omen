export interface UseMarketResult {
  market?: any | null;
  agreePool?: number;
  disagreePool?: number;
  status?: string;
  isLoading: boolean;
  error?: Error | null;
  refetch: () => void | Promise<void>;
}

export interface ConfirmBeliefPayload {
  beliefId: string;
  statement: string;
  author?: string;
  signature?: string;
  sourceUrl?: string;
  marketAddress?: `0x${string}` | string;
}

export interface UseCreatorConfirmResult {
  confirmBelief: (payload: ConfirmBeliefPayload) => Promise<{ signature: string }>;
  isSigning?: boolean;
  isConfirming?: boolean;
  isPending?: boolean;
  isSuccess: boolean;
  signature?: string | null;
  error: Error | null;
  reset?: () => void;
}

export interface CreateMarketParams {
  title?: string;
  statement?: string;
  category?: string;
  deadline?: string;
  endTime?: string;
  creatorFee?: number;
  initialSeed?: number;
  initialLiquidity?: string;
  beliefId?: string;
  sourceUrl?: string;
  resolutionSourceUrl?: string;
  resolutionCriteria?: string;
  authorHandle?: string;
  chainId?: number;
  timeframeDays?: number;
  resolutionOracle?: "chainlink" | "robinhood_market_data";
  rulesText?: string;
  oracleFeed?: `0x${string}` | string;
  targetPrice?: number | bigint;
  resolutionType?: number;
  closeTime?: number | bigint;
  creator?: `0x${string}` | string;
}

export interface UseCreateMarketResult {
  createMarket: (params: CreateMarketParams) => Promise<any>;
  isPending: boolean;
  isDeploying?: boolean;
  isSuccess: boolean;
  marketAddress?: `0x${string}` | string | null;
  txHash: string | null;
  createdMarketId?: string | null;
  error: Error | null;
  reset: () => void;
}

export interface CreateMarketResult {
  createMarket: (params: CreateMarketParams) => Promise<any>;
  txHash?: `0x${string}` | string | null;
  isPending: boolean;
  isConfirming?: boolean;
  isConfirmed?: boolean;
  isSyncing?: boolean;
  isSuccess?: boolean;
  error: Error | null;
  createdMarketId?: string | null;
}

export interface ResolveMarketParams {
  marketId: string | number;
  outcome: "AGREE" | "DISAGREE" | "CANCEL" | "VOID";
  contractAddress?: `0x${string}` | string;
  notes?: string;
  payoutRecipient?: string;
  cancellationReason?: string;
  cancellationCategory?: string;
}

export interface ResolveMarketResult {
  resolveMarket: (params: ResolveMarketParams) => Promise<any>;
  txHash?: `0x${string}` | string | null;
  isPending: boolean;
  isConfirming?: boolean;
  isConfirmed?: boolean;
  isSyncing?: boolean;
  isSuccess?: boolean;
  error: Error | null;
}
