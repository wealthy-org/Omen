import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { GET as getActivityFeed } from "../app/api/activity/route";
import * as supabaseLib from "../lib/supabase";
import { ETHEREUM_SEPOLIA_CHAIN_ID } from "../lib/constants";

describe("TICKET-90: Public Activity Feed API", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function createMockGetRequest(url: string) {
    return new NextRequest(url, {
      method: "GET",
    });
  }

  it("should adhere strictly to Zero-Comment Policy in activity route files", () => {
    const filesToCheck = [
      path.resolve(process.cwd(), "app/api/activity/route.ts"),
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

  it("should retrieve unified chronological activity feed with relations", async () => {
    const mockEvents = [
      {
        id: "evt-1",
        market_id: "m-101",
        event_type: "PositionTaken",
        wallet_address: "0x1111111111111111111111111111111111111111",
        amount: 0.5,
        tx_hash: "0xabc1",
        block_number: 123456,
        created_at: "2026-09-17T08:00:00Z",
        markets: {
          id: "m-101",
          contract_address: "0xmarket1",
          chain_id: ETHEREUM_SEPOLIA_CHAIN_ID,
          status: "OPEN",
          belief_id: "b-101",
          beliefs: {
            id: "b-101",
            statement: "AI agents will execute 50% of smart contract calls by Q4 2026",
            author: "0xauthor1",
          },
        },
      },
      {
        id: "evt-2",
        market_id: "m-102",
        event_type: "MarketResolved",
        wallet_address: "0x2222222222222222222222222222222222222222",
        amount: null,
        tx_hash: "0xabc2",
        block_number: 123460,
        created_at: "2026-09-17T07:30:00Z",
        markets: {
          id: "m-102",
          contract_address: "0xmarket2",
          chain_id: ETHEREUM_SEPOLIA_CHAIN_ID,
          status: "RESOLVED",
          belief_id: "b-102",
          beliefs: {
            id: "b-102",
            statement: "ETH/BTC ratio will cross 0.08 before merge anniversary",
            author: "0xauthor2",
          },
        },
      },
    ];

    const mockQuery: any = {};
    mockQuery.order = vi.fn().mockReturnValue(mockQuery);
    mockQuery.range = vi.fn().mockResolvedValue({
      data: mockEvents,
      error: null,
      count: 2,
    });

    vi.spyOn(supabaseLib, "getSupabaseClient").mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn().mockReturnValue(mockQuery),
      })),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseClient>);

    const req = createMockGetRequest("http://localhost:3000/api/activity?limit=10&offset=0");
    const res = await getActivityFeed(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(2);
    expect(body.data[0].event_type).toBe("PositionTaken");
    expect(body.data[0].statement).toBe("AI agents will execute 50% of smart contract calls by Q4 2026");
    expect(body.total).toBe(2);
  });

  it("should filter activities by market_id and event_type", async () => {
    const mockEvents = [
      {
        id: "evt-1",
        market_id: "m-101",
        event_type: "PositionTaken",
        wallet_address: "0x1111111111111111111111111111111111111111",
        amount: 0.5,
        tx_hash: "0xabc1",
        block_number: 123456,
        created_at: "2026-09-17T08:00:00Z",
        markets: {
          id: "m-101",
          contract_address: "0xmarket1",
          chain_id: ETHEREUM_SEPOLIA_CHAIN_ID,
          status: "OPEN",
          belief_id: "b-101",
          beliefs: {
            id: "b-101",
            statement: "Statement 101",
            author: "0xauthor1",
          },
        },
      },
    ];

    const mockQuery: any = {};
    mockQuery.eq = vi.fn().mockReturnValue(mockQuery);
    mockQuery.order = vi.fn().mockReturnValue(mockQuery);
    mockQuery.range = vi.fn().mockResolvedValue({
      data: mockEvents,
      error: null,
      count: 1,
    });

    vi.spyOn(supabaseLib, "getSupabaseClient").mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn().mockReturnValue(mockQuery),
      })),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseClient>);

    const req = createMockGetRequest("http://localhost:3000/api/activity?market_id=m-101&event_type=PositionTaken");
    const res = await getActivityFeed(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(mockQuery.eq).toHaveBeenCalledWith("market_id", "m-101");
    expect(mockQuery.eq).toHaveBeenCalledWith("event_type", "PositionTaken");
  });

  it("should return HTTP 500 when database error occurs", async () => {
    const mockQuery: any = {};
    mockQuery.order = vi.fn().mockReturnValue(mockQuery);
    mockQuery.range = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "Database query error" },
      count: null,
    });

    vi.spyOn(supabaseLib, "getSupabaseClient").mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn().mockReturnValue(mockQuery),
      })),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseClient>);

    const req = createMockGetRequest("http://localhost:3000/api/activity");
    const res = await getActivityFeed(req);
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("Database query error");
  });
});
