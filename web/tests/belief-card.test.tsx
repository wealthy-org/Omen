import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BeliefCard, { BeliefItem } from "@/components/BeliefCard";

const confirmedBelief: BeliefItem = {
  id: "belief-1",
  statement: "ETH will surpass 0.08 BTC ratio following Pectra upgrade.",
  author: "VitalikFan",
  authorHandle: "@vitalikfan",
  isConfirmed: true,
  status: "MARKET_OPEN",
  confidenceScore: 94,
  sourceUrl: "https://x.com/vitalikfan/status/123",
  subject: "ETH",
  comparisonAsset: "BTC",
  direction: "UP",
  targetTime: "2026-12-31",
  marketId: "market-888",
};

const detectedBelief: BeliefItem = {
  id: "belief-2",
  statement: "AI agents will handle 50% of onchain DEX volume by end of 2026.",
  author: "AIWhale",
  authorHandle: "@aiwhale",
  isConfirmed: false,
  status: "DETECTED",
  confidenceScore: 88,
  sourceUrl: "https://warpcast.com/aiwhale/123",
  subject: "DEX Volume",
};

describe("BeliefCard Component", () => {
  it("renders author, statement, and external source link", () => {
    render(<BeliefCard belief={confirmedBelief} />);

    expect(screen.getByText("VitalikFan")).toBeInTheDocument();
    expect(screen.getByText("@vitalikfan")).toBeInTheDocument();
    expect(screen.getByText("ETH will surpass 0.08 BTC ratio following Pectra upgrade.")).toBeInTheDocument();
    
    const sourceLink = screen.getByRole("link", { name: /view source/i });
    expect(sourceLink).toHaveAttribute("href", "https://x.com/vitalikfan/status/123");
  });

  it("renders status badges and confidence score", () => {
    render(<BeliefCard belief={confirmedBelief} />);

    expect(screen.getByText("✓ CONFIRMED")).toBeInTheDocument();
    expect(screen.getByText("94% Confidence")).toBeInTheDocument();
  });

  it("renders AI DETECTED badge when not confirmed", () => {
    render(<BeliefCard belief={detectedBelief} />);

    expect(screen.getByText("AI DETECTED")).toBeInTheDocument();
    expect(screen.getByText("88% Confidence")).toBeInTheDocument();
  });

  it("renders View Market link if marketId exists", () => {
    render(<BeliefCard belief={confirmedBelief} />);

    const link = screen.getByRole("link", { name: /view market/i });
    expect(link).toHaveAttribute("href", "/market/market-888");
  });

  it("renders Create Market CTA when marketId is missing", () => {
    const onCreateMock = vi.fn();
    render(<BeliefCard belief={detectedBelief} onCreateMarket={onCreateMock} />);

    const btn = screen.getByRole("button", { name: /create market/i });
    fireEvent.click(btn);

    expect(onCreateMock).toHaveBeenCalledWith(detectedBelief);
  });
});
