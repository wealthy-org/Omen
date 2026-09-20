import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import ConnectWalletButton from "@/components/ConnectWalletButton";

describe("ConnectWalletButton Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders Connect Wallet text and wallet icon in disconnected state", () => {
    render(<ConnectWalletButton />);

    const button = screen.getByRole("button", { name: /connect wallet/i });
    expect(button).toBeInTheDocument();
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  it("handles connecting state and transitions to connected state", () => {
    vi.useFakeTimers();
    const onConnectMock = vi.fn();

    render(
      <ConnectWalletButton
        onConnect={onConnectMock}
        initialAddress="0x1234567890abcdef1234567890abcdef12345678"
        initialBalance="0.45 ETH"
      />
    );

    const button = screen.getByRole("button", { name: /connect wallet/i });
    fireEvent.click(button);

    expect(onConnectMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Connecting...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /connecting wallet/i })).toBeDisabled();

    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(screen.getByText("0.45 ETH")).toBeInTheDocument();
    expect(screen.getByText("0x1234...5678")).toBeInTheDocument();
  });

  it("renders connected state with custom initial address and balance", () => {
    render(
      <ConnectWalletButton
        initialStatus="connected"
        initialAddress="0x9876543210fedcba9876543210fedcba98765432"
        initialBalance="2.50 ETH"
      />
    );

    expect(screen.getByText("2.50 ETH")).toBeInTheDocument();
    expect(screen.getByText("0x9876...5432")).toBeInTheDocument();
  });

  it("toggles dropdown menu on address chip click with ARIA attributes", () => {
    render(<ConnectWalletButton initialStatus="connected" />);

    const chipButton = screen.getByRole("button", { name: /wallet menu/i });
    expect(chipButton).toHaveAttribute("aria-haspopup", "menu");
    expect(chipButton).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    fireEvent.click(chipButton);

    expect(chipButton).toHaveAttribute("aria-expanded", "true");
    const menu = screen.getByRole("menu");
    expect(menu).toBeInTheDocument();
    expect(screen.getByText("Copy Address")).toBeInTheDocument();
    expect(screen.getByText("View on Explorer")).toBeInTheDocument();
    expect(screen.getByText("Disconnect")).toBeInTheDocument();

    fireEvent.click(chipButton);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(chipButton).toHaveAttribute("aria-expanded", "false");
  });

  it("closes dropdown on outside click", () => {
    render(
      <div>
        <div data-testid="outside-element">Outside</div>
        <ConnectWalletButton initialStatus="connected" />
      </div>
    );

    const chipButton = screen.getByRole("button", { name: /wallet menu/i });
    fireEvent.click(chipButton);
    expect(screen.getByRole("menu")).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId("outside-element"));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("copies address and displays Copied! feedback", async () => {
    vi.useFakeTimers();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <ConnectWalletButton
        initialStatus="connected"
        initialAddress="0x1234567890abcdef1234567890abcdef12345678"
      />
    );

    const chipButton = screen.getByRole("button", { name: /wallet menu/i });
    fireEvent.click(chipButton);

    const copyOption = screen.getByRole("menuitem", { name: /copy address/i });
    await act(async () => {
      fireEvent.click(copyOption);
    });

    expect(writeTextMock).toHaveBeenCalledWith("0x1234567890abcdef1234567890abcdef12345678");
    expect(screen.getByText("Copied!")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2100);
    });

    expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
    expect(screen.getByText("Copy Address")).toBeInTheDocument();
  });

  it("renders explorer link pointing to Etherscan Sepolia", () => {
    render(
      <ConnectWalletButton
        initialStatus="connected"
        initialAddress="0x1234567890abcdef1234567890abcdef12345678"
      />
    );

    const chipButton = screen.getByRole("button", { name: /wallet menu/i });
    fireEvent.click(chipButton);

    const explorerLink = screen.getByRole("menuitem", { name: /view on explorer/i });
    expect(explorerLink).toHaveAttribute(
      "href",
      "https://sepolia.etherscan.io/address/0x1234567890abcdef1234567890abcdef12345678"
    );
    expect(explorerLink).toHaveAttribute("target", "_blank");
    expect(explorerLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("handles disconnect action and calls onDisconnect callback", () => {
    const onDisconnectMock = vi.fn();
    render(
      <ConnectWalletButton
        initialStatus="connected"
        onDisconnect={onDisconnectMock}
      />
    );

    const chipButton = screen.getByRole("button", { name: /wallet menu/i });
    fireEvent.click(chipButton);

    const disconnectButton = screen.getByRole("menuitem", { name: /disconnect/i });
    fireEvent.click(disconnectButton);

    expect(onDisconnectMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: /connect wallet/i })).toBeInTheDocument();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
