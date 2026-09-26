import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  customType,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";

const timestamptz = customType<{ data: string; driverData: string | Date }>({
  dataType: () => "timestamp with time zone",
  fromDriver: (value) => new Date(value).toISOString(),
});

const createdAt = () => timestamptz("created_at").notNull().default(sql`now()`);

const amount = (name: string) => numeric(name, { mode: "number" });

export type BeliefClaim =
  | { kind: "PRICE"; asset: string; direction: "ABOVE" | "BELOW"; targetPrice: number; deadline: string }
  | { kind: "EVENT"; question: string; criteria: string; category: string; deadline: string };

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    wallet_address: text("wallet_address").notNull().unique(),
    created_at: createdAt(),
  },
  (t) => [index("idx_users_wallet_address").on(t.wallet_address)]
);

export const beliefs = pgTable(
  "beliefs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    author: text("author"),
    statement: text("statement").notNull(),
    source_url: text("source_url"),
    source_platform: text("source_platform").default("manual"),
    source_timestamp: timestamptz("source_timestamp"),
    ai_confidence: amount("ai_confidence"),
    claim: jsonb("claim").$type<BeliefClaim>(),
    status: text("status")
      .$type<"DETECTED" | "OPEN" | "CONFIRMED" | "CLOSED" | "RESOLVED" | "SETTLED">()
      .notNull()
      .default("DETECTED"),
    created_at: createdAt(),
  },
  (t) => [
    check(
      "beliefs_status_check",
      sql`${t.status} IN ('DETECTED', 'OPEN', 'CONFIRMED', 'CLOSED', 'RESOLVED', 'SETTLED')`
    ),
    index("idx_beliefs_status").on(t.status),
    index("idx_beliefs_author").on(t.author),
  ]
);

export const belief_sources = pgTable(
  "belief_sources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    belief_id: uuid("belief_id").references(() => beliefs.id, { onDelete: "cascade" }),
    raw_text: text("raw_text").notNull(),
    submitted_by_wallet: text("submitted_by_wallet"),
    created_at: createdAt(),
  },
  (t) => [index("idx_belief_sources_belief_id").on(t.belief_id)]
);

export const markets = pgTable(
  "markets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    belief_id: uuid("belief_id").references(() => beliefs.id, { onDelete: "cascade" }),
    contract_address: text("contract_address"),
    chain_id: integer("chain_id").notNull().default(11155111),
    contract_market_id: integer("contract_market_id"),
    title: text("title"),
    description: text("description"),
    category: text("category").default("crypto"),
    agree_pool: amount("agree_pool").notNull().default(0),
    disagree_pool: amount("disagree_pool").notNull().default(0),
    open_time: timestamptz("open_time").notNull().default(sql`now()`),
    close_time: timestamptz("close_time")
      .notNull()
      .default(sql`(now() + interval '7 days')`),
    deadline: timestamptz("deadline"),
    resolution_type: text("resolution_type").$type<
      "PRICE_ABOVE" | "PRICE_BELOW" | "RELATIVE_PERFORMANCE" | "MANUAL"
    >(),
    resolution_config: jsonb("resolution_config").$type<Record<string, unknown>>(),
    resolution_source: text("resolution_source"),
    metadata_hash: text("metadata_hash"),
    status: text("status").notNull().default("OPEN"),
    winner: text("winner").$type<"AGREE" | "DISAGREE" | "VOID">(),
    created_at: createdAt(),
  },
  (t) => [
    check(
      "markets_resolution_type_check",
      sql`${t.resolution_type} IN ('PRICE_ABOVE', 'PRICE_BELOW', 'RELATIVE_PERFORMANCE', 'MANUAL')`
    ),
    check("markets_winner_check", sql`${t.winner} IN ('AGREE', 'DISAGREE', 'VOID')`),
    index("idx_markets_belief_id").on(t.belief_id),
    index("idx_markets_chain_id").on(t.chain_id),
    index("idx_markets_contract_address").on(t.contract_address),
    index("idx_markets_contract_market_id").on(t.contract_market_id),
    index("idx_markets_status").on(t.status),
    index("idx_markets_category").on(t.category),
  ]
);

export const market_positions = pgTable(
  "market_positions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    market_id: uuid("market_id")
      .notNull()
      .references(() => markets.id, { onDelete: "cascade" }),
    wallet_address: text("wallet_address").notNull(),
    side: text("side").$type<"AGREE" | "DISAGREE">().notNull(),
    amount: amount("amount").notNull(),
    claimed: boolean("claimed").notNull().default(false),
    tx_hash: text("tx_hash").notNull().unique(),
    created_at: createdAt(),
  },
  (t) => [
    check("market_positions_side_check", sql`${t.side} IN ('AGREE', 'DISAGREE')`),
    index("idx_market_positions_market_id").on(t.market_id),
    index("idx_market_positions_wallet_address").on(t.wallet_address),
    index("idx_market_positions_tx_hash").on(t.tx_hash),
  ]
);

export const market_events = pgTable(
  "market_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    market_id: uuid("market_id").references(() => markets.id, { onDelete: "cascade" }),
    event_type: text("event_type").notNull(),
    wallet_address: text("wallet_address"),
    amount: amount("amount"),
    tx_hash: text("tx_hash").notNull().unique(),
    block_number: integer("block_number"),
    created_at: createdAt(),
  },
  (t) => [
    index("idx_market_events_market_id").on(t.market_id),
    index("idx_market_events_tx_hash").on(t.tx_hash),
  ]
);

