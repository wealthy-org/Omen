import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { GET as getActivityFeed } from "../app/api/activity/route";
import { useTestDb, failingDb, schema } from "./helpers/test-db";
import { ETHEREUM_SEPOLIA_CHAIN_ID } from "../lib/constants";

describe("TICKET-90: Public Activity Feed API", () => {
  const testDb = useTestDb();

  beforeEach(async () => {
    vi.restoreAllMocks();
    await testDb.reset();
  });

  async function seedEvents() {
    const { db } = testDb;
    const [belief1, belief2] = await db
      .insert(schema.beliefs)
      .values([
        { statement: "AI agents will execute 50% of smart contract calls by Q4 2026", author: "0xauthor1" },
        { statement: "ETH/BTC ratio will cross 0.08 before merge anniversary", author: "0xauthor2" },
      ])
      .returning();
    const [market1, market2] = await db
      .insert(schema.markets)
      .values([
        { belief_id: belief1.id, contract_address: "0xmarket1", chain_id: ETHEREUM_SEPOLIA_CHAIN_ID, status: "OPEN" },
        { belief_id: belief2.id, contract_address: "0xmarket2", chain_id: ETHEREUM_SEPOLIA_CHAIN_ID, status: "RESOLVED" },
      ])
      .returning();
    await db.insert(schema.market_events).values([
      {
        market_id: market1.id,
        event_type: "PositionTaken",
        wallet_address: "0x1111111111111111111111111111111111111111",
        amount: 0.5,
        tx_hash: "0xabc1",
        block_number: 123456,
        created_at: "2026-09-17T08:00:00Z",
      },
      {
        market_id: market2.id,
        event_type: "MarketResolved",
        wallet_address: "0x2222222222222222222222222222222222222222",
        amount: null,
        tx_hash: "0xabc2",
        block_number: 123460,
        created_at: "2026-09-17T07:30:00Z",
      },
    ]);
    return { market1, market2 };
  }

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
    const { market1 } = await seedEvents();

    const req = createMockGetRequest("http://localhost:3000/api/activity?limit=10&offset=0");
    const res = await getActivityFeed(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(2);
    expect(body.data[0].event_type).toBe("PositionTaken");
    expect(body.data[0].amount).toBe(0.5);
    expect(body.data[0].market_contract_address).toBe("0xmarket1");
    expect(body.data[0].market_id).toBe(market1.id);
    expect(body.data[0].statement).toBe("AI agents will execute 50% of smart contract calls by Q4 2026");
    expect(body.data[0].created_at).toBe("2026-09-17T08:00:00.000Z");
    expect(body.total).toBe(2);
  });

  it("should filter activities by market_id and event_type", async () => {
    const { market1 } = await seedEvents();

    const req = createMockGetRequest(`http://localhost:3000/api/activity?market_id=${market1.id}&event_type=PositionTaken`);
    const res = await getActivityFeed(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].market_id).toBe(market1.id);
    expect(body.total).toBe(1);
  });

  it("should paginate with limit and offset while reporting the full total", async () => {
    await seedEvents();

    const res = await getActivityFeed(createMockGetRequest("http://localhost:3000/api/activity?limit=1&offset=1"));
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].event_type).toBe("MarketResolved");
    expect(body.total).toBe(2);
  });

  it("should return HTTP 500 when database error occurs", async () => {
    failingDb("Database query error");

    const req = createMockGetRequest("http://localhost:3000/api/activity");
    const res = await getActivityFeed(req);
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("Database query error");
  });
});
