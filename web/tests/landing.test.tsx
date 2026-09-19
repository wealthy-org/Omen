import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import HomePage from "@/app/page";

const MOCK_LANDING_MARKETS = [
  {
    id: "market-1",
    statement: "SOL will outperform ETH this month",
    author: "TraderX",
    authorHandle: "@TraderX",
    isConfirmed: true,
    status: "OPEN",
    agreePool: 87.5,
    disagreePool: 34.0,
    agreeParticipants: 2046,
    disagreeParticipants: 796,
    closeTime: new Date(Date.now() + 86400000 * 12).toISOString(),
    category: "ETH",
  },
  {
    id: "market-2",
    statement: "BTC prints a new all-time high in Q4",
    author: "OnchainWitch",
    authorHandle: "@onchainwitch",
    isConfirmed: false,
    status: "DETECTED",
    agreePool: 63.0,
    disagreePool: 37.0,
    agreeParticipants: 610,
    disagreeParticipants: 350,
    closeTime: new Date(Date.now() + 86400000 * 68).toISOString(),
    category: "BTC",
  },
];

describe("Landing Page V1 Components", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlString = String(url);
      if (urlString.includes("/api/stats/overview")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            stats: {
              total_volume_eth: "320.50",
              active_markets: 18,
              total_beliefs: 142,
              verified_creators: 38,
            },
          }),
        } as Response);
      }
      if (urlString.includes("/api/markets")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            markets: MOCK_LANDING_MARKETS,
          }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true }) } as Response);
    });
  });

  it("renders the hero headline, dual-testnet badge, and 2-column layout", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /turn opinions into markets\./i,
      })
    ).toBeInTheDocument();

    expect(screen.getAllByText(/Dual-Testnet Active/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/SOL will outperform ETH this month/i).length).toBeGreaterThan(0);
  });

  it("renders CTA buttons linking to single-page anchor sections", () => {
    render(<HomePage />);

    const exploreButton = screen.getAllByRole("link", { name: /explore markets/i })[0];
    expect(exploreButton).toHaveAttribute("href", "#markets");

    const resolutionButton = screen.getAllByRole("link", { name: /how resolution works/i })[0];
    expect(resolutionButton).toHaveAttribute("href", "#how-it-works");
  });

  it("renders the infinite marquee tech stack items", () => {
    render(<HomePage />);

    expect(screen.getByText(/Protocol Infrastructure & Ecosystem Stack/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Ethereum Sepolia/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Robinhood Chain/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Chainlink/i).length).toBeGreaterThan(0);
  });

  it("renders the redesigned platform metrics cards in StatsOverview", async () => {
    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText(/320\.50 ETH/)).toBeInTheDocument();
      expect(screen.getByText("18")).toBeInTheDocument();
      expect(screen.getByText("142")).toBeInTheDocument();
      expect(screen.getByText("38")).toBeInTheDocument();
    });
  });

  it("renders trending belief markets and category tab filters", async () => {
    render(<HomePage />);

    expect(screen.getByText(/Trending Belief Markets/i)).toBeInTheDocument();
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("ETH")).toBeInTheDocument();
    expect(screen.getByText("BTC")).toBeInTheDocument();
    expect(screen.getByText("ARB")).toBeInTheDocument();
    expect(screen.getByText("Macro")).toBeInTheDocument();
  });

  it("renders the 5-stage protocol lifecycle flow", () => {
    render(<HomePage />);

    expect(screen.getByText(/From a Take to a Track Record/i)).toBeInTheDocument();
    expect(screen.getByText("A belief appears")).toBeInTheDocument();
    expect(screen.getByText("The market opens")).toBeInTheDocument();
    expect(screen.getByText("The author confirms")).toBeInTheDocument();
    expect(screen.getByText("Oracle resolves")).toBeInTheDocument();
    expect(screen.getByText("Record remembered")).toBeInTheDocument();
  });

  it("renders creator reputation highlight and live activity stream", () => {
    render(<HomePage />);

    expect(screen.getByText(/Conviction Becomes a Record/i)).toBeInTheDocument();
    expect(screen.getAllByText("@TraderX").length).toBeGreaterThan(0);
    expect(screen.getByText(/Live On-Chain Activity/i)).toBeInTheDocument();
  });

  it("renders the dual-track consensus signal gap visualizer", () => {
    render(<HomePage />);

    expect(screen.getByText(/The Signal Gap: Words vs\. Capital/i)).toBeInTheDocument();
    expect(screen.getByText(/Dual-Track Consensus Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/Track 1: Social Sentiments/i)).toBeInTheDocument();
    expect(screen.getByText(/Track 2: Staked Capital Pool/i)).toBeInTheDocument();
  });

  it("renders the interactive FAQ accordion section", () => {
    render(<HomePage />);

    expect(screen.getByText(/Frequently Asked Questions/i)).toBeInTheDocument();
    expect(screen.getByText(/What is an Omen Social Belief Market\?/i)).toBeInTheDocument();
  });
});
