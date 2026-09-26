import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import { POST as submitBelief } from "../app/api/beliefs/submit/route";
import { computeBeliefHashes } from "../lib/market/factory-client";
import * as factoryClientLib from "../lib/market/factory-client";
import { ETHEREUM_SEPOLIA_CHAIN_ID } from "../lib/constants";
import { useTestDb, schema } from "./helpers/test-db";

describe("TICKET-85: Submit Belief & On-Chain Market Creation API", () => {

  const testDb = useTestDb();

  beforeEach(async () => {
    vi.restoreAllMocks();
    await testDb.reset();
  });

  function createMockPostRequest(url: string, body: unknown) {
    return new NextRequest(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  function mockOnChainMarket() {
    vi.spyOn(factoryClientLib, "createOnChainMarket").mockResolvedValue({
      contractAddress: "0xmarketContract123456789012345678901234",
      contractMarketId: 1,
      txHash: "0xtxhash123",
    });
  }

  it("should adhere strictly to Zero-Comment Policy in submit and factory client files", () => {
    const filesToCheck = [
      path.resolve(process.cwd(), "app/api/beliefs/submit/route.ts"),
      path.resolve(process.cwd(), "lib/market/factory-client.ts"),
    ];

    for (const filePath of filesToCheck) {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf-8");
        const lines = content.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          expect(trimmed.startsWith("/" + "/")).toBe(false);
          expect(trimmed.startsWith("/" + "*")).toBe(false);
          expect(trimmed.includes("*" + "/")).toBe(false);
        }
      }
    }
  });

  it("should compute deterministic 32-byte hashes for belief, source, and resolution config", () => {
    const hashes = computeBeliefHashes(
      "ETH will flip BTC in 2026",
      "https://x.com/vitalik/status/123",
      {
        resolutionType: "PRICE_ABOVE",
        targetPrice: 5000,
      }
    );

    expect(hashes.beliefHash.startsWith("0x")).toBe(true);
    expect(hashes.beliefHash).toHaveLength(66);
    expect(hashes.sourceHash.startsWith("0x")).toBe(true);
    expect(hashes.sourceHash).toHaveLength(66);
    expect(hashes.resolutionHash.startsWith("0x")).toBe(true);
    expect(hashes.resolutionHash).toHaveLength(66);
  });

  it("should return HTTP 400 when required fields are missing", async () => {
    const reqMissingStatement = createMockPostRequest("http://localhost:3000/api/beliefs/submit", {
      raw_text: "Some source text",
    });
    const res1 = await submitBelief(reqMissingStatement);
    expect(res1.status).toBe(400);

    const reqMissingSource = createMockPostRequest("http://localhost:3000/api/beliefs/submit", {
      statement: "Valid statement",
    });
    const res2 = await submitBelief(reqMissingSource);
    expect(res2.status).toBe(400);
  });

  it("should submit belief and create market on-chain successfully", async () => {
    mockOnChainMarket();

    const req = createMockPostRequest("http://localhost:3000/api/beliefs/submit", {
      statement: "Solana will reach 1M daily active wallets",
      author: "0xauthor1",
      raw_text: "https://x.com/solana/status/999",
      submitted_by_wallet: "0xsubmitter",
      close_time: 1727164800,
      resolution_type: "PRICE_ABOVE",
      resolution_config: { targetPrice: 200 },
      chain_id: ETHEREUM_SEPOLIA_CHAIN_ID,
    });

    const res = await submitBelief(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.contract_address).toBe("0xmarketContract123456789012345678901234");
    expect(body.data.tx_hash).toBe("0xtxhash123");

    const { db } = testDb;
    const belief = await db.query.beliefs.findFirst({ where: eq(schema.beliefs.id, body.data.belief_id) });
    expect(belief?.statement).toBe("Solana will reach 1M daily active wallets");
    expect(belief?.status).toBe("DETECTED");

    const market = await db.query.markets.findFirst({
      where: eq(schema.markets.id, body.data.market_id),
      with: { market_events: true },
    });
    expect(market?.belief_id).toBe(body.data.belief_id);
    expect(market?.status).toBe("OPEN");
    expect(market?.close_time).toBe(new Date(1727164800 * 1000).toISOString());
    expect(market?.resolution_config).toEqual({ targetPrice: 200 });
    expect(market?.market_events[0].event_type).toBe("MarketCreated");
    expect(market?.market_events[0].tx_hash).toBe("0xtxhash123");

    const sources = await db.query.belief_sources.findMany();
    expect(sources[0].raw_text).toBe("https://x.com/solana/status/999");
  });

  it("should register a creator profile once per author handle without marking beliefs as confirmed", async () => {
    const submit = (txSuffix: string) => {
      vi.spyOn(factoryClientLib, "createOnChainMarket").mockResolvedValue({
        contractAddress: "0xmarketContract123456789012345678901234",
        contractMarketId: 1,
        txHash: `0xtx${txSuffix}`,
      });
      return submitBelief(createMockPostRequest("http://localhost:3000/api/beliefs/submit", {
        statement: `Belief ${txSuffix}`,
        author: "traderx",
        raw_text: "raw text",
      }));
    };

    expect((await submit("a")).status).toBe(200);
    expect((await submit("b")).status).toBe(200);

    const profiles = await testDb.db.query.creator_profiles.findMany();
    expect(profiles).toHaveLength(1);
    expect(profiles[0].handle).toBe("@traderx");
    expect(profiles[0].confirmed_beliefs_count).toBe(0);
  });
});
