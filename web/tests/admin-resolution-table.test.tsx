import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AdminMarketResolutionTable, {
  ResolvableMarketItem,
} from "../components/AdminMarketResolutionTable";

const MOCK_RESOLVABLE_MARKETS: ResolvableMarketItem[] = [
  {
    id: "market-101",
    title: "Will Ethereum Dencun Upgrade reduce L2 gas fees by >80%?",
    category: "CRYPTO",
    totalPool: 125000,
    volume: 340000,
    yesPercentage: 88,
    noPercentage: 12,
    endTime: "2026-03-10T12:00:00Z",
    resolutionSourceUrl: "https://l2fees.info",
    status: "PENDING_RESOLUTION",
  },
  {
    id: "market-102",
    title: "Will SpaceX Starship complete orbital landing test?",
    category: "TECH",
    totalPool: 85000,
    volume: 195000,
    yesPercentage: 45,
    noPercentage: 55,
    endTime: "2026-03-12T18:30:00Z",
    resolutionSourceUrl: "https://spacex.com/launches",
    status: "PENDING_RESOLUTION",
  },
];

describe("AdminMarketResolutionTable Component", () => {
  it("renders pending markets table and action buttons", () => {
    render(<AdminMarketResolutionTable initialMarkets={MOCK_RESOLVABLE_MARKETS} />);

    expect(
      screen.getByRole("heading", { name: /expired markets pending resolution/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Will Ethereum Dencun Upgrade reduce L2 gas fees by >80%?")).toBeInTheDocument();
    expect(screen.getByText("Will SpaceX Starship complete orbital landing test?")).toBeInTheDocument();

    const yesButtons = screen.getAllByRole("button", { name: /^resolve yes$/i });
    expect(yesButtons.length).toBe(2);

    const noButtons = screen.getAllByRole("button", { name: /^resolve no$/i });
    expect(noButtons.length).toBe(2);
  });

  it("filters markets based on search query", () => {
    render(<AdminMarketResolutionTable initialMarkets={MOCK_RESOLVABLE_MARKETS} />);

    const searchInput = screen.getByLabelText(/search pending markets/i);
    fireEvent.change(searchInput, { target: { value: "SpaceX" } });

    expect(screen.getByText("Will SpaceX Starship complete orbital landing test?")).toBeInTheDocument();
    expect(
      screen.queryByText("Will Ethereum Dencun Upgrade reduce L2 gas fees by >80%?")
    ).not.toBeInTheDocument();
  });

  it("opens double confirmation modal on Resolve YES click", () => {
    render(<AdminMarketResolutionTable initialMarkets={MOCK_RESOLVABLE_MARKETS} />);

    const yesButtons = screen.getAllByRole("button", { name: /^resolve yes$/i });
    fireEvent.click(yesButtons[0]);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /confirm market resolution/i })).toBeInTheDocument();
    expect(screen.getByText(/target market/i)).toBeInTheDocument();
    expect(screen.getByText(/execute settlement \(yes\)/i)).toBeInTheDocument();
  });

  it("displays validation notice if confirming without checking oracle verification checkbox", () => {
    render(<AdminMarketResolutionTable initialMarkets={MOCK_RESOLVABLE_MARKETS} />);

    const yesButtons = screen.getAllByRole("button", { name: /^resolve yes$/i });
    fireEvent.click(yesButtons[0]);

    const executeBtn = screen.getByRole("button", { name: /execute settlement \(yes\)/i });
    fireEvent.click(executeBtn);

    expect(
      screen.getByText(/you must check and confirm the oracle verification before executing/i)
    ).toBeInTheDocument();
  });

  it("executes settlement successfully after verification checkbox is checked", async () => {
    const onResolveMarket = vi.fn().mockResolvedValue(undefined);
    render(
      <AdminMarketResolutionTable
        initialMarkets={MOCK_RESOLVABLE_MARKETS}
        onResolveMarket={onResolveMarket}
      />
    );

    const yesButtons = screen.getAllByRole("button", { name: /^resolve yes$/i });
    fireEvent.click(yesButtons[0]);

    const notesInput = screen.getByLabelText(/resolution notes/i);
    fireEvent.change(notesInput, {
      target: { value: "Verified via official L2 gas analytics report" },
    });

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    const executeBtn = screen.getByRole("button", { name: /execute settlement \(yes\)/i });
    fireEvent.click(executeBtn);

    await waitFor(() => {
      expect(onResolveMarket).toHaveBeenCalledTimes(1);
      expect(onResolveMarket).toHaveBeenCalledWith(
        "market-101",
        "YES",
        "Verified via official L2 gas analytics report"
      );
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText(/successfully resolved as \[yes\]/i)).toBeInTheDocument();
    expect(screen.getByText("Resolved: YES")).toBeInTheDocument();
  });

  it("closes modal without resolving when clicking Cancel button", () => {
    const onResolveMarket = vi.fn();
    render(
      <AdminMarketResolutionTable
        initialMarkets={MOCK_RESOLVABLE_MARKETS}
        onResolveMarket={onResolveMarket}
      />
    );

    const noButtons = screen.getAllByRole("button", { name: /^resolve no$/i });
    fireEvent.click(noButtons[0]);

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    const cancelBtn = screen.getByRole("button", { name: /^cancel$/i });
    fireEvent.click(cancelBtn);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(onResolveMarket).not.toHaveBeenCalled();
  });
});
