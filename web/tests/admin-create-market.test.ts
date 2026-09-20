import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAdminCreateMarket } from "@/hooks/useAdminCreateMarket";
import { OMEN_FACTORY_ADDRESS, PREDICTION_MARKET_ABI } from "@/lib/contracts";

const {
  mockWagmiContext,
  mockWriteContractAsync,
  mockUseConnection,
  mockUseWaitForTransactionReceipt,
  mockWaitForTransactionReceipt,
} = vi.hoisted(() => {
  const React = require("react");
  return {
    mockWagmiContext: React.createContext({}),
    mockWriteContractAsync: vi.fn(),
    mockUseConnection: vi.fn(),
    mockUseWaitForTransactionReceipt: vi.fn(),
    mockWaitForTransactionReceipt: vi.fn(),
  };
});

vi.mock("wagmi", () => ({
  WagmiContext: mockWagmiContext,
  useWriteContract: () => ({
    writeContract: mockWriteContractAsync,
    writeContractAsync: mockWriteContractAsync,
    mutate: mockWriteContractAsync,
    mutateAsync: mockWriteContractAsync,
    data: "0xmockcreatetx123",
    isPending: false,
    error: null,
  }),
  useWaitForTransactionReceipt: () => mockUseWaitForTransactionReceipt(),
  useConnection: () => mockUseConnection(),
  usePublicClient: () => ({
    waitForTransactionReceipt: mockWaitForTransactionReceipt,
  }),
}));

describe("useAdminCreateMarket Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseConnection.mockReturnValue({
      address: "0xAdminWallet1111111111111111111111111111",
      isConnected: true,
    });
    mockUseWaitForTransactionReceipt.mockReturnValue({
      isLoading: false,
      isSuccess: true,
    });
    mockWaitForTransactionReceipt.mockResolvedValue({
      logs: [],
    });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  it("calls writeContractAsync with createMarket params and syncs to /api/markets", async () => {
    mockWriteContractAsync.mockResolvedValueOnce("0xmockcreatetx123");

    const { result } = renderHook(() => useAdminCreateMarket());

    const futureDate = "2026-12-31T23:59:00Z";
    const expectedDeadline = BigInt(Math.floor(new Date(futureDate).getTime() / 1000));

    let output: { hash: string; contractMarketId: string } | undefined;
    await act(async () => {
      output = await result.current.createMarket({
        title: "Will ETH reach $10,000?",
        category: "CRYPTO",
        endTime: futureDate,
        resolutionSourceUrl: "https://coingecko.com",
        resolutionCriteria: "Resolves to YES if CoinGecko spot price hits $10,000.",
        initialLiquidity: "1.00",
      });
    });

    expect(mockWriteContractAsync).toHaveBeenCalledWith({
      address: OMEN_FACTORY_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: "createMarket",
      args: ["Will ETH reach $10,000?", expectedDeadline],
    });
    expect(output?.hash).toBe("0xmockcreatetx123");
    expect(global.fetch).toHaveBeenCalledWith("/api/markets", expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({
        "Content-Type": "application/json",
        "x-admin-wallet": "0xadminwallet1111111111111111111111111111",
      }),
    }));
  });

  it("propagates error when writeContractAsync fails or user rejects transaction", async () => {
    mockWriteContractAsync.mockRejectedValueOnce(new Error("Admin rejected transaction"));

    const { result } = renderHook(() => useAdminCreateMarket());

    await expect(
      act(async () => {
        await result.current.createMarket({
          title: "Failed Market Proposal",
          category: "MACRO",
          endTime: "2026-11-01T00:00:00Z",
          resolutionCriteria: "Some criteria that will fail",
        });
      })
    ).rejects.toThrow("Admin rejected transaction");

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
