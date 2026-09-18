import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AdminOracleMonitor from "../components/AdminOracleMonitor";

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

  it("refreshes round data when clicking refresh button", () => {
    render(<AdminOracleMonitor />);

    const refreshBtn = screen.getByRole("button", {
      name: /refresh round data/i,
    });
    fireEvent.click(refreshBtn);

    expect(
      screen.getByText(/chainlink live aggregator round state refreshed/i)
    ).toBeInTheDocument();
  });
});
