export type MarketStatus = "active" | "closing-soon" | "resolved";

export type MarketOutcome = "YES" | "NO";

export interface MarketData {
  id: string | number;
  title: string;
  category: string;
  totalPool?: string | number;
  totalPoolEth?: number;
  yesPercentage: number;
  noPercentage: number;
  closingDate?: string;
  closingTimeRemaining?: string;
  endTime?: string;
  status: MarketStatus;
  resolvedOutcome?: MarketOutcome;
  layer?: "L1" | "L2";
  volume?: string;
  creatorFeePercentage?: number;
}

export interface MarketCardProps {
  market: MarketData;
  onSelectOutcome?: (market: MarketData, outcome: MarketOutcome) => void;
}

export interface MarketDetailData {
  id: string;
  title?: string;
  statement?: string;
  category?: string;
  description?: string;
  creatorAddress?: string | null;
  creatorHandle?: string | null;
  authorHandle?: string | null;
  sourceUrl?: string | null;
  sourcePlatform?: string | null;
  chainlinkFeedAddress?: string;
  oracleFeed?: string | null;
  targetPrice?: number | null;
  createdAt?: string;
  closingDate?: string;
  closesAt?: string;
  isConfirmed?: boolean;
  status?: "OPEN" | "CLOSED" | "RESOLVED" | "SETTLED" | "CANCELLED" | string;
  resolvedOutcome?: "YES" | "NO" | "AGREE" | "DISAGREE";
  winningSide?: "AGREE" | "DISAGREE" | null;
  resolutionTxHash?: string;
  totalPoolEth?: number;
  totalVolumeEth?: number;
  agreePoolEth?: number;
  disagreePoolEth?: number;
  agreePercentage?: number;
  disagreePercentage?: number;
  socialConsensusPct?: number;
  agreeMultiplier?: number;
  disagreeMultiplier?: number;
  contractAddress?: string | null;
  marketAddress?: string | null;
  chainId?: number;
  resolutionType?: string | null;
}

export interface MarketDetailPanelsProps {
  market: MarketDetailData;
  onPositionPlaced?: () => void;
  onPositionUpdated?: () => void;
}

export interface MarketDetailPageProps {
  params?: Promise<{ id: string }> | { id: string };
}

export interface CategoryItem {
  id: string;
  label: string;
  count?: number;
  icon?: any;
}

export interface MarketCategoryFilterProps {
  categories?: CategoryItem[];
  selectedCategory?: string;
  onSelectCategory?: (categoryId: string) => void;
  activeCategory?: string;
  onCategoryChange?: (id: string) => void;
  sortBy?: string;
  selectedSort?: string;
  onSortChange?: (id: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  marketCounts?: Record<string, number>;
  className?: string;
}

export interface BettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketId?: string | number;
  marketTitle?: string;
  market?: MarketData | null;
  selectedSide?: "YES" | "NO" | "AGREE" | "DISAGREE" | null;
  initialOutcome?: "YES" | "NO" | "AGREE" | "DISAGREE" | string;
  userBalance?: string;
  onSuccess?: () => void;
  onConfirmBet?: ((outcome: MarketOutcome | string, amount: string) => Promise<void> | void) | ((params: { marketId?: string | number; outcome?: MarketOutcome | string; amount: string }) => Promise<void> | void) | any;
  onPlaceBet?: (params: {
    marketId: string | number;
    side: "YES" | "NO" | "AGREE" | "DISAGREE";
    amount: string;
  }) => Promise<void> | void;
}

export type PositionSide = "AGREE" | "DISAGREE";

export interface PositionPanelProps {
  marketAddress?: string;
  marketId?: string;
  marketStatement?: string;
  agreePool?: number;
  disagreePool?: number;
  status?: string;
  userBalance?: string;
  isSubmitting?: boolean;
  onSuccess?: () => void;
  onPositionSuccess?: () => void;
  onConfirmPosition?: ((side: "AGREE" | "DISAGREE", amount: string) => Promise<void> | void) | ((params: { marketId?: string; side: "AGREE" | "DISAGREE"; amount: string }) => Promise<void> | void) | any;
  onTakePosition?: (params: {
    marketAddress: string;
    side: PositionSide;
    amount: string;
  }) => Promise<void> | void;
}

export type BeliefStatus = "OPEN" | "CLOSED" | "RESOLVED" | "DETECTED";

export interface BeliefMarket {
  id: string;
  statement: string;
  author: string;
  authorHandle?: string;
  isConfirmed?: boolean;
  source_url?: string;
  sourceUrl?: string;
  status: BeliefStatus;
  agreePool: number;
  agree_pool?: number;
  disagreePool: number;
  disagree_pool?: number;
  total_pool?: number;
  agreeParticipants: number;
  disagreeParticipants: number;
  agree_percentage?: number;
  disagree_percentage?: number;
  closeTime?: string;
  category?: string;
  deadline?: string;
  volume?: number;
  resolution_type?: string;
  contract_address?: string;
  chain_id?: number;
}

export interface BeliefMarketCardProps {
  market: BeliefMarket;
  onSelect?: (market: BeliefMarket) => void;
}

export type TabCategory = "all" | "eth" | "btc" | "arb" | "macro";

export interface CategoryTabItem {
  id: TabCategory;
  label: string;
}

export interface TrendingMarketsTeaserProps {
  theme?: "dark" | "light";
  onExploreClick?: () => void;
}

export interface StatsOverviewProps {
  theme?: "dark" | "light";
}

export interface SignalCase {
  id: string;
  category?: string;
  statement?: string;
  author: string;
  authorHandle: string;
  authorAvatar?: string;
  peopleAgreePct?: number;
  peopleDisagreePct?: number;
  peopleTotal: number;
  moneyAgreePct?: number;
  moneyDisagreePct?: number;
  moneyTotalEth?: number;
  gapPct?: number;
  gapType?: "overhyped" | "underpriced" | string;
  gapBadge?: string;
  analysisText?: string;
  source?: string;
  handle?: string;
  date?: string;
  text?: string;
  sourceUrl?: string;
  marketTitle?: string;
  poolEth?: number;
  agreePct?: number;
  disagreePct?: number;
  status?: string;
  resolutionDate?: string;
  oracle?: string;
  alphaNote?: string;
}

export interface SignalGapVisualizerProps {
  theme?: "dark" | "light";
}

export interface HeroSectionProps {
  theme?: "dark" | "light";
  onExploreClick?: () => void;
}

export interface FeaturePillarsProps {
  theme?: "dark" | "light";
}

export interface ProtocolStep {
  number: string;
  title: string;
  description: string;
  tag: string;
}

export interface ProtocolFlowProps {
  theme?: "dark" | "light";
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface LandingFAQProps {
  theme?: "dark" | "light";
}

export type DiscoveryTab = "trending" | "newest" | "ending_soon" | "volume" | "confirmed";
export type MarketCategoryFilter = "all" | "eth" | "btc" | "arb" | "macro";

export interface DiscoveryFilterProps {
  activeTab: DiscoveryTab;
  onTabChange: (tab: DiscoveryTab) => void;
  activeCategory: MarketCategoryFilter;
  onCategoryChange: (category: MarketCategoryFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalMarketsCount?: number;
  trendingCount?: number;
  confirmedCount?: number;
  endingSoonCount?: number;
}

export interface FeaturedBeliefHeroProps {
  market?: BeliefMarket;
  onTradeClick?: (market: BeliefMarket) => void;
}
