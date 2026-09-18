import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { GET as getCreators } from "../app/api/creators/route";
import { GET as getCreatorByAddress } from "../app/api/creators/[address]/route";
import * as supabaseLib from "../lib/supabase";

describe("TICKET-89: Creator Profiles & Directory API", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function createMockGetRequest(url: string) {
    return new NextRequest(url, {
      method: "GET",
    });
  }

  it("should adhere strictly to Zero-Comment Policy in creators route files", () => {
    const filesToCheck = [
      path.resolve(process.cwd(), "app/api/creators/route.ts"),
      path.resolve(process.cwd(), "app/api/creators/[address]/route.ts"),
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

  it("should retrieve creator directory with pagination and computed accuracy", async () => {
    const mockProfiles = [
      {
        id: "prof-1",
        wallet_address: "0x1111111111111111111111111111111111111111",
        handle: "vitalik",
        confirmed_beliefs_count: 10,
        resolved_count: 8,
        correct_count: 6,
        created_at: "2026-01-01T00:00:00Z",
      },
      {
        id: "prof-2",
        wallet_address: "0x2222222222222222222222222222222222222222",
        handle: "satoshi",
        confirmed_beliefs_count: 5,
        resolved_count: 0,
        correct_count: 0,
        created_at: "2026-01-02T00:00:00Z",
      },
    ];

    const mockQuery: any = {};
    mockQuery.order = vi.fn().mockReturnValue(mockQuery);
    mockQuery.range = vi.fn().mockResolvedValue({
      data: mockProfiles,
      error: null,
      count: 2,
    });

    vi.spyOn(supabaseLib, "getSupabaseClient").mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn().mockReturnValue(mockQuery),
      })),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseClient>);

    const req = createMockGetRequest("http://localhost:3000/api/creators?limit=10&offset=0&sort=accuracy");
    const res = await getCreators(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(2);
    expect(body.data[0].accuracy_percentage).toBe(75);
    expect(body.data[1].accuracy_percentage).toBe(0);
    expect(body.total).toBe(2);
  });

  it("should filter creators by search query", async () => {
    const mockProfiles = [
      {
        id: "prof-1",
        wallet_address: "0x1111111111111111111111111111111111111111",
        handle: "vitalik",
        confirmed_beliefs_count: 10,
        resolved_count: 8,
        correct_count: 6,
        created_at: "2026-01-01T00:00:00Z",
      },
    ];

    const mockQuery: any = {};
    mockQuery.or = vi.fn().mockReturnValue(mockQuery);
    mockQuery.order = vi.fn().mockReturnValue(mockQuery);
    mockQuery.range = vi.fn().mockResolvedValue({
      data: mockProfiles,
      error: null,
      count: 1,
    });

    vi.spyOn(supabaseLib, "getSupabaseClient").mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn().mockReturnValue(mockQuery),
      })),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseClient>);

    const req = createMockGetRequest("http://localhost:3000/api/creators?search=vitalik");
    const res = await getCreators(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].handle).toBe("vitalik");
  });

  it("should retrieve creator profile by address with related beliefs and stats", async () => {
    const walletAddress = "0x1111111111111111111111111111111111111111";
    const mockProfile = {
      id: "prof-1",
      wallet_address: walletAddress,
      handle: "vitalik",
      confirmed_beliefs_count: 3,
      resolved_count: 2,
      correct_count: 2,
      created_at: "2026-01-01T00:00:00Z",
    };

    const mockBeliefs = [
      {
        id: "b-1",
        statement: "Ethereum will scale to 100k TPS",
        author: walletAddress,
        status: "CONFIRMED",
        created_at: "2026-01-02T00:00:00Z",
      },
      {
        id: "b-2",
        statement: "Danksharding will reduce L2 fees by 10x",
        author: walletAddress,
        status: "RESOLVED",
        created_at: "2026-01-03T00:00:00Z",
      },
    ];

    const mockProfileQuery: any = {};
    mockProfileQuery.or = vi.fn().mockReturnValue(mockProfileQuery);
    mockProfileQuery.maybeSingle = vi.fn().mockResolvedValue({
      data: mockProfile,
      error: null,
    });

    const mockBeliefsQuery: any = {};
    mockBeliefsQuery.eq = vi.fn().mockReturnValue(mockBeliefsQuery);
    mockBeliefsQuery.order = vi.fn().mockResolvedValue({
      data: mockBeliefs,
      error: null,
    });

    vi.spyOn(supabaseLib, "getSupabaseClient").mockReturnValue({
      from: vi.fn((table: string) => {
        if (table === "creator_profiles") {
          return {
            select: vi.fn().mockReturnValue(mockProfileQuery),
          };
        }
        if (table === "beliefs") {
          return {
            select: vi.fn().mockReturnValue(mockBeliefsQuery),
          };
        }
        return {} as any;
      }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseClient>);

    const req = createMockGetRequest(`http://localhost:3000/api/creators/${walletAddress}`);
    const res = await getCreatorByAddress(req, { params: Promise.resolve({ address: walletAddress }) });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.wallet_address).toBe(walletAddress);
    expect(body.data.accuracy_percentage).toBe(100);
    expect(body.data.beliefs).toHaveLength(2);
  });

  it("should return HTTP 404 when creator profile is not found", async () => {
    const mockProfileQuery: any = {};
    mockProfileQuery.or = vi.fn().mockReturnValue(mockProfileQuery);
    mockProfileQuery.maybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    const mockBeliefsQuery: any = {};
    mockBeliefsQuery.or = vi.fn().mockReturnValue(mockBeliefsQuery);
    mockBeliefsQuery.order = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    });

    vi.spyOn(supabaseLib, "getSupabaseClient").mockReturnValue({
      from: vi.fn((table: string) => {
        if (table === "creator_profiles") {
          return {
            select: vi.fn().mockReturnValue(mockProfileQuery),
          };
        }
        if (table === "beliefs") {
          return {
            select: vi.fn().mockReturnValue(mockBeliefsQuery),
          };
        }
        return {} as any;
      }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseClient>);

    const req = createMockGetRequest("http://localhost:3000/api/creators/0xnonexistent");
    const res = await getCreatorByAddress(req, { params: Promise.resolve({ address: "0xnonexistent" }) });
    expect(res.status).toBe(404);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("not found");
  });

  it("should return HTTP 500 when database error occurs in creators list", async () => {
    const mockQuery: any = {};
    mockQuery.order = vi.fn().mockReturnValue(mockQuery);
    mockQuery.range = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "Database connection failed" },
      count: null,
    });

    vi.spyOn(supabaseLib, "getSupabaseClient").mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn().mockReturnValue(mockQuery),
      })),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseClient>);

    const req = createMockGetRequest("http://localhost:3000/api/creators");
    const res = await getCreators(req);
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
  });
});
