import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
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
    agreePercentage: 88,
    disagreePercentage: 12,
    endTime: "2026-03-10T12:00:00Z",
    resolutionSourceUrl: "https://l2fees.info",
    resolutionCriteria: "Resolves to AGREE if median L2 transaction gas drops >= 80%.",
    status: "PENDING_RESOLUTION",
  },
  {
    id: "market-102",
    title: "Will SpaceX Starship complete orbital landing test?",
    category: "TECH",
    totalPool: 85000,
    volume: 195000,
    agreePercentage: 45,
    disagreePercentage: 55,
    endTime: "2026-03-12T18:30:00Z",
    resolutionSourceUrl: "https://spacex.com/launches",
    resolutionCriteria: "Resolves to AGREE on official booster landing confirmation.",
    status: "PENDING_RESOLUTION",
  },
  {
    id: "market-103",
    title: "Past Resolved Market",
    category: "CRYPTO",
    totalPool: 50000,
    volume: 100000,
    agreePercentage: 60,
    disagreePercentage: 40,
    endTime: "2026-03-01T00:00:00Z",
    resolutionSourceUrl: "https://ethereum.org",
    status: "RESOLVED",
    resolvedOutcome: "AGREE",
    resolvedAt: "2026-03-02T12:00:00Z",
    resolutionNotes: "Official milestone achieved.",
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

    const agreeButtons = screen.getAllByRole("button", { name: /^resolve agree$/i });
    expect(agreeButtons.length).toBe(2);

    const disagreeButtons = screen.getAllByRole("button", { name: /^resolve disagree$/i });
    expect(disagreeButtons.length).toBe(2);

    const cancelButtons = screen.getAllByRole("button", { name: /cancel and refund market/i });
    expect(cancelButtons.length).toBe(2);
  });

  it("filters markets based on status filter tabs", () => {
    render(<AdminMarketResolutionTable initialMarkets={MOCK_RESOLVABLE_MARKETS} />);

    const resolvedFilterBtn = screen.getByRole("button", { name: /^resolved \(1\)$/i });
    fireEvent.click(resolvedFilterBtn);

    expect(screen.getByText("Past Resolved Market")).toBeInTheDocument();
    expect(screen.queryByText("Will Ethereum Dencun Upgrade reduce L2 gas fees by >80%?")).not.toBeInTheDocument();

    const pendingFilterBtn = screen.getByRole("button", { name: /^pending \(2\)$/i });
    fireEvent.click(pendingFilterBtn);

    expect(screen.getByText("Will Ethereum Dencun Upgrade reduce L2 gas fees by >80%?")).toBeInTheDocument();
    expect(screen.queryByText("Past Resolved Market")).not.toBeInTheDocument();
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

  it("opens double confirmation modal on Resolve AGREE click and requires checkbox check", () => {
    render(<AdminMarketResolutionTable initialMarkets={MOCK_RESOLVABLE_MARKETS} />);

    const agreeButtons = screen.getAllByRole("button", { name: /^resolve agree$/i });
    fireEvent.click(agreeButtons[0]);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /confirm market resolution \(agree\)/i })).toBeInTheDocument();
    expect(screen.getByText(/winning outcome: agree/i)).toBeInTheDocument();

    const executeBtn = screen.getByRole("button", { name: /execute settlement \(agree\)/i });
    fireEvent.click(executeBtn);

    expect(
      screen.getByText(/you must check and confirm the oracle verification before executing/i)
    ).toBeInTheDocument();
  });

  it("executes settlement successfully on Resolve AGREE after verification checkbox is checked", async () => {
    const onResolveMarket = vi.fn().mockResolvedValue(undefined);
    render(
      <AdminMarketResolutionTable
        initialMarkets={MOCK_RESOLVABLE_MARKETS}
        onResolveMarket={onResolveMarket}
      />
    );

    const agreeButtons = screen.getAllByRole("button", { name: /^resolve agree$/i });
    fireEvent.click(agreeButtons[0]);

    const notesInput = screen.getByLabelText(/resolution oracle citation/i);
    fireEvent.change(notesInput, {
      target: { value: "Verified via official L2 gas analytics report" },
    });

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    const executeBtn = screen.getByRole("button", { name: /execute settlement \(agree\)/i });
    fireEvent.click(executeBtn);

    await waitFor(() => {
      expect(onResolveMarket).toHaveBeenCalledTimes(1);
      expect(onResolveMarket).toHaveBeenCalledWith(
        "market-101",
        "AGREE",
        "Verified via official L2 gas analytics report",
        undefined
      );
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText(/successfully resolved as \[agree\]/i)).toBeInTheDocument();
    expect(screen.getAllByText("Resolved: AGREE").length).toBe(2);
  });

  it("handles CANCEL & Refund flow with mandatory reason and 100% refund double checks", async () => {
    const onResolveMarket = vi.fn().mockResolvedValue(undefined);
    render(
      <AdminMarketResolutionTable
        initialMarkets={MOCK_RESOLVABLE_MARKETS}
        onResolveMarket={onResolveMarket}
      />
    );

    const cancelBtn = screen.getByLabelText(/cancel and refund market market-102/i);
    fireEvent.click(cancelBtn);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /market invalidation & full capital refund/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/100% capital refund policy/i)).toBeInTheDocument();

    const executeBtn = screen.getByRole("button", { name: /execute market invalidation & refund/i });
    fireEvent.click(executeBtn);

    expect(
      screen.getByText(/detailed cancellation justification is required/i)
    ).toBeInTheDocument();

    const reasonSelect = screen.getByLabelText(/cancellation reason category/i);
    fireEvent.change(reasonSelect, { target: { value: "EVENT_CANCELLED" } });

    const notesInput = screen.getByLabelText(/detailed invalidation justification/i);
    fireEvent.change(notesInput, {
      target: { value: "Orbital launch window was scrubbed indefinitely by aviation authority." },
    });

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBe(2);
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);

    fireEvent.click(executeBtn);

    await waitFor(() => {
      expect(onResolveMarket).toHaveBeenCalledWith(
        "market-102",
        "CANCEL",
        "Orbital launch window was scrubbed indefinitely by aviation authority.",
        "EVENT_CANCELLED"
      );
    });

    expect(screen.getByText(/cancelled & refunded 100% to bettors!/i)).toBeInTheDocument();
    expect(screen.getByText("Cancelled & Refunded")).toBeInTheDocument();
  });

  it("opens View Details modal for resolved markets", () => {
    render(<AdminMarketResolutionTable initialMarkets={MOCK_RESOLVABLE_MARKETS} />);

    const viewDetailsBtn = screen.getByRole("button", { name: /view details/i });
    fireEvent.click(viewDetailsBtn);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole("heading", { name: /resolution record & details/i })).toBeInTheDocument();
    expect(within(dialog).getByText("Past Resolved Market")).toBeInTheDocument();
    expect(within(dialog).getByText("Official milestone achieved.")).toBeInTheDocument();

    const closeBtn = within(dialog).getByRole("button", { name: /close details/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
