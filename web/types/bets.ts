export type BetStatus = "active" | "won" | "lost" | "cancelled";

export type BetSide = "AGREE" | "DISAGREE";

export interface UserBet {
  id: string | number;
  marketId: string | number;
  marketTitle: string;
  category?: string;
  side: BetSide;
  amount?: string;
  amountEth?: number;
  payout?: string;
  potentialPayoutEth?: number;
  roiPercent?: number;
  status: BetStatus;
  isClaimed?: boolean;
  payoutClaimed?: boolean;
  contractAddress?: string;
  chainId?: number;
  resolvedOutcome?: string;
  createdAt?: string;
}

export interface UserBetsTableProps {
  bets: UserBet[];
  onClaimPayout?: (bet: UserBet) => Promise<void> | void;
  claimingBetId?: string | null;
  isLoading?: boolean;
}

export interface ClaimPayoutButtonProps {
  amount?: string | number;
  marketId?: string | number;
  isClaimed?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  onClaim?: () => Promise<void> | void;
  onSuccess?: ((txHash?: string) => void) | (() => void);
  className?: string;
}

export interface PlaceBetParams {
  marketId: number | string;
  outcome?: "AGREE" | "DISAGREE";
  side?: boolean | "AGREE" | "DISAGREE";
  amount?: string;
  amountEth?: string | number;
}

export interface PlacePositionParams {
  marketAddress: string;
  marketId?: string;
  side: "AGREE" | "DISAGREE";
  amount?: string | number;
  amountEth?: number | string;
}

export interface ClaimPayoutParams {
  marketAddress?: string;
  marketId?: number | string;
}

export interface ClaimPayoutResult {
  claimPayout: (marketId: number | string) => Promise<string>;
  txHash?: `0x${string}` | string | null;
  isPending: boolean;
  isConfirming?: boolean;
  isConfirmed?: boolean;
  isSuccess?: boolean;
  error: Error | null;
}
