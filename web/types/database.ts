export type PointsSource = "daily_checkin" | "quest" | "prediction_market" | "referral";

export type MarketStatus = "active" | "resolved_yes" | "resolved_no" | "cancelled";

export type BetSide = "yes" | "no";

export interface User {
  id: string;
  wallet_address: string;
  total_points: number;
  last_checkin_at: string | null;
  streak_count: number;
  created_at: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string | null;
  points_reward: number;
  is_active: boolean;
  created_at: string;
}

export interface PointsEvent {
  id: string;
  wallet_address: string;
  quest_id: string | null;
  source: PointsSource;
  points: number;
  created_at: string;
}

export interface Market {
  id: string;
  contract_market_id: number;
  title: string;
  description: string | null;
  deadline: string;
  status: MarketStatus;
  total_pool_yes: number;
  total_pool_no: number;
  resolution_source: string | null;
  created_at: string;
}

export interface Bet {
  id: string;
  market_id: string;
  wallet_address: string;
  side: BetSide;
  amount: number;
  claimed: boolean;
  tx_hash: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: {
          id?: string;
          wallet_address: string;
          total_points?: number;
          last_checkin_at?: string | null;
          streak_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          wallet_address?: string;
          total_points?: number;
          last_checkin_at?: string | null;
          streak_count?: number;
          created_at?: string;
        };
      };
      quests: {
        Row: Quest;
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          points_reward: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          points_reward?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      points_events: {
        Row: PointsEvent;
        Insert: {
          id?: string;
          wallet_address: string;
          quest_id?: string | null;
          source: PointsSource;
          points: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          wallet_address?: string;
          quest_id?: string | null;
          source?: PointsSource;
          points?: number;
          created_at?: string;
        };
      };
      markets: {
        Row: Market;
        Insert: {
          id?: string;
          contract_market_id: number;
          title: string;
          description?: string | null;
          deadline: string;
          status?: MarketStatus;
          total_pool_yes?: number;
          total_pool_no?: number;
          resolution_source?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          contract_market_id?: number;
          title?: string;
          description?: string | null;
          deadline?: string;
          status?: MarketStatus;
          total_pool_yes?: number;
          total_pool_no?: number;
          resolution_source?: string | null;
          created_at?: string;
        };
      };
      bets: {
        Row: Bet;
        Insert: {
          id?: string;
          market_id: string;
          wallet_address: string;
          side: BetSide;
          amount: number;
          claimed?: boolean;
          tx_hash: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          market_id?: string;
          wallet_address?: string;
          side?: BetSide;
          amount?: number;
          claimed?: boolean;
          tx_hash?: string;
          created_at?: string;
        };
      };
    };
  };
}
