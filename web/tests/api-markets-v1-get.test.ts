import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { GET as getMarketsList } from "../app/api/markets/route";
import { GET as getMarketDetail } from "../app/api/markets/[id]/route";
import * as supabaseLib from "../lib/supabase";

describe("TICKET-86: Markets V1 API Routes (GET /api/markets & GET /api/markets/[id])", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function createMockRequest(url: string) {
    return new NextRequest(url, { method: "GET" });
  }

  it("should adhere strictly to Zero-Comment Policy in markets route files", () => {
    const filesToCheck = [
      path.resolve(process.cwd(), "app/api/markets/route.ts"),
      path.resolve(process.cwd(), "app/api/markets/[id]/route.ts"),
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

  it("should return markets with V1 metrics and consensus calculation", async () => {
    const mockMarkets = [
      {
        id: "m-uuid-1",
        belief_id: "b-1",
        contract_address: "0x1234567890123456789012345678901234567890",
        chain_id: 11155111,
        agree_pool: "7.5",
        disagree_pool: "2.5",
        open_time: "2026-09-01T00:00:00Z",
        close_time: "2026-10-01T00:00:00Z",
        resolution_type: "RELATIVE_PERFORMANCE",
        status: "OPEN",
        winner: null,
        created_at: "2026-09-01T00:00:00Z",
        beliefs: {
          id: "b-1",
          author: "@vitalik",
          statement: "ETH will outperform SOL",
          status: "CONFIRMED",
        },
      },
    ];

    const mockChain: any = {};
    mockChain.order = vi.fn().mockReturnValue(mockChain);
    mockChain.range = vi.fn().mockResolvedValue({ data: mockMarkets, error: null, count: 1 });

    const mockSelect = vi.fn().mockReturnValue(mockChain);

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockRequest("http://localhost:3000/api/markets");
    const res = await getMarketsList(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.count).toBe(1);
    expect(body.markets[0].id).toBe("m-uuid-1");
    expect(body.markets[0].agree_pool).toBe(7.5);
    expect(body.markets[0].disagree_pool).toBe(2.5);
    expect(body.markets[0].total_pool).toBe(10);
    expect(body.markets[0].capital_consensus).toBe(75);
    expect(body.markets[0].beliefs.author).toBe("@vitalik");
  });

  it("should apply discovery tab filters like most_volume and ending_soon", async () => {
    const mockChainVolume: any = {};
    mockChainVolume.order = vi.fn().mockReturnValue(mockChainVolume);
    mockChainVolume.range = vi.fn().mockResolvedValue({ data: [], error: null, count: 0 });

    const mockSelectVolume = vi.fn().mockReturnValue(mockChainVolume);

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelectVolume }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const reqVol = createMockRequest("http://localhost:3000/api/markets?tab=most_volume");
    const resVol = await getMarketsList(reqVol);
    expect(resVol.status).toBe(200);
    expect(mockChainVolume.order).toHaveBeenCalledWith("agree_pool", { ascending: false });

    const mockChainSoon: any = {};
    mockChainSoon.order = vi.fn().mockReturnValue(mockChainSoon);
    mockChainSoon.range = vi.fn().mockResolvedValue({ data: [], error: null, count: 0 });

    const mockSelectSoon = vi.fn().mockReturnValue(mockChainSoon);

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelectSoon }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const reqSoon = createMockRequest("http://localhost:3000/api/markets?tab=ending_soon");
    const resSoon = await getMarketsList(reqSoon);
    expect(resSoon.status).toBe(200);
    expect(mockChainSoon.order).toHaveBeenCalledWith("close_time", { ascending: true });
  });

  it("should return market detail by UUID", async () => {
    const mockMarket = {
      id: "m-uuid-1",
      belief_id: "b-1",
      contract_address: "0x123",
      agree_pool: 10,
      disagree_pool: 5,
      beliefs: { id: "b-1", statement: "Test" },
      oracle_snapshots: [],
      market_resolutions: [],
      market_positions: [],
    };

    const mockChain: any = {};
    mockChain.or = vi.fn().mockReturnValue(mockChain);
    mockChain.maybeSingle = vi.fn().mockResolvedValue({ data: mockMarket, error: null });

    const mockSelect = vi.fn().mockReturnValue(mockChain);

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockRequest("http://localhost:3000/api/markets/m-uuid-1");
    const res = await getMarketDetail(req, { params: Promise.resolve({ id: "m-uuid-1" }) });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.market.id).toBe("m-uuid-1");
    expect(body.market.total_pool).toBe(15);
  });

  it("should return HTTP 404 when market ID does not exist", async () => {
    const mockChain: any = {};
    mockChain.or = vi.fn().mockReturnValue(mockChain);
    mockChain.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });

    const mockSelect = vi.fn().mockReturnValue(mockChain);

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockRequest("http://localhost:3000/api/markets/non-existent");
    const res = await getMarketDetail(req, { params: Promise.resolve({ id: "non-existent" }) });
    expect(res.status).toBe(404);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("not found");
  });

  it("should return HTTP 500 when database error occurs in market detail query", async () => {
    const mockChain: any = {};
    mockChain.or = vi.fn().mockReturnValue(mockChain);
    mockChain.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: { message: "Database failure" } });

    const mockSelect = vi.fn().mockReturnValue(mockChain);

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockRequest("http://localhost:3000/api/markets/m-1");
    const res = await getMarketDetail(req, { params: Promise.resolve({ id: "m-1" }) });
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe("Database failure");
  });
});
