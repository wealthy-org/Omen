import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";

describe("Footer", () => {
  it("renders branding", () => {
    render(<Footer />);
    expect(screen.getByAltText("Omen Logo")).toBeInTheDocument();
    expect(screen.getByText("OMEN")).toBeInTheDocument();
  });

  it("links only to pages that exist", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: /^markets$/i })).toHaveAttribute("href", "/markets");
    expect(screen.getByRole("link", { name: /^predictors$/i })).toHaveAttribute("href", "/creators");
    expect(screen.getByRole("link", { name: /submit a call/i })).toHaveAttribute("href", "/create");
    for (const link of screen.getAllByRole("link")) {
      expect(link.getAttribute("href")).not.toBe("#");
    }
  });

  it("opens explorer and source links in a new tab", () => {
    render(<Footer />);
    const github = screen.getByRole("link", { name: /source on github/i });
    expect(github).toHaveAttribute("href", "https://github.com/wealthy-org/Omen");
    expect(github).toHaveAttribute("target", "_blank");
  });
});
