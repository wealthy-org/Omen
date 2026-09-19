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
    yesPercentage: 68,
    noPercentage: 32,
    volume: "38.50",
  };

  const closingSoonMarket: MarketData = {
    id: "mkt-2",
    title: "Will Arbitrum exceed 10M active daily addresses?",
    category: "L2",
    status: "closing-soon",
    endTime: "Ends in 4h 12m",
    totalPool: "6.80",
    yesPercentage: 45,
    noPercentage: 55,
  };

  const resolvedMarket: MarketData = {
    id: "mkt-3",
    title: "Will US Fed cut interest rates in September?",
    category: "MACRO",
    status: "resolved",
    endTime: "Ended",
    totalPool: "22.50",
    yesPercentage: 100,
    noPercentage: 0,
    resolvedOutcome: "YES",
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
        name: /bet yes on will eth reach \$5,000 before q4 2026\?/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /bet no on will eth reach \$5,000 before q4 2026\?/i,
      })
    ).toBeInTheDocument();
  });

  it("triggers onSelectOutcome with outcome YES when Bet YES is clicked", () => {
    const onSelectOutcome = vi.fn();
    render(
      <MarketCard market={activeMarket} onSelectOutcome={onSelectOutcome} />
    );

    const betYesBtn = screen.getByRole("button", {
      name: /bet yes on will eth reach \$5,000 before q4 2026\?/i,
    });
    fireEvent.click(betYesBtn);

    expect(onSelectOutcome).toHaveBeenCalledTimes(1);
    expect(onSelectOutcome).toHaveBeenCalledWith(activeMarket, "YES");
  });

  it("triggers onSelectOutcome with outcome NO when Bet NO is clicked", () => {
    const onSelectOutcome = vi.fn();
    render(
      <MarketCard market={activeMarket} onSelectOutcome={onSelectOutcome} />
    );

    const betNoBtn = screen.getByRole("button", {
      name: /bet no on will eth reach \$5,000 before q4 2026\?/i,
    });
    fireEvent.click(betNoBtn);

    expect(onSelectOutcome).toHaveBeenCalledTimes(1);
    expect(onSelectOutcome).toHaveBeenCalledWith(activeMarket, "NO");
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
      screen.getByText(/Resolved: Outcome YES Won/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /bet yes/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /bet no/i })).not.toBeInTheDocument();
  });
});
