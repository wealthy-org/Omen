import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";
import HeroSection from "@/components/landing/HeroSection";

describe("Landing Page Components", () => {
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

  it("renders the trending prediction markets teaser section", () => {
    render(<HomePage />);

    expect(screen.getByText(/Trending Prediction Markets/i)).toBeInTheDocument();
    expect(screen.getByText(/Will Ethereum trade above \$4,500/i)).toBeInTheDocument();
    expect(screen.getByText(/Will Arbitrum Daily Active Users exceed 1\.5 Million/i)).toBeInTheDocument();
  });

  it("renders the gamified 7-day streak calendar in QuestsTeaser", () => {
    render(<HomePage />);

    expect(screen.getByText(/Gamification & Quest Engine/i)).toBeInTheDocument();
    expect(screen.getByText("D1")).toBeInTheDocument();
    expect(screen.getByText("D7")).toBeInTheDocument();
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
