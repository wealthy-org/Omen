import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { resolveSingleMarket, processPendingResolutions } from "../lib/market/resolution-engine";
import * as supabaseLib from "../lib/supabase";
import * as chainlinkLib from "../lib/oracle/chainlink";
import { ETHEREUM_SEPOLIA_CHAIN_ID } from "../lib/constants";

describe("TICKET-96: Automatic Oracle Market Resolution Engine", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should adhere strictly to Zero-Comment Policy in resolution engine and helper files", () => {
    const filesToCheck = [
      path.resolve(process.cwd(), "lib/market/resolution-engine.ts"),
      path.resolve(process.cwd(), "lib/market/resolution-helper.ts"),
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

  it("should process expired markets and resolve winner based on Chainlink oracle price", async () => {
    const mockExpiredMarket = {
      id: "m-exp-1",
      belief_id: "b-1",
      contract_address: "0xmarket1111111111111111111111111111111111",
      chain_id: ETHEREUM_SEPOLIA_CHAIN_ID,
      agree_pool: 20,
      disagree_pool: 10,
      open_time: "2026-09-01T00:00:00Z",
      close_time: "2026-09-10T00:00:00Z",
      status: "OPEN",
      resolution_type: "PRICE_ABOVE",
      resolution_config: {
        asset: "ETH",
        targetPrice: 3000,
      },
    };

    const mockStartSnapshot = {
      id: "snap-1",
      market_id: "m-exp-1",
      asset: "ETH",
      price: 2800,
      snapshot_type: "START",
    };

    const mockMarketsQuery: any = {};
    mockMarketsQuery.eq = vi.fn().mockImplementation((col: string, val: string) => {
      if (col === "id") {
        return {
          maybeSingle: vi.fn().mockResolvedValue({ data: mockExpiredMarket, error: null }),
        };
      }
      return mockMarketsQuery;
    });
    mockMarketsQuery.lte = vi.fn().mockResolvedValue({
      data: [mockExpiredMarket],
      error: null,
    });

    const mockMarketUpdate: any = {};
    mockMarketUpdate.eq = vi.fn().mockReturnValue(mockMarketUpdate);
    mockMarketUpdate.select = vi.fn().mockReturnValue(mockMarketUpdate);
    mockMarketUpdate.single = vi.fn().mockResolvedValue({
      data: { ...mockExpiredMarket, status: "RESOLVED", winner: "AGREE" },
      error: null,
    });

    const mockSnapshotsQuery: any = {};
    mockSnapshotsQuery.eq = vi.fn().mockReturnValue(mockSnapshotsQuery);
    mockSnapshotsQuery.maybeSingle = vi.fn().mockResolvedValue({
      data: mockStartSnapshot,
      error: null,
    });

    const mockResolutionInsert: any = {};
    mockResolutionInsert.select = vi.fn().mockReturnValue(mockResolutionInsert);
    mockResolutionInsert.single = vi.fn().mockResolvedValue({
      data: { id: "res-1", market_id: "m-exp-1", resolved_outcome: "AGREE" },
      error: null,
    });

    const mockSettlementInsert: any = {};
    mockSettlementInsert.select = vi.fn().mockReturnValue(mockSettlementInsert);
    mockSettlementInsert.single = vi.fn().mockResolvedValue({
      data: { id: "set-1", market_id: "m-exp-1" },
      error: null,
    });

    const mockBeliefUpdate: any = {};
    mockBeliefUpdate.eq = vi.fn().mockResolvedValue({ data: null, error: null });

    const mockBeliefQuery: any = {};
    mockBeliefQuery.eq = vi.fn().mockReturnValue(mockBeliefQuery);
    mockBeliefQuery.maybeSingle = vi.fn().mockResolvedValue({
      data: { id: "b-1", author: "0x1111111111111111111111111111111111111111" },
      error: null,
    });

    const mockProfileQuery: any = {};
    mockProfileQuery.eq = vi.fn().mockReturnValue(mockProfileQuery);
    mockProfileQuery.maybeSingle = vi.fn().mockResolvedValue({
      data: { id: "prof-1", wallet_address: "0x1111111111111111111111111111111111111111", resolved_count: 1, correct_count: 1 },
      error: null,
    });

    const mockProfileUpdate: any = {};
    mockProfileUpdate.eq = vi.fn().mockResolvedValue({ data: null, error: null });

    const mockProfileUpsert: any = {};
    mockProfileUpsert.select = vi.fn().mockResolvedValue({ data: null, error: null });

    const mockConfirmationQuery: any = {};
    mockConfirmationQuery.eq = vi.fn().mockReturnValue(mockConfirmationQuery);
    mockConfirmationQuery.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn((table: string) => {
        if (table === "markets") {
          return {
            select: vi.fn().mockReturnValue(mockMarketsQuery),
            update: vi.fn().mockReturnValue(mockMarketUpdate),
          };
        }
        if (table === "oracle_snapshots") {
          return {
            select: vi.fn().mockReturnValue(mockSnapshotsQuery),
            insert: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: {}, error: null }) }) }),
          };
        }
        if (table === "market_resolutions") return { insert: vi.fn().mockReturnValue(mockResolutionInsert) };
        if (table === "market_settlements") return { insert: vi.fn().mockReturnValue(mockSettlementInsert) };
        if (table === "beliefs") {
          return {
            select: vi.fn().mockReturnValue(mockBeliefQuery),
            update: vi.fn().mockReturnValue(mockBeliefUpdate),
          };
        }
        if (table === "creator_profiles") {
          return {
            select: vi.fn().mockReturnValue(mockProfileQuery),
            update: vi.fn().mockReturnValue(mockProfileUpdate),
            upsert: vi.fn().mockReturnValue(mockProfileUpsert),
          };
        }
        if (table === "creator_confirmations") {
          return {
            select: vi.fn().mockReturnValue(mockConfirmationQuery),
          };
        }
        return {} as any;
      }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    vi.spyOn(chainlinkLib, "fetchChainlinkPrice").mockResolvedValue({
      price: 3450,
      roundId: BigInt(200),
      updatedAt: BigInt(1726500000),
    });

    const result = await processPendingResolutions();
    expect(result.success).toBe(true);
    expect(result.processedCount).toBe(1);
    expect(result.results[0].outcome).toBe("AGREE");
    expect(result.results[0].marketId).toBe("m-exp-1");
  });

  it("should apply fail-safe fallback to VOID when oracle fails", async () => {
    const mockExpiredMarket = {
      id: "m-exp-void",
      belief_id: "b-2",
      contract_address: "0xmarket2222222222222222222222222222222222",
      chain_id: ETHEREUM_SEPOLIA_CHAIN_ID,
      agree_pool: 10,
      disagree_pool: 5,
      open_time: "2026-09-01T00:00:00Z",
      close_time: "2026-09-10T00:00:00Z",
      status: "OPEN",
      resolution_type: "PRICE_ABOVE",
      resolution_config: {
        asset: "NON_EXISTENT_ASSET",
        targetPrice: 100,
      },
    };

    const mockSingleMarketQuery: any = {};
    mockSingleMarketQuery.eq = vi.fn().mockReturnValue(mockSingleMarketQuery);
    mockSingleMarketQuery.maybeSingle = vi.fn().mockResolvedValue({
      data: mockExpiredMarket,
      error: null,
    });

    const mockMarketUpdate: any = {};
    mockMarketUpdate.eq = vi.fn().mockReturnValue(mockMarketUpdate);
    mockMarketUpdate.select = vi.fn().mockReturnValue(mockMarketUpdate);
    mockMarketUpdate.single = vi.fn().mockResolvedValue({
      data: { ...mockExpiredMarket, status: "VOID", winner: "VOID" },
      error: null,
    });

    const mockResolutionInsert: any = {};
    mockResolutionInsert.select = vi.fn().mockReturnValue(mockResolutionInsert);
    mockResolutionInsert.single = vi.fn().mockResolvedValue({
      data: { id: "res-void", market_id: "m-exp-void", resolved_outcome: "VOID" },
      error: null,
    });

    const mockSettlementInsert: any = {};
    mockSettlementInsert.select = vi.fn().mockReturnValue(mockSettlementInsert);
    mockSettlementInsert.single = vi.fn().mockResolvedValue({
      data: { id: "set-void", market_id: "m-exp-void" },
      error: null,
    });

    const mockSnapshotsVoidQuery: any = {};
    mockSnapshotsVoidQuery.eq = vi.fn().mockReturnValue(mockSnapshotsVoidQuery);
    mockSnapshotsVoidQuery.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });

    const mockProfileVoidQuery: any = {};
    mockProfileVoidQuery.eq = vi.fn().mockReturnValue(mockProfileVoidQuery);
    mockProfileVoidQuery.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });

    const mockProfileVoidUpdate: any = {};
    mockProfileVoidUpdate.eq = vi.fn().mockResolvedValue({ data: null, error: null });

    const mockConfirmationVoidQuery: any = {};
    mockConfirmationVoidQuery.eq = vi.fn().mockReturnValue(mockConfirmationVoidQuery);
    mockConfirmationVoidQuery.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn((table: string) => {
        if (table === "markets") {
          return {
            select: vi.fn().mockReturnValue(mockSingleMarketQuery),
            update: vi.fn().mockReturnValue(mockMarketUpdate),
          };
        }
        if (table === "oracle_snapshots") {
          return {
            select: vi.fn().mockReturnValue(mockSnapshotsVoidQuery),
            insert: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: {}, error: null }) }) }),
          };
        }
        if (table === "market_resolutions") return { insert: vi.fn().mockReturnValue(mockResolutionInsert) };
        if (table === "market_settlements") return { insert: vi.fn().mockReturnValue(mockSettlementInsert) };
        if (table === "beliefs") {
          return {
            select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
            update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }),
          };
        }
        if (table === "creator_profiles") {
          return {
            select: vi.fn().mockReturnValue(mockProfileVoidQuery),
            update: vi.fn().mockReturnValue(mockProfileVoidUpdate),
            upsert: vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue({ data: null, error: null }) }),
          };
        }
        if (table === "creator_confirmations") {
          return {
            select: vi.fn().mockReturnValue(mockConfirmationVoidQuery),
          };
        }
        return {} as any;
      }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    vi.spyOn(chainlinkLib, "fetchChainlinkPrice").mockRejectedValue(new Error("Oracle timeout"));

    const result = await resolveSingleMarket("m-exp-void");
    expect(result.success).toBe(true);
    expect(result.outcome).toBe("VOID");
  });
});
