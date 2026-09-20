import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MarketCard, MarketData } from "../components/MarketCard";

describe("MarketCard Component", () => {
  const activeMarket: MarketData = {
    id: "mkt-1",
    title: "Will ETH reach $5,000 before Q4 2026?",
    category: "CRYPTO",
    status: "active",
    endTime: "Ends in 2d 18h",
    totalPool: "14.25",
    agreePercentage: 68,
    disagreePercentage: 32,
    volume: "38.50",
  };

  const closingSoonMarket: MarketData = {
    id: "mkt-2",
    title: "Will Arbitrum exceed 10M active daily addresses?",
    category: "L2",
    status: "closing-soon",
    endTime: "Ends in 4h 12m",
    totalPool: "6.80",
    agreePercentage: 45,
    disagreePercentage: 55,
  };

  const resolvedMarket: MarketData = {
    id: "mkt-3",
    title: "Will US Fed cut interest rates in September?",
    category: "MACRO",
    status: "resolved",
    endTime: "Ended",
    totalPool: "22.50",
    agreePercentage: 100,
    disagreePercentage: 0,
    resolvedOutcome: "AGREE",
  };

  it("renders active market card details properly", () => {
    render(<MarketCard market={activeMarket} />);

    expect(screen.getByText("CRYPTO")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Ends in 2d 18h")).toBeInTheDocument();
    expect(
      screen.getByText("Will ETH reach $5,000 before Q4 2026?")
    ).toBeInTheDocument();
    expect(screen.getAllByText("68%").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("32%").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Total Pool: 14.25 ETH")).toBeInTheDocument();
    expect(screen.getByText("Vol: 38.50 ETH")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /bet agree on will eth reach \$5,000 before q4 2026\?/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /bet disagree on will eth reach \$5,000 before q4 2026\?/i,
      })
    ).toBeInTheDocument();
  });

  it("triggers onSelectOutcome with outcome AGREE when Bet Agree is clicked", () => {
    const onSelectOutcome = vi.fn();
    render(
      <MarketCard market={activeMarket} onSelectOutcome={onSelectOutcome} />
    );

    const betAgreeBtn = screen.getByRole("button", {
      name: /bet agree on will eth reach \$5,000 before q4 2026\?/i,
    });
    fireEvent.click(betAgreeBtn);

    expect(onSelectOutcome).toHaveBeenCalledTimes(1);
    expect(onSelectOutcome).toHaveBeenCalledWith(activeMarket, "AGREE");
  });

  it("triggers onSelectOutcome with outcome DISAGREE when Bet Disagree is clicked", () => {
    const onSelectOutcome = vi.fn();
    render(
      <MarketCard market={activeMarket} onSelectOutcome={onSelectOutcome} />
    );

    const betDisagreeBtn = screen.getByRole("button", {
      name: /bet disagree on will eth reach \$5,000 before q4 2026\?/i,
    });
    fireEvent.click(betDisagreeBtn);

    expect(onSelectOutcome).toHaveBeenCalledTimes(1);
    expect(onSelectOutcome).toHaveBeenCalledWith(activeMarket, "DISAGREE");
  });

  it("renders closing-soon badge properly", () => {
    render(<MarketCard market={closingSoonMarket} />);

    expect(screen.getByText("Closing Soon")).toBeInTheDocument();
    expect(screen.getByText("Ends in 4h 12m")).toBeInTheDocument();
    expect(screen.getByText("L2")).toBeInTheDocument();
  });

  it("renders resolved market status and winner without betting action buttons", () => {
    render(<MarketCard market={resolvedMarket} />);

    expect(screen.getByText("Resolved")).toBeInTheDocument();
    expect(
      screen.getByText(/Resolved: Outcome AGREE Won/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /bet agree/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /bet disagree/i })).not.toBeInTheDocument();
  });
});
