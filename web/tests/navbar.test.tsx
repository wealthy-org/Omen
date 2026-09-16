import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Navbar from "@/components/Navbar";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

import { usePathname } from "next/navigation";

describe("Navbar Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePathname).mockReturnValue("/");
  });

  it("renders branding logo and testnet badge", () => {
    render(<Navbar />);

    expect(screen.getByText("OMEN")).toBeInTheDocument();
    expect(screen.getByText("TESTNET")).toBeInTheDocument();
  });

  it("renders all desktop navigation links", () => {
    render(<Navbar />);

    expect(screen.getByRole("link", { name: /predictions/i })).toHaveAttribute("href", "/predictions");
    expect(screen.getByRole("link", { name: /quests/i })).toHaveAttribute("href", "/quests");
    expect(screen.getByRole("link", { name: /leaderboard/i })).toHaveAttribute("href", "/leaderboard");
    expect(screen.getByRole("link", { name: /my bets/i })).toHaveAttribute("href", "/my-bets");
  });

  it("highlights the active link based on current pathname", () => {
    vi.mocked(usePathname).mockReturnValue("/predictions");

    render(<Navbar />);

    const predictionsLink = screen.getByRole("link", { name: /predictions/i });
    expect(predictionsLink).toHaveAttribute("aria-current", "page");
    expect(predictionsLink.className).toContain("text-white");
    expect(predictionsLink.className).toContain("font-bold");
  });

  it("renders the Connect Wallet button", () => {
    render(<Navbar />);

    const connectButtons = screen.getAllByRole("button", { name: /connect wallet/i });
    expect(connectButtons.length).toBeGreaterThan(0);
  });

  it("renders theme toggle button and calls handler on click", () => {
    const onToggleMock = vi.fn();
    render(<Navbar onToggleTheme={onToggleMock} />);

    const themeToggleButtons = screen.getAllByRole("button", { name: /toggle theme/i });
    expect(themeToggleButtons.length).toBeGreaterThan(0);

    fireEvent.click(themeToggleButtons[0]);
    expect(onToggleMock).toHaveBeenCalledTimes(1);
  });

  it("applies sticky scrolled styling when window scrolls down", () => {
    render(<Navbar />);

    const header = screen.getByRole("banner");
    expect(header.className).toContain("sticky");
    expect(header.className).toContain("top-0");

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 50, writable: true });
      window.dispatchEvent(new Event("scroll"));
    });

    const innerNav = header.querySelector("div");
    expect(innerNav?.className).toContain("backdrop-blur-xl");
  });

  it("toggles the mobile menu when the hamburger button is clicked", () => {
    render(<Navbar />);

    expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();

    const toggleButton = screen.getByRole("button", { name: /toggle navigation menu/i });
    expect(toggleButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggleButton);

    expect(screen.getByTestId("mobile-menu")).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(toggleButton);

    expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();
    expect(toggleButton).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the mobile menu when a navigation item inside it is clicked", () => {
    render(<Navbar />);

    const toggleButton = screen.getByRole("button", { name: /toggle navigation menu/i });
    fireEvent.click(toggleButton);

    const mobileMenu = screen.getByTestId("mobile-menu");
    expect(mobileMenu).toBeInTheDocument();

    const mobileQuestsLink = screen.getAllByRole("link", { name: /quests/i })[1];
    fireEvent.click(mobileQuestsLink);

    expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();
  });
});
