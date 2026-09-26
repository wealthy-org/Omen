export type AdminTab =
  | "create"
  | "resolution"
  | "pipeline"
  | "oracle"
  | "emergency"
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
  validMasterKeys?: string[];
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

export type ResolutionOutcome = "AGREE" | "DISAGREE" | "CANCEL" | "VOID";

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
  agreePercentage?: number;
  disagreePercentage?: number;
  total_agree_pool?: number;
  total_disagree_pool?: number;
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
  has_market?: boolean;
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
