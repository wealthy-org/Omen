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
    const mockUsers = [
      { wallet_address: "0x1111111111111111111111111111111111111111", total_points: "1200", streak_count: 5 },
      { wallet_address: "0x2222222222222222222222222222222222222222", total_points: "850", streak_count: 3 },
    ];

    const mockRange = vi.fn().mockResolvedValue({ data: mockUsers, count: 50, error: null });
    const mockOrderCreated = vi.fn().mockReturnValue({ range: mockRange });
    const mockOrderPoints = vi.fn().mockReturnValue({ order: mockOrderCreated });
    const mockSelect = vi.fn().mockReturnValue({ order: mockOrderPoints });

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
    expect(body.leaderboard[0].total_points).toBe(1200);
    expect(body.leaderboard[1].rank).toBe(2);
    expect(body.currentUserRank).toBeNull();
  });

  it("should support custom limit and offset pagination", async () => {
    const mockUsers = [
      { wallet_address: "0x3333333333333333333333333333333333333333", total_points: "400", streak_count: 2 },
    ];

    const mockRange = vi.fn().mockResolvedValue({ data: mockUsers, count: 100, error: null });
    const mockOrderCreated = vi.fn().mockReturnValue({ range: mockRange });
    const mockOrderPoints = vi.fn().mockReturnValue({ order: mockOrderCreated });
    const mockSelect = vi.fn().mockReturnValue({ order: mockOrderPoints });

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
    const mockUsers = [
      { wallet_address: "0x1111111111111111111111111111111111111111", total_points: "1500", streak_count: 8 },
    ];

    const mockTargetUser = {
      wallet_address: targetWallet,
      total_points: "600",
      streak_count: 4,
    };

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: vi.fn().mockImplementation((_cols: string, opts?: { count?: string; head?: boolean }) => {
            if (opts?.head) {
              return {
                gt: vi.fn().mockResolvedValue({ count: 6, error: null }),
              };
            }
            return {
              order: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  range: vi.fn().mockResolvedValue({ data: mockUsers, count: 25, error: null }),
                }),
              }),
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: mockTargetUser, error: null }),
              }),
            };
          }),
        };
      }
      return {};
    });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: mockFrom,
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockRequest(`http://localhost:3000/api/leaderboard/points?wallet_address=${targetWallet}`);
    const res = await GET(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.currentUserRank).toBeDefined();
    expect(body.currentUserRank.rank).toBe(7);
    expect(body.currentUserRank.wallet_address).toBe(targetWallet);
    expect(body.currentUserRank.total_points).toBe(600);
    expect(body.currentUserRank.streak_count).toBe(4);
  });

  it("should return 500 if database query fails", async () => {
    const mockRange = vi.fn().mockResolvedValue({ data: null, count: 0, error: { message: "Database query failed" } });
    const mockOrderCreated = vi.fn().mockReturnValue({ range: mockRange });
    const mockOrderPoints = vi.fn().mockReturnValue({ order: mockOrderCreated });
    const mockSelect = vi.fn().mockReturnValue({ order: mockOrderPoints });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
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
