export type QuestCategory = "ONBOARDING" | "SOCIAL" | "ON-CHAIN" | "DAILY";

export type QuestStatus = "AVAILABLE" | "VERIFYING" | "COMPLETED";

export interface QuestItem {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  points?: number;
  xp_reward?: number;
  verification_type?: "MANUAL" | "AUTO_CHECK" | "EIP712_SIGNATURE" | string;
  recurrence?: "ONE_TIME" | "DAILY" | "WEEKLY" | string;
  status: QuestStatus;
  actionLabel?: string;
  actionUrl?: string;
  action_url?: string;
}

export interface QuestCardProps {
  id?: string;
  title?: string;
  description?: string;
  category?: QuestCategory;
  points?: number;
  quest?: QuestItem;
  status?: QuestStatus;
  actionLabel?: string;
  actionUrl?: string;
  onAction?: (id: string) => Promise<void> | void;
  onVerify?: (id: string) => Promise<void> | void;
  onComplete?: (questId: string) => Promise<void> | void;
  isCompleting?: boolean;
  className?: string;
}

export type FilterCategory = "ALL" | QuestCategory;

export interface TeaserQuest {
  title: string;
  category: string;
  reward: string;
  progress: string;
}

export interface QuestsTeaserProps {
  theme?: "dark" | "light";
  onExploreClick?: () => void;
}
