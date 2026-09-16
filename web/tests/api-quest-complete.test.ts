import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { POST } from "@/app/api/quests/[id]/complete/route";
import * as supabaseLib from "@/lib/supabase";

describe("TICKET-28: API Route Verifikasi Quest (/api/quests/[id]/complete)", () => {
  const targetWallet = "0x71c841915637e130f9cf8853765eea5957019c9e";
  const targetQuestId = "q-1234";

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function createMockRequest(body: unknown) {
    return new NextRequest(`http://localhost:3000/api/quests/${targetQuestId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  function createContext(id: string = targetQuestId) {
    return { params: Promise.resolve({ id }) };
  }

  it("should return 400 if wallet_address is missing or invalid format", async () => {
    const res1 = await POST(createMockRequest({}), createContext());
    expect(res1.status).toBe(400);

    const res2 = await POST(createMockRequest({ wallet_address: "not-an-address" }), createContext());
    expect(res2.status).toBe(400);
  });

  it("should return 404 if quest does not exist", async () => {
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const res = await POST(createMockRequest({ wallet_address: targetWallet }), createContext());
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Quest not found");
  });

  it("should return 400 if quest is not active", async () => {
    const mockQuest = { id: targetQuestId, title: "Expired Quest", points_reward: 50, is_active: false };
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: mockQuest, error: null });
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const res = await POST(createMockRequest({ wallet_address: targetWallet }), createContext());
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Quest is not active");
  });

  it("should return 404 if user is not found in database", async () => {
    const mockQuest = { id: targetQuestId, title: "Active Quest", points_reward: 50, is_active: true };

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === "quests") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: mockQuest, error: null }),
            }),
          }),
        };
      }
      if (table === "users") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        };
      }
      return {};
    });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: mockFrom,
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const res = await POST(createMockRequest({ wallet_address: targetWallet }), createContext());
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toContain("User not found");
  });

  it("should reject with 400 if quest has already been completed by this wallet", async () => {
    const mockQuest = { id: targetQuestId, title: "Active Quest", points_reward: 50, is_active: true };
    const mockUser = { id: "u-1", wallet_address: targetWallet, total_points: 100 };
    const mockExistingEvent = { id: "ev-1" };

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === "quests") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: mockQuest, error: null }),
            }),
          }),
        };
      }
      if (table === "users") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
            }),
          }),
        };
      }
      if (table === "points_events") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({ data: mockExistingEvent, error: null }),
                }),
              }),
            }),
          }),
        };
      }
      return {};
    });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: mockFrom,
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const res = await POST(createMockRequest({ wallet_address: targetWallet }), createContext());
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Quest has already been completed by this wallet");
  });

  it("should successfully complete quest, award points, and record audit event", async () => {
    const mockQuest = { id: targetQuestId, title: "Active Quest", points_reward: "75", is_active: true };
    const mockUser = { id: "u-1", wallet_address: targetWallet, total_points: "100" };

    const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
    const mockInsert = vi.fn().mockResolvedValue({ error: null });

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === "quests") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: mockQuest, error: null }),
            }),
          }),
        };
      }
      if (table === "users") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
            }),
          }),
          update: vi.fn().mockReturnValue({ eq: mockUpdateEq }),
        };
      }
      if (table === "points_events") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                }),
              }),
            }),
          }),
          insert: mockInsert,
        };
      }
      return {};
    });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: mockFrom,
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const res = await POST(createMockRequest({ wallet_address: targetWallet }), createContext());
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.quest_id).toBe(targetQuestId);
    expect(body.points_awarded).toBe(75);
    expect(body.total_points).toBe(175);

    expect(mockUpdateEq).toHaveBeenCalledWith("wallet_address", targetWallet);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        wallet_address: targetWallet,
        quest_id: targetQuestId,
        source: "quest",
        points: 75,
      })
    );
  });

  it("should strictly adhere to Zero-Comment Policy", () => {
    const filePath = path.resolve(process.cwd(), "app/api/quests/[id]/complete/route.ts");
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
