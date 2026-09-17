import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { POST as indexPosition } from "../app/api/markets/[id]/position/route";
import { GET as getUserPositions } from "../app/api/positions/route";
import * as supabaseLib from "../lib/supabase";

describe("TICKET-87: Positions Indexer & History APIs", () => {
  const validWallet = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function createMockRequest(url: string, method = "GET", body?: unknown) {
    return new NextRequest(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  it("should adhere strictly to Zero-Comment Policy in position route files", () => {
    const filesToCheck = [
      path.resolve(process.cwd(), "app/api/markets/[id]/position/route.ts"),
      path.resolve(process.cwd(), "app/api/positions/route.ts"),
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

  it("should successfully index a new position and update pool accumulator", async () => {
    const mockMarket = {
      id: "m-uuid-1",
      agree_pool: "5.0",
      disagree_pool: "5.0",
      total_pool_yes: 5.0,
      total_pool_no: 5.0,
    };

    const mockPosition = {
      id: "pos-1",
      market_id: "m-uuid-1",
      wallet_address: validWallet.toLowerCase(),
      side: "AGREE",
      amount: 2.5,
      claimed: false,
      tx_hash: "0xtx123",
      created_at: "2026-09-01T00:00:00Z",
    };

    const mockMarketQuery: any = {};
    mockMarketQuery.or = vi.fn().mockReturnValue(mockMarketQuery);
    mockMarketQuery.maybeSingle = vi.fn().mockResolvedValue({ data: mockMarket, error: null });

    const mockExistingPosQuery: any = {};
    mockExistingPosQuery.eq = vi.fn().mockReturnValue(mockExistingPosQuery);
    mockExistingPosQuery.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });

    const mockPosInsertQuery: any = {};
    mockPosInsertQuery.select = vi.fn().mockReturnValue(mockPosInsertQuery);
    mockPosInsertQuery.single = vi.fn().mockResolvedValue({ data: mockPosition, error: null });

    const mockEventInsertQuery: any = {};
    mockEventInsertQuery.insert = vi.fn().mockResolvedValue({ data: null, error: null });

    const mockMarketUpdateQuery: any = {};
    mockMarketUpdateQuery.eq = vi.fn().mockResolvedValue({ data: null, error: null });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn((table: string) => {
        if (table === "markets") {
          return {
            select: vi.fn().mockReturnValue(mockMarketQuery),
            update: vi.fn().mockReturnValue(mockMarketUpdateQuery),
          };
        }
        if (table === "market_positions") {
          return {
            select: vi.fn().mockReturnValue(mockExistingPosQuery),
            insert: vi.fn().mockReturnValue(mockPosInsertQuery),
          };
        }
        if (table === "market_events") {
          return mockEventInsertQuery;
        }
        return {} as any;
      }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockRequest("http://localhost:3000/api/markets/m-uuid-1/position", "POST", {
      wallet_address: validWallet,
      side: "AGREE",
      amount: 2.5,
      tx_hash: "0xtx123",
      block_number: 123456,
    });

    const res = await indexPosition(req, { params: Promise.resolve({ id: "m-uuid-1" }) });
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.position.id).toBe("pos-1");
    expect(body.position.amount).toBe(2.5);
  });

  it("should return HTTP 409 Conflict when tx_hash is already indexed", async () => {
    const mockMarket = { id: "m-uuid-1" };
    const mockMarketQuery: any = {};
    mockMarketQuery.or = vi.fn().mockReturnValue(mockMarketQuery);
    mockMarketQuery.maybeSingle = vi.fn().mockResolvedValue({ data: mockMarket, error: null });

    const mockExistingPosQuery: any = {};
    mockExistingPosQuery.eq = vi.fn().mockReturnValue(mockExistingPosQuery);
    mockExistingPosQuery.maybeSingle = vi.fn().mockResolvedValue({ data: { id: "existing-pos" }, error: null });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn((table: string) => {
        if (table === "markets") {
          return { select: vi.fn().mockReturnValue(mockMarketQuery) };
        }
        if (table === "market_positions") {
          return { select: vi.fn().mockReturnValue(mockExistingPosQuery) };
        }
        return {} as any;
      }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockRequest("http://localhost:3000/api/markets/m-uuid-1/position", "POST", {
      wallet_address: validWallet,
      side: "AGREE",
      amount: 1.0,
      tx_hash: "0xduplicate-tx",
    });

    const res = await indexPosition(req, { params: Promise.resolve({ id: "m-uuid-1" }) });
    expect(res.status).toBe(409);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("already indexed");
  });

  it("should return HTTP 400 for invalid position payload", async () => {
    const req = createMockRequest("http://localhost:3000/api/markets/m-1/position", "POST", {
      wallet_address: validWallet,
      side: "INVALID_SIDE",
      amount: -5,
    });

    const res = await indexPosition(req, { params: Promise.resolve({ id: "m-1" }) });
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
  });

  it("should return user positions with calculated status (WON, LOST, OPEN, CLAIMED)", async () => {
    const mockPositions = [
      {
        id: "p-1",
        market_id: "m-1",
        wallet_address: validWallet.toLowerCase(),
        side: "AGREE",
        amount: 2,
        claimed: false,
        tx_hash: "0xtx1",
        created_at: "2026-09-01T00:00:00Z",
        markets: {
          id: "m-1",
          status: "RESOLVED",
          winner: "AGREE",
          agree_pool: 2,
          disagree_pool: 4,
          beliefs: { statement: "ETH will outperform SOL" },
        },
      },
      {
        id: "p-2",
        market_id: "m-2",
        wallet_address: validWallet.toLowerCase(),
        side: "DISAGREE",
        amount: 3,
        claimed: true,
        tx_hash: "0xtx2",
        created_at: "2026-09-01T00:00:00Z",
        markets: {
          id: "m-2",
          status: "RESOLVED",
          winner: "DISAGREE",
          agree_pool: 3,
          disagree_pool: 3,
          beliefs: { statement: "BTC above 100k" },
        },
      },
    ];

    const mockChain: any = {};
    mockChain.eq = vi.fn().mockReturnValue(mockChain);
    mockChain.order = vi.fn().mockResolvedValue({ data: mockPositions, error: null });

    const mockSelect = vi.fn().mockReturnValue(mockChain);

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockRequest(`http://localhost:3000/api/positions?wallet_address=${validWallet}`);
    const res = await getUserPositions(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.count).toBe(2);
    expect(body.positions[0].calculated_status).toBe("WON");
    expect(body.positions[0].estimated_payout).toBe(6);
    expect(body.positions[1].calculated_status).toBe("CLAIMED");
  });

  it("should return HTTP 400 on GET /api/positions when wallet parameter is missing", async () => {
    const req = createMockRequest("http://localhost:3000/api/positions");
    const res = await getUserPositions(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("wallet_address");
  });
});
