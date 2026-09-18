import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { POST as createOracleSnapshot } from "../app/api/oracle/snapshot/route";
import { normalizeChainlinkPrice } from "../lib/oracle/chainlink";
import * as supabaseLib from "../lib/supabase";
import * as chainlinkLib from "../lib/oracle/chainlink";

describe("TICKET-91: Oracle Price Snapshot API & Chainlink Helper", () => {
  const originalAdminKey = process.env.ADMIN_API_KEY;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.ADMIN_API_KEY = "test-secret-admin-key";
  });

  afterAll(() => {
    process.env.ADMIN_API_KEY = originalAdminKey;
  });

  function createMockPostRequest(url: string, body: unknown, headers?: Record<string, string>) {
    return new NextRequest(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
    });
  }

  it("should adhere strictly to Zero-Comment Policy in oracle snapshot files", () => {
    const filesToCheck = [
      path.resolve(process.cwd(), "app/api/oracle/snapshot/route.ts"),
      path.resolve(process.cwd(), "lib/oracle/chainlink.ts"),
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

  it("should accurately normalize Chainlink raw prices with custom decimals", () => {
    const rawEthPrice = BigInt(350050000000);
    const ethPrice = normalizeChainlinkPrice(rawEthPrice, 8);
    expect(ethPrice).toBe(3500.5);

    const rawBtcPrice = BigInt(6500000000000);
    const btcPrice = normalizeChainlinkPrice(rawBtcPrice, 8);
    expect(btcPrice).toBe(65000);

    const zeroPrice = normalizeChainlinkPrice(BigInt(0), 8);
    expect(zeroPrice).toBe(0);
  });

  it("should return HTTP 401 when x-admin-key is missing or invalid", async () => {
    const reqNoAuth = createMockPostRequest("http://localhost:3000/api/oracle/snapshot", {
      asset: "ETH",
      price: 3500,
    });
    const resNoAuth = await createOracleSnapshot(reqNoAuth);
    expect(resNoAuth.status).toBe(401);

    const reqWrongAuth = createMockPostRequest(
      "http://localhost:3000/api/oracle/snapshot",
      { asset: "ETH", price: 3500 },
      { "x-admin-key": "invalid-key" }
    );
    const resWrongAuth = await createOracleSnapshot(reqWrongAuth);
    expect(resWrongAuth.status).toBe(401);
  });

  it("should return HTTP 400 when required asset field is missing", async () => {
    const req = createMockPostRequest(
      "http://localhost:3000/api/oracle/snapshot",
      { market_id: "m-101" },
      { "x-admin-key": "test-secret-admin-key" }
    );
    const res = await createOracleSnapshot(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("asset");
  });

  it("should successfully record snapshot with provided price", async () => {
    const mockSnapshot = {
      id: "snap-1",
      market_id: "m-101",
      asset: "ETH",
      price: 3500.5,
      snapshot_type: "START",
      source: "chainlink",
      recorded_at: "2026-09-17T08:00:00Z",
    };

    const mockInsert: any = {};
    mockInsert.select = vi.fn().mockReturnValue(mockInsert);
    mockInsert.single = vi.fn().mockResolvedValue({
      data: mockSnapshot,
      error: null,
    });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn(() => ({
        insert: vi.fn().mockReturnValue(mockInsert),
      })),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockPostRequest(
      "http://localhost:3000/api/oracle/snapshot",
      {
        market_id: "m-101",
        asset: "ETH",
        price: 3500.5,
        snapshot_type: "START",
      },
      { "x-admin-key": "test-secret-admin-key" }
    );

    const res = await createOracleSnapshot(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.price).toBe(3500.5);
    expect(body.data.asset).toBe("ETH");
  });

  it("should fetch price from Chainlink helper when price is omitted", async () => {
    vi.spyOn(chainlinkLib, "fetchChainlinkPrice").mockResolvedValue({
      price: 65432.1,
      roundId: BigInt(100),
      updatedAt: BigInt(1726500000),
    });

    const mockSnapshot = {
      id: "snap-2",
      market_id: "m-102",
      asset: "BTC",
      price: 65432.1,
      snapshot_type: "END",
      source: "chainlink",
      recorded_at: "2026-09-17T08:00:00Z",
    };

    const mockInsert: any = {};
    mockInsert.select = vi.fn().mockReturnValue(mockInsert);
    mockInsert.single = vi.fn().mockResolvedValue({
      data: mockSnapshot,
      error: null,
    });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn(() => ({
        insert: vi.fn().mockReturnValue(mockInsert),
      })),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockPostRequest(
      "http://localhost:3000/api/oracle/snapshot",
      {
        market_id: "m-102",
        asset: "BTC",
        snapshot_type: "END",
      },
      { "x-admin-key": "test-secret-admin-key" }
    );

    const res = await createOracleSnapshot(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.price).toBe(65432.1);
  });

  it("should return snapshots on GET /api/oracle/snapshot", async () => {
    const mockSnapshots = [
      {
        id: "snap-1",
        asset: "ETH",
        price: 2454.54,
        snapshot_type: "DISPLAY",
        source: "chainlink",
        recorded_at: "2026-09-18T00:00:00Z",
      },
    ];

    const mockQuery: any = {};
    mockQuery.order = vi.fn().mockReturnValue(mockQuery);
    mockQuery.limit = vi.fn().mockResolvedValue({
      data: mockSnapshots,
      error: null,
    });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn().mockReturnValue(mockQuery),
      })),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const { GET: getOracleSnapshots } = await import("../app/api/oracle/snapshot/route");
    const req = new NextRequest("http://localhost:3000/api/oracle/snapshot?limit=5");
    const res = await getOracleSnapshots(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.snapshots).toHaveLength(1);
    expect(body.snapshots[0].price).toBe(2454.54);
  });

  it("should return configured feeds on GET /api/oracle/feeds", async () => {
    vi.spyOn(chainlinkLib, "fetchChainlinkPrice").mockResolvedValue({
      price: 2454.54,
      roundId: BigInt("18446744073709587751"),
      updatedAt: BigInt(Math.floor(Date.now() / 1000)),
    });

    const { GET: getOracleFeeds } = await import("../app/api/oracle/feeds/route");
    const res = await getOracleFeeds();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.feeds).toBeInstanceOf(Array);
    expect(body.feeds.length).toBeGreaterThanOrEqual(3);
    expect(body.feeds[0].symbol).toBe("ETH/USD");
  });
});
