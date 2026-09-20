import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ActivityPage from "@/app/activity/page";
import { ETHEREUM_SEPOLIA_CHAIN_ID, ROBINHOOD_TESTNET_CHAIN_ID } from "@/lib/constants";

const MOCK_ACTIVITIES = [
  {
    id: "act-1",
    event_type: "AGREE",
    wallet_address: "0x1111111111111111111111111111111111111111",
    belief_author: "CryptoWhale",
    market_id: "market-101",
    statement: "Will Ethereum exceed $4000 in Q4?",
    amount: 0.5,
    tx_hash: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    market_chain_id: ETHEREUM_SEPOLIA_CHAIN_ID,
    created_at: new Date().toISOString(),
  },
  {
    id: "act-2",
    event_type: "CONFIRM_EIP712",
    wallet_address: "0x2222222222222222222222222222222222222222",
    belief_author: "Vitalik",
    market_id: "market-102",
    statement: "AI agents will handle 50% DEX volume.",
    amount: null,
    tx_hash: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    market_chain_id: ROBINHOOD_TESTNET_CHAIN_ID,
    created_at: new Date().toISOString(),
  },
  {
    id: "act-3",
    event_type: "CLAIM",
    wallet_address: "0x3333333333333333333333333333333333333333",
    belief_author: null,
    market_id: "market-101",
    statement: "Will Ethereum exceed $4000 in Q4?",
    amount: 1.25,
    tx_hash: "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
    market_chain_id: ETHEREUM_SEPOLIA_CHAIN_ID,
    created_at: new Date().toISOString(),
  },
];

describe("ActivityPage (/activity)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          activities: MOCK_ACTIVITIES,
        }),
      } as Response)
    );
  });

  it("renders live activity header and initial activity stream", async () => {
    render(<ActivityPage />);

    expect(screen.getByRole("heading", { level: 1, name: /On-Chain Activity Feed/i })).toBeInTheDocument();
    expect(screen.getByText(/Live Stream/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText(/Will Ethereum exceed \$4000 in Q4\?/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/0\.5 ETH/i)).toBeInTheDocument();
      expect(screen.getByText(/AI agents will handle 50% DEX volume\./i)).toBeInTheDocument();
    });
  });

  it("filters activity items by category tabs", async () => {
    render(<ActivityPage />);

    await waitFor(() => {
      expect(screen.getByText(/CryptoWhale/i)).toBeInTheDocument();
    });

    const confirmsTab = screen.getByRole("button", { name: /Confirmations/i });
    fireEvent.click(confirmsTab);

    expect(screen.getByText(/Vitalik/i)).toBeInTheDocument();
    expect(screen.queryByText(/CryptoWhale/i)).not.toBeInTheDocument();
  });

  it("links to market page and block explorer via receipt modal", async () => {
    render(<ActivityPage />);

    await waitFor(() => {
      expect(screen.getByText(/CryptoWhale/i)).toBeInTheDocument();
    });

    const marketLinks = screen.getAllByRole("link", { name: /view market/i });
    expect(marketLinks[0]).toHaveAttribute("href", "/market/market-101");

    const receiptButtons = screen.getAllByRole("button", { name: /view transaction receipt/i });
    expect(receiptButtons.length).toBeGreaterThan(0);
    fireEvent.click(receiptButtons[0]);

    const explorerLinks = screen.getAllByRole("link", { name: /view on/i });
    expect(explorerLinks[0]).toHaveAttribute("href", expect.stringContaining("0xaaaa"));
  });
});
