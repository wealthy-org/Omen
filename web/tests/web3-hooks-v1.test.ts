import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePosition } from "@/hooks/usePosition";
import { useClaim } from "@/hooks/useClaim";
import { useMarket } from "@/hooks/useMarket";

const {
  mockWagmiContext,
  mockWriteContractAsync,
  mockUseAccount,
  mockUseReadContract,
} = vi.hoisted(() => {
  const React = require("react");
  return {
    mockWagmiContext: React.createContext({}),
    mockWriteContractAsync: vi.fn(),
    mockUseAccount: vi.fn(),
    mockUseReadContract: vi.fn(),
  };
});

vi.mock("wagmi", () => ({
  WagmiContext: mockWagmiContext,
  useWriteContract: () => ({
    writeContract: mockWriteContractAsync,
    writeContractAsync: mockWriteContractAsync,
    mutate: mockWriteContractAsync,
    mutateAsync: mockWriteContractAsync,
    data: "0xmockhash123",
    isPending: false,
    error: null,
  }),
  useAccount: () => mockUseAccount(),
  useReadContract: (args: any) => mockUseReadContract(args),
}));

describe("Web3 Hooks V1 (usePosition, useClaim, useMarket)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockUseAccount.mockReturnValue({
      address: "0x1111111111111111111111111111111111111111",
      isConnected: true,
    });
    mockUseReadContract.mockReturnValue({
      data: [BigInt("100000000000000000000"), BigInt("50000000000000000000"), 0],
      refetch: vi.fn(),
    });
    mockWriteContractAsync.mockResolvedValue("0xmockhash123");

    vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ success: true }),
      } as Response)
    );
  });

  describe("usePosition", () => {
    it("executes position placement and calls off-chain sync", async () => {
      const { result } = renderHook(() => usePosition());

      await act(async () => {
        await result.current.placePosition({
          marketAddress: "0x1111111111111111111111111111111111111111",
          marketId: "market-101",
          side: "AGREE",
          amount: "0.25",
        });
      });

      expect(result.current.isSuccess).toBe(true);
      expect(result.current.isPending).toBe(false);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/markets/market-101/position"),
        expect.objectContaining({ method: "POST" })
      );
    });

    it("handles zero or invalid amount gracefully", async () => {
      const { result } = renderHook(() => usePosition());

      await expect(
        act(async () => {
          await result.current.placePosition({
            marketAddress: "0x1111111111111111111111111111111111111111",
            marketId: "market-101",
            side: "AGREE",
            amount: "0",
          });
        })
      ).rejects.toThrow(/Amount must be greater than 0/i);
    });
  });

  describe("useClaim", () => {
    it("executes payout claim successfully", async () => {
      const { result } = renderHook(() => useClaim());

      await act(async () => {
        await result.current.claimPayout({
          marketAddress: "0x1111111111111111111111111111111111111111",
          marketId: "market-101",
        });
      });

      expect(result.current.isSuccess).toBe(true);
      expect(result.current.isPending).toBe(false);
    });
  });

  describe("useMarket", () => {
    it("fetches market details and pool data", async () => {
      const { result } = renderHook(() =>
        useMarket("0x1111111111111111111111111111111111111111")
      );

      expect(result.current).toBeDefined();
      expect(result.current.agreePool).toBe(100);
      expect(result.current.disagreePool).toBe(50);
      expect(result.current.status).toBe("OPEN");
    });
  });
});
