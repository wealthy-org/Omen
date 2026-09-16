import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { POST } from "@/app/api/markets/[id]/resolve/route";
import * as supabaseLib from "@/lib/supabase";

describe("TICKET-32: API Route Pembaruan Status Resolusi Pasar (POST /api/markets/[id]/resolve)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function createMockRequest(
    marketId: string,
    body: any,
    headers: Record<string, string> = {}
  ) {
    const req = new NextRequest(`http://localhost:3000/api/markets/${marketId}/resolve`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...headers,
      },
      body: typeof body === "string" ? body : JSON.stringify(body),
    });

    const context = {
      params: Promise.resolve({ id: marketId }),
    };

    return { req, context };
  }

  it("should resolve market to resolved_yes with resolution_source successfully", async () => {
    const activeMarket = {
      id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      contract_market_id: 1,
      title: "Will ETH hit $5,000?",
      description: "ETH prediction",
      category: "crypto",
      deadline: "2026-10-01T00:00:00.000Z",
      status: "active",
      total_pool_yes: 100,
      total_pool_no: 50,
      resolution_source: null,
      created_at: "2026-09-16T12:00:00.000Z",
    };

    const resolvedMarket = {
      ...activeMarket,
      status: "resolved_yes",
      resolution_source: "https://oracle.binance.com/eth-usd",
    };

    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: activeMarket, error: null });
    const mockEqFind = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelectFind = vi.fn().mockReturnValue({ eq: mockEqFind });

    const mockSingle = vi.fn().mockResolvedValue({ data: resolvedMarket, error: null });
    const mockSelectUpdate = vi.fn().mockReturnValue({ single: mockSingle });
    const mockEqUpdate = vi.fn().mockReturnValue({ select: mockSelectUpdate });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqUpdate });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: mockSelectFind,
        update: mockUpdate,
      }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const { req, context } = createMockRequest(
      "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      {
        status: "resolved_yes",
        resolution_source: "https://oracle.binance.com/eth-usd",
      },
      { "x-admin-key": "omen-admin-2026" }
    );

    const res = await POST(req, context);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.market.status).toBe("resolved_yes");
    expect(body.market.resolution_source).toBe("https://oracle.binance.com/eth-usd");
    expect(body.market.total_pool).toBe(150);
  });

  it("should find and resolve market by numeric contract_market_id", async () => {
    const activeMarket = {
      id: "some-uuid",
      contract_market_id: 5,
      title: "Solana ATH",
      description: null,
      category: "crypto",
      deadline: "2026-10-01T00:00:00.000Z",
      status: "active",
      total_pool_yes: 20,
      total_pool_no: 30,
      resolution_source: null,
      created_at: "2026-09-16T12:00:00.000Z",
    };

    const resolvedMarket = {
      ...activeMarket,
      status: "resolved_no",
    };

    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: activeMarket, error: null });
    const mockEqFind = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelectFind = vi.fn().mockReturnValue({ eq: mockEqFind });

    const mockSingle = vi.fn().mockResolvedValue({ data: resolvedMarket, error: null });
    const mockSelectUpdate = vi.fn().mockReturnValue({ single: mockSingle });
    const mockEqUpdate = vi.fn().mockReturnValue({ select: mockSelectUpdate });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqUpdate });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: mockSelectFind,
        update: mockUpdate,
      }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const { req, context } = createMockRequest(
      "5",
      { status: "resolved_no" },
      { authorization: "Bearer omen-admin-2026" }
    );

    const res = await POST(req, context);
    expect(res.status).toBe(200);
    expect(mockEqFind).toHaveBeenCalledWith("contract_market_id", 5);
  });

  it("should return 401 Unauthorized when credentials are not admin", async () => {
    const { req, context } = createMockRequest("any-id", {
      status: "resolved_yes",
    });

    const res = await POST(req, context);
    expect(res.status).toBe(401);
  });

  it("should return 400 Bad Request when resolve status is invalid", async () => {
    const { req, context } = createMockRequest(
      "any-id",
      { status: "invalid_status" },
      { "x-admin-key": "omen-admin-2026" }
    );

    const res = await POST(req, context);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Invalid status");
  });

  it("should return 404 Not Found when market does not exist", async () => {
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockEqFind = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelectFind = vi.fn().mockReturnValue({ eq: mockEqFind });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelectFind }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const { req, context } = createMockRequest(
      "non-existent-id",
      { status: "resolved_yes" },
      { "x-admin-key": "omen-admin-2026" }
    );

    const res = await POST(req, context);
    expect(res.status).toBe(404);
  });

  it("should return 400 Bad Request when market is already resolved or cancelled", async () => {
    const alreadyResolvedMarket = {
      id: "already-resolved-uuid",
      contract_market_id: 2,
      status: "resolved_yes",
    };

    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: alreadyResolvedMarket, error: null });
    const mockEqFind = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelectFind = vi.fn().mockReturnValue({ eq: mockEqFind });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelectFind }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const { req, context } = createMockRequest(
      "already-resolved-uuid",
      { status: "resolved_no" },
      { "x-admin-key": "omen-admin-2026" }
    );

    const res = await POST(req, context);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("cannot be resolved again");
  });

  it("should return 500 when Supabase update fails", async () => {
    const activeMarket = {
      id: "fail-uuid",
      contract_market_id: 3,
      status: "active",
    };

    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: activeMarket, error: null });
    const mockEqFind = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelectFind = vi.fn().mockReturnValue({ eq: mockEqFind });

    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: "DB update error" } });
    const mockSelectUpdate = vi.fn().mockReturnValue({ single: mockSingle });
    const mockEqUpdate = vi.fn().mockReturnValue({ select: mockSelectUpdate });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqUpdate });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: mockSelectFind,
        update: mockUpdate,
      }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const { req, context } = createMockRequest(
      "fail-uuid",
      { status: "cancelled" },
      { "x-admin-key": "omen-admin-2026" }
    );

    const res = await POST(req, context);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("DB update error");
  });

  it("should strictly adhere to Zero-Comment Policy", () => {
    const targetFiles = [
      path.resolve(process.cwd(), "app/api/markets/[id]/resolve/route.ts"),
      path.resolve(process.cwd(), "tests/api-markets-resolve.test.ts"),
    ];

    for (const filePath of targetFiles) {
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        expect(trimmed.startsWith("//")).toBe(false);
        expect(trimmed.includes("/" + "*")).toBe(false);
        expect(trimmed.includes("*" + "/")).toBe(false);
      }
    }
  });
});
