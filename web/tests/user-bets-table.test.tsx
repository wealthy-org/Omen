import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { UserBetsTable, UserBet } from "../components/UserBetsTable";

describe("UserBetsTable Component", () => {
  const mockBets: UserBet[] = [
    {
      id: "bet-1",
      marketId: "mkt-1",
      marketTitle: "Will ETH reach $5,000 before Q4 2026?",
      category: "CRYPTO",
      side: "YES",
      amount: "0.50",
      payout: "0.74",
      roiPercent: 48,
      status: "active",
      createdAt: "2026-09-15",
    },
    {
      id: "bet-2",
      marketId: "mkt-2",
      marketTitle: "Will Arbitrum exceed 10M active daily addresses?",
      category: "L2",
      side: "NO",
      amount: "0.20",
      payout: "0.36",
      roiPercent: 80,
      status: "won",
      isClaimed: false,
      createdAt: "2026-09-14",
    },
    {
      id: "bet-3",
      marketId: "mkt-3",
      marketTitle: "Will DOGE reach $1.00 this cycle?",
      category: "MEME",
      side: "YES",
      amount: "0.10",
      payout: "0.26",
      roiPercent: 160,
      status: "lost",
      createdAt: "2026-09-13",
    },
    {
      id: "bet-4",
      marketId: "mkt-4",
      marketTitle: "Will US Fed cut interest rates in September?",
      category: "MACRO",
      side: "YES",
      amount: "0.40",
      payout: "0.80",
      roiPercent: 100,
      status: "won",
      isClaimed: true,
      createdAt: "2026-09-10",
    },
  ];

  it("renders table header and all user bets rows", () => {
    render(<UserBetsTable bets={mockBets} />);

    expect(screen.getByText("Market Question")).toBeInTheDocument();
    expect(screen.getByText("Side")).toBeInTheDocument();
    expect(screen.getByText("Staked")).toBeInTheDocument();
    expect(screen.getByText("Potential Return")).toBeInTheDocument();

    expect(
      screen.getByText("Will ETH reach $5,000 before Q4 2026?")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Will Arbitrum exceed 10M active daily addresses?")
    ).toBeInTheDocument();
    expect(screen.getByText("0.50 ETH")).toBeInTheDocument();
    expect(screen.getByText("0.20 ETH")).toBeInTheDocument();
  });

  it("renders side badges and status badges correctly", () => {
    render(<UserBetsTable bets={mockBets} />);

    const yesBadges = screen.getAllByText("YES");
    expect(yesBadges.length).toBe(3);

    const noBadge = screen.getByText("NO");
    expect(noBadge).toBeInTheDocument();

    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getAllByText(/won 🏆/i).length).toBe(2);
    expect(screen.getByText("Lost")).toBeInTheDocument();
  });

  it("renders Claim Payout button and calls onClaimPayout callback when clicked", () => {
    const onClaimPayout = vi.fn();
    render(<UserBetsTable bets={mockBets} onClaimPayout={onClaimPayout} />);

    const claimBtn = screen.getByRole("button", {
      name: /claim payout for will arbitrum exceed 10m active daily addresses\?/i,
    });
    expect(claimBtn).toBeInTheDocument();

    fireEvent.click(claimBtn);
    expect(onClaimPayout).toHaveBeenCalledTimes(1);
    expect(onClaimPayout).toHaveBeenCalledWith(mockBets[1]);
  });

  it("renders Claimed state when payout has already been claimed", () => {
    render(<UserBetsTable bets={mockBets} />);

    expect(screen.getByText("Claimed")).toBeInTheDocument();
  });

  it("renders empty state when bets list is empty", () => {
    render(<UserBetsTable bets={[]} />);

    expect(screen.getByTestId("empty-user-bets")).toBeInTheDocument();
    expect(screen.getByText("No Bet Positions Yet")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /explore prediction markets/i })
    ).toHaveAttribute("href", "/predictions");
  });
});
