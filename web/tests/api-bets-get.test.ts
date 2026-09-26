import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { GET } from "@/app/api/bets/route";
import { useTestDb, failingDb, schema } from "./helpers/test-db";

describe("TICKET-33: API Route Riwayat Taruhan (GET /api/bets)", () => {

  const validWallet = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
  const normalizedWallet = validWallet.toLowerCase();
  const testDb = useTestDb();

  beforeEach(async () => {
    vi.restoreAllMocks();
    await testDb.reset();
  });

  function createMockRequest(url: string) {
    return new NextRequest(url, { method: "GET" });
  }

  it("should strictly adhere to Zero-Comment Policy", () => {
    const targetFiles = [
      path.resolve(process.cwd(), "app/api/bets/route.ts"),
      path.resolve(process.cwd(), "tests/api-bets-get.test.ts"),
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

  it("should return user bets with correctly calculated outcomes for active, won, lost, and cancelled markets", async () => {
    const [active, resolvedAgree, cancelled] = await testDb.db
      .insert(schema.markets)
      .values([
        { contract_market_id: 1, title: "Active ETH Market", status: "active", deadline: "2026-12-31T00:00:00.000Z", agree_pool: 50, disagree_pool: 50 },
        { contract_market_id: 2, title: "Resolved Agree Market", status: "RESOLVED", winner: "AGREE", deadline: "2026-09-01T00:00:00.000Z", agree_pool: 100, disagree_pool: 100 },
        { contract_market_id: 3, title: "Cancelled Market", status: "cancelled", deadline: "2026-08-01T00:00:00.000Z", agree_pool: 30, disagree_pool: 30 },
      ])
      .returning();

    await testDb.db.insert(schema.market_positions).values([
      { market_id: active.id, wallet_address: normalizedWallet, side: "AGREE", amount: 50, claimed: false, tx_hash: "0xhash1", created_at: "2026-09-16T13:00:00.000Z" },
      { market_id: resolvedAgree.id, wallet_address: normalizedWallet, side: "AGREE", amount: 100, claimed: true, tx_hash: "0xhash2", created_at: "2026-09-16T12:00:00.000Z" },
      { market_id: resolvedAgree.id, wallet_address: normalizedWallet, side: "DISAGREE", amount: 20, claimed: false, tx_hash: "0xhash3", created_at: "2026-09-16T11:00:00.000Z" },
      { market_id: cancelled.id, wallet_address: normalizedWallet, side: "AGREE", amount: 30, claimed: false, tx_hash: "0xhash4", created_at: "2026-09-16T10:00:00.000Z" },
      { market_id: active.id, wallet_address: "0x0000000000000000000000000000000000000001", side: "AGREE", amount: 5, tx_hash: "0xother" },
    ]);

    const req = createMockRequest(`http://localhost:3000/api/bets?wallet_address=${validWallet}`);
    const res = await GET(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.count).toBe(4);
    expect(body.bets[0].status).toBe("active");
    expect(body.bets[0].market_title).toBe("Active ETH Market");
    expect(body.bets[0].contract_market_id).toBe(1);
    expect(body.bets[1].status).toBe("won");
    expect(body.bets[1].payout).toBe(200);
    expect(body.bets[1].claimed).toBe(true);
    expect(body.bets[2].status).toBe("lost");
    expect(body.bets[2].payout).toBe(0);
    expect(body.bets[3].status).toBe("cancelled");
    expect(body.bets[3].payout).toBe(30);
  });

  it("should return empty array if user has placed no bets", async () => {
    const req = createMockRequest(`http://localhost:3000/api/bets?wallet_address=${validWallet}`);
    const res = await GET(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.count).toBe(0);
    expect(body.bets).toEqual([]);
  });

  it("should return 400 Bad Request when wallet_address parameter is missing", async () => {
    const req = createMockRequest("http://localhost:3000/api/bets");
    const res = await GET(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toContain("wallet_address");
  });

  it("should return 400 Bad Request when wallet_address is not a valid EVM address", async () => {
    const invalidWallets = ["not-an-address", "0x123", "0xZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ"];
    for (const w of invalidWallets) {
      const req = createMockRequest(`http://localhost:3000/api/bets?wallet_address=${w}`);
      const res = await GET(req);
      expect(res.status).toBe(400);
    }
  });

  it("should return 500 when the database query for bets fails", async () => {
    failingDb("Database query failed");

    const req = createMockRequest(`http://localhost:3000/api/bets?wallet_address=${validWallet}`);
    const res = await GET(req);
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.error).toBe("Database query failed");
  });
});
