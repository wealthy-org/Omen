export type DbMarketStatus =
  | "active"
  | "cancelled"
  | "OPEN"
  | "CLOSED"
  | "RESOLVED"
  | "SETTLED";

export type DbBetSide = "AGREE" | "DISAGREE";

export type DbBeliefStatus =
  | "DETECTED"
  | "OPEN"
  | "CONFIRMED"
  | "CLOSED"
  | "RESOLVED"
  | "SETTLED";

export type MarketResolutionType =
  | "PRICE_ABOVE"
  | "PRICE_BELOW"
  | "RELATIVE_PERFORMANCE";

export type MarketWinner = "AGREE" | "DISAGREE" | "VOID";

export type DbPositionSide = "AGREE" | "DISAGREE";

export type MarketStatus = DbMarketStatus;
export type BetSide = DbBetSide;
export type BeliefStatus = DbBeliefStatus;
export type PositionSide = DbPositionSide;

export type MarketEventType =
  | "MarketCreated"
  | "PositionTaken"
  | "MarketClosed"
  | "MarketResolved"
  | "PayoutClaimed"
  | "MarketVoided";

export type OracleSnapshotSource = "chainlink" | "robinhood_market_data";

export type SnapshotType = "START" | "END" | "DISPLAY";

export type ResolvedOutcome = "AGREE" | "DISAGREE" | "VOID";

export type User = {
  id: string;
  wallet_address: string;
  created_at: string;
};

export type UserV1 = {
  id: string;
  wallet_address: string;
  created_at: string;
};

export type Belief = {
  id: string;
  author: string | null;
  statement: string;
  source_url: string | null;
  source_platform: string | null;
  source_timestamp: string | null;
  ai_confidence: number | null;
  status: DbBeliefStatus;
  created_at: string;
};

export type BeliefSource = {
  id: string;
  belief_id: string;
  raw_text: string;
  submitted_by_wallet: string | null;
  created_at: string;
};

export type Market = {
  id: string;
  contract_market_id?: number;
  belief_id?: string | null;
  contract_address?: string;
  chain_id?: number;
  title?: string;
  category?: string;
  description?: string | null;
  deadline?: string;
  status: DbMarketStatus;
  resolution_source?: string | null;
  agree_pool?: number;
  disagree_pool?: number;
  open_time?: string;
  close_time?: string;
  resolution_type?: MarketResolutionType | null;
  resolution_config?: Record<string, unknown> | null;
  metadata_hash?: string | null;
  winner?: MarketWinner | null;
  created_at: string;
};

export type MarketV1 = {
  id: string;
  belief_id: string | null;
  contract_address: string;
  chain_id: number;
  agree_pool: number;
  disagree_pool: number;
  open_time: string;
  close_time: string;
  resolution_type: MarketResolutionType | null;
  resolution_config: Record<string, unknown> | null;
  metadata_hash: string | null;
  status: string;
  winner: MarketWinner | null;
  created_at: string;
};

export type MarketPosition = {
  id: string;
  market_id: string;
  wallet_address: string;
  side: DbPositionSide;
  amount: number;
  claimed: boolean;
  tx_hash: string;
  created_at: string;
};

export type MarketEvent = {
  id: string;
  market_id: string | null;
  event_type: MarketEventType | string;
  wallet_address: string | null;
  amount: number | null;
  tx_hash: string;
  block_number: number | null;
  created_at: string;
};

export type MarketResolution = {
  id: string;
  market_id: string;
  oracle_source: string | null;
  start_price: number | null;
  end_price: number | null;
  resolved_outcome: ResolvedOutcome;
  resolution_tx_hash: string | null;
  resolved_at: string;
};

export type MarketSettlement = {
  id: string;
  market_id: string;
  total_pool: number | null;
  distributable_pool: number | null;
  protocol_fee: number | null;
  settled_at: string;
};

export type DbCreatorProfile = {
  id: string;
  wallet_address: string;
  handle: string | null;
  confirmed_beliefs_count: number;
  resolved_count: number;
  correct_count: number;
  created_at: string;
};

export type CreatorProfile = DbCreatorProfile;

export type CreatorConfirmation = {
  id: string;
  belief_id: string;
  creator_wallet: string;
  confirmed_at: string;
  signature: string;
  tx_hash: string | null;
};

export type OracleSnapshot = {
  id: string;
  market_id: string | null;
  source: OracleSnapshotSource | null;
  asset: string;
  price: number;
  snapshot_type: SnapshotType | null;
  recorded_at: string;
};

