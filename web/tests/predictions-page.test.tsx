import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PredictionsPage from "../app/predictions/page";

const MOCK_LIVE_MARKETS = [
  {
    id: "mkt-1",
    contract_market_id: 1,
    title: "Will ETH reach $5,000 before Q4 2026?",
    category: "crypto",
    status: "active",
    deadline: "2026-10-01T00:00:00Z",
    yes_pool: 28.5,
    no_pool: 15.5,
  },
  {
    id: "mkt-2",
    contract_market_id: 2,
    title: "Will DOGE reach $1.00 this cycle?",
    category: "meme",
    status: "active",
    deadline: "2026-10-15T00:00:00Z",
    yes_pool: 12.0,
    no_pool: 20.0,
  },
  {
    id: "mkt-3",
    contract_market_id: 3,
    title: "Will Bitcoin hit $120,000 in 2026?",
    category: "crypto",
    status: "active",
    deadline: "2026-12-31T00:00:00Z",
    yes_pool: 45.0,
    no_pool: 15.0,
  },
];

describe("PredictionsPage Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders page header and loading skeleton before data arrives", () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() => new Promise(() => {}));

    render(<PredictionsPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /prediction markets/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Live Arbitrum Sepolia Markets")).toBeInTheDocument();
  });

  it("renders dynamic market cards after fetching from api", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlString = String(url);
      if (urlString.includes("/api/markets")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            markets: MOCK_LIVE_MARKETS,
          }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true }) } as Response);
    });

    render(<PredictionsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Will ETH reach $5,000 before Q4 2026?")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Will DOGE reach $1.00 this cycle?")
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId("predictions-grid")).toBeInTheDocument();
  });

  it("filters markets when a category pill is selected", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlString = String(url);
      if (urlString.includes("/api/markets")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            markets: MOCK_LIVE_MARKETS,
          }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true }) } as Response);
    });

    render(<PredictionsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Will ETH reach $5,000 before Q4 2026?")
      ).toBeInTheDocument();
    });

    const memeButton = screen.getByRole("button", { name: /meme tokens/i });
    fireEvent.click(memeButton);

    expect(
      screen.getByText("Will DOGE reach $1.00 this cycle?")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Will ETH reach $5,000 before Q4 2026?")
    ).not.toBeInTheDocument();
  });

  it("filters markets in real time when search query is typed", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlString = String(url);
      if (urlString.includes("/api/markets")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            markets: MOCK_LIVE_MARKETS,
          }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true }) } as Response);
    });

    render(<PredictionsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Will ETH reach $5,000 before Q4 2026?")
      ).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText(/search prediction markets/i);
    fireEvent.change(searchInput, { target: { value: "Bitcoin" } });

    expect(
      screen.getByText("Will Bitcoin hit $120,000 in 2026?")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Will ETH reach $5,000 before Q4 2026?")
    ).not.toBeInTheDocument();
  });

  it("renders empty state and allows resetting filters", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlString = String(url);
      if (urlString.includes("/api/markets")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            markets: MOCK_LIVE_MARKETS,
          }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true }) } as Response);
    });

    render(<PredictionsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Will ETH reach $5,000 before Q4 2026?")
      ).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText(/search prediction markets/i);
    fireEvent.change(searchInput, { target: { value: "NonExistentAssetXYZ123" } });

    expect(screen.getByTestId("empty-markets")).toBeInTheDocument();
    expect(screen.getByText("No markets found")).toBeInTheDocument();

    const resetBtn = screen.getByRole("button", { name: /reset filters/i });
    fireEvent.click(resetBtn);

    expect(screen.getByTestId("predictions-grid")).toBeInTheDocument();
    expect(
      screen.getByText("Will ETH reach $5,000 before Q4 2026?")
    ).toBeInTheDocument();
  });

  it("opens confirmation modal when clicking Bet YES and places bet successfully", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlString = String(url);
      if (urlString.includes("/api/markets")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            markets: MOCK_LIVE_MARKETS,
          }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true }) } as Response);
    });

    render(<PredictionsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Will ETH reach $5,000 before Q4 2026?")
      ).toBeInTheDocument();
    });

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
});
