import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import PredictionsPage, { MOCK_MARKETS } from "../app/predictions/page";

describe("PredictionsPage Component", () => {
  it("renders page header, statistics, category filter, and market cards", () => {
    render(<PredictionsPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /prediction markets/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Live Arbitrum Sepolia Markets")).toBeInTheDocument();
    expect(screen.getByText("Active Markets")).toBeInTheDocument();
    expect(screen.getAllByText(String(MOCK_MARKETS.length)).length).toBeGreaterThanOrEqual(1);

    expect(screen.getByTestId("predictions-grid")).toBeInTheDocument();
    expect(
      screen.getByText("Will ETH reach $5,000 before Q4 2026?")
    ).toBeInTheDocument();
  });

  it("filters markets when a category pill is selected", () => {
    render(<PredictionsPage />);

    const memeButton = screen.getByRole("button", { name: /meme tokens/i });
    fireEvent.click(memeButton);

    expect(
      screen.getByText("Will DOGE reach $1.00 this cycle?")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Will PEPE flip SHIB in market capitalization?")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Will ETH reach $5,000 before Q4 2026?")
    ).not.toBeInTheDocument();
  });

  it("filters markets in real time when search query is typed", () => {
    render(<PredictionsPage />);

    const searchInput = screen.getByLabelText(/search prediction markets/i);
    fireEvent.change(searchInput, { target: { value: "Bitcoin" } });

    expect(
      screen.getByText("Will Bitcoin hit $120,000 in 2026?")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Will ETH reach $5,000 before Q4 2026?")
    ).not.toBeInTheDocument();
  });

  it("renders empty state and allows resetting filters", () => {
    render(<PredictionsPage />);

    const searchInput = screen.getByLabelText(/search prediction markets/i);
    fireEvent.change(searchInput, { target: { value: "NonExistentAssetXYZ123" } });

    expect(screen.getByTestId("empty-markets")).toBeInTheDocument();
    expect(screen.getByText("No markets found")).toBeInTheDocument();
    expect(screen.queryByTestId("predictions-grid")).not.toBeInTheDocument();

    const resetBtn = screen.getByRole("button", { name: /reset filters/i });
    fireEvent.click(resetBtn);

    expect(screen.getByTestId("predictions-grid")).toBeInTheDocument();
    expect(
      screen.getByText("Will ETH reach $5,000 before Q4 2026?")
    ).toBeInTheDocument();
  });

  it("opens confirmation modal when clicking Bet YES and places bet successfully", async () => {
    render(<PredictionsPage />);

    const betYesBtn = screen.getByRole("button", {
      name: /bet yes on will eth reach \$5,000 before q4 2026\?/i,
    });
    fireEvent.click(betYesBtn);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(
      within(dialog).getByRole("heading", {
        name: "Will ETH reach $5,000 before Q4 2026?",
      })
    ).toBeInTheDocument();

    const confirmBtn = within(dialog).getByRole("button", { name: /confirm bet/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveTextContent(
        'Confirmed bet of 0.05 ETH on YES for "Will ETH reach $5,000 before Q4 2026?"! Position registered.'
      );
    });
  });

  it("opens confirmation modal when clicking Bet NO with NO selected by default", () => {
    render(<PredictionsPage />);

    const betNoBtn = screen.getByRole("button", {
      name: /bet no on will doge reach \$1\.00 this cycle\?/i,
    });
    fireEvent.click(betNoBtn);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(
      within(dialog).getByRole("heading", {
        name: "Will DOGE reach $1.00 this cycle?",
      })
    ).toBeInTheDocument();

    const noSelectBtn = within(dialog).getByRole("button", { name: /select no outcome/i });
    expect(noSelectBtn).toHaveAttribute("aria-pressed", "true");

    const closeBtn = within(dialog).getByRole("button", { name: /close betting modal/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
