import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react";
import { useCreateMarket } from "../../hooks/useCreateMarket";
import { usePosition } from "../../hooks/usePosition";
import { useCreatorConfirm } from "../../hooks/useCreatorConfirm";
import { useClaim } from "../../hooks/useClaim";
import { calculateResolutionResult } from "../../lib/oracle/chainlink";
import { MarketDetailPanels } from "../../components/MarketDetailPanels";
import { CreatorConfirmation } from "../../components/CreatorConfirmation";

const mocks = vi.hoisted(() => ({
  writeContractAsyncMock: vi.fn().mockResolvedValue("0xMockTxHashExecution"),
  signTypedDataAsyncMock: vi.fn().mockResolvedValue("0xMockEIP712CreatorSignature"),
  accountAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  chainId: 11155111,
}));

vi.mock("wagmi", () => ({
  useAccount: () => ({
    address: mocks.accountAddress,
    isConnected: true,
  }),
  useChainId: () => mocks.chainId,
  useWriteContract: () => ({
    writeContract: mocks.writeContractAsyncMock,
    writeContractAsync: mocks.writeContractAsyncMock,
    mutate: mocks.writeContractAsyncMock,
    mutateAsync: mocks.writeContractAsyncMock,
    isPending: false,
  }),
  useReadContract: () => ({
    data: [BigInt(2000000000000000000), BigInt(1000000000000000000), 0],
    isLoading: false,
    refetch: vi.fn(),
  }),
  useSignTypedData: () => ({
    signTypedData: mocks.signTypedDataAsyncMock,
    signTypedDataAsync: mocks.signTypedDataAsyncMock,
    mutate: mocks.signTypedDataAsyncMock,
    mutateAsync: mocks.signTypedDataAsyncMock,
    isPending: false,
  }),
}));

describe("E2E Belief Market Full Cycle (Sepolia & Robinhood)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  it("completes full lifecycle: create -> stake -> sign EIP712 -> resolve -> claim payout", async () => {
    const { result: createHook } = renderHook(() => useCreateMarket());
    let deployedMarketAddress = "";

    await act(async () => {
      const res = await createHook.current.createMarket({
        statement: "Bitcoin breaks $150,000 in 2026",
        targetPrice: 150000,
        resolutionType: 0,
        closeTime: 1799999999,
        beliefId: "belief-e2e-1",
      });
      deployedMarketAddress = res.marketAddress;
    });

    expect(deployedMarketAddress).toMatch(/^0x/);
    expect(createHook.current.isSuccess).toBe(true);

    const { result: posHook } = renderHook(() => usePosition());
    await act(async () => {
      await posHook.current.placePosition({
        marketAddress: deployedMarketAddress,
        marketId: "mkt-e2e-1",
        side: "AGREE",
        amountEth: 1.5,
      });
    });
    expect(posHook.current.isSuccess).toBe(true);

    const { result: confirmHook } = renderHook(() => useCreatorConfirm());
    let signature = "";
    await act(async () => {
      const res = await confirmHook.current.confirmBelief({
        beliefId: "belief-e2e-1",
        statement: "Bitcoin breaks $150,000 in 2026",
        marketAddress: deployedMarketAddress as `0x${string}`,
      });
      signature = res.signature;
    });
    expect(signature).toMatch(/^0x/);
    expect(confirmHook.current.isSuccess).toBe(true);

    const oraclePrice = 162000;
    const targetPrice = 150000;
    const resolutionOutcome = calculateResolutionResult("PRICE_ABOVE", oraclePrice, targetPrice);
    expect(resolutionOutcome.resolvedSide).toBe("AGREE");
    expect(resolutionOutcome.isResolved).toBe(true);

    const resolvedMarketData = {
      id: "mkt-e2e-1",
      statement: "Bitcoin breaks $150,000 in 2026",
      authorHandle: "satoshi",
      creatorAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      createdAt: "2026-01-01T00:00:00Z",
      closesAt: "2026-12-31T23:59:59Z",
      isConfirmed: true,
      status: "RESOLVED" as const,
      winningSide: "AGREE" as const,
      agreePoolEth: 1.5,
      disagreePoolEth: 0.5,
      totalVolumeEth: 2.0,
      socialConsensusPct: 85,
      marketAddress: deployedMarketAddress,
      chainId: 11155111,
      oracleFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
      targetPrice: 150000,
      resolutionType: "PRICE_ABOVE",
    };

    render(<MarketDetailPanels market={resolvedMarketData} />);
    expect(screen.getByText(/Market Settled/i)).toBeInTheDocument();

    const claimButton = screen.getByRole("button", { name: /Claim Payout/i });
    fireEvent.click(claimButton);

    await waitFor(() => {
      expect(screen.getByText(/Payout Claimed/i)).toBeInTheDocument();
    });
  });

  it("handles creator confirmation visual transition in E2E page flow", async () => {
    const onConfirmed = vi.fn();
    render(
      <CreatorConfirmation
        beliefId="belief-e2e-2"
        statement="Ethereum Layer 2 fees under $0.001"
        authorHandle="vitalik"
        creatorAddress="0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
        onConfirmed={onConfirmed}
      />
    );

    const btn = screen.getByRole("button", { name: /Confirm Belief/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByText(/EIP-712 Authenticated/i)).toBeInTheDocument();
    });
    expect(onConfirmed).toHaveBeenCalled();
  });
});
