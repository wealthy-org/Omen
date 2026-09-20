import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { POST as resolveMarket } from "../app/api/markets/[id]/resolve/route";
import { normalizeOutcome, calculateSettlementPool } from "../lib/market/resolution-helper";
import * as supabaseLib from "../lib/supabase";

describe("TICKET-92: Market Resolution API V1 & Helper", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.ADMIN_SECRET_KEY = "test-admin-secret";
  });

  function createMockPostRequest(url: string, body: unknown, headers?: Record<string, string>) {
    return new NextRequest(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": "test-admin-secret",
        ...headers,
      },
      body: JSON.stringify(body),
    });
  }

  it("should adhere strictly to Zero-Comment Policy in resolution files", () => {
    const filesToCheck = [
      path.resolve(process.cwd(), "app/api/markets/[id]/resolve/route.ts"),
      path.resolve(process.cwd(), "lib/market/resolution-helper.ts"),
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

  it("should correctly normalize outcome aliases and calculate pool settlements", () => {
    expect(normalizeOutcome("AGREE")).toBe("AGREE");
    expect(normalizeOutcome("agree")).toBe("AGREE");
    expect(normalizeOutcome("DISAGREE")).toBe("DISAGREE");
    expect(normalizeOutcome("disagree")).toBe("DISAGREE");
    expect(normalizeOutcome("VOID")).toBe("VOID");
    expect(normalizeOutcome("void")).toBe("VOID");
    expect(normalizeOutcome("CANCEL")).toBe("VOID");
    expect(normalizeOutcome("cancelled")).toBe("VOID");
    expect(normalizeOutcome("INVALID")).toBeNull();

    const defaultSettlement = calculateSettlementPool(10, 5, "AGREE");
    expect(defaultSettlement.totalPool).toBe(15);
    expect(defaultSettlement.distributablePool).toBe(15);
    expect(defaultSettlement.protocolFee).toBe(0);

    const feeSettlement = calculateSettlementPool(10, 5, "AGREE", 200);
    expect(feeSettlement.totalPool).toBe(15);
    expect(feeSettlement.distributablePool).toBe(14.7);
    expect(feeSettlement.protocolFee).toBe(0.3);

    const voidSettlement = calculateSettlementPool(10, 5, "VOID");
    expect(voidSettlement.totalPool).toBe(15);
    expect(voidSettlement.distributablePool).toBe(15);
    expect(voidSettlement.protocolFee).toBe(0);
  });

  it("should return HTTP 401 when admin key is unauthorized", async () => {
    const req = new NextRequest("http://localhost:3000/api/markets/m-101/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outcome: "AGREE" }),
    });

    const res = await resolveMarket(req, { params: Promise.resolve({ id: "m-101" }) });
    expect(res.status).toBe(401);
  });

  it("should return HTTP 400 when market is already resolved or cancelled", async () => {
    const mockMarket = {
      id: "m-101",
      status: "RESOLVED",
      winner: "AGREE",
    };

    const mockQuery: any = {};
    mockQuery.eq = vi.fn().mockReturnValue(mockQuery);
    mockQuery.maybeSingle = vi.fn().mockResolvedValue({ data: mockMarket, error: null });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn().mockReturnValue(mockQuery),
      })),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockPostRequest("http://localhost:3000/api/markets/m-101/resolve", {
      outcome: "AGREE",
    });

    const res = await resolveMarket(req, { params: Promise.resolve({ id: "m-101" }) });
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toContain("already");
  });

  it("should resolve market with outcome AGREE and coordinate updates across tables", async () => {
    const marketId = "m-101";
    const beliefId = "b-101";
    const creatorWallet = "0x1111111111111111111111111111111111111111";

    const mockMarket = {
      id: marketId,
      belief_id: beliefId,
      status: "OPEN",
      agree_pool: 6,
      disagree_pool: 4,
      total_pool: 10,
    };

    const mockBelief = {
      id: beliefId,
      author: creatorWallet,
      statement: "ETH reaches $5000",
      status: "CONFIRMED",
    };

    const mockProfile = {
      id: "prof-1",
      wallet_address: creatorWallet.toLowerCase(),
      resolved_count: 2,
      correct_count: 1,
    };

    const mockMarketQuery: any = {};
    mockMarketQuery.eq = vi.fn().mockReturnValue(mockMarketQuery);
    mockMarketQuery.maybeSingle = vi.fn().mockResolvedValue({ data: mockMarket, error: null });

    const mockMarketUpdate: any = {};
    mockMarketUpdate.eq = vi.fn().mockReturnValue(mockMarketUpdate);
    mockMarketUpdate.select = vi.fn().mockReturnValue(mockMarketUpdate);
    mockMarketUpdate.single = vi.fn().mockResolvedValue({
      data: { ...mockMarket, status: "RESOLVED", winner: "AGREE" },
      error: null,
    });

    const mockBeliefQuery: any = {};
    mockBeliefQuery.eq = vi.fn().mockReturnValue(mockBeliefQuery);
    mockBeliefQuery.maybeSingle = vi.fn().mockResolvedValue({ data: mockBelief, error: null });

    const mockBeliefUpdate: any = {};
    mockBeliefUpdate.eq = vi.fn().mockResolvedValue({ data: null, error: null });

    const mockResolutionInsert: any = {};
    mockResolutionInsert.select = vi.fn().mockReturnValue(mockResolutionInsert);
    mockResolutionInsert.single = vi.fn().mockResolvedValue({
      data: { id: "res-1", market_id: marketId, resolved_outcome: "AGREE" },
      error: null,
    });

    const mockSettlementInsert: any = {};
    mockSettlementInsert.select = vi.fn().mockReturnValue(mockSettlementInsert);
    mockSettlementInsert.single = vi.fn().mockResolvedValue({
      data: { id: "set-1", market_id: marketId, distributable_pool: 10 },
      error: null,
    });

    const mockProfileQuery: any = {};
    mockProfileQuery.eq = vi.fn().mockReturnValue(mockProfileQuery);
    mockProfileQuery.maybeSingle = vi.fn().mockResolvedValue({ data: mockProfile, error: null });

    const mockProfileUpdate: any = {};
    mockProfileUpdate.eq = vi.fn().mockResolvedValue({ data: null, error: null });

    const mockConfirmationQuery: any = {};
    mockConfirmationQuery.eq = vi.fn().mockReturnValue(mockConfirmationQuery);
    mockConfirmationQuery.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn((table: string) => {
        if (table === "markets") {
          return {
            select: vi.fn().mockReturnValue(mockMarketQuery),
            update: vi.fn().mockReturnValue(mockMarketUpdate),
          };
        }
        if (table === "beliefs") {
          return {
            select: vi.fn().mockReturnValue(mockBeliefQuery),
            update: vi.fn().mockReturnValue(mockBeliefUpdate),
          };
        }
        if (table === "market_resolutions") {
          return {
            insert: vi.fn().mockReturnValue(mockResolutionInsert),
          };
        }
        if (table === "market_settlements") {
          return {
            insert: vi.fn().mockReturnValue(mockSettlementInsert),
          };
        }
        if (table === "creator_profiles") {
          return {
            select: vi.fn().mockReturnValue(mockProfileQuery),
            update: vi.fn().mockReturnValue(mockProfileUpdate),
            upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
        if (table === "creator_confirmations") {
          return {
            select: vi.fn().mockReturnValue(mockConfirmationQuery),
          };
        }
        return {} as any;
      }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockPostRequest(`http://localhost:3000/api/markets/${marketId}/resolve`, {
      outcome: "AGREE",
      oracle_source: "chainlink",
      start_price: 3000,
      end_price: 5100,
      resolution_tx_hash: "0xtx123",
    });

    const res = await resolveMarket(req, { params: Promise.resolve({ id: marketId }) });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.market.status).toBe("RESOLVED");
    expect(body.market.winner).toBe("AGREE");
  });
});
