import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ETHEREUM_SEPOLIA_CHAIN_ID } from "../lib/constants";
import type {
  Database,
  Belief,
  BeliefSource,
  MarketV1,
  MarketPosition,
  MarketEvent,
  MarketResolution,
  MarketSettlement,
  CreatorProfile,
  CreatorConfirmation,
  OracleSnapshot,
  UserV1,
  BeliefStatus,
  MarketResolutionType,
  MarketWinner,
  PositionSide,
  MarketEventType,
  OracleSnapshotSource,
  SnapshotType,
} from "../types/database";

describe("TICKET-65: Supabase Schema V1 Beliefs Migration", () => {
  const migrationPath = path.resolve(process.cwd(), "db/migrations/01_init_schema.sql");
  const rollbackPath = path.resolve(process.cwd(), "db/migrations/01_rollback_schema.sql");

  it("should have migration and rollback files on filesystem", () => {
    expect(fs.existsSync(migrationPath)).toBe(true);
    expect(fs.existsSync(rollbackPath)).toBe(true);
  });

  it("should adhere strictly to Zero-Comment Policy in migration and rollback scripts", () => {
    for (const filePath of [migrationPath, rollbackPath]) {
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        expect(trimmed.startsWith("--")).toBe(false);
        expect(trimmed.includes("/*")).toBe(false);
        expect(trimmed.includes("*/")).toBe(false);
        expect(trimmed.startsWith("//")).toBe(false);
      }
    }
  });

  it("should define all 11 core V1 tables", () => {
    const content = fs.readFileSync(migrationPath, "utf-8");
    expect(content).toContain("CREATE TABLE IF NOT EXISTS beliefs");
    expect(content).toContain("CREATE TABLE IF NOT EXISTS belief_sources");
    expect(content).toContain("CREATE TABLE IF NOT EXISTS markets");
    expect(content).toContain("CREATE TABLE IF NOT EXISTS market_positions");
    expect(content).toContain("CREATE TABLE IF NOT EXISTS market_events");
    expect(content).toContain("CREATE TABLE IF NOT EXISTS market_resolutions");
    expect(content).toContain("CREATE TABLE IF NOT EXISTS market_settlements");
    expect(content).toContain("CREATE TABLE IF NOT EXISTS creator_profiles");
    expect(content).toContain("CREATE TABLE IF NOT EXISTS creator_confirmations");
    expect(content).toContain("CREATE TABLE IF NOT EXISTS oracle_snapshots");
    expect(content).toContain("CREATE TABLE IF NOT EXISTS users");
  });

  it("should ensure all datetime columns use TIMESTAMPTZ", () => {
    const content = fs.readFileSync(migrationPath, "utf-8");
    expect(content).toContain("source_timestamp TIMESTAMPTZ");
    expect(content).toContain("created_at TIMESTAMPTZ NOT NULL DEFAULT now()");
    expect(content).toContain("open_time TIMESTAMPTZ");
    expect(content).toContain("close_time TIMESTAMPTZ");
    expect(content).toContain("confirmed_at TIMESTAMPTZ");
    expect(content).toContain("recorded_at TIMESTAMPTZ");
    expect(content).toContain("resolved_at TIMESTAMPTZ");
    expect(content).toContain("settled_at TIMESTAMPTZ");
    expect(content.includes("TIMESTAMP WITHOUT TIME ZONE")).toBe(false);
  });

  it("should enforce primary keys and foreign key references", () => {
    const content = fs.readFileSync(migrationPath, "utf-8");
    expect(content).toContain("belief_id UUID REFERENCES beliefs(id) ON DELETE CASCADE");
    expect(content).toContain("market_id UUID REFERENCES markets(id) ON DELETE CASCADE");
  });

  it("should enforce check constraints for state machine and outcome domains", () => {
    const content = fs.readFileSync(migrationPath, "utf-8");
    expect(content).toContain("CHECK (status IN ('DETECTED', 'OPEN', 'CONFIRMED', 'CLOSED', 'RESOLVED', 'SETTLED'))");
    expect(content).toContain("CHECK (resolution_type IN ('PRICE_ABOVE', 'PRICE_BELOW', 'RELATIVE_PERFORMANCE'))");
    expect(content).toContain("CHECK (winner IN ('AGREE', 'DISAGREE', 'VOID'))");
    expect(content).toContain("CHECK (side IN ('AGREE', 'DISAGREE'))");
    expect(content).toContain("CHECK (resolved_outcome IN ('AGREE', 'DISAGREE', 'VOID'))");
    expect(content).toContain("CHECK (source IN ('chainlink', 'robinhood_market_data'))");
  });

  it("should create performance indexes for all 11 core tables", () => {
    const content = fs.readFileSync(migrationPath, "utf-8");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_beliefs_status ON beliefs(status);");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_beliefs_author ON beliefs(author);");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_belief_sources_belief_id ON belief_sources(belief_id);");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_markets_belief_id ON markets(belief_id);");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_markets_chain_id ON markets(chain_id);");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_markets_contract_address ON markets(contract_address);");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_market_positions_market_id ON market_positions(market_id);");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_market_positions_wallet_address ON market_positions(wallet_address);");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_market_events_market_id ON market_events(market_id);");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_market_events_tx_hash ON market_events(tx_hash);");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_market_resolutions_market_id ON market_resolutions(market_id);");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_market_settlements_market_id ON market_settlements(market_id);");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_creator_profiles_wallet_address ON creator_profiles(wallet_address);");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_creator_confirmations_belief_id ON creator_confirmations(belief_id);");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_oracle_snapshots_market_id ON oracle_snapshots(market_id);");
  });

  it("should enable RLS and public read policies", () => {
    const content = fs.readFileSync(migrationPath, "utf-8");
    expect(content).toContain("ALTER TABLE users ENABLE ROW LEVEL SECURITY;");
    expect(content).toContain("ALTER TABLE beliefs ENABLE ROW LEVEL SECURITY;");
    expect(content).toContain("ALTER TABLE belief_sources ENABLE ROW LEVEL SECURITY;");
    expect(content).toContain("ALTER TABLE markets ENABLE ROW LEVEL SECURITY;");
    expect(content).toContain("ALTER TABLE market_positions ENABLE ROW LEVEL SECURITY;");
    expect(content).toContain("ALTER TABLE market_events ENABLE ROW LEVEL SECURITY;");
    expect(content).toContain("ALTER TABLE market_resolutions ENABLE ROW LEVEL SECURITY;");
    expect(content).toContain("ALTER TABLE market_settlements ENABLE ROW LEVEL SECURITY;");
    expect(content).toContain("ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;");
    expect(content).toContain("ALTER TABLE creator_confirmations ENABLE ROW LEVEL SECURITY;");
    expect(content).toContain("ALTER TABLE oracle_snapshots ENABLE ROW LEVEL SECURITY;");
    expect(content).toContain('CREATE POLICY "Allow public read access on beliefs" ON beliefs FOR SELECT USING (true);');
  });

  it("should validate TypeScript types definition for 11 V1 tables", () => {
    const mockBelief: Belief = {
      id: "b45a9094-c8c3-4d6f-bf62-1b86e8149811",
      author: "@vitalikbuterin",
      statement: "ETH will outperform SOL before year end",
      source_url: "https://x.com/vitalikbuterin/status/123",
      source_platform: "manual",
      source_timestamp: "2026-09-01T00:00:00Z",
      ai_confidence: 0.95,
      status: "OPEN",
      created_at: "2026-09-01T00:00:00Z",
    };
    expect(mockBelief.status).toBe("OPEN");

    const mockBeliefSource: BeliefSource = {
      id: "a1",
      belief_id: mockBelief.id,
      raw_text: "ETH will outperform SOL before year end",
      submitted_by_wallet: "0x123",
      created_at: "2026-09-01T00:00:00Z",
    };
    expect(mockBeliefSource.belief_id).toBe(mockBelief.id);

    const mockMarket: MarketV1 = {
      id: "m1",
      belief_id: mockBelief.id,
      contract_address: "0x345",
      chain_id: ETHEREUM_SEPOLIA_CHAIN_ID,
      agree_pool: 10,
      disagree_pool: 5,
      open_time: "2026-09-01T00:00:00Z",
      close_time: "2026-10-01T00:00:00Z",
      resolution_type: "RELATIVE_PERFORMANCE",
      resolution_config: { assetA: "ETH", assetB: "SOL" },
      metadata_hash: "0xabc",
      status: "OPEN",
      winner: null,
      created_at: "2026-09-01T00:00:00Z",
    };
    expect(mockMarket.resolution_type).toBe("RELATIVE_PERFORMANCE");

    const mockPosition: MarketPosition = {
      id: "p1",
      market_id: mockMarket.id,
      wallet_address: "0xuser",
      side: "AGREE",
      amount: 2.5,
      claimed: false,
      tx_hash: "0xtx1",
      created_at: "2026-09-01T00:00:00Z",
    };
    expect(mockPosition.side).toBe("AGREE");

    const mockEvent: MarketEvent = {
      id: "e1",
      market_id: mockMarket.id,
      event_type: "PositionTaken",
      wallet_address: "0xuser",
      amount: 2.5,
      tx_hash: "0xtx1",
      block_number: 123456,
      created_at: "2026-09-01T00:00:00Z",
    };
    expect(mockEvent.event_type).toBe("PositionTaken");

    const mockResolution: MarketResolution = {
      id: "r1",
      market_id: mockMarket.id,
      oracle_source: "chainlink",
      start_price: 2500,
      end_price: 3200,
      resolved_outcome: "AGREE",
      resolution_tx_hash: "0xres",
      resolved_at: "2026-10-01T00:00:00Z",
    };
    expect(mockResolution.resolved_outcome).toBe("AGREE");

    const mockSettlement: MarketSettlement = {
      id: "s1",
      market_id: mockMarket.id,
      total_pool: 15,
      distributable_pool: 14.85,
      protocol_fee: 0.15,
      settled_at: "2026-10-01T01:00:00Z",
    };
    expect(mockSettlement.total_pool).toBe(15);

    const mockProfile: CreatorProfile = {
      id: "cp1",
      wallet_address: "0xcreator",
      handle: "vitalik",
      confirmed_beliefs_count: 5,
      resolved_count: 3,
      correct_count: 2,
      created_at: "2026-09-01T00:00:00Z",
    };
    expect(mockProfile.handle).toBe("vitalik");

    const mockConfirmation: CreatorConfirmation = {
      id: "cc1",
      belief_id: mockBelief.id,
      creator_wallet: "0xcreator",
      confirmed_at: "2026-09-01T02:00:00Z",
      signature: "0xsig",
      tx_hash: "0xtxconf",
    };
    expect(mockConfirmation.signature).toBe("0xsig");

    const mockSnapshot: OracleSnapshot = {
      id: "os1",
      market_id: mockMarket.id,
      source: "chainlink",
      asset: "ETH/USD",
      price: 2500,
      snapshot_type: "START",
      recorded_at: "2026-09-01T00:00:00Z",
    };
    expect(mockSnapshot.snapshot_type).toBe("START");

    const mockUserV1: UserV1 = {
      id: "u1",
      wallet_address: "0xuser",
      created_at: "2026-09-01T00:00:00Z",
    };
    expect(mockUserV1.wallet_address).toBe("0xuser");
  });
});
