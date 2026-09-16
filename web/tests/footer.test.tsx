import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";

describe("Footer Component", () => {
  it("renders branding title and description", () => {
    render(<Footer />);

    expect(screen.getByAltText("Omen Logo")).toBeInTheDocument();
    expect(screen.getByText("OMEN")).toBeInTheDocument();
    expect(
      screen.getByText(/Institutional Web3 prediction market and gamified points farming protocol/i)
    ).toBeInTheDocument();
  });

  it("renders Arbitrum Sepolia network badge", () => {
    render(<Footer />);

    expect(screen.getByText("Arbitrum Sepolia Testnet")).toBeInTheDocument();
  });

  it("renders section headings for Platform, Developers, and Community", () => {
    render(<Footer />);

    expect(screen.getByRole("heading", { name: /platform/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /developers/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /community/i })).toBeInTheDocument();
  });

  it("renders platform navigation links", () => {
    render(<Footer />);

    expect(screen.getByRole("link", { name: /predictions feed/i })).toHaveAttribute("href", "/predictions");
    expect(screen.getByRole("link", { name: /quests farming/i })).toHaveAttribute("href", "/quests");
    expect(screen.getByRole("link", { name: /points leaderboard/i })).toHaveAttribute("href", "/leaderboard");
    expect(screen.getByRole("link", { name: /my bets/i })).toHaveAttribute("href", "/my-bets");
  });

  it("renders developer links and external attributes", () => {
    render(<Footer />);

    const contractsLink = screen.getByRole("link", { name: /smart contracts/i });
    expect(contractsLink).toHaveAttribute("href", "https://sepolia.arbiscan.io");
    expect(contractsLink).toHaveAttribute("target", "_blank");

    const githubLink = screen.getByRole("link", { name: /github repository/i });
    expect(githubLink).toHaveAttribute("href", "https://github.com/wealthy-org/Omen");
    expect(githubLink).toHaveAttribute("target", "_blank");
  });

  it("renders community links with target blank", () => {
    render(<Footer />);

    expect(screen.getByRole("link", { name: /x \(twitter\)/i })).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: /discord/i })).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: /telegram/i })).toHaveAttribute("target", "_blank");
  });

  it("renders current year copyright and disclaimer", () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`${currentYear} Omen Protocol`, "i"))).toBeInTheDocument();
    expect(
      screen.getByText(/Demonstration and testnet platform only\. Not financial advice\./i)
    ).toBeInTheDocument();
  });
});
