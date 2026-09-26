export type ActivityType =
  | "AGREE"
  | "DISAGREE"
  | "CONFIRM_EIP712"
  | "CLAIM"
  | "RESOLVE"
  | "MARKET_CREATED";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  actorName?: string;
  actorNote?: string;
  actorAddress: string;
  marketId: string;
  marketTitle?: string;
  marketStatement?: string;
  amountEth?: number;
  timestamp: string;
  txHash: string;
  chainId?: number;
  blockNumber?: number;
  outcomeWon?: string;
  initialVolume?: number;
}

export interface ActivityFeedProps {
  activities: ActivityItem[];
  isLoading?: boolean;
}

export type ActivityFilterCategory = "all" | "stakes" | "confirmations" | "payouts";

export type ActivityMethod =
  | "stake_agree"
  | "stake_disagree"
  | "create_market"
  | "confirm_belief"
  | "claim_payout"
  | "oracle_resolve";

export interface StakingDetails {
  side: "AGREE" | "DISAGREE";
  multiplier: string;
  poolShare: string;
  preStakeOdds: string;
  postStakeOdds: string;
  vaultAddress: string;
}

export interface Eip712Details {
  domain: string;
  verifyingContract: string;
  authorPublicKey?: string;
  sigV?: number;
  sigR?: string;
  sigS?: string;
  messageHash?: string;
}

export interface MarketCreationDetails {
  marketId?: string;
  statement?: string;
  category?: string;
  factoryAddress?: string;
  initialSeed?: string;
  creatorFeePct?: string;
  creatorFeeBps?: number;
  initialLiquidityEth?: string;
  oracleFeed?: string;
  resolutionOracle?: string;
  targetPrice?: string;
  resolutionTime?: string;
  durationDays?: number;
}

export interface DualPayoutDetails {
  winningOutcome?: "AGREE" | "DISAGREE" | string;
  grossPayoutEth?: string;
  initialStakeEth?: string;
  roiPercentage?: string;
  resolutionTxHash?: string;
  totalPayoutEth?: string;
  creatorFeeEth?: string;
  protocolFeeEth?: string;
  recipientCount?: number;
  merkleRoot?: string;
}

export interface OracleDetails {
  feedName: string;
  feedAddress: string;
  feedDecimals: number;
  snapshotRoundId: string;
  snapshotPrice: string;
  targetPrice: string;
  snapshotTimestamp: string;
  heartbeatSec: number;
  answeredInRound: string;
  divergencePct: string;
}

export interface OnChainTx {
  id: string;
  txHash: string;
  method: ActivityMethod;
  methodLabel: string;
  blockNumber: number;
  timeAgo: string;
  timestamp: string;
  fromAddress?: string;
  fromHandle?: string;
  toContract?: string;
  toContractName?: string;
  statement?: string;
  marketId?: string;
  marketTitle?: string;
  marketStatement?: string;
  valueEth?: string;
  valueUsd?: string;
  txFeeEth?: string;
  gasPriceGwei?: string;
  gasUsed?: string;
  gasLimit?: string;
  chainName: string;
  chainId: number;
  status?: "Success" | "Pending" | string;
  actor?: string;
  actorAddress?: string;
  creatorFeePool?: string;
  staking?: StakingDetails;
  stakingDetails?: StakingDetails;
  eip712?: Eip712Details;
  eip712Details?: Eip712Details;
  marketCreation?: MarketCreationDetails;
  creationDetails?: MarketCreationDetails;
  dualPayout?: DualPayoutDetails;
  payoutDetails?: DualPayoutDetails;
  oracle?: OracleDetails;
  oracleDetails?: OracleDetails;
  decodedLog?: {
    functionName: string;
    params: { name: string; value: string; type: string }[];
  };
}

export interface LandingActivityItem {
  id: string;
  address: string;
  action: "agreed" | "disagreed";
  claim: string;
  amount: string;
  timeAgo: string;
}

export interface LandingActivityStreamProps {
  theme?: "dark" | "light";
}

export interface LiveActivityExplorerProps {
  theme?: "dark" | "light";
}
