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

    expect(screen.getByAltText("Omen Logo")).toBeInTheDocument();
    expect(screen.getByText("OMEN")).toBeInTheDocument();
    expect(screen.getByText("TESTNET")).toBeInTheDocument();
  });

  it("renders all V1 desktop navigation links", () => {
    render(<Navbar />);

    expect(screen.getByRole("link", { name: /markets/i })).toHaveAttribute("href", "/#markets");
    expect(screen.getByRole("link", { name: /beliefs/i })).toHaveAttribute("href", "/#markets");
    expect(screen.getByRole("link", { name: /creators/i })).toHaveAttribute("href", "/#creators");
    expect(screen.getByRole("link", { name: /activity/i })).toHaveAttribute("href", "/#activity");
  });

  it("highlights the active link based on current pathname", () => {
    vi.mocked(usePathname).mockReturnValue("/markets");

    render(<Navbar />);

    const marketsLink = screen.getByRole("link", { name: /markets/i });
    expect(marketsLink).toHaveAttribute("aria-current", "page");
    expect(marketsLink.className).toContain("text-white");
    expect(marketsLink.className).toContain("font-bold");
  });

  it("renders the Submit Belief CTA button and Connect Wallet button", () => {
    render(<Navbar />);

    const submitButtons = screen.getAllByRole("link", { name: /submit belief/i });
    expect(submitButtons.length).toBeGreaterThan(0);
    expect(submitButtons[0]).toHaveAttribute("href", "/create");

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

    const mobileBeliefsLink = screen.getAllByRole("link", { name: /beliefs/i })[1];
    fireEvent.click(mobileBeliefsLink);

    expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();
  });
});
