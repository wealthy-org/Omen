import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import { POST } from "@/app/api/markets/route";
import { useTestDb, failingDb, schema } from "./helpers/test-db";

describe("TICKET-31: API Route Simpan Pasar Baru (POST /api/markets)", () => {

  const testDb = useTestDb();

  beforeEach(async () => {
    vi.restoreAllMocks();
    await testDb.reset();
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

  it("should create a new market successfully when authorized via x-admin-key", async () => {
    const req = createMockPostRequest(
      {
        contract_market_id: 10,
        title: "  Will Bitcoin hit 100k?  ",
        description: "BTC price prediction",
        deadline: "2026-12-31T23:59:59.000Z",
        category: "CRYPTO",
        resolution_source: "Chainlink",
      },
      { "x-admin-key": "omen-admin-2026" }
    );

    const res = await POST(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.market.contract_market_id).toBe(10);
    expect(data.market.title).toBe("Will Bitcoin hit 100k?");
    expect(data.market.category).toBe("crypto");
    expect(data.market.status).toBe("OPEN");
    expect(data.market.total_pool).toBe(0);

    const stored = await testDb.db.query.markets.findFirst({ where: eq(schema.markets.contract_market_id, 10) });
    expect(stored?.close_time).toBe("2026-12-31T23:59:59.000Z");
    expect(stored?.resolution_source).toBe("Chainlink");
  });

  it("should create a new market successfully when authorized via Authorization Bearer token", async () => {
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
    const req = createMockPostRequest(
      {
        contract_market_id: 12,
        title: "Will ETH flip BTC?",
        deadline: "2026-12-31T23:59:59.000Z",
      },
      { "x-admin-wallet": "0xAdmin99999999999999999999999999999999999" }
    );

    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it("should link a deployed belief market, store resolution params, open the belief, and log MarketCreated", async () => {
    const [belief] = await testDb.db
      .insert(schema.beliefs)
      .values({ statement: "Will BTC trade at or above $100,000 before Dec 21, 2026?", author: "@yes2crypto.eth" })
      .returning();

    const req = createMockPostRequest(
      {
        contract_market_id: 7,
        contract_address: "0x1111111111111111111111111111111111111111",
        chain_id: 46630,
        belief_id: belief.id,
        title: belief.statement,
        deadline: "2026-12-21T23:59:59.000Z",
        open_time: "2026-09-26T00:00:00.000Z",
        resolution_type: "PRICE_ABOVE",
        resolution_config: { asset: "BTC", targetPrice: 100000 },
        tx_hash: "0xdeploytx",
      },
      { "x-admin-wallet": "0x1234567890abcdef1234567890abcdef12345678" }
    );

    const res = await POST(req);
    expect(res.status).toBe(201);

    const market = await testDb.db.query.markets.findFirst({
      where: eq(schema.markets.belief_id, belief.id),
      with: { beliefs: true, market_events: true },
    });
    expect(market?.chain_id).toBe(46630);
    expect(market?.resolution_type).toBe("PRICE_ABOVE");
    expect(market?.resolution_config).toEqual({ asset: "BTC", targetPrice: 100000 });
    expect(market?.open_time).toBe("2026-09-26T00:00:00.000Z");
    expect(market?.beliefs?.status).toBe("OPEN");
    expect(market?.market_events).toHaveLength(1);
    expect(market?.market_events[0]).toMatchObject({
      event_type: "MarketCreated",
      tx_hash: "0xdeploytx",
      wallet_address: "0x1234567890abcdef1234567890abcdef12345678",
    });
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
    await testDb.db.insert(schema.markets).values({ contract_market_id: 5, title: "Existing" });

    const req = createMockPostRequest(
      { contract_market_id: 5, title: "Duplicate", deadline: "2026-12-31T00:00:00.000Z" },
      { "x-admin-key": "omen-admin-2026" }
    );

    const res = await POST(req);
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toContain("already exists");
  });

  it("should return 500 when the database insert operation fails", async () => {
    failingDb("Database insert failure");

    const req = createMockPostRequest(
      { contract_market_id: 6, title: "Fails", deadline: "2026-12-31T00:00:00.000Z" },
      { "x-admin-key": "omen-admin-2026" }
    );

    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Database insert failure");
  });
});
