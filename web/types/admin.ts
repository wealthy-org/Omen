import type { QuestCategory } from "./quest";

export type AdminTab =
  | "create"
  | "resolution"
  | "pipeline"
  | "oracle"
  | "emergency"
  | "quests"
  | "create-market"
  | "beliefs-monitor"
  | "oracle-monitor"
  | "resolve-markets"
  | "emergency-controls";

export interface AdminDashboardProps {
  initialConnectedAddress?: string;
  initialTab?: AdminTab;
  onUnauthorized?: () => void;
}

export interface AdminLoginFormProps {
  onLoginSuccess: (adminAddress: string) => void;
  authorizedAddresses?: string[];
  className?: string;
}

export interface AdminMarketFormData {
  title: string;
  category: string;
  endTime?: string;
  deadline?: string;
  creatorFee?: number;
  initialSeed?: number;
  initialLiquidity?: string;
  sourceUrl?: string;
  resolutionSourceUrl?: string;
  authorHandle?: string;
  rulesText?: string;
  resolutionCriteria?: string;
}

export interface AdminMarketCreateFormProps {
  onSubmitMarket?: (data: AdminMarketFormData) => Promise<void> | void;
  onSuccess?: () => void;
  isLoading?: boolean;
}

export type QuestRecurrence = "ONE_TIME" | "DAILY" | "WEEKLY";

export interface AdminQuestItem {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  points?: number;
  xp_reward?: number;
  verification_type?: string;
  recurrence?: QuestRecurrence;
  actionUrl?: string;
  action_url?: string;
  isActive?: boolean;
  is_active?: boolean;
  completionsCount?: number;
  createdAt?: string;
  created_at?: string;
}

export interface AdminQuestManagementFormProps {
  initialQuests?: AdminQuestItem[];
  onCreateQuest?: (quest: AdminQuestItem) => Promise<void> | void;
  onToggleQuestStatus?: (id: string, active: boolean) => Promise<void> | void;
  onDeleteQuest?: (id: string) => Promise<void> | void;
  className?: string;
}

export type ResolutionOutcome = "YES" | "NO" | "CANCEL";

export type CancellationReasonCategory =
  | "ORACLE_FAILURE"
  | "AMBIGUOUS_CRITERIA"
  | "EVENT_CANCELLED"
  | "EMERGENCY_SAFEGUARD"
  | "ORACLE_OUTAGE"
  | "AMBIGUOUS_RESOLUTION"
  | "MARKET_MANIPULATION"
  | "FORCE_MAJEURE";

export interface ResolvableMarketItem {
  id: string;
  title: string;
  category: string;
  totalPool?: number;
  total_pool?: number;
  volume?: number;
  yesPercentage?: number;
  noPercentage?: number;
  total_yes_pool?: number;
  total_no_pool?: number;
  endTime?: string;
  deadline?: string;
  resolutionSourceUrl?: string;
  resolutionCriteria?: string;
  resolvedOutcome?: ResolutionOutcome | string;
  resolved_outcome?: string;
  resolvedAt?: string;
  cancellationReason?: CancellationReasonCategory | string;
  cancellation_reason?: string;
  cancellation_category?: CancellationReasonCategory;
  resolutionNotes?: string;
  status: "PENDING_RESOLUTION" | "RESOLVED" | "CANCELLED" | string;
  belief_id?: string;
  contract_address?: string;
  chain_id?: number;
  resolution_tx_hash?: string;
  auto_detected?: boolean;
  confidence?: number;
}

export interface AdminMarketResolutionTableProps {
  initialMarkets?: ResolvableMarketItem[];
  markets?: ResolvableMarketItem[];
  onMarketResolved?: (id: string, outcome: string) => void;
  onResolveMarket?: (
    marketId: string,
    outcome: ResolutionOutcome,
    resolutionNotes?: string,
    cancellationReason?: CancellationReasonCategory | string
  ) => Promise<void> | void;
  isLoading?: boolean;
  className?: string;
}

export interface BeliefPipelineItem {
  id: string;
  statement: string;
  author: string;
  authorHandle?: string;
  author_handle?: string;
  status: "DETECTED" | "OPEN" | "CONFIRMED" | "CLOSED" | "RESOLVED" | "SETTLED" | string;
  aiConfidence?: number;
  ai_confidence?: number;
  agreePool?: number;
  agree_pool?: number;
  disagreePool?: number;
  disagree_pool?: number;
  total_pool?: number;
  totalPool?: number;
  consensusPercentage?: number;
  consensus_percentage?: number;
  hasEip712Signature?: boolean;
  has_eip712_signature?: boolean;
  sourceUrl?: string;
  source_url?: string;
  created_at: string;
}

export interface EmergencyActionLog {
  id: string;
  actionType: "PAUSE_PROTOCOL" | "RESUME_PROTOCOL" | "EMERGENCY_VOID" | "CANCEL_MARKET";
  targetId?: string;
  reason: string;
  executor: string;
  timestamp: string;
}

export interface AdminEmergencyControlsProps {
  onActionComplete?: () => void;
}

export interface AdminOracleMonitorProps {
  refreshIntervalMs?: number;
}
