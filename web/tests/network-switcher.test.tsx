import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import NetworkSwitcherModal from "@/components/NetworkSwitcherModal";
import Navbar from "@/components/Navbar";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn().mockReturnValue("/"),
}));

describe("NetworkSwitcherModal Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    render(<NetworkSwitcherModal isOpen={false} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("Wrong Network Detected")).not.toBeInTheDocument();
  });

  it("renders modal with warning information and ARIA accessibility attributes when isOpen is true", () => {
    render(
      <NetworkSwitcherModal
        isOpen={true}
        currentChainId={1}
        currentNetworkName="Ethereum Mainnet"
        targetChainId={11155111}
        targetNetworkName="Ethereum Sepolia"
      />
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "network-modal-title");
    expect(dialog).toHaveAttribute("aria-describedby", "network-modal-desc");

    expect(screen.getByText("Wrong Network Detected")).toBeInTheDocument();
    expect(
      screen.getByText(/Omen operates on Ethereum Sepolia and Robinhood Chain Testnet/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Ethereum Mainnet \(1\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Ethereum Sepolia/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Robinhood Chain Testnet/i).length).toBeGreaterThan(0);
  });

  it("triggers onSwitchNetwork with selected chain ID and displays loading state during network switch", async () => {
    const onSwitchMock = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 50))
    );

    render(
      <NetworkSwitcherModal
        isOpen={true}
        onSwitchNetwork={onSwitchMock}
      />
    );

    const robinhoodButton = screen.getByRole("button", {
      name: /robinhood chain testnet/i,
    });
    fireEvent.click(robinhoodButton);

    const switchButton = screen.getByRole("button", {
      name: /switch to robinhood chain testnet/i,
    });
    expect(switchButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(switchButton);
    });

    expect(onSwitchMock).toHaveBeenCalledWith(46630);
  });

  it("triggers onClose when close icon or dismiss button is clicked", () => {
    const onCloseMock = vi.fn();

    render(
      <NetworkSwitcherModal
        isOpen={true}
        onClose={onCloseMock}
      />
    );

    const closeIconButton = screen.getByRole("button", { name: /close dialog/i });
    fireEvent.click(closeIconButton);
    expect(onCloseMock).toHaveBeenCalledTimes(1);

    const dismissButton = screen.getByRole("button", { name: /dismiss for now/i });
    fireEvent.click(dismissButton);
    expect(onCloseMock).toHaveBeenCalledTimes(2);
  });

  it("renders wrong network indicator badge in Navbar and opens switcher modal when clicked", () => {
    render(<Navbar isWrongNetwork={true} />);

    const wrongNetworkBadges = screen.getAllByRole("button", { name: /wrong network/i });
    expect(wrongNetworkBadges.length).toBeGreaterThan(0);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Wrong Network Detected")).toBeInTheDocument();
  });
});
