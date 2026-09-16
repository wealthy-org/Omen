export type PointsSource = "daily_checkin" | "quest" | "prediction_market" | "referral";

export type MarketStatus = "active" | "resolved_yes" | "resolved_no" | "cancelled";

export type BetSide = "yes" | "no";

export type User = {
  id: string;
  wallet_address: string;
  total_points: number;
  last_checkin_at: string | null;
  streak_count: number;
  created_at: string;
};

export type Quest = {
  id: string;
  title: string;
  description: string | null;
  points_reward: number;
  is_active: boolean;
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
  description: string | null;
  category: string;
  deadline: string;
  status: MarketStatus;
  total_pool_yes: number;
  total_pool_no: number;
  resolution_source: string | null;
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: "points_events_quest_id_fkey";
            columns: ["quest_id"];
            isOneToOne: false;
            referencedRelation: "quests";
            referencedColumns: ["id"];
          }
        ];
      };
      markets: {
        Row: Market;
        Insert: {
          id?: string;
          contract_market_id: number;
          title: string;
          description?: string | null;
          category?: string;
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
          category?: string;
          deadline?: string;
          status?: MarketStatus;
          total_pool_yes?: number;
          total_pool_no?: number;
          resolution_source?: string | null;
          created_at?: string;
        };
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: "bets_market_id_fkey";
            columns: ["market_id"];
            isOneToOne: false;
            referencedRelation: "markets";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
