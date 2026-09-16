import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("TICKET-23: Supabase Schema Migration", () => {
  const migrationPath = path.resolve(process.cwd(), "db/migrations/01_init_schema.sql");

  it("should exist on the filesystem", () => {
    expect(fs.existsSync(migrationPath)).toBe(true);
  });

  it("should adhere strictly to the Zero-Comment Policy", () => {
    const content = fs.readFileSync(migrationPath, "utf-8");
    const lines = content.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      expect(trimmed.startsWith("--")).toBe(false);
      expect(trimmed.includes("/*")).toBe(false);
      expect(trimmed.includes("*/")).toBe(false);
      expect(trimmed.startsWith("//")).toBe(false);
    }
  });

  it("should define all 5 core tables", () => {
    const content = fs.readFileSync(migrationPath, "utf-8");
    expect(content).toContain("CREATE TABLE IF NOT EXISTS users");
    expect(content).toContain("CREATE TABLE IF NOT EXISTS quests");
    expect(content).toContain("CREATE TABLE IF NOT EXISTS points_events");
    expect(content).toContain("CREATE TABLE IF NOT EXISTS markets");
    expect(content).toContain("CREATE TABLE IF NOT EXISTS bets");
  });

  it("should ensure all datetime columns use TIMESTAMPTZ according to database guidelines", () => {
    const content = fs.readFileSync(migrationPath, "utf-8");
    expect(content).toContain("last_checkin_at TIMESTAMPTZ");
    expect(content).toContain("created_at TIMESTAMPTZ NOT NULL DEFAULT now()");
    expect(content).toContain("deadline TIMESTAMPTZ NOT NULL");
    expect(content.includes("TIMESTAMP WITHOUT TIME ZONE")).toBe(false);
  });

  it("should enforce primary keys and foreign key constraints", () => {
    const content = fs.readFileSync(migrationPath, "utf-8");
    expect(content).toContain("id UUID PRIMARY KEY DEFAULT gen_random_uuid()");
    expect(content).toContain("quest_id UUID REFERENCES quests(id) ON DELETE SET NULL");
    expect(content).toContain("market_id UUID REFERENCES markets(id) ON DELETE CASCADE NOT NULL");
  });

  it("should enforce unique constraints on critical columns", () => {
    const content = fs.readFileSync(migrationPath, "utf-8");
    expect(content).toContain("wallet_address TEXT UNIQUE NOT NULL");
    expect(content).toContain("contract_market_id INTEGER UNIQUE NOT NULL");
    expect(content).toContain("tx_hash TEXT UNIQUE NOT NULL");
  });

  it("should enforce check constraints for state and enum domains", () => {
    const content = fs.readFileSync(migrationPath, "utf-8");
    expect(content).toContain("CHECK (source IN ('daily_checkin', 'quest', 'prediction_market', 'referral'))");
    expect(content).toContain("CHECK (status IN ('active', 'resolved_yes', 'resolved_no', 'cancelled'))");
    expect(content).toContain("CHECK (side IN ('yes', 'no'))");
  });

  it("should create performance indexes for query optimization", () => {
    const content = fs.readFileSync(migrationPath, "utf-8");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_users_total_points ON users(total_points DESC);");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_quests_is_active ON quests(is_active);");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_points_events_wallet_address ON points_events(wallet_address);");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_points_events_quest_id ON points_events(quest_id);");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_markets_contract_market_id ON markets(contract_market_id);");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_markets_status ON markets(status);");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_markets_category ON markets(category);");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_bets_market_id ON bets(market_id);");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_bets_wallet_address ON bets(wallet_address);");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_bets_tx_hash ON bets(tx_hash);");
  });
});
