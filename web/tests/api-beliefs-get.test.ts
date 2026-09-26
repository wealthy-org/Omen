import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { GET as getBeliefsList } from "../app/api/beliefs/route";
import { GET as getBeliefDetail } from "../app/api/beliefs/[id]/route";
import { useTestDb, failingDb, schema } from "./helpers/test-db";

describe("TICKET-83: Beliefs API Routes (GET /api/beliefs & GET /api/beliefs/[id])", () => {

  const testDb = useTestDb();

  beforeEach(async () => {
    vi.restoreAllMocks();
    await testDb.reset();
  });

  function createMockRequest(url: string) {
    return new NextRequest(url, { method: "GET" });
  }

  async function seedBeliefs() {
    const [low, high, confirmed] = await testDb.db
      .insert(schema.beliefs)
      .values([
        { statement: "BTC above 100k", author: "@traderx", ai_confidence: 40, status: "DETECTED", created_at: "2026-09-10T00:00:00Z" },
        { statement: "ETH above 5k", author: "@macrodad", ai_confidence: 95, status: "DETECTED", created_at: "2026-09-11T00:00:00Z" },
        { statement: "SOL flips ETH", author: "@VitalikFan", ai_confidence: 70, status: "CONFIRMED", created_at: "2026-09-12T00:00:00Z" },
      ])
      .returning();
    await testDb.db.insert(schema.belief_sources).values({
      belief_id: low.id,
      raw_text: "BTC will be above 100k",
      submitted_by_wallet: "0x1111111111111111111111111111111111111111",
    });
    return { low, high, confirmed };
  }

  it("should adhere strictly to Zero-Comment Policy in belief route files", () => {
    const filesToCheck = [
      path.resolve(process.cwd(), "app/api/beliefs/route.ts"),
      path.resolve(process.cwd(), "app/api/beliefs/[id]/route.ts"),
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

  it("should return beliefs list with default parameters", async () => {
    const { low, confirmed } = await seedBeliefs();

    const res = await getBeliefsList(createMockRequest("http://localhost:3000/api/beliefs"));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.count).toBe(3);
    expect(body.total).toBe(3);
    expect(body.beliefs[0].id).toBe(confirmed.id);
    const withSource = body.beliefs.find((b: { id: string }) => b.id === low.id);
    expect(withSource.belief_sources).toHaveLength(1);
    expect(withSource.markets).toEqual([]);
  });

  it("should apply status and author filters", async () => {
    const { confirmed } = await seedBeliefs();

    const res = await getBeliefsList(createMockRequest("http://localhost:3000/api/beliefs?status=CONFIRMED&author=vitalik"));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.count).toBe(1);
    expect(body.beliefs[0].id).toBe(confirmed.id);
  });

  it("should apply highest_confidence sort", async () => {
    const { high } = await seedBeliefs();

    const res = await getBeliefsList(createMockRequest("http://localhost:3000/api/beliefs?sort=highest_confidence"));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.beliefs[0].id).toBe(high.id);
    expect(body.beliefs.map((b: { ai_confidence: number }) => b.ai_confidence)).toEqual([95, 70, 40]);
  });

  it("should return single belief detail by ID", async () => {
    const { low } = await seedBeliefs();

    const res = await getBeliefDetail(
      createMockRequest(`http://localhost:3000/api/beliefs/${low.id}`),
      { params: Promise.resolve({ id: low.id }) }
    );
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.belief.id).toBe(low.id);
    expect(body.belief.belief_sources[0].raw_text).toBe("BTC will be above 100k");
    expect(body.belief.creator_confirmations).toEqual([]);
  });

  it("should return HTTP 404 when belief is not found", async () => {
    for (const id of ["non-existent", "00000000-0000-0000-0000-000000000000"]) {
      const res = await getBeliefDetail(
        createMockRequest(`http://localhost:3000/api/beliefs/${id}`),
        { params: Promise.resolve({ id }) }
      );
      expect(res.status).toBe(404);

      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error).toContain("not found");
    }
  });

  it("should return HTTP 500 when database error occurs in list query", async () => {
    failingDb("DB timeout");

    const res = await getBeliefsList(createMockRequest("http://localhost:3000/api/beliefs"));
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe("DB timeout");
  });
});
