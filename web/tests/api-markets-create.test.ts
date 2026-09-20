import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { POST } from "@/app/api/markets/route";
import * as supabaseLib from "@/lib/supabase";

describe("TICKET-31: API Route Simpan Pasar Baru (POST /api/markets)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function createMockPostRequest(
    body: any,
    headers: Record<string, string> = {}
  ) {
    return new NextRequest("http://localhost:3000/api/markets", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...headers,
      },
      body: typeof body === "string" ? body : JSON.stringify(body),
    });
  }

  it("should create a new market successfully when authorized via x-admin-key", async () => {
    const mockCreatedMarket = {
      id: "m-new-1",
      contract_market_id: 10,
      title: "Will Bitcoin hit 100k?",
      description: "BTC prediction",
      category: "crypto",
      deadline: "2026-12-31T23:59:59.000Z",
      status: "OPEN",
      agree_pool: 0,
      disagree_pool: 0,
      resolution_source: "CoinGecko Oracle",
      created_at: "2026-09-16T15:00:00.000Z",
    };

    const mockSingle = vi.fn().mockResolvedValue({ data: mockCreatedMarket, error: null });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });

    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelectCheck = vi.fn().mockReturnValue({ eq: mockEq });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "markets") {
          return {
            select: mockSelectCheck,
            insert: mockInsert,
          };
        }
        return {};
      }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockPostRequest(
      {
        contract_market_id: 10,
        title: "Will Bitcoin hit 100k?",
        description: "BTC prediction",
        category: "crypto",
        deadline: "2026-12-31T23:59:59.000Z",
        resolution_source: "CoinGecko Oracle",
      },
      { "x-admin-key": "omen-admin-2026" }
    );

    const res = await POST(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.market.contract_market_id).toBe(10);
    expect(data.market.title).toBe("Will Bitcoin hit 100k?");
    expect(data.market.total_pool).toBe(0);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        contract_market_id: 10,
        title: "Will Bitcoin hit 100k?",
        category: "crypto",
        status: "OPEN",
      })
    );
  });

  it("should create a new market successfully when authorized via Authorization Bearer token", async () => {
    const mockCreatedMarket = {
      id: "m-new-2",
      contract_market_id: 11,
      title: "Will Solana hit 500?",
      description: null,
      category: "crypto",
      deadline: "2026-12-31T23:59:59.000Z",
      status: "OPEN",
      agree_pool: 0,
      disagree_pool: 0,
      resolution_source: null,
      created_at: "2026-09-16T15:00:00.000Z",
    };

    const mockSingle = vi.fn().mockResolvedValue({ data: mockCreatedMarket, error: null });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });

    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelectCheck = vi.fn().mockReturnValue({ eq: mockEq });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: mockSelectCheck,
        insert: mockInsert,
      }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockPostRequest(
      {
        contract_market_id: 11,
        title: "Will Solana hit 500?",
        deadline: "2026-12-31T23:59:59.000Z",
      },
      { authorization: "Bearer omen-admin-2026" }
    );

    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.market.category).toBe("crypto");
  });

  it("should create a new market successfully when authorized via whitelisted x-admin-wallet", async () => {
    const mockCreatedMarket = {
      id: "m-new-3",
      contract_market_id: 12,
      title: "Will Arbitrum flip Polygon?",
      description: null,
      category: "layer2",
      deadline: "2026-12-31T23:59:59.000Z",
      status: "OPEN",
      agree_pool: 0,
      disagree_pool: 0,
      resolution_source: null,
      created_at: "2026-09-16T15:00:00.000Z",
    };

    const mockSingle = vi.fn().mockResolvedValue({ data: mockCreatedMarket, error: null });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });

    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelectCheck = vi.fn().mockReturnValue({ eq: mockEq });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: mockSelectCheck,
        insert: mockInsert,
      }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockPostRequest(
      {
        contract_market_id: 12,
        title: "Will Arbitrum flip Polygon?",
        category: "layer2",
        deadline: "2026-12-31T23:59:59.000Z",
      },
      { "x-admin-wallet": "0xAdmin99999999999999999999999999999999999" }
    );

    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it("should return 401 Unauthorized when credentials are missing or invalid", async () => {
    const reqNoAuth = createMockPostRequest({
      contract_market_id: 1,
      title: "Test",
      deadline: "2026-12-31T00:00:00.000Z",
    });
    const resNoAuth = await POST(reqNoAuth);
    expect(resNoAuth.status).toBe(401);

    const reqWrongKey = createMockPostRequest(
      {
        contract_market_id: 1,
        title: "Test",
        deadline: "2026-12-31T00:00:00.000Z",
      },
      { "x-admin-key": "invalid-secret" }
    );
    const resWrongKey = await POST(reqWrongKey);
    expect(resWrongKey.status).toBe(401);
  });

  it("should return 400 Bad Request when JSON body is malformed", async () => {
    const req = new NextRequest("http://localhost:3000/api/markets", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-admin-key": "omen-admin-2026",
      },
      body: "invalid-json{",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid JSON body");
  });

  it("should return 400 Bad Request when required fields are missing or invalid", async () => {
    const invalidPayloads = [
      { title: "No ID", deadline: "2026-12-31T00:00:00.000Z" },
      { contract_market_id: -5, title: "Negative ID", deadline: "2026-12-31T00:00:00.000Z" },
      { contract_market_id: "abc", title: "String ID", deadline: "2026-12-31T00:00:00.000Z" },
      { contract_market_id: 1, title: "", deadline: "2026-12-31T00:00:00.000Z" },
      { contract_market_id: 1, title: "No deadline" },
      { contract_market_id: 1, title: "Invalid deadline", deadline: "not-a-date" },
    ];

    for (const payload of invalidPayloads) {
      const req = createMockPostRequest(payload, { "x-admin-key": "omen-admin-2026" });
      const res = await POST(req);
      expect(res.status).toBe(400);
    }
  });

  it("should return 409 Conflict when market with contract_market_id already exists", async () => {
    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: { id: "existing-uuid" },
      error: null,
    });
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelectCheck = vi.fn().mockReturnValue({ eq: mockEq });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelectCheck }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockPostRequest(
      {
        contract_market_id: 42,
        title: "Duplicate Market",
        deadline: "2026-12-31T00:00:00.000Z",
      },
      { "x-admin-key": "omen-admin-2026" }
    );

    const res = await POST(req);
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toContain("already exists");
  });

  it("should return 500 when Supabase insert operation fails", async () => {
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelectCheck = vi.fn().mockReturnValue({ eq: mockEq });

    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "Database insert failure" },
    });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: mockSelectCheck,
        insert: mockInsert,
      }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockPostRequest(
      {
        contract_market_id: 99,
        title: "DB Error Test",
        deadline: "2026-12-31T00:00:00.000Z",
      },
      { "x-admin-key": "omen-admin-2026" }
    );

    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Database insert failure");
  });

  it("should strictly adhere to Zero-Comment Policy", () => {
    const targetFiles = [
      path.resolve(process.cwd(), "app/api/markets/route.ts"),
      path.resolve(process.cwd(), "tests/api-markets-create.test.ts"),
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
