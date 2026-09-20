import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AdminBeliefPipelineTable, { BeliefPipelineItem } from "../components/AdminBeliefPipelineTable";

const TEST_PIPELINE_ITEMS: BeliefPipelineItem[] = [
  {
    id: "belief-v1-001",
    statement: "ETH will outperform SOL in Q4 2026",
    author: "0x71c...99a1",
    author_handle: "@vitalik_fan",
    status: "OPEN",
    ai_confidence: 94,
    agree_pool: 12500,
    disagree_pool: 7500,
    total_pool: 20000,
    consensus_percentage: 62.5,
    has_eip712_signature: true,
    created_at: "2026-09-18T05:00:00.000Z",
  },
  {
    id: "belief-v1-002",
    statement: "Bitcoin price will breach $100k prior to year-end options expiry",
    author: "0x892...11b2",
    author_handle: "@satoshi_macro",
    status: "CONFIRMED",
    ai_confidence: 88,
    agree_pool: 35000,
    disagree_pool: 15000,
    total_pool: 50000,
    consensus_percentage: 70.0,
    has_eip712_signature: true,
    created_at: "2026-09-18T02:00:00.000Z",
  },
];

describe("AdminBeliefPipelineTable Component", () => {
  it("renders belief pipeline table headers, filter tabs, and items", () => {
    render(<AdminBeliefPipelineTable initialItems={TEST_PIPELINE_ITEMS} />);

    expect(
      screen.getByRole("heading", { name: /belief markets lifecycle monitor/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/statement & author/i)).toBeInTheDocument();
    expect(screen.getByText(/ai confidence/i)).toBeInTheDocument();
    expect(screen.getByText(/consensus \/ pool/i)).toBeInTheDocument();
    expect(screen.getByText(/eip-712 auth/i)).toBeInTheDocument();
  });

  it("filters beliefs by search input", () => {
    render(<AdminBeliefPipelineTable initialItems={TEST_PIPELINE_ITEMS} />);

    const searchInput = screen.getByLabelText(/filter beliefs search/i);
    fireEvent.change(searchInput, {
      target: { value: "Bitcoin" },
    });

    expect(
      screen.getByText(/Bitcoin price will breach \$100k/i)
    ).toBeInTheDocument();
  });

  it("syncs pipeline when clicking sync button", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        beliefs: [
          {
            id: "b-sync-1",
            statement: "Synced test belief statement",
            author: "0xTestAuthor",
            author_handle: "@tester",
            status: "OPEN",
            ai_confidence: 90,
            agree_pool: 5000,
            disagree_pool: 1000,
            created_at: new Date().toISOString(),
          },
        ],
      }),
    } as any);

    render(<AdminBeliefPipelineTable />);

    const syncBtn = screen.getByLabelText(/sync pipeline/i);
    fireEvent.click(syncBtn);

    await waitFor(() => {
      expect(screen.getByText("Synced test belief statement")).toBeInTheDocument();
    });
  });
});
