import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";

describe("Footer Component", () => {
  it("renders branding title and description", () => {
    render(<Footer />);

    expect(screen.getByAltText("Omen Logo")).toBeInTheDocument();
    expect(screen.getByText("OMEN")).toBeInTheDocument();
    expect(
      screen.getByText(/Social Belief Market Protocol/i)
    ).toBeInTheDocument();
  });

  it("renders testnet network badge", () => {
    render(<Footer />);

    expect(screen.getByText(/Dual-Testnet Active/i)).toBeInTheDocument();
  });

  it("renders section headings for Platform, Developers, and Community", () => {
    render(<Footer />);

    expect(screen.getByRole("heading", { name: /platform/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /developers/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /community/i })).toBeInTheDocument();
  });

  it("renders V1 platform navigation links", () => {
    render(<Footer />);

    expect(screen.getByRole("link", { name: /markets feed/i })).toHaveAttribute("href", "/markets");
    expect(screen.getByRole("link", { name: /beliefs catalog/i })).toHaveAttribute("href", "/beliefs");
    expect(screen.getByRole("link", { name: /creators directory/i })).toHaveAttribute("href", "/creators");
    expect(screen.getByRole("link", { name: /activity feed/i })).toHaveAttribute("href", "/activity");
    expect(screen.getByRole("link", { name: /submit belief/i })).toHaveAttribute("href", "/create");
  });

  it("renders developer links and external attributes", () => {
    render(<Footer />);

    const sepoliaLink = screen.getByRole("link", { name: /sepolia explorer/i });
    expect(sepoliaLink).toHaveAttribute("href", "https://sepolia.etherscan.io");
    expect(sepoliaLink).toHaveAttribute("target", "_blank");

    const robinhoodLink = screen.getByRole("link", { name: /robinhood explorer/i });
    expect(robinhoodLink).toHaveAttribute("href", "https://explorer.testnet.chain.robinhood.com");
    expect(robinhoodLink).toHaveAttribute("target", "_blank");

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
