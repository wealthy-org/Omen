export type ContractResolutionType =
  | "PRICE_ABOVE"
  | "PRICE_BELOW"
  | "RELATIVE_PERFORMANCE";

export type ResolutionType = "PRICE_ABOVE" | "PRICE_BELOW" | "RELATIVE_PERFORMANCE";

export type ContractResolutionOutcome = "AGREE_WON" | "DISAGREE_WON" | "INVALID";

export type OracleResolutionOutcome = "AGREE_WON" | "DISAGREE_WON" | "INVALID";

export interface ResolutionParams {
  type?: ResolutionType;
  resolutionType?: ResolutionType;
  targetPrice?: number | bigint;
  startPriceA?: number;
  endPriceA?: number;
  startPriceB?: number;
  endPriceB?: number;
  assetAFeed?: string;
  assetBFeed?: string;
  startTimestamp?: bigint;
  endTimestamp?: bigint;
  chainId?: number;
}

export interface ContractResolutionParams {
  resolutionType: ContractResolutionType;
  assetAFeed: string;
  assetBFeed?: string;
  targetPrice?: bigint;
  startTimestamp?: bigint;
  endTimestamp?: bigint;
  chainId?: number;
}

export interface ResolutionExecutionResult {
  success?: boolean;
  market_id?: string;
  marketId?: string;
  outcome?: "AGREE_WON" | "DISAGREE_WON" | "INVALID" | "CANCEL" | "VOID" | string;
  resolved?: boolean;
  tx_hash?: string;
  txHash?: string;
  reason?: string;
  error?: string;
}

export interface ResolutionEngineSummary {
  success?: boolean;
  processedCount?: number;
  total_eligible?: number;
  resolved_count?: number;
  failed_count?: number;
  results: ResolutionExecutionResult[];
}

export interface BeliefHashes {
  beliefHash: `0x${string}`;
  sourceHash: `0x${string}`;
  resolutionHash: `0x${string}`;
}

export interface CreateOnChainMarketParams {
  beliefHash?: `0x${string}`;
  sourceHash?: `0x${string}`;
  resolutionHash?: `0x${string}`;
  openTime?: number;
  closeTime?: number;
  config?: {
    resType?: number;
    assetAFeed?: `0x${string}` | string;
    assetBFeed?: `0x${string}` | string;
    targetPrice?: bigint | number;
    startTimestamp?: number;
    endTimestamp?: number;
  };
  marketId?: number;
  beliefStatement?: string;
  sourceUrl?: string;
  authorHandle?: string;
  closeTimestamp?: number;
  resolutionType?: number;
  assetAFeed?: string;
  assetBFeed?: string;
  targetPrice?: number | bigint;
  startTimestamp?: number;
  endTimestamp?: number;
  chainId?: number;
}

export interface CreatedMarketResult {
  txHash: string;
  contractAddress: string;
  contractMarketId?: number;
}

export interface VerifyConfirmationParams {
  beliefId: string;
  statement: string;
  timestamp?: number | bigint;
  chainId?: number;
  creatorAddress?: string;
  author?: string;
  signature: string;
  verifyingContract?: string;
}

export interface MockMarketPool {
  marketId: number;
  agreePool: number;
  disagreePool: number;
  totalPool: number;
  status: "active" | "cancelled" | "OPEN" | "CLOSED" | "RESOLVED" | "CANCELLED";
  resolvedOutcome?: boolean;
}

export interface MockBetRecord {
  txHash?: `0x${string}`;
  marketId: number;
  walletAddress?: string;
  user?: string;
  side: "AGREE" | "DISAGREE" | boolean;
  amountEth?: number;
  amount?: number;
  claimed: boolean;
  timestamp?: string;
}

export interface MockTransactionResult {
  txHash?: `0x${string}`;
  hash?: string;
  status?: "success" | "reverted";
  success?: boolean;
  blockNumber: number;
}

export interface DecodedParameter {
  name: string;
  type: string;
  value: string;
}

export interface DecodedTxResult {
  foundOnRpc: boolean;
  txHash: string;
  chainId: number;
  chainName: string;
  status: "success" | "reverted" | "pending" | "unknown";
  blockNumber?: number;
  confirmations?: number;
  from?: string;
  to?: string;
  toContractName?: string;
  valueEth?: string;
  gasPriceGwei?: string;
  gasUsed?: string;
  executionFeeEth?: string;
  functionName?: string;
  params?: DecodedParameter[];
  rawInput?: string;
  errorMessage?: string;
}
