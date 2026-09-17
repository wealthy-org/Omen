import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BeliefMarketCard, { BeliefMarket } from "@/components/BeliefMarketCard";

const mockMarket: BeliefMarket = {
  id: "market-123",
  statement: "Will SOL outperform ETH in the next 30 days?",
  author: "CryptoWhale",
  authorHandle: "@cryptowhale",
  isConfirmed: true,
  status: "OPEN",
  agreePool: 60,
  disagreePool: 40,
  agreeParticipants: 64,
  disagreeParticipants: 36,
  closeTime: new Date(Date.now() + 86400000 * 3).toISOString(),
  category: "Crypto",
};

const unconfirmedMarket: BeliefMarket = {
  id: "market-456",
  statement: "Will BTC reach $100k before December 2026?",
  author: "SatoshiFan",
  authorHandle: "@satoshifan",
  isConfirmed: false,
  status: "DETECTED",
  agreePool: 10,
  disagreePool: 90,
  agreeParticipants: 20,
  disagreeParticipants: 80,
  closeTime: new Date(Date.now() + 86400000).toISOString(),
  category: "Macro",
};

describe("BeliefMarketCard Component", () => {
  it("renders 5 core dimensions: WHO, WHAT, WHEN, CONSENSUS, MONEY", () => {
    render(<BeliefMarketCard market={mockMarket} />);

    expect(screen.getByText("CryptoWhale")).toBeInTheDocument();
    expect(screen.getByText("@cryptowhale")).toBeInTheDocument();
    expect(screen.getByText("✓ CONFIRMED")).toBeInTheDocument();
    expect(screen.getByText("Will SOL outperform ETH in the next 30 days?")).toBeInTheDocument();
    expect(screen.getByText(/64% AGREE/i)).toBeInTheDocument();
    expect(screen.getByText(/36% DISAGREE/i)).toBeInTheDocument();
    expect(screen.getByText(/60% AGREE/i)).toBeInTheDocument();
    expect(screen.getByText(/40% DISAGREE/i)).toBeInTheDocument();
    expect(screen.getByText(/100(\.00)? ETH/i)).toBeInTheDocument();
  });

  it("renders AI DETECTED badge when belief is not officially confirmed", () => {
    render(<BeliefMarketCard market={unconfirmedMarket} />);

    expect(screen.getByText("AI DETECTED")).toBeInTheDocument();
    expect(screen.queryByText("✓ CONFIRMED")).not.toBeInTheDocument();
  });

  it("links to market detail page /market/[id]", () => {
    render(<BeliefMarketCard market={mockMarket} />);

    const linkElements = screen.getAllByRole("link");
    const targetLink = linkElements.find(
      (el) => el.getAttribute("href") === "/market/market-123"
    );
    expect(targetLink).toBeDefined();
  });

  it("calls onSelect callback when card is clicked if provided", () => {
    const onSelectMock = vi.fn();
    render(<BeliefMarketCard market={mockMarket} onSelect={onSelectMock} />);

    const viewButton = screen.getByRole("button", { name: /view market/i });
    fireEvent.click(viewButton);

    expect(onSelectMock).toHaveBeenCalledWith(mockMarket);
  });
});
