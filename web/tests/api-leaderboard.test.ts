import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { GET } from "@/app/api/leaderboard/points/route";
import * as supabaseLib from "@/lib/supabase";

describe("TICKET-29: API Route Ranking Poin Leaderboard (/api/leaderboard/points)", () => {
  const targetWallet = "0x71c841915637e130f9cf8853765eea5957019c9e";

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function createMockRequest(url: string) {
    return new NextRequest(url, { method: "GET" });
  }

  it("should return descending leaderboard with default pagination and ranks", async () => {
    const mockProfiles = [
      { wallet_address: "0x1111111111111111111111111111111111111111", correct_count: 5, resolved_count: 6, handle: "@trader1" },
      { wallet_address: "0x2222222222222222222222222222222222222222", correct_count: 3, resolved_count: 4, handle: "@trader2" },
    ];

    const mockRange = vi.fn().mockResolvedValue({ data: mockProfiles, count: 50, error: null });
    const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
    const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockRequest("http://localhost:3000/api/leaderboard/points");
    const res = await GET(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.total_users).toBe(50);
    expect(body.limit).toBe(50);
    expect(body.offset).toBe(0);
    expect(body.leaderboard).toHaveLength(2);
    expect(body.leaderboard[0].rank).toBe(1);
    expect(body.leaderboard[0].total_points).toBe(1750);
    expect(body.leaderboard[1].rank).toBe(2);
    expect(body.currentUserRank).toBeNull();
  });

  it("should support custom limit and offset pagination", async () => {
    const mockProfiles = [
      { wallet_address: "0x3333333333333333333333333333333333333333", correct_count: 2, resolved_count: 3, handle: "@trader3" },
    ];

    const mockRange = vi.fn().mockResolvedValue({ data: mockProfiles, count: 100, error: null });
    const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
    const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockRequest("http://localhost:3000/api/leaderboard/points?limit=10&offset=20");
    const res = await GET(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.limit).toBe(10);
    expect(body.offset).toBe(20);
    expect(body.leaderboard[0].rank).toBe(21);
    expect(mockRange).toHaveBeenCalledWith(20, 29);
  });

  it("should calculate and include currentUserRank when wallet_address query is passed", async () => {
    const mockProfiles = [
      { wallet_address: "0x1111111111111111111111111111111111111111", correct_count: 8, resolved_count: 10, handle: "@leader" },
      { wallet_address: targetWallet, correct_count: 4, resolved_count: 5, handle: "@target" },
    ];

    const mockRange = vi.fn().mockResolvedValue({ data: mockProfiles, count: 25, error: null });
    const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
    const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockRequest(`http://localhost:3000/api/leaderboard/points?wallet_address=${targetWallet}`);
    const res = await GET(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.currentUserRank).toBeDefined();
    expect(body.currentUserRank.rank).toBe(2);
    expect(body.currentUserRank.wallet_address).toBe(targetWallet);
    expect(body.currentUserRank.total_points).toBe(1500);
    expect(body.currentUserRank.streak_count).toBe(5);
  });

  it("should return 500 if database query fails", async () => {
    const mockRange = vi.fn().mockResolvedValue({ data: null, count: 0, error: { message: "Database query failed", code: "OTHER" } });
    const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
    const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "creator_profiles") {
          return { select: mockSelect };
        }
        if (table === "users") {
          return {
            select: vi.fn().mockReturnValue({
              range: vi.fn().mockRejectedValue(new Error("Database query failed")),
            }),
          };
        }
        return {};
      }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockRequest("http://localhost:3000/api/leaderboard/points");
    const res = await GET(req);
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.error).toBe("Database query failed");
  });

  it("should strictly adhere to Zero-Comment Policy", () => {
    const filePath = path.resolve(process.cwd(), "app/api/leaderboard/points/route.ts");
    expect(fs.existsSync(filePath)).toBe(true);

    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      expect(trimmed.startsWith("//")).toBe(false);
      expect(trimmed.includes("/" + "*")).toBe(false);
      expect(trimmed.includes("*" + "/")).toBe(false);
    }
  });
});
