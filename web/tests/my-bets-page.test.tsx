import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import MyBetsPage from "../app/my-bets/page";

describe("MyBetsPage Component", () => {
  it("renders header, 3 portfolio summary cards, and position table", () => {
    render(<MyBetsPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /my predictions & bets/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Total ETH Staked")).toBeInTheDocument();
    expect(screen.getByText("Total Payouts Won")).toBeInTheDocument();
    expect(screen.getByText("Prediction Win Rate")).toBeInTheDocument();

    expect(screen.getByText("1.20 ETH")).toBeInTheDocument();
    expect(screen.getByText("1.16 ETH")).toBeInTheDocument();

    expect(
      screen.getByText("Will ETH reach $5,000 before Q4 2026?")
    ).toBeInTheDocument();
  });

  it("filters bet positions when switching tabs", () => {
    render(<MyBetsPage />);

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

  it("claims payout and displays success notification message", () => {
    render(<MyBetsPage />);

    const claimBtn = screen.getByRole("button", {
      name: /claim payout for will arbitrum exceed 10m active daily addresses\?/i,
    });
    fireEvent.click(claimBtn);

    expect(screen.getByRole("status")).toHaveTextContent(
      'Successfully claimed 0.36 ETH for "Will Arbitrum exceed 10M active daily addresses?"!'
    );

    expect(
      screen.queryByRole("button", {
        name: /claim payout for will arbitrum exceed 10m active daily addresses\?/i,
      })
    ).not.toBeInTheDocument();
  });
});
