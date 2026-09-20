import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCreateMarket } from "../hooks/useCreateMarket";

const mocks = vi.hoisted(() => ({
  writeContractAsyncMock: vi.fn(),
  accountAddress: "0x1234567890123456789012345678901234567890",
}));

vi.mock("wagmi", () => ({
  useConnection: () => ({
    address: mocks.accountAddress,
    isConnected: true,
  }),
  usePublicClient: () => ({
    waitForTransactionReceipt: vi.fn().mockResolvedValue({
      logs: [
        {
          topics: [
            "0x",
            "0x",
            "0x0000000000000000000000001111111111111111111111111111111111111111",
          ],
          data: "0x",
        },
      ],
    }),
  }),
  useWriteContract: () => ({
    writeContract: mocks.writeContractAsyncMock,
    writeContractAsync: mocks.writeContractAsyncMock,
    mutate: mocks.writeContractAsyncMock,
    mutateAsync: mocks.writeContractAsyncMock,
    isPending: false,
  }),
}));

describe("useCreateMarket Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.writeContractAsyncMock.mockResolvedValue(
      "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
    );
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  it("initializes with correct default states", () => {
    const { result } = renderHook(() => useCreateMarket());

    expect(result.current.isPending).toBe(false);
    expect(result.current.isDeploying).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.marketAddress).toBeNull();
    expect(result.current.txHash).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("creates market successfully and returns market address and tx hash", async () => {
    const { result } = renderHook(() => useCreateMarket());

    let response: { marketAddress: string | null; txHash: string } | undefined;
    await act(async () => {
      response = await result.current.createMarket({
        statement: "ETH will exceed $4500 by Q4 2026",
        targetPrice: 4500,
        resolutionType: 0,
        closeTime: 1790000000,
        beliefId: "belief-123",
      });
    });

    expect(response).toBeDefined();
    expect(response?.marketAddress).toMatch(/^0x/);
    expect(response?.txHash).toMatch(/^0x/);
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isDeploying).toBe(false);
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/beliefs/submit",
      expect.objectContaining({
        method: "POST",
      })
    );
  });

  it("resets state when reset is called", async () => {
    const { result } = renderHook(() => useCreateMarket());

    await act(async () => {
      await result.current.createMarket({
        statement: "Test Market",
        targetPrice: 3000,
        resolutionType: 0,
        closeTime: 1790000000,
      });
    });

    expect(result.current.isSuccess).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.isSuccess).toBe(false);
    expect(result.current.marketAddress).toBeNull();
    expect(result.current.txHash).toBeNull();
  });

  it("handles failure and sets error state", async () => {
    mocks.writeContractAsyncMock.mockRejectedValueOnce(new Error("Transaction rejected"));

    const { result } = renderHook(() => useCreateMarket());

    let capturedError: any;
    await act(async () => {
      try {
        await result.current.createMarket({
          statement: "Failing Market",
          targetPrice: 2000,
          resolutionType: 0,
          closeTime: 1790000000,
        });
      } catch (err: any) {
        capturedError = err;
      }
    });

    expect(capturedError?.message).toBe("Transaction rejected");
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isDeploying).toBe(false);
    expect(result.current.error?.message).toBe("Transaction rejected");
  });
});