export type Bet = {
  id: string;
  market_id: string;
  wallet_address: string;
  side: DbBetSide;
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
      markets: {
        Row: Market;
        Insert: Partial<Market> & {
          contract_market_id?: number;
          title?: string;
          deadline?: string;
        };
        Update: Partial<Market>;
        Relationships: [
          {
            foreignKeyName: "markets_belief_id_fkey";
            columns: ["belief_id"];
            referencedRelation: "beliefs";
            referencedColumns: ["id"];
          }
        ];
      };
      bets: {
        Row: Bet;
        Insert: Partial<Bet> & {
          market_id: string;
          wallet_address: string;
          side: DbBetSide;
          amount: number;
          tx_hash: string;
        };
        Update: Partial<Bet>;
        Relationships: [
          {
            foreignKeyName: "bets_market_id_fkey";
            columns: ["market_id"];
            referencedRelation: "markets";
            referencedColumns: ["id"];
          }
        ];
      };
      beliefs: {
        Row: Belief;
        Insert: Partial<Belief> & { statement: string };
        Update: Partial<Belief>;
        Relationships: [];
      };
      belief_sources: {
        Row: BeliefSource;
        Insert: Partial<BeliefSource> & { belief_id: string; raw_text: string };
        Update: Partial<BeliefSource>;
        Relationships: [
          {
            foreignKeyName: "belief_sources_belief_id_fkey";
            columns: ["belief_id"];
            referencedRelation: "beliefs";
            referencedColumns: ["id"];
          }
        ];
      };
      market_positions: {
        Row: MarketPosition;
        Insert: Partial<MarketPosition> & {
          market_id: string;
          wallet_address: string;
          side: DbPositionSide;
          amount: number;
          tx_hash: string;
        };
        Update: Partial<MarketPosition>;
        Relationships: [
          {
            foreignKeyName: "market_positions_market_id_fkey";
            columns: ["market_id"];
            referencedRelation: "markets";
            referencedColumns: ["id"];
          }
        ];
      };
      market_events: {
        Row: MarketEvent;
        Insert: Partial<MarketEvent> & {
          event_type: string;
          tx_hash: string;
        };
        Update: Partial<MarketEvent>;
        Relationships: [
          {
            foreignKeyName: "market_events_market_id_fkey";
            columns: ["market_id"];
            referencedRelation: "markets";
            referencedColumns: ["id"];
          }
        ];
      };
      market_resolutions: {
        Row: MarketResolution;
        Insert: Partial<MarketResolution> & {
          market_id: string;
          resolved_outcome: ResolvedOutcome;
        };
        Update: Partial<MarketResolution>;
        Relationships: [
          {
            foreignKeyName: "market_resolutions_market_id_fkey";
            columns: ["market_id"];
            referencedRelation: "markets";
            referencedColumns: ["id"];
          }
        ];
      };
      market_settlements: {
        Row: MarketSettlement;
        Insert: Partial<MarketSettlement> & {
          market_id: string;
        };
        Update: Partial<MarketSettlement>;
        Relationships: [
          {
            foreignKeyName: "market_settlements_market_id_fkey";
            columns: ["market_id"];
            referencedRelation: "markets";
            referencedColumns: ["id"];
          }
        ];
      };
      creator_profiles: {
        Row: DbCreatorProfile;
        Insert: Partial<DbCreatorProfile> & {
          wallet_address: string;
        };
        Update: Partial<DbCreatorProfile>;
        Relationships: [];
      };
      creator_confirmations: {
        Row: CreatorConfirmation;
        Insert: Partial<CreatorConfirmation> & {
          belief_id: string;
          creator_wallet: string;
          signature: string;
        };
        Update: Partial<CreatorConfirmation>;
        Relationships: [
          {
            foreignKeyName: "creator_confirmations_belief_id_fkey";
            columns: ["belief_id"];
            referencedRelation: "beliefs";
            referencedColumns: ["id"];
          }
        ];
      };
      oracle_snapshots: {
        Row: OracleSnapshot;
        Insert: Partial<OracleSnapshot> & {
          asset: string;
          price: number;
        };
        Update: Partial<OracleSnapshot>;
        Relationships: [
          {
            foreignKeyName: "oracle_snapshots_market_id_fkey";
            columns: ["market_id"];
            referencedRelation: "markets";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