export const market_resolutions = pgTable(
  "market_resolutions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    market_id: uuid("market_id")
      .notNull()
      .references(() => markets.id, { onDelete: "cascade" }),
    oracle_source: text("oracle_source").default("chainlink"),
    start_price: amount("start_price"),
    end_price: amount("end_price"),
    resolved_outcome: text("resolved_outcome").$type<"AGREE" | "DISAGREE" | "VOID">().notNull(),
    resolution_tx_hash: text("resolution_tx_hash"),
    resolved_at: timestamptz("resolved_at")
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    check(
      "market_resolutions_resolved_outcome_check",
      sql`${t.resolved_outcome} IN ('AGREE', 'DISAGREE', 'VOID')`
    ),
    index("idx_market_resolutions_market_id").on(t.market_id),
  ]
);

export const market_settlements = pgTable(
  "market_settlements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    market_id: uuid("market_id")
      .notNull()
      .references(() => markets.id, { onDelete: "cascade" }),
    total_pool: amount("total_pool"),
    distributable_pool: amount("distributable_pool"),
    protocol_fee: amount("protocol_fee").default(0),
    settled_at: timestamptz("settled_at")
      .notNull()
      .default(sql`now()`),
  },
  (t) => [index("idx_market_settlements_market_id").on(t.market_id)]
);

export const creator_profiles = pgTable(
  "creator_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    wallet_address: text("wallet_address").notNull().unique(),
    handle: text("handle"),
    display_name: text("display_name"),
    avatar_url: text("avatar_url"),
    bio: text("bio"),
    farcaster_fid: integer("farcaster_fid").unique(),
    confirmed_beliefs_count: integer("confirmed_beliefs_count").notNull().default(0),
    resolved_count: integer("resolved_count").notNull().default(0),
    correct_count: integer("correct_count").notNull().default(0),
    created_at: createdAt(),
  },
  (t) => [index("idx_creator_profiles_wallet_address").on(t.wallet_address)]
);

export const creator_confirmations = pgTable(
  "creator_confirmations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    belief_id: uuid("belief_id")
      .notNull()
      .references(() => beliefs.id, { onDelete: "cascade" }),
    creator_wallet: text("creator_wallet").notNull(),
    confirmed_at: timestamptz("confirmed_at")
      .notNull()
      .default(sql`now()`),
    signature: text("signature").notNull(),
    tx_hash: text("tx_hash"),
  },
  (t) => [index("idx_creator_confirmations_belief_id").on(t.belief_id)]
);

export const oracle_snapshots = pgTable(
  "oracle_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    market_id: uuid("market_id").references(() => markets.id, { onDelete: "cascade" }),
    source: text("source").$type<"chainlink" | "robinhood_market_data">(),
    asset: text("asset").notNull(),
    price: amount("price").notNull(),
    snapshot_type: text("snapshot_type").$type<
      "START" | "END" | "DISPLAY" | "RESOLUTION" | "BASELINE"
    >(),
    recorded_at: timestamptz("recorded_at")
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    check("oracle_snapshots_source_check", sql`${t.source} IN ('chainlink', 'robinhood_market_data')`),
    check(
      "oracle_snapshots_snapshot_type_check",
      sql`${t.snapshot_type} IN ('START', 'END', 'DISPLAY', 'RESOLUTION', 'BASELINE')`
    ),
    index("idx_oracle_snapshots_market_id").on(t.market_id),
  ]
);

export const beliefsRelations = relations(beliefs, ({ many }) => ({
  belief_sources: many(belief_sources),
  markets: many(markets),
  creator_confirmations: many(creator_confirmations),
}));

export const beliefSourcesRelations = relations(belief_sources, ({ one }) => ({
  beliefs: one(beliefs, { fields: [belief_sources.belief_id], references: [beliefs.id] }),
}));

export const marketsRelations = relations(markets, ({ one, many }) => ({
  beliefs: one(beliefs, { fields: [markets.belief_id], references: [beliefs.id] }),
  market_positions: many(market_positions),
  market_events: many(market_events),
  market_resolutions: many(market_resolutions),
  market_settlements: many(market_settlements),
  oracle_snapshots: many(oracle_snapshots),
}));

export const marketPositionsRelations = relations(market_positions, ({ one }) => ({
  markets: one(markets, { fields: [market_positions.market_id], references: [markets.id] }),
}));

export const marketEventsRelations = relations(market_events, ({ one }) => ({
  markets: one(markets, { fields: [market_events.market_id], references: [markets.id] }),
}));

export const marketResolutionsRelations = relations(market_resolutions, ({ one }) => ({
  markets: one(markets, { fields: [market_resolutions.market_id], references: [markets.id] }),
}));

export const marketSettlementsRelations = relations(market_settlements, ({ one }) => ({
  markets: one(markets, { fields: [market_settlements.market_id], references: [markets.id] }),
}));

export const creatorConfirmationsRelations = relations(creator_confirmations, ({ one }) => ({
  beliefs: one(beliefs, { fields: [creator_confirmations.belief_id], references: [beliefs.id] }),
}));

export const oracleSnapshotsRelations = relations(oracle_snapshots, ({ one }) => ({
  markets: one(markets, { fields: [oracle_snapshots.market_id], references: [markets.id] }),
}));
