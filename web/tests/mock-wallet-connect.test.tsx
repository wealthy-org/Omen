import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import ConnectWalletButton from "@/components/ConnectWalletButton";
import { DEFAULT_DEMO_WALLET_ADDRESS } from "@/lib/mockPredictionMarket";

describe("Mock Wallet Connection & Supabase Sync (TICKET-48)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        user: {
          wallet_address: DEFAULT_DEMO_WALLET_ADDRESS,
          total_points: 0,
        },
      }),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("connects demo wallet and calls /api/wallet/connect", async () => {
    vi.useFakeTimers();
    const onConnectMock = vi.fn();

    render(<ConnectWalletButton onConnect={onConnectMock} />);

    const button = screen.getByRole("button", { name: /connect wallet/i });
    fireEvent.click(button);

    expect(onConnectMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Connecting...")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(screen.getByText("10.0000 ETH")).toBeInTheDocument();
    expect(screen.getByText("0x71C6...4B29")).toBeInTheDocument();

    expect(global.fetch).toHaveBeenCalledWith("/api/wallet/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet_address: DEFAULT_DEMO_WALLET_ADDRESS }),
    });
  });

  it("shows Demo Wallet (Mock Mode) badge in dropdown menu", () => {
    render(
      <ConnectWalletButton
        initialStatus="connected"
        initialAddress={DEFAULT_DEMO_WALLET_ADDRESS}
        initialBalance="10.0000 ETH"
      />
    );

    const chipButton = screen.getByRole("button", { name: /wallet menu/i });
    fireEvent.click(chipButton);

    expect(screen.getByText("Demo Wallet (Mock Mode)")).toBeInTheDocument();
    expect(screen.getByText("Disconnect")).toBeInTheDocument();
  });
});
