import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { POST as submitBelief } from "../app/api/beliefs/submit/route";
import { computeBeliefHashes } from "../lib/market/factory-client";
import * as factoryClientLib from "../lib/market/factory-client";
import * as supabaseLib from "../lib/supabase";
import { ETHEREUM_SEPOLIA_CHAIN_ID } from "../lib/constants";

describe("TICKET-85: Submit Belief & On-Chain Market Creation API", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function createMockPostRequest(url: string, body: unknown) {
    return new NextRequest(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
    const mockBelief = {
      id: "b-uuid-1",
      statement: "Solana will reach 1M daily active wallets",
      author: "0xauthor1",
      status: "DETECTED",
      created_at: "2026-09-17T08:00:00Z",
    };

    const mockSource = {
      id: "src-uuid-1",
      belief_id: "b-uuid-1",
      raw_text: "https://x.com/solana/status/999",
      submitted_by_wallet: "0xsubmitter",
      created_at: "2026-09-17T08:00:00Z",
    };

    const mockMarket = {
      id: "m-uuid-1",
      belief_id: "b-uuid-1",
      contract_address: "0xmarketContract123456789012345678901234",
      chain_id: ETHEREUM_SEPOLIA_CHAIN_ID,
      status: "OPEN",
      agree_pool: 0,
      disagree_pool: 0,
      open_time: "2026-09-17T08:00:00Z",
      close_time: "2026-09-24T08:00:00Z",
    };

    const mockBeliefInsert: any = {};
    mockBeliefInsert.select = vi.fn().mockReturnValue(mockBeliefInsert);
    mockBeliefInsert.single = vi.fn().mockResolvedValue({ data: mockBelief, error: null });

    const mockSourceInsert: any = {};
    mockSourceInsert.select = vi.fn().mockReturnValue(mockSourceInsert);
    mockSourceInsert.single = vi.fn().mockResolvedValue({ data: mockSource, error: null });

    const mockMarketInsert: any = {};
    mockMarketInsert.select = vi.fn().mockReturnValue(mockMarketInsert);
    mockMarketInsert.single = vi.fn().mockResolvedValue({ data: mockMarket, error: null });

    const mockEventInsert: any = {};
    mockEventInsert.select = vi.fn().mockReturnValue(mockEventInsert);
    mockEventInsert.single = vi.fn().mockResolvedValue({ data: { id: "evt-1" }, error: null });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn((table: string) => {
        if (table === "beliefs") return { insert: vi.fn().mockReturnValue(mockBeliefInsert) };
        if (table === "belief_sources") return { insert: vi.fn().mockReturnValue(mockSourceInsert) };
        if (table === "markets") return { insert: vi.fn().mockReturnValue(mockMarketInsert) };
        if (table === "market_events") return { insert: vi.fn().mockReturnValue(mockEventInsert) };
        return {} as any;
      }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    vi.spyOn(factoryClientLib, "createOnChainMarket").mockResolvedValue({
      contractAddress: "0xmarketContract123456789012345678901234",
      contractMarketId: 1,
      txHash: "0xtxhash123",
    });

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
    expect(body.data.belief_id).toBe("b-uuid-1");
    expect(body.data.market_id).toBe("m-uuid-1");
    expect(body.data.contract_address).toBe("0xmarketContract123456789012345678901234");
    expect(body.data.tx_hash).toBe("0xtxhash123");
  });
});
