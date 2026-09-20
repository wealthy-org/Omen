import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/stats/overview/route";

vi.mock("@/lib/supabase", () => {
  return {
    getSupabaseAdminClient: vi.fn(),
  };
});

import { getSupabaseAdminClient } from "@/lib/supabase";

describe("GET /api/stats/overview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates platform statistics aggregate correctly from markets and users tables", async () => {
    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === "markets") {
        return {
          select: vi.fn().mockResolvedValue({
            data: [
              { status: "active", agree_pool: "50.0", disagree_pool: "50.0" },
              { status: "active", agree_pool: "25.5", disagree_pool: "25.0" },
              { status: "resolved", agree_pool: "10.0", disagree_pool: "10.0" },
            ],
            error: null,
          }),
        };
      }
      if (table === "beliefs") {
        return {
          select: vi.fn().mockResolvedValue({ count: 12, error: null }),
        };
      }
      if (table === "creator_profiles") {
        return {
          select: vi.fn().mockResolvedValue({ count: 8, error: null }),
        };
      }
      if (table === "users") {
        return {
          select: vi.fn().mockResolvedValue({ count: 24, error: null }),
        };
      }
      return {
        select: vi.fn().mockResolvedValue({ data: [], count: 0, error: null }),
      };
    });

    (getSupabaseAdminClient as any).mockReturnValue({
      from: mockFrom,
    });

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.stats.active_markets).toBe(2);
    expect(json.stats.total_tvl_eth).toBe("170.50");
    expect(json.stats.total_beliefs).toBe(12);
    expect(json.stats.verified_creators).toBe(8);
    expect(json.stats.active_wallets).toBe(24);
  });

  it("returns 500 error when supabase returns a database error", async () => {
    const mockFrom = vi.fn().mockImplementation(() => {
      return {
        select: vi.fn().mockResolvedValue({ data: null, error: { message: "db error" } }),
      };
    });

    (getSupabaseAdminClient as any).mockReturnValue({
      from: mockFrom,
    });

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe("db error");
  });
});
