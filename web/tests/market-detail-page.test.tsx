import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MarketDetailPage from "../app/market/[id]/page";
import { MarketDetailPanels } from "../components/MarketDetailPanels";

const mocks = vi.hoisted(() => ({
  writeContractAsyncMock: vi.fn().mockResolvedValue("0xMockTxHash"),
  accountAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
}));

vi.mock("wagmi", () => ({
  useAccount: () => ({
    address: mocks.accountAddress,
    isConnected: true,
  }),
  useChainId: () => 11155111,
  useWriteContract: () => ({
    writeContract: mocks.writeContractAsyncMock,
    writeContractAsync: mocks.writeContractAsyncMock,
    mutate: mocks.writeContractAsyncMock,
    mutateAsync: mocks.writeContractAsyncMock,
    isPending: false,
  }),
  useReadContract: () => ({
    data: [BigInt(1000000000000000000), BigInt(2000000000000000000), 0],
    isLoading: false,
    refetch: vi.fn(),
  }),
  useSignTypedData: () => {
    const mockSign = vi.fn().mockResolvedValue("0xMockSignature");
    return {
      signTypedData: mockSign,
      signTypedDataAsync: mockSign,
      mutate: mockSign,
      mutateAsync: mockSign,
      isPending: false,
    };
  },
}));

describe("Market Detail Page (/market/[id])", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        market: {
          id: "mkt-1",
          statement: "Solana TPS reaches 100k by year end",
          authorHandle: "aeyakovenko",
          creatorAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
          sourceUrl: "https://x.com/aeyakovenko/status/1",
          createdAt: "2026-03-01T00:00:00Z",
          closesAt: "2026-12-31T23:59:59Z",
          isConfirmed: true,
          status: "OPEN",
          agreePoolEth: 50.0,
          disagreePoolEth: 25.0,
          totalVolumeEth: 75.0,
          socialConsensusPct: 82,
          marketAddress: "0xMarketAddress123",
          chainId: 11155111,
          oracleFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
          targetPrice: 100000,
          resolutionType: "PRICE_ABOVE",
        },
      }),
    });
  });

  it("renders market detail page with loaded data", async () => {
    render(<MarketDetailPage params={{ id: "mkt-1" }} />);

    await waitFor(() => {
      expect(screen.getByText(/Solana TPS reaches 100k by year end/i)).toBeInTheDocument();
    });

    expect(screen.getAllByText(/aeyakovenko/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Contract & Verification Details/i)).toBeInTheDocument();
    expect(screen.getByText(/Consensus & Pool Metrics/i)).toBeInTheDocument();
  });

  it("renders resolved market state and handles claim button", async () => {
    const resolvedMarket = {
      id: "mkt-resolved",
      statement: "ETH reaches $4k",
      authorHandle: "vitalik",
      creatorAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      createdAt: "2026-01-01T00:00:00Z",
      closesAt: "2026-02-01T00:00:00Z",
      isConfirmed: true,
      status: "RESOLVED" as const,
      winningSide: "AGREE" as const,
      agreePoolEth: 10.0,
      disagreePoolEth: 5.0,
      totalVolumeEth: 15.0,
      socialConsensusPct: 90,
      marketAddress: "0xResolvedMarketAddress",
      chainId: 11155111,
      oracleFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
      targetPrice: 4000,
      resolutionType: "PRICE_ABOVE",
    };

    render(<MarketDetailPanels market={resolvedMarket} />);

    expect(screen.getByText(/Market Settled/i)).toBeInTheDocument();
    const claimBtn = screen.getByRole("button", { name: /Claim Payout/i });
    expect(claimBtn).toBeInTheDocument();

    fireEvent.click(claimBtn);

    await waitFor(() => {
      expect(screen.getByText(/Payout Claimed/i)).toBeInTheDocument();
    });
  });

  it("renders market not found state when API returns 404", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: "Market not found" }),
    });

    render(<MarketDetailPage params={{ id: "non-existent" }} />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Market Not Found/i })).toBeInTheDocument();
    });

    expect(screen.getByRole("link", { name: /Explore All Markets/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Back to Home/i })).toBeInTheDocument();
  });
});
