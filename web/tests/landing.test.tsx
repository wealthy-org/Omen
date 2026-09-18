import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import HomePage from "@/app/page";
import HeroSection from "@/components/landing/HeroSection";

const MOCK_LANDING_MARKETS = [
  {
    id: "market-1",
    statement: "Will ETH reach $5,000 before end of Q4 2026?",
    author: "VitalikFan",
    authorHandle: "@vitalikfan",
    isConfirmed: true,
    status: "OPEN",
    agreePool: 45.5,
    disagreePool: 15.2,
    agreeParticipants: 58,
    disagreeParticipants: 22,
    closeTime: new Date(Date.now() + 86400000 * 5).toISOString(),
    category: "Crypto",
  },
  {
    id: "market-2",
    statement: "AI agent transaction volume will surpass 20% on L2s.",
    author: "CryptoOracle",
    authorHandle: "@cryptooracle",
    isConfirmed: false,
    status: "DETECTED",
    agreePool: 20.0,
    disagreePool: 30.0,
    agreeParticipants: 35,
    disagreeParticipants: 65,
    closeTime: new Date(Date.now() + 86400000 * 2).toISOString(),
    category: "AI",
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

  it("renders the social belief hero section headline and dual-testnet badge", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /the internet is full of opinions\. omen gives them a market\./i,
      })
    ).toBeInTheDocument();

    expect(screen.getAllByText(/Dual-Testnet Active/i).length).toBeGreaterThan(0);
  });

  it("renders primary and secondary CTA buttons in the hero section", () => {
    render(<HomePage />);

    const exploreButton = screen.getAllByRole("link", { name: /explore markets/i })[0];
    expect(exploreButton).toHaveAttribute("href", "/markets");

    const submitButton = screen.getAllByRole("link", { name: /submit belief/i })[0];
    expect(submitButton).toHaveAttribute("href", "/create");
  });

  it("renders the 4 V1 platform metrics overview cards in StatsOverview", async () => {
    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("320.50 ETH")).toBeInTheDocument();
      expect(screen.getByText("18 Markets")).toBeInTheDocument();
      expect(screen.getByText("142 Beliefs")).toBeInTheDocument();
      expect(screen.getByText("38 Creators")).toBeInTheDocument();
    });
  });

  it("renders dynamic trending belief markets using BeliefMarketCard", async () => {
    render(<HomePage />);

    expect(screen.getByText(/Trending Belief Markets/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Will ETH reach \$5,000 before end of Q4 2026\?/i)).toBeInTheDocument();
      expect(screen.getByText(/AI agent transaction volume will surpass 20% on L2s\./i)).toBeInTheDocument();
    });
  });

  it("renders the 3-step Social Belief protocol onboarding journey", () => {
    render(<HomePage />);

    expect(screen.getByText(/How Social Belief Markets Work/i)).toBeInTheDocument();
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
  });

  it("renders empty state notification when no trending belief markets exist", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlString = String(url);
      if (urlString.includes("/api/markets")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, markets: [] }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true }) } as Response);
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText(/No trending belief markets found/i)).toBeInTheDocument();
      expect(screen.getByText(/Be the first to create one!/i)).toBeInTheDocument();
    });
  });
});
