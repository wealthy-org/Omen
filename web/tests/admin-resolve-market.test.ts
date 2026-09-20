import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAdminResolveMarket } from "@/hooks/useAdminResolveMarket";
import { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI } from "@/lib/contracts";

const {
  mockWagmiContext,
  mockWriteContractAsync,
  mockUseConnection,
  mockUseWaitForTransactionReceipt,
} = vi.hoisted(() => {
  const React = require("react");
  return {
    mockWagmiContext: React.createContext({}),
    mockWriteContractAsync: vi.fn(),
    mockUseConnection: vi.fn(),
    mockUseWaitForTransactionReceipt: vi.fn(),
  };
});

vi.mock("wagmi", () => ({
  WagmiContext: mockWagmiContext,
  useWriteContract: () => ({
    writeContract: mockWriteContractAsync,
    writeContractAsync: mockWriteContractAsync,
    mutate: mockWriteContractAsync,
    mutateAsync: mockWriteContractAsync,
    data: "0xmockresolvetx123",
    isPending: false,
    error: null,
  }),
  useWaitForTransactionReceipt: () => mockUseWaitForTransactionReceipt(),
  useConnection: () => mockUseConnection(),
}));

describe("useAdminResolveMarket Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseConnection.mockReturnValue({
      address: "0xAdminAddress111111111111111111111111111",
      isConnected: true,
    });
    mockUseWaitForTransactionReceipt.mockReturnValue({
      isLoading: false,
      isSuccess: true,
    });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  it("calls resolveMarket with result = true for AGREE outcome and syncs to backend", async () => {
    mockWriteContractAsync.mockResolvedValueOnce("0xmockresolvetx123");

    const { result } = renderHook(() => useAdminResolveMarket());

    let txHash: string | undefined;
    await act(async () => {
      txHash = await result.current.resolveMarket({
        marketId: "market-101",
        outcome: "AGREE",
        notes: "Official verification passed",
      });
    });

    expect(mockWriteContractAsync).toHaveBeenCalledWith({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: "resolveMarket",
      args: [BigInt(101), true],
    });
    expect(txHash).toBe("0xmockresolvetx123");
    expect(global.fetch).toHaveBeenCalledWith("/api/markets/market-101/resolve", expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({
        "Content-Type": "application/json",
        "x-admin-wallet": "0xadminaddress111111111111111111111111111",
      }),
    }));
  });

  it("calls resolveMarket with result = false for DISAGREE outcome", async () => {
    mockWriteContractAsync.mockResolvedValueOnce("0xmockresolvetx456");

    const { result } = renderHook(() => useAdminResolveMarket());

    await act(async () => {
      await result.current.resolveMarket({
        marketId: 42,
        outcome: "DISAGREE",
      });
    });

    expect(mockWriteContractAsync).toHaveBeenCalledWith({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: "resolveMarket",
      args: [BigInt(42), false],
    });
  });

  it("calls cancelMarket for CANCEL outcome", async () => {
    mockWriteContractAsync.mockResolvedValueOnce("0xmockcanceltx789");

    const { result } = renderHook(() => useAdminResolveMarket());

    await act(async () => {
      await result.current.resolveMarket({
        marketId: "15",
        outcome: "CANCEL",
        cancellationReason: "EVENT_CANCELLED",
      });
    });

    expect(mockWriteContractAsync).toHaveBeenCalledWith({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: "cancelMarket",
      args: [BigInt(15)],
    });
  });

  it("propagates error when resolution transaction fails or user rejects", async () => {
    mockWriteContractAsync.mockRejectedValueOnce(new Error("Admin rejected resolution"));

    const { result } = renderHook(() => useAdminResolveMarket());

    await expect(
      act(async () => {
        await result.current.resolveMarket({
          marketId: "1",
          outcome: "AGREE",
        });
      })
    ).rejects.toThrow("Admin rejected resolution");

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
