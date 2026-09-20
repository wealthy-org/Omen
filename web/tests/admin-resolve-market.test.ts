import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAdminResolveMarket } from "@/hooks/useAdminResolveMarket";
import { OMEN_MARKET_ABI } from "@/lib/contracts";

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
  const marketAddress = "0x1111111111111111111111111111111111111111";

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

  it("calls resolveMarket with outcome = 1 for AGREE outcome and syncs to backend", async () => {
    mockWriteContractAsync.mockResolvedValueOnce("0xmockresolvetx123");

    const { result } = renderHook(() => useAdminResolveMarket());

    let txHash: string | undefined;
    await act(async () => {
      txHash = await result.current.resolveMarket({
        marketId: "market-101",
        contractAddress: marketAddress,
        outcome: "AGREE",
        notes: "Official verification passed",
      });
    });

    expect(mockWriteContractAsync).toHaveBeenCalledWith({
      address: marketAddress,
      abi: OMEN_MARKET_ABI,
      functionName: "resolveMarket",
      args: [1],
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

  it("calls resolveMarket with outcome = 2 for DISAGREE outcome", async () => {
    mockWriteContractAsync.mockResolvedValueOnce("0xmockresolvetx456");

    const { result } = renderHook(() => useAdminResolveMarket());

    await act(async () => {
      await result.current.resolveMarket({
        marketId: "42",
        contractAddress: marketAddress,
        outcome: "DISAGREE",
      });
    });

    expect(mockWriteContractAsync).toHaveBeenCalledWith({
      address: marketAddress,
      abi: OMEN_MARKET_ABI,
      functionName: "resolveMarket",
      args: [2],
    });
  });

  it("calls voidMarket for CANCEL outcome", async () => {
    mockWriteContractAsync.mockResolvedValueOnce("0xmockcanceltx789");

    const { result } = renderHook(() => useAdminResolveMarket());

    await act(async () => {
      await result.current.resolveMarket({
        marketId: "15",
        contractAddress: marketAddress,
        outcome: "CANCEL",
        cancellationReason: "EVENT_CANCELLED",
      });
    });

    expect(mockWriteContractAsync).toHaveBeenCalledWith({
      address: marketAddress,
      abi: OMEN_MARKET_ABI,
      functionName: "voidMarket",
    });
  });

  it("propagates error when resolution transaction fails or user rejects", async () => {
    mockWriteContractAsync.mockRejectedValueOnce(new Error("Admin rejected resolution"));

    const { result } = renderHook(() => useAdminResolveMarket());

    await expect(
      act(async () => {
        await result.current.resolveMarket({
          marketId: "1",
          contractAddress: marketAddress,
          outcome: "AGREE",
        });
      })
    ).rejects.toThrow("Admin rejected resolution");

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
