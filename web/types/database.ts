export type PointsSource =
  | "daily_checkin"
  | "quest"
  | "prediction_market"
  | "referral";

export type MarketStatus =
  | "active"
  | "resolved_yes"
  | "resolved_no"
  | "cancelled";

export type BetSide = "yes" | "no";

export type User = {
  id: string;
  wallet_address: string;
  total_points: number;
  last_checkin_at: string | null;
  streak_count?: number;
  created_at: string;
};

export type Quest = {
  id: string;
  title: string;
  description: string | null;
  category?: string;
  points_reward: number;
  is_active: boolean;
  action_url?: string | null;
  created_at: string;
};

export type PointsEvent = {
  id: string;
  wallet_address: string;
  quest_id: string | null;
  source: PointsSource;
  points: number;
  created_at: string;
};

export type Market = {
  id: string;
  contract_market_id: number;
  title: string;
  category: string;
  description: string | null;
  deadline: string;
  status: MarketStatus;
  resolution_source?: string | null;
  yes_pool?: number;
  no_pool?: number;
  created_at: string;
};

export type Bet = {
  id: string;
  market_id: string;
  wallet_address: string;
  side: BetSide;
  amount: number;
  claimed: boolean;
  tx_hash: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Partial<User> & { wallet_address: string };
        Update: Partial<User>;
        Relationships: [];
      };
      quests: {
        Row: Quest;
        Insert: Partial<Quest> & { title: string; points_reward: number };
        Update: Partial<Quest>;
        Relationships: [];
      };
      points_events: {
        Row: PointsEvent;
        Insert: Partial<PointsEvent> & {
          wallet_address: string;
          source: PointsSource;
          points: number;
        };
        Update: Partial<PointsEvent>;
        Relationships: [];
      };
      markets: {
        Row: Market;
        Insert: Partial<Market> & {
          contract_market_id: number;
          title: string;
          deadline: string;
        };
        Update: Partial<Market>;
        Relationships: [];
      };
      bets: {
        Row: Bet;
        Insert: Partial<Bet> & {
          market_id: string;
          wallet_address: string;
          side: BetSide;
          amount: number;
          tx_hash: string;
        };
        Update: Partial<Bet>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
