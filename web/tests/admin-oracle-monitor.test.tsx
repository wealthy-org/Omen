import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AdminOracleMonitor from "../components/AdminOracleMonitor";
import { ETHEREUM_SEPOLIA_CHAIN_ID } from "@/lib/constants";

describe("AdminOracleMonitor Component", () => {
  it("renders live oracle feed cards with prices and contract addresses", () => {
    render(<AdminOracleMonitor />);

    expect(
      screen.getByRole("heading", { name: /oracle pipeline & live feeds monitor/i })
    ).toBeInTheDocument();
    expect(screen.getByText("ETH/USD")).toBeInTheDocument();
    expect(screen.getByText("BTC/USD")).toBeInTheDocument();
    expect(screen.getByText("SOL/USD")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /trigger oracle snapshot/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /recent oracle snapshots/i })
    ).toBeInTheDocument();
  });

  it("triggers snapshot record action and renders notification", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          id: "snap-test-1",
          asset: "ETH",
          price: 3500.0,
          snapshot_type: "RESOLUTION",
          source: "chainlink",
          recorded_at: new Date().toISOString(),
        },
      }),
    } as any);

    render(<AdminOracleMonitor />);

    const executeBtn = screen.getByRole("button", {
      name: /execute snapshot/i,
    });
    fireEvent.click(executeBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/snapshot successfully recorded for ETH/i)
      ).toBeInTheDocument();
    });
  });

  it("refreshes round data when clicking refresh button", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        feeds: [
          {
            symbol: "ETH/USD",
            name: "Ethereum / US Dollar",
            price: 2454.54,
            decimals: 8,
            roundId: "18446744073709587751",
            updatedAt: "2026-09-18T00:00:00.000Z",
            heartbeatSec: 3600,
            contractAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
            chainId: ETHEREUM_SEPOLIA_CHAIN_ID,
            status: "HEALTHY",
          },
        ],
      }),
    } as any);

    render(<AdminOracleMonitor />);

    const refreshBtn = screen.getByRole("button", {
      name: /refresh round data/i,
    });
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/chainlink live aggregator round state refreshed/i)
      ).toBeInTheDocument();
    });
  });
});
