import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { GET } from "@/app/api/quests/route";
import * as supabaseLib from "@/lib/supabase";

describe("TICKET-27: API Route Daftar Quest (/api/quests)", () => {
  const targetWallet = "0x71c841915637e130f9cf8853765eea5957019c9e";

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function createMockRequest(url: string) {
    return new NextRequest(url, { method: "GET" });
  }

  it("should return active quests with is_completed false when no wallet_address provided", async () => {
    const mockQuests = [
      {
        id: "q-1",
        title: "Daily Social Share",
        description: "Share Omen prediction market",
        points_reward: "50",
        is_active: true,
        created_at: "2026-09-16T10:00:00.000Z",
      },
      {
        id: "q-2",
        title: "Place 5 Bets",
        description: "Place bets on active markets",
        points_reward: "200",
        is_active: true,
        created_at: "2026-09-16T11:00:00.000Z",
      },
    ];

    const mockOrder = vi.fn().mockResolvedValue({ data: mockQuests, error: null });
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockRequest("http://localhost:3000/api/quests");
    const res = await GET(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.quests).toHaveLength(2);
    expect(body.quests[0].is_completed).toBe(false);
    expect(body.quests[0].points_reward).toBe(50);
    expect(body.quests[1].is_completed).toBe(false);
    expect(body.quests[1].points_reward).toBe(200);
  });

  it("should return correct is_completed status when wallet_address query param is provided", async () => {
    const mockQuests = [
      {
        id: "q-1",
        title: "Connect Wallet",
        description: "First time connection",
        points_reward: "100",
        is_active: true,
        created_at: "2026-09-16T10:00:00.000Z",
      },
      {
        id: "q-2",
        title: "First Prediction",
        description: "Place your initial bet",
        points_reward: "150",
        is_active: true,
        created_at: "2026-09-16T11:00:00.000Z",
      },
    ];

    const mockOrder = vi.fn().mockResolvedValue({ data: mockQuests, error: null });
    const mockEqQuests = vi.fn().mockReturnValue({ order: mockOrder });
    const mockSelectQuests = vi.fn().mockReturnValue({ eq: mockEqQuests });

    const mockCompletions = [{ quest_id: "q-1" }];
    const mockNot = vi.fn().mockResolvedValue({ data: mockCompletions, error: null });
    const mockEqSource = vi.fn().mockReturnValue({ not: mockNot });
    const mockEqWallet = vi.fn().mockReturnValue({ eq: mockEqSource });
    const mockSelectCompletions = vi.fn().mockReturnValue({ eq: mockEqWallet });

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === "quests") {
        return { select: mockSelectQuests };
      }
      if (table === "points_events") {
        return { select: mockSelectCompletions };
      }
      return {};
    });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: mockFrom,
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockRequest(`http://localhost:3000/api/quests?wallet_address=${targetWallet}`);
    const res = await GET(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.quests[0].id).toBe("q-1");
    expect(body.quests[0].is_completed).toBe(true);
    expect(body.quests[1].id).toBe("q-2");
    expect(body.quests[1].is_completed).toBe(false);
  });

  it("should return 500 if supabase query for quests fails", async () => {
    const mockOrder = vi.fn().mockResolvedValue({ data: null, error: { message: "Database timeout" } });
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockRequest("http://localhost:3000/api/quests");
    const res = await GET(req);
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.error).toBe("Database timeout");
  });

  it("should strictly adhere to Zero-Comment Policy", () => {
    const filePath = path.resolve(process.cwd(), "app/api/quests/route.ts");
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
