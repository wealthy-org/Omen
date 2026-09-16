import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { POST } from "@/app/api/checkin/route";
import * as supabaseLib from "@/lib/supabase";

describe("TICKET-26: API Route Daily Check-in Streak (/api/checkin)", () => {
  const targetWallet = "0x71c841915637e130f9cf8853765eea5957019c9e";

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function createMockRequest(body: unknown) {
    return new NextRequest("http://localhost:3000/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("should return 400 if wallet_address is invalid or missing", async () => {
    const res1 = await POST(createMockRequest({}));
    expect(res1.status).toBe(400);

    const res2 = await POST(createMockRequest({ wallet_address: "not-evm" }));
    expect(res2.status).toBe(400);
  });

  it("should return 404 if user does not exist in database", async () => {
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: mockFrom,
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const res = await POST(createMockRequest({ wallet_address: targetWallet }));
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toContain("User not found");
  });

  it("should grant streak 1 and 100 points on first checkin", async () => {
    const mockUser = {
      id: "u-1",
      wallet_address: targetWallet,
      total_points: 0,
      streak_count: 0,
      last_checkin_at: null,
    };

    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: mockUser, error: null });
    const mockSelectEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockSelectEq });

    const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });

    const mockInsert = vi.fn().mockResolvedValue({ error: null });

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === "users") {
        return { select: mockSelect, update: mockUpdate };
      }
      if (table === "points_events") {
        return { insert: mockInsert };
      }
      return {};
    });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: mockFrom,
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const res = await POST(createMockRequest({ wallet_address: targetWallet }));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.points_earned).toBe(100);
    expect(body.streak_count).toBe(1);
    expect(body.total_points).toBe(100);

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        total_points: 100,
        streak_count: 1,
      })
    );

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        wallet_address: targetWallet,
        quest_id: null,
        source: "daily_checkin",
        points: 100,
      })
    );
  });

  it("should reject checkin if cooldown is active (less than 24 hours)", async () => {
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();
    const mockUser = {
      id: "u-1",
      wallet_address: targetWallet,
      total_points: 100,
      streak_count: 1,
      last_checkin_at: fiveHoursAgo,
    };

    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: mockUser, error: null });
    const mockSelectEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockSelectEq });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const res = await POST(createMockRequest({ wallet_address: targetWallet }));
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toContain("Check-in cooldown active");
    expect(body.remaining_seconds).toBeGreaterThan(0);
  });

  it("should increment streak and apply 25% multiplier for consecutive checkin within 24 to 48 hours", async () => {
    const twentySixHoursAgo = new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString();
    const mockUser = {
      id: "u-1",
      wallet_address: targetWallet,
      total_points: 225,
      streak_count: 2,
      last_checkin_at: twentySixHoursAgo,
    };

    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: mockUser, error: null });
    const mockSelectEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockSelectEq });

    const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });
    const mockInsert = vi.fn().mockResolvedValue({ error: null });

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === "users") return { select: mockSelect, update: mockUpdate };
      if (table === "points_events") return { insert: mockInsert };
      return {};
    });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: mockFrom,
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const res = await POST(createMockRequest({ wallet_address: targetWallet }));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.streak_count).toBe(3);
    expect(body.points_earned).toBe(150);
    expect(body.total_points).toBe(375);
  });

  it("should reset streak to 1 if more than 48 hours have passed", async () => {
    const sixtyHoursAgo = new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString();
    const mockUser = {
      id: "u-1",
      wallet_address: targetWallet,
      total_points: 500,
      streak_count: 5,
      last_checkin_at: sixtyHoursAgo,
    };

    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: mockUser, error: null });
    const mockSelectEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockSelectEq });

    const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });
    const mockInsert = vi.fn().mockResolvedValue({ error: null });

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === "users") return { select: mockSelect, update: mockUpdate };
      if (table === "points_events") return { insert: mockInsert };
      return {};
    });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: mockFrom,
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const res = await POST(createMockRequest({ wallet_address: targetWallet }));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.streak_count).toBe(1);
    expect(body.points_earned).toBe(100);
    expect(body.total_points).toBe(600);
  });

  it("should return 500 if database update fails", async () => {
    const twentySixHoursAgo = new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString();
    const mockUser = {
      id: "u-1",
      wallet_address: targetWallet,
      total_points: 100,
      streak_count: 1,
      last_checkin_at: twentySixHoursAgo,
    };

    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: mockUser, error: null });
    const mockSelectEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockSelectEq });

    const mockUpdateEq = vi.fn().mockResolvedValue({ error: { message: "Database write error" } });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === "users") return { select: mockSelect, update: mockUpdate };
      return {};
    });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: mockFrom,
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const res = await POST(createMockRequest({ wallet_address: targetWallet }));
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.error).toBe("Database write error");
  });

  it("should strictly adhere to Zero-Comment Policy", () => {
    const filePath = path.resolve(process.cwd(), "app/api/checkin/route.ts");
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
