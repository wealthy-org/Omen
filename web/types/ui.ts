export type Theme = "system" | "dark" | "light";

export interface ThemeContextType {
  theme: Theme;
  effectiveTheme?: "dark" | "light";
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
  toggleTheme?: () => void;
}

export interface FooterProps {
  theme?: "dark" | "light";
}

export interface NavbarProps {
  theme?: "dark" | "light";
  onThemeToggle?: () => void;
  onToggleTheme?: () => void;
  isWrongNetwork?: boolean;
}

export interface DailyCheckinWidgetProps {
  walletAddress?: string;
  currentStreak?: number;
  totalDays?: number;
  streakMultiplier?: string;
  initialCanCheckIn?: boolean;
  cooldownSeconds?: number;
  pointsSchedule?: number[];
  onCheckIn?: (day: number, points: number) => Promise<void> | void;
  onCheckinSuccess?: (xpReward: number, streak: number) => void;
  onClaimSuccess?: (xpAwarded: number, newStreak: number) => void;
  className?: string;
}

export interface NetworkSwitcherModalProps {
  isOpen: boolean;
  currentChainId?: number;
  currentNetworkName?: string;
  targetChainId?: number;
  targetNetworkName?: string;
  onSwitchNetwork?: (chainId?: number) => Promise<void> | void;
  onClose?: () => void;
}

export interface ConnectWalletButtonProps {
  initialStatus?: "disconnected" | "connecting" | "connected";
  initialAddress?: string;
  initialBalance?: string;
  className?: string;
  showBalance?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export type BeliefCardStatus = "DETECTED" | "CONFIRMED" | "MARKET_OPEN" | "RESOLVED";

export interface BeliefItem {
  id: string;
  statement: string;
  author: string;
  authorHandle?: string;
  authorAvatar?: string;
  isConfirmed?: boolean;
  sourceUrl?: string;
  status: BeliefCardStatus;
  confidenceScore?: number;
  detectedAt?: string;
  category?: string;
  marketId?: string;
  agreePoolEth?: number;
  disagreePoolEth?: number;
  agreePercentage?: number;
  disagreePercentage?: number;
  confirmedAt?: string;
  resolvedOutcome?: "YES" | "NO";
  subject?: string;
  comparisonAsset?: string;
  direction?: string;
  targetTime?: string;
}

export interface BeliefCardProps {
  belief: BeliefItem;
  onConfirm?: (beliefId: string) => void;
  onCreateMarket?: (belief: BeliefItem) => void;
  isConfirming?: boolean;
}

export type BeliefFilterStatus = "all" | "detected" | "confirmed" | "market_live";

export interface ExtractedBeliefData {
  statement: string;
  subject: string;
  comparison_asset?: string | null;
  direction: "OUTPERFORM" | "ABOVE_PRICE" | "BELOW_PRICE" | string;
  target_value?: number | null;
  targetPrice?: number;
  targetTime?: string;
  timeframe_days?: number;
  statement_summary?: string;
  category?: string;
  oracle_recommendation?: "chainlink" | "robinhood_market_data";
  confidence_score?: number;
  confidenceScore?: number;
}

export interface BeliefSubmitFormProps {
  initialRawText?: string;
  initialAuthorHandle?: string;
  initialSourceUrl?: string;
  onSuccessRedirect?: (marketId: string) => void;
}

export interface InfraItem {
  name: string;
  icon: string;
}

export interface InfraMarqueeProps {
  theme?: "dark" | "light";
}

export interface AirdropBannerProps {
  theme?: "dark" | "light";
}

export interface OnboardingJourneyProps {
  theme?: "dark" | "light";
}
