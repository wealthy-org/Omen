import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import HomePage from "@/app/page";
import HeroSection from "@/components/landing/HeroSection";

const MOCK_LANDING_MARKETS = [
  {
    id: "eth-4500",
    contract_market_id: 1,
    title: "Will Ethereum trade above $4,500 before the end of Q4 2026?",
    category: "crypto",
    status: "active",
    yes_pool: 32.78,
    no_pool: 15.42,
    deadline: "2026-12-31T00:00:00Z",
  },
  {
    id: "arb-dau",
    contract_market_id: 2,
    title: "Will Arbitrum Daily Active Users exceed 1.5 Million in October?",
    category: "l2",
    status: "active",
    yes_pool: 19.17,
    no_pool: 16.33,
    deadline: "2026-10-31T00:00:00Z",
  },
];

const MOCK_LANDING_QUESTS = [
  {
    id: "q-1",
    title: "Connect Web3 Wallet",
    category: "onboarding",
    points_reward: 100,
    is_completed: false,
  },
  {
    id: "q-2",
    title: "Place First Binary Bet (≥ 0.01 ETH)",
    category: "on-chain",
    points_reward: 250,
    is_completed: false,
  },
];

describe("Landing Page Components", () => {
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
              total_tvl_eth: "148.50",
              active_markets: 24,
              total_points: 1420000,
              active_wallets: 4120,
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
      if (urlString.includes("/api/quests")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            quests: MOCK_LANDING_QUESTS,
            userProfile: { streak_count: 3 },
          }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true }) } as Response);
    });
  });

  it("renders the default dark emerald hero section headline and kicker badge", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /predict onchain\. farm points\. dominate the airdrop\./i,
      })
    ).toBeInTheDocument();

    const networkTags = screen.getAllByText(/Arbitrum Sepolia/i);
    expect(networkTags.length).toBeGreaterThan(0);
  });

  it("renders the light emerald hero section with the same centered stack layout and 3D ribbon asset", () => {
    render(<HeroSection theme="light" />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /predict onchain\. farm points\. dominate the airdrop\./i,
      })
    ).toBeInTheDocument();

    expect(screen.getByAltText(/Omen Web3 3D Dark Emerald Abstract/i)).toBeInTheDocument();
  });

  it("renders primary and secondary CTA buttons in the hero section", () => {
    render(<HomePage />);

    const exploreButton = screen.getAllByRole("link", { name: /explore live markets/i })[0];
    expect(exploreButton).toHaveAttribute("href", "/predictions");

    const questButton = screen.getAllByRole("link", { name: /start quest farming/i })[0];
    expect(questButton).toHaveAttribute("href", "/quests");
  });

  it("renders the 4 metrics overview cards in StatsOverview", () => {
    render(<HomePage />);

    expect(screen.getByText("148.50 ETH")).toBeInTheDocument();
    expect(screen.getByText("24 Markets")).toBeInTheDocument();
    expect(screen.getByText("1,420,000 PTS")).toBeInTheDocument();
    expect(screen.getByText("4,120 Wallets")).toBeInTheDocument();
  });

  it("renders the dual ecosystem feature pillars", () => {
    render(<HomePage />);

    expect(screen.getByText(/Pillar I • Prediction Market & Betting/i)).toBeInTheDocument();
    expect(screen.getByText(/Pillar II • Gamification, Quest & Airdrop/i)).toBeInTheDocument();
  });

  it("renders dynamic trending prediction markets teaser section from api", async () => {
    render(<HomePage />);

    expect(screen.getByText(/Trending Prediction Markets/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Will Ethereum trade above \$4,500/i)).toBeInTheDocument();
      expect(screen.getByText(/Will Arbitrum Daily Active Users exceed 1\.5 Million/i)).toBeInTheDocument();
    });

    const cryptoTab = screen.getByRole("button", { name: /Crypto/i });
    const l2Tab = screen.getByRole("button", { name: /Layer 2/i });
    const macroTab = screen.getByRole("button", { name: /Macro/i });

    expect(cryptoTab).toBeInTheDocument();
    expect(l2Tab).toBeInTheDocument();
    expect(macroTab).toBeInTheDocument();
  });

  it("renders the gamified 7-day streak calendar and dynamic quests in QuestsTeaser", async () => {
    render(<HomePage />);

    expect(screen.getByText(/Gamification & Quest Engine/i)).toBeInTheDocument();
    expect(screen.getByText("D1")).toBeInTheDocument();
    expect(screen.getByText("D7")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText("Connect Web3 Wallet").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Place First Binary Bet (≥ 0.01 ETH)").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("renders the 3-step onboarding journey section", () => {
    render(<HomePage />);

    expect(screen.getByText(/How to Get Started in 3 Simple Steps/i)).toBeInTheDocument();
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
  });

  it("renders the Season 1 Airdrop campaign banner", () => {
    render(<HomePage />);

    expect(screen.getByText(/Season 1 Airdrop Campaign Active/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view points leaderboard/i })).toHaveAttribute(
      "href",
      "/leaderboard"
    );
  });
});
