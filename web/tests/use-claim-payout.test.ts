import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useClaimPayout } from "@/hooks/useClaimPayout";
import { OMEN_MARKET_ABI } from "@/lib/contracts";

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
    data: "0xmockclaimtx789",
    isPending: false,
    error: null,
  }),
  useWaitForTransactionReceipt: () => mockUseWaitForTransactionReceipt(),
  useConnection: () => mockUseConnection(),
}));

describe("useClaimPayout Hook", () => {
  const marketAddress = "0x3333333333333333333333333333333333333333";

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseConnection.mockReturnValue({
      address: "0x2222222222222222222222222222222222222222",
      isConnected: true,
    });
    mockUseWaitForTransactionReceipt.mockReturnValue({
      isLoading: false,
      isSuccess: true,
    });
  });

  it("calls writeContractAsync with correct contract address, ABI, and claimPayout function name", async () => {
    mockWriteContractAsync.mockResolvedValueOnce("0xmockclaimtx789");

    const { result } = renderHook(() => useClaimPayout());

    let txHash: string | undefined;
    await act(async () => {
      txHash = await result.current.claimPayout(marketAddress);
    });

    expect(mockWriteContractAsync).toHaveBeenCalledWith({
      address: marketAddress,
      abi: OMEN_MARKET_ABI,
      functionName: "claimPayout",
    });
    expect(txHash).toBe("0xmockclaimtx789");
  });

  it("propagates error when claim transaction fails or user rejects", async () => {
    mockWriteContractAsync.mockRejectedValueOnce(new Error("User rejected claim transaction"));

    const { result } = renderHook(() => useClaimPayout());

    await expect(
      act(async () => {
        await result.current.claimPayout(marketAddress);
      })
    ).rejects.toThrow("User rejected claim transaction");
  });
});
