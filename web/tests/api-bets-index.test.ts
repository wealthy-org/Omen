import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { POST } from "@/app/api/bets/index/route";
import * as supabaseLib from "@/lib/supabase";

describe("TICKET-34: API Route Indexer Taruhan (POST /api/bets/index)", () => {
  const validWallet = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
  const normalizedWallet = validWallet.toLowerCase();
  const validTxHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function createMockRequest(body: any) {
    return new NextRequest("http://localhost:3000/api/bets/index", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    });
  }

  it("should successfully index an agree bet and update agree_pool", async () => {
    const mockCreatedBet = {
      id: "bet-uuid-1",
      market_id: "m-uuid-1",
      wallet_address: normalizedWallet,
      side: "AGREE",
      amount: 25,
      claimed: false,
      tx_hash: validTxHash,
      created_at: new Date().toISOString(),
    };

    const mockMarket = {
      id: "m-uuid-1",
      contract_market_id: 1,
      title: "Market 1",
      agree_pool: 100,
      disagree_pool: 50,
    };

    const mockCheckSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    });

    const mockBetInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: mockCreatedBet, error: null }),
      }),
    });

    const mockMarketSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({ data: mockMarket, error: null }),
      }),
    });

    const mockMarketUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    const mockUserUpsert = vi.fn().mockResolvedValue({ error: null });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "bets") {
          return {
            select: mockCheckSelect,
            insert: mockBetInsert,
          };
        }
        if (table === "markets") {
          return {
            select: mockMarketSelect,
            update: mockMarketUpdate,
          };
        }
        if (table === "users") {
          return {
            upsert: mockUserUpsert,
          };
        }
        return {};
      }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockRequest({
      tx_hash: validTxHash,
      contract_market_id: 1,
      wallet_address: validWallet,
      side: "AGREE",
      amount: 25,
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.bet.id).toBe("bet-uuid-1");
    expect(data.bet.side).toBe("AGREE");
    expect(data.updated_pools.agree_pool).toBe(125);
    expect(data.updated_pools.disagree_pool).toBe(50);
    expect(data.updated_pools.total_pool).toBe(175);

    expect(mockMarketUpdate).toHaveBeenCalledWith({
      agree_pool: 125,
      disagree_pool: 50,
    });

    expect(mockUserUpsert).toHaveBeenCalledWith(
      {
        wallet_address: normalizedWallet,
      },
      { onConflict: "wallet_address" }
    );
  });

  it("should successfully index a disagree bet and update disagree_pool", async () => {
    const mockMarket = {
      id: "market-uuid-2",
      contract_market_id: 2,
      title: "Solana ATH",
      agree_pool: 80,
      disagree_pool: 40,
    };

    const mockCreatedBet = {
      id: "bet-uuid-2",
      market_id: "market-uuid-2",
      wallet_address: normalizedWallet,
      side: "DISAGREE",
      amount: 60,
      claimed: false,
      tx_hash: validTxHash.toLowerCase(),
      created_at: "2026-09-16T12:00:00.000Z",
    };

    const mockMarketUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "bets") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockCreatedBet, error: null }),
              }),
            }),
          };
        }
        if (table === "markets") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: mockMarket, error: null }),
              }),
            }),
            update: mockMarketUpdate,
          };
        }
        if (table === "users") {
          return {
            upsert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockRequest({
      tx_hash: validTxHash,
      contract_market_id: 2,
      wallet_address: validWallet,
      side: "DISAGREE",
      amount: 60,
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.updated_pools.agree_pool).toBe(80);
    expect(data.updated_pools.disagree_pool).toBe(100);
    expect(data.updated_pools.total_pool).toBe(180);
  });

  it("should return 409 Conflict when tx_hash has already been indexed", async () => {
    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: { id: "existing-bet-id" }, error: null }),
          }),
        }),
      }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockRequest({
      tx_hash: validTxHash,
      contract_market_id: 1,
      wallet_address: validWallet,
      side: "AGREE",
      amount: 10,
    });

    const res = await POST(req);
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toContain("already been indexed");
  });

  it("should return 400 Bad Request when JSON body is invalid", async () => {
    const req = new NextRequest("http://localhost:3000/api/bets/index", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "invalid-json{",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid JSON body");
  });

  it("should return 400 Bad Request when fields are missing or invalid", async () => {
    const invalidPayloads = [
      { contract_market_id: 1, wallet_address: validWallet, side: "AGREE", amount: 10 },
      { tx_hash: "invalid-hash", contract_market_id: 1, wallet_address: validWallet, side: "AGREE", amount: 10 },
      { tx_hash: validTxHash, contract_market_id: -1, wallet_address: validWallet, side: "AGREE", amount: 10 },
      { tx_hash: validTxHash, contract_market_id: "abc", wallet_address: validWallet, side: "AGREE", amount: 10 },
      { tx_hash: validTxHash, contract_market_id: 1, wallet_address: "not-evm", side: "AGREE", amount: 10 },
      { tx_hash: validTxHash, contract_market_id: 1, wallet_address: validWallet, side: "maybe", amount: 10 },
      { tx_hash: validTxHash, contract_market_id: 1, wallet_address: validWallet, side: "AGREE", amount: 0 },
      { tx_hash: validTxHash, contract_market_id: 1, wallet_address: validWallet, side: "AGREE", amount: -5 },
      { tx_hash: validTxHash, contract_market_id: 1, wallet_address: validWallet, side: "AGREE", amount: "abc" },
    ];

    for (const payload of invalidPayloads) {
      const req = createMockRequest(payload);
      const res = await POST(req);
      expect(res.status).toBe(400);
    }
  });

  it("should return 404 Not Found when market does not exist", async () => {
    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "bets") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          };
        }
        if (table === "markets") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          };
        }
        return {};
      }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockRequest({
      tx_hash: validTxHash,
      contract_market_id: 9999,
      wallet_address: validWallet,
      side: "AGREE",
      amount: 10,
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toContain("not found");
  });

  it("should return 500 Internal Server Error when Supabase fails on insert", async () => {
    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "bets") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: { message: "Database insert error" } }),
              }),
            }),
          };
        }
        if (table === "markets") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: { id: "m-1", agree_pool: 0, disagree_pool: 0 }, error: null }),
              }),
            }),
          };
        }
        return {};
      }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockRequest({
      tx_hash: validTxHash,
      contract_market_id: 1,
      wallet_address: validWallet,
      side: "AGREE",
      amount: 10,
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Database insert error");
  });

  it("should strictly adhere to Zero-Comment Policy", () => {
    const targetFiles = [
      path.resolve(process.cwd(), "app/api/bets/index/route.ts"),
      path.resolve(process.cwd(), "tests/api-bets-index.test.ts"),
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
