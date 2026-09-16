import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { GET } from "@/app/api/markets/route";
import * as supabaseLib from "@/lib/supabase";

describe("TICKET-30: API Route Katalog Pasar Prediksi (GET /api/markets)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function createMockRequest(url: string) {
    return new NextRequest(url, { method: "GET" });
  }

  it("should return all markets with pool calculations under default parameters", async () => {
    const mockMarkets = [
      {
        id: "m-1",
        contract_market_id: 1,
        title: "Will ETH hit $5,000?",
        description: "Prediction on Ethereum price",
        category: "crypto",
        deadline: "2026-10-01T00:00:00.000Z",
        status: "active",
        total_pool_yes: "10.5",
        total_pool_no: "5.5",
        resolution_source: "Binance Oracle",
        created_at: "2026-09-16T12:00:00.000Z",
      },
    ];

    const mockOrder = vi.fn().mockResolvedValue({ data: mockMarkets, error: null });
    const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockRequest("http://localhost:3000/api/markets");
    const res = await GET(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.count).toBe(1);
    expect(body.markets[0].total_pool_yes).toBe(10.5);
    expect(body.markets[0].total_pool_no).toBe(5.5);
    expect(body.markets[0].total_pool).toBe(16);
  });

  it("should correctly apply status filters for active and resolved", async () => {
    const mockChainActive: any = {};
    mockChainActive.order = vi.fn().mockResolvedValue({ data: [], error: null });
    mockChainActive.eq = vi.fn().mockReturnValue(mockChainActive);

    const mockSelectActive = vi.fn().mockReturnValue(mockChainActive);

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelectActive }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const reqActive = createMockRequest("http://localhost:3000/api/markets?status=active");
    const resActive = await GET(reqActive);
    expect(resActive.status).toBe(200);
    expect(mockChainActive.eq).toHaveBeenCalledWith("status", "active");

    const mockChainResolved: any = {};
    mockChainResolved.order = vi.fn().mockResolvedValue({ data: [], error: null });
    mockChainResolved.in = vi.fn().mockReturnValue(mockChainResolved);

    const mockSelectResolved = vi.fn().mockReturnValue(mockChainResolved);

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelectResolved }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const reqResolved = createMockRequest("http://localhost:3000/api/markets?status=resolved");
    const resResolved = await GET(reqResolved);
    expect(resResolved.status).toBe(200);
    expect(mockChainResolved.in).toHaveBeenCalledWith("status", ["resolved_yes", "resolved_no"]);
  });

  it("should apply category filter using ilike", async () => {
    const mockChain: any = {};
    mockChain.order = vi.fn().mockResolvedValue({ data: [], error: null });
    mockChain.ilike = vi.fn().mockReturnValue(mockChain);

    const mockSelect = vi.fn().mockReturnValue(mockChain);

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockRequest("http://localhost:3000/api/markets?category=meme");
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(mockChain.ilike).toHaveBeenCalledWith("category", "meme");
  });

  it("should apply sort options for highest_pool and ending_soon", async () => {
    const mockChainPool: any = {};
    mockChainPool.order = vi.fn().mockResolvedValue({ data: [], error: null });
    const mockSelectPool = vi.fn().mockReturnValue(mockChainPool);

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelectPool }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const reqPool = createMockRequest("http://localhost:3000/api/markets?sort=highest_pool");
    const resPool = await GET(reqPool);
    expect(resPool.status).toBe(200);
    expect(mockChainPool.order).toHaveBeenCalledWith("total_pool_yes", { ascending: false });

    const mockChainSoon: any = {};
    mockChainSoon.order = vi.fn().mockResolvedValue({ data: [], error: null });
    const mockSelectSoon = vi.fn().mockReturnValue(mockChainSoon);

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelectSoon }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const reqSoon = createMockRequest("http://localhost:3000/api/markets?sort=ending_soon");
    const resSoon = await GET(reqSoon);
    expect(resSoon.status).toBe(200);
    expect(mockChainSoon.order).toHaveBeenCalledWith("deadline", { ascending: true });
  });

  it("should return 500 if database query fails", async () => {
    const mockChain: any = {};
    mockChain.order = vi.fn().mockResolvedValue({ data: null, error: { message: "Database read failure" } });
    const mockSelect = vi.fn().mockReturnValue(mockChain);

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockRequest("http://localhost:3000/api/markets");
    const res = await GET(req);
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.error).toBe("Database read failure");
  });

  it("should strictly adhere to Zero-Comment Policy", () => {
    const filePath = path.resolve(process.cwd(), "app/api/markets/route.ts");
    expect(fs.existsSync(filePath)).toBe(true);

    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      expect(trimmed.startsWith("//")).toBe(false);
      expect(trimmed.includes("/" + "*")).toBe(false);
      expect(trimmed.includes("*" + "/")).toBe(false);
    }
  });
});
