import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MyBetsPage from "../app/my-bets/page";

const MOCK_FETCHED_BETS = [
  {
    id: "bet-101",
    market_id: "mkt-1",
    wallet_address: "0x1234567890abcdef1234567890abcdef12345678",
    side: "AGREE",
    amount: 0.50,
    payout: 0.75,
    status: "active",
    claimed: false,
    created_at: "2026-09-15T12:00:00Z",
    markets: {
      title: "Will ETH reach $5,000 before Q4 2026?",
      category: "CRYPTO",
      contract_market_id: 1,
    },
  },
  {
    id: "bet-102",
    market_id: "mkt-2",
    wallet_address: "0x1234567890abcdef1234567890abcdef12345678",
    side: "DISAGREE",
    amount: 0.20,
    payout: 0.36,
    status: "won",
    claimed: false,
    created_at: "2026-09-14T12:00:00Z",
    markets: {
      title: "Will Arbitrum exceed 10M active daily addresses?",
      category: "L2",
      contract_market_id: 2,
    },
  },
  {
    id: "bet-103",
    market_id: "mkt-3",
    wallet_address: "0x1234567890abcdef1234567890abcdef12345678",
    side: "AGREE",
    amount: 0.30,
    payout: 0.00,
    status: "lost",
    claimed: false,
    created_at: "2026-09-13T12:00:00Z",
    markets: {
      title: "Will DOGE reach $1.00 this cycle?",
      category: "MEME",
      contract_market_id: 3,
    },
  },
];

describe("MyBetsPage Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders header and loading skeleton before data arrives", () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() => new Promise(() => {}));

    render(<MyBetsPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /my predictions & bets/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Total ETH Staked")).toBeInTheDocument();
    expect(screen.getByText("Total Payouts Won")).toBeInTheDocument();
  });

  it("renders dynamic bets and calculates total portfolio metrics from api", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlString = String(url);
      if (urlString.includes("/api/bets")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            bets: MOCK_FETCHED_BETS,
          }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true }) } as Response);
    });

    render(<MyBetsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Will ETH reach $5,000 before Q4 2026?")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Will Arbitrum exceed 10M active daily addresses?")
      ).toBeInTheDocument();
    });

    expect(screen.getByText("1.00 ETH")).toBeInTheDocument();
    expect(screen.getAllByText("0.36 ETH").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("50.0%").length).toBeGreaterThanOrEqual(1);
  });

  it("filters bet positions when switching tabs", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlString = String(url);
      if (urlString.includes("/api/bets")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            bets: MOCK_FETCHED_BETS,
          }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true }) } as Response);
    });

    render(<MyBetsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Will ETH reach $5,000 before Q4 2026?")
      ).toBeInTheDocument();
    });

    const activeTab = screen.getByRole("button", { name: /^active/i });
    fireEvent.click(activeTab);

    expect(
      screen.getByText("Will ETH reach $5,000 before Q4 2026?")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Will DOGE reach $1.00 this cycle?")
    ).not.toBeInTheDocument();

    const wonTab = screen.getByRole("button", { name: /^won/i });
    fireEvent.click(wonTab);

    expect(
      screen.getByText("Will Arbitrum exceed 10M active daily addresses?")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Will ETH reach $5,000 before Q4 2026?")
    ).not.toBeInTheDocument();
  });

  it("claims payout and displays success notification message", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlString = String(url);
      if (urlString.includes("/api/bets")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            bets: MOCK_FETCHED_BETS,
          }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true }) } as Response);
    });

    render(<MyBetsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Will Arbitrum exceed 10M active daily addresses?")
      ).toBeInTheDocument();
    });

    const claimBtn = screen.getByRole("button", {
      name: /claim payout for will arbitrum exceed 10m active daily addresses\?/i,
    });
    fireEvent.click(claimBtn);

    expect(screen.getByRole("status")).toHaveTextContent(
      'Successfully claimed 0.36 ETH for "Will Arbitrum exceed 10M active daily addresses?"!'
    );
  });

  it("renders empty state when user has 0 bets without showing fallback data", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlString = String(url);
      if (urlString.includes("/api/bets")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            bets: [],
          }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true }) } as Response);
    });

    render(<MyBetsPage />);

    await waitFor(() => {
      expect(screen.getByText("No Bet Positions Yet")).toBeInTheDocument();
    });

    expect(screen.getAllByText("0.00 ETH").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("0.0%").length).toBeGreaterThanOrEqual(1);
  });
});
