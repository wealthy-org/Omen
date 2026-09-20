import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePlaceBet } from "@/hooks/usePlaceBet";
import { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI } from "@/lib/contracts";
import { parseEther } from "viem";

const { mockWagmiContext, mockWriteContractAsync, mockUseConnection, mockUseWaitForTransactionReceipt } = vi.hoisted(() => {
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
    data: "0xmocktxhash123",
    isPending: false,
    error: null,
  }),
  useWaitForTransactionReceipt: () => mockUseWaitForTransactionReceipt(),
  useConnection: () => mockUseConnection(),
}));

describe("usePlaceBet Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseConnection.mockReturnValue({
      address: "0x1111111111111111111111111111111111111111",
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

  it("calls writeContractAsync with correct contract address, ABI, and parsed wei value for AGREE bet", async () => {
    mockWriteContractAsync.mockResolvedValueOnce("0xmocktxhash123");

    const { result } = renderHook(() => usePlaceBet());

    let txHash: string | undefined;
    await act(async () => {
      txHash = await result.current.placeBet({
        marketId: "1",
        outcome: "AGREE",
        amount: "0.5",
      });
    });

    expect(mockWriteContractAsync).toHaveBeenCalledWith({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: "placeBet",
      args: [BigInt(1), true],
      value: parseEther("0.5"),
    });
    expect(txHash).toBe("0xmocktxhash123");
    expect(global.fetch).toHaveBeenCalledWith("/api/bets/index", expect.objectContaining({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contract_market_id: 1,
        wallet_address: "0x1111111111111111111111111111111111111111",
        side: "AGREE",
        amount: 0.5,
        tx_hash: "0xmocktxhash123",
      }),
    }));
  });

  it("calls writeContractAsync with side = false for DISAGREE bet", async () => {
    mockWriteContractAsync.mockResolvedValueOnce("0xmocktxhash456");

    const { result } = renderHook(() => usePlaceBet());

    await act(async () => {
      await result.current.placeBet({
        marketId: 42,
        outcome: "DISAGREE",
        amount: "0.1",
      });
    });

    expect(mockWriteContractAsync).toHaveBeenCalledWith({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: "placeBet",
      args: [BigInt(42), false],
      value: parseEther("0.1"),
    });
  });

  it("propagates error when writeContractAsync fails or user rejects", async () => {
    mockWriteContractAsync.mockRejectedValueOnce(new Error("User rejected transaction"));

    const { result } = renderHook(() => usePlaceBet());

    await expect(
      act(async () => {
        await result.current.placeBet({
          marketId: "1",
          outcome: "AGREE",
          amount: "0.2",
        });
      })
    ).rejects.toThrow("User rejected transaction");

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
