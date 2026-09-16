import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { POST } from "@/app/api/wallet/connect/route";
import * as supabaseLib from "@/lib/supabase";

describe("TICKET-25: API Route Pendaftaran Wallet (/api/wallet/connect)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function createMockRequest(body: unknown) {
    return new NextRequest("http://localhost:3000/api/wallet/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("should return 400 if wallet_address is missing or invalid type", async () => {
    const req1 = createMockRequest({});
    const res1 = await POST(req1);
    expect(res1.status).toBe(400);
    const data1 = await res1.json();
    expect(data1.error).toContain("wallet_address is required");

    const req2 = createMockRequest({ wallet_address: 12345 });
    const res2 = await POST(req2);
    expect(res2.status).toBe(400);
  });

  it("should return 400 if wallet_address is not a valid EVM address format", async () => {
    const invalidAddresses = [
      "0xinvalid",
      "0x123456789012345678901234567890123456789",
      "0x12345678901234567890123456789012345678901",
      "0xZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ",
      "not-even-a-hash",
    ];

    for (const address of invalidAddresses) {
      const req = createMockRequest({ wallet_address: address });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Invalid EVM wallet address format");
    }
  });

  it("should return 200 and normalized user data on successful upsert", async () => {
    const mockUser = {
      wallet_address: "0x71c841915637e130f9cf8853765eea5957019c9e",
      total_points: "150",
      streak_count: 3,
    };

    const mockSingle = vi.fn().mockResolvedValue({ data: mockUser, error: null });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockUpsert = vi.fn().mockReturnValue({ select: mockSelect });
    const mockFrom = vi.fn().mockReturnValue({ upsert: mockUpsert });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: mockFrom,
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockRequest({
      wallet_address: "0x71C841915637E130F9cf8853765eEa5957019C9e",
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.user.wallet_address).toBe("0x71c841915637e130f9cf8853765eea5957019c9e");
    expect(body.user.total_points).toBe(150);
    expect(body.user.streak_count).toBe(3);

    expect(mockFrom).toHaveBeenCalledWith("users");
    expect(mockUpsert).toHaveBeenCalledWith(
      { wallet_address: "0x71c841915637e130f9cf8853765eea5957019c9e" },
      { onConflict: "wallet_address" }
    );
  });

  it("should return 500 if supabase database returns an error", async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "Database connection failed" },
    });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockUpsert = vi.fn().mockReturnValue({ select: mockSelect });
    const mockFrom = vi.fn().mockReturnValue({ upsert: mockUpsert });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: mockFrom,
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockRequest({
      wallet_address: "0x71C841915637E130F9cf8853765eEa5957019C9e",
    });

    const res = await POST(req);
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.error).toBe("Database connection failed");
  });

  it("should strictly adhere to Zero-Comment Policy", () => {
    const filePath = path.resolve(process.cwd(), "app/api/wallet/connect/route.ts");
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
