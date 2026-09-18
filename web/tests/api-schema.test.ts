import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("TICKET-23: Supabase Schema Migration", () => {
  const migrationPath = path.resolve(process.cwd(), "db/migrations/01_init_schema.sql");
  const rollbackPath = path.resolve(process.cwd(), "db/migrations/01_rollback_schema.sql");

  it("should exist on the filesystem", () => {
    expect(fs.existsSync(migrationPath)).toBe(true);
    expect(fs.existsSync(rollbackPath)).toBe(true);
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

  it("should define all core V1 tables", () => {
    const content = fs.readFileSync(migrationPath, "utf-8");
    expect(content).toContain("CREATE TABLE IF NOT EXISTS users");
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
  });

  it("should ensure all datetime columns use TIMESTAMPTZ according to database guidelines", () => {
    const content = fs.readFileSync(migrationPath, "utf-8");
    expect(content).toContain("created_at TIMESTAMPTZ NOT NULL DEFAULT now()");
    expect(content).toContain("open_time TIMESTAMPTZ");
    expect(content).toContain("close_time TIMESTAMPTZ");
    expect(content.includes("TIMESTAMP WITHOUT TIME ZONE")).toBe(false);
  });

  it("should enforce primary keys and foreign key constraints", () => {
    const content = fs.readFileSync(migrationPath, "utf-8");
    expect(content).toContain("id UUID PRIMARY KEY DEFAULT gen_random_uuid()");
    expect(content).toContain("belief_id UUID REFERENCES beliefs(id) ON DELETE CASCADE");
    expect(content).toContain("market_id UUID REFERENCES markets(id) ON DELETE CASCADE NOT NULL");
  });

  it("should enforce unique constraints on critical columns", () => {
    const content = fs.readFileSync(migrationPath, "utf-8");
    expect(content).toContain("wallet_address TEXT UNIQUE NOT NULL");
    expect(content).toContain("tx_hash TEXT UNIQUE NOT NULL");
  });

  it("should enforce check constraints for state and enum domains", () => {
    const content = fs.readFileSync(migrationPath, "utf-8");
    expect(content).toContain("CHECK (status IN ('DETECTED', 'OPEN', 'CONFIRMED', 'CLOSED', 'RESOLVED', 'SETTLED'))");
    expect(content).toContain("CHECK (side IN ('AGREE', 'DISAGREE'))");
    expect(content).toContain("CHECK (resolution_type IN ('PRICE_ABOVE', 'PRICE_BELOW', 'RELATIVE_PERFORMANCE'))");
  });

  it("should create performance indexes for query optimization", () => {
    const content = fs.readFileSync(migrationPath, "utf-8");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_beliefs_status ON beliefs(status);");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_markets_belief_id ON markets(belief_id);");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_markets_status ON markets(status);");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_market_positions_market_id ON market_positions(market_id);");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_market_positions_wallet_address ON market_positions(wallet_address);");
    expect(content).toContain("CREATE INDEX IF NOT EXISTS idx_market_positions_tx_hash ON market_positions(tx_hash);");
  });
});
