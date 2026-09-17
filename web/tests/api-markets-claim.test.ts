import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/markets/[id]/claim/route";
import * as supabaseLib from "@/lib/supabase";

describe("TICKET-107: API Route Klaim Pembayaran Pasar (POST /api/markets/[id]/claim)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function createMockClaimRequest(
    marketId: string,
    body: any,
    headers: Record<string, string> = {}
  ) {
    const req = new NextRequest(`http://localhost:3000/api/markets/${marketId}/claim`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...headers,
      },
      body: typeof body === "string" ? body : JSON.stringify(body),
    });

    const context = {
      params: Promise.resolve({ id: marketId }),
    };

    return { req, context };
  }

  it("should successfully record a claim when market is found and user has positions", async () => {
    const mockMarket = {
      id: "12345678-1234-1234-1234-123456789012",
      contract_market_id: 10,
      title: "Test Claim Market",
      status: "RESOLVED",
    };

    const mockPositions = [
      {
        id: "pos-1",
        market_id: "12345678-1234-1234-1234-123456789012",
        wallet_address: "0x1111111111111111111111111111111111111111",
        claimed: true,
      },
    ];

    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: mockMarket, error: null });
    const mockEqFind = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelectFind = vi.fn().mockReturnValue({ eq: mockEqFind, or: mockEqFind });

    const mockSelectUpdate = vi.fn().mockResolvedValue({ data: mockPositions, error: null });
    const mockEqWallet = vi.fn().mockReturnValue({ select: mockSelectUpdate });
    const mockEqMarket = vi.fn().mockReturnValue({ eq: mockEqWallet });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqMarket });

    const mockInsertEvent = vi.fn().mockResolvedValue({ data: null, error: null });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "markets") {
          return {
            select: mockSelectFind,
          };
        }
        if (table === "market_positions") {
          return {
            update: mockUpdate,
          };
        }
        if (table === "market_events") {
          return {
            insert: mockInsertEvent,
          };
        }
        return {};
      }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const { req, context } = createMockClaimRequest("12345678-1234-1234-1234-123456789012", {
      wallet_address: "0x1111111111111111111111111111111111111111",
      tx_hash: "0xclaimtx123456",
    });

    const res = await POST(req, context);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.claimed).toBe(true);
    expect(body.market_id).toBe("12345678-1234-1234-1234-123456789012");
  });

  it("should return 400 when wallet_address is missing", async () => {
    const { req, context } = createMockClaimRequest("m-claim-1", {
      tx_hash: "0xclaimtx123456",
    });

    const res = await POST(req, context);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/wallet_address/i);
  });
});
