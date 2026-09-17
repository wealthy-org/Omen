import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { GET as getBeliefsList } from "../app/api/beliefs/route";
import { GET as getBeliefDetail } from "../app/api/beliefs/[id]/route";
import * as supabaseLib from "../lib/supabase";

describe("TICKET-83: Beliefs API Routes (GET /api/beliefs & GET /api/beliefs/[id])", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function createMockRequest(url: string) {
    return new NextRequest(url, { method: "GET" });
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
    const mockBeliefs = [
      {
        id: "b-1",
        author: "@vitalik",
        statement: "ETH will outperform SOL",
        source_url: "https://x.com/post/1",
        source_platform: "manual",
        ai_confidence: 0.95,
        status: "OPEN",
        created_at: "2026-09-01T00:00:00Z",
        belief_sources: [{ id: "bs-1", raw_text: "ETH will outperform SOL" }],
        markets: [{ id: "m-1", agree_pool: 10, disagree_pool: 5 }],
      },
    ];

    const mockChain: any = {};
    mockChain.order = vi.fn().mockReturnValue(mockChain);
    mockChain.range = vi.fn().mockResolvedValue({ data: mockBeliefs, error: null, count: 1 });

    const mockSelect = vi.fn().mockReturnValue(mockChain);

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockRequest("http://localhost:3000/api/beliefs");
    const res = await getBeliefsList(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.count).toBe(1);
    expect(body.beliefs[0].id).toBe("b-1");
  });

  it("should apply status and author filters", async () => {
    const mockChain: any = {};
    mockChain.eq = vi.fn().mockReturnValue(mockChain);
    mockChain.ilike = vi.fn().mockReturnValue(mockChain);
    mockChain.order = vi.fn().mockReturnValue(mockChain);
    mockChain.range = vi.fn().mockResolvedValue({ data: [], error: null, count: 0 });

    const mockSelect = vi.fn().mockReturnValue(mockChain);

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockRequest("http://localhost:3000/api/beliefs?status=CONFIRMED&author=vitalik");
    const res = await getBeliefsList(req);
    expect(res.status).toBe(200);
    expect(mockChain.eq).toHaveBeenCalledWith("status", "CONFIRMED");
    expect(mockChain.ilike).toHaveBeenCalledWith("author", "%vitalik%");
  });

  it("should apply highest_confidence sort", async () => {
    const mockChain: any = {};
    mockChain.order = vi.fn().mockReturnValue(mockChain);
    mockChain.range = vi.fn().mockResolvedValue({ data: [], error: null, count: 0 });

    const mockSelect = vi.fn().mockReturnValue(mockChain);

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockRequest("http://localhost:3000/api/beliefs?sort=highest_confidence");
    const res = await getBeliefsList(req);
    expect(res.status).toBe(200);
    expect(mockChain.order).toHaveBeenCalledWith("ai_confidence", { ascending: false });
  });

  it("should return single belief detail by ID", async () => {
    const mockBelief = {
      id: "b-123",
      author: "@satoshi",
      statement: "Bitcoin will hit 100k",
      status: "OPEN",
      belief_sources: [],
      markets: [],
      creator_confirmations: [],
    };

    const mockChain: any = {};
    mockChain.eq = vi.fn().mockReturnValue(mockChain);
    mockChain.maybeSingle = vi.fn().mockResolvedValue({ data: mockBelief, error: null });

    const mockSelect = vi.fn().mockReturnValue(mockChain);

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockRequest("http://localhost:3000/api/beliefs/b-123");
    const res = await getBeliefDetail(req, { params: Promise.resolve({ id: "b-123" }) });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.belief.id).toBe("b-123");
  });

  it("should return HTTP 404 when belief is not found", async () => {
    const mockChain: any = {};
    mockChain.eq = vi.fn().mockReturnValue(mockChain);
    mockChain.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });

    const mockSelect = vi.fn().mockReturnValue(mockChain);

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockRequest("http://localhost:3000/api/beliefs/non-existent");
    const res = await getBeliefDetail(req, { params: Promise.resolve({ id: "non-existent" }) });
    expect(res.status).toBe(404);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("not found");
  });

  it("should return HTTP 500 when database error occurs in list query", async () => {
    const mockChain: any = {};
    mockChain.order = vi.fn().mockReturnValue(mockChain);
    mockChain.range = vi.fn().mockResolvedValue({ data: null, error: { message: "DB timeout" } });

    const mockSelect = vi.fn().mockReturnValue(mockChain);

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockRequest("http://localhost:3000/api/beliefs");
    const res = await getBeliefsList(req);
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe("DB timeout");
  });
});
