import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useClaimPayout } from "@/hooks/useClaimPayout";
import { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI } from "@/lib/contracts";

const { mockWagmiContext, mockWriteContractAsync, mockUseAccount, mockUseWaitForTransactionReceipt } = vi.hoisted(() => {
  const React = require("react");
  return {
    mockWagmiContext: React.createContext({}),
    mockWriteContractAsync: vi.fn(),
    mockUseAccount: vi.fn(),
    mockUseWaitForTransactionReceipt: vi.fn(),
  };
});

vi.mock("wagmi", () => ({
  WagmiContext: mockWagmiContext,
  useWriteContract: () => ({
    writeContractAsync: mockWriteContractAsync,
    data: "0xmockclaimtx789",
    isPending: false,
    error: null,
  }),
  useWaitForTransactionReceipt: () => mockUseWaitForTransactionReceipt(),
  useAccount: () => mockUseAccount(),
}));

describe("useClaimPayout Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAccount.mockReturnValue({
      address: "0x2222222222222222222222222222222222222222",
      isConnected: true,
    });
    mockUseWaitForTransactionReceipt.mockReturnValue({
      isLoading: false,
      isSuccess: true,
    });
  });

  it("calls writeContractAsync with correct contract address, ABI, function name, and BigInt marketId", async () => {
    mockWriteContractAsync.mockResolvedValueOnce("0xmockclaimtx789");

    const { result } = renderHook(() => useClaimPayout());

    let txHash: string | undefined;
    await act(async () => {
      txHash = await result.current.claimPayout("7");
    });

    expect(mockWriteContractAsync).toHaveBeenCalledWith({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: "claim",
      args: [BigInt(7)],
    });
    expect(txHash).toBe("0xmockclaimtx789");
  });

  it("calls writeContractAsync when marketId is provided as a number", async () => {
    mockWriteContractAsync.mockResolvedValueOnce("0xmockclaimtx999");

    const { result } = renderHook(() => useClaimPayout());

    let txHash: string | undefined;
    await act(async () => {
      txHash = await result.current.claimPayout(12);
    });

    expect(mockWriteContractAsync).toHaveBeenCalledWith({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: "claim",
      args: [BigInt(12)],
    });
    expect(txHash).toBe("0xmockclaimtx999");
  });

  it("propagates error when claim transaction fails or user rejects", async () => {
    mockWriteContractAsync.mockRejectedValueOnce(new Error("User rejected claim transaction"));

    const { result } = renderHook(() => useClaimPayout());

    await expect(
      act(async () => {
        await result.current.claimPayout("1");
      })
    ).rejects.toThrow("User rejected claim transaction");
  });
});
