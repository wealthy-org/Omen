export interface CreatorProfile {
  address: string;
  name: string;
  handle?: string;
  avatarUrl?: string;
  avatar_url?: string;
  bio?: string;
  accuracyRate: number;
  accuracy_rate?: number;
  confirmationRate?: number;
  confirmation_rate?: number;
  totalBeliefs: number;
  total_beliefs?: number;
  confirmedBeliefs: number;
  confirmed_beliefs?: number;
  resolvedBeliefs?: number;
  resolved_beliefs?: number;
  totalVolumeEth?: number;
  volumeGeneratedEth: number;
  total_volume?: number;
  earnedFeesEth?: number;
  points?: number;
  rank?: number;
  tier?: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  topCategory?: string;
  isVerified?: boolean;
  is_verified?: boolean;
  createdAt?: string;
  created_at?: string;
}

export interface CreatorCardProps {
  creator: CreatorProfile;
  rank?: number;
}

export interface CreatorConfirmationProps {
  beliefId: string;
  statement: string;
  authorHandle: string;
  creatorAddress?: string;
  sourceUrl?: string;
  isConfirmed?: boolean;
  marketAddress?: string;
  onConfirmed?: (signature: string) => void;
}

export type CreatorSortOption = "accuracy" | "confirmed" | "volume" | "beliefs";

export type ProfileTab = "active" | "resolved" | "all";

export interface CreatorPageProps {
  params: { address: string } | Promise<{ address: string }>;
}

export interface CurrentUserProfile {
  rank: number;
  totalPoints?: number;
  points?: number;
  streakDays?: number;
  ensName?: string;
  address?: string;
  handle?: string;
  accuracy?: number;
  totalBets?: number;
}

export interface LeaderboardEntry {
  rank: number;
  address: string;
  handle?: string;
  avatar?: string;
  ensName?: string;
  streakDays?: number;
  totalPoints?: number;
  multiplier?: string;
  winRate?: string;
  accuracyPercentage?: number;
  predictionAccuracy?: number;
  correctPredictions?: number;
  resolvedPredictions?: number;
  totalPredictions?: number;
  totalVolume?: string;
  totalVolumeEth?: number;
  tier?: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | string;
  weeklyChange?: number;
}

export interface LeaderboardTableProps {
  entries?: LeaderboardEntry[];
  currentUserAddress?: string;
  pageSize?: number;
  isLoading?: boolean;
  className?: string;
}

export interface CreatorProfileHeaderProps {
  creator: CreatorProfile & {
    bio?: string;
    confirmationRate?: number;
  };
}

export interface CreatorSpotlight {
  id: string;
  name: string;
  handle: string;
  address: string;
  avatarInitials: string;
  gradient: string;
  since: string;
  confirmed: number;
  resolved: number;
  correct: number;
  accuracyRate: number;
  volumeEth: number;
  topCategory: { name: string; winRate: number };
  weakestCategory: { name: string; winRate: number };
}
