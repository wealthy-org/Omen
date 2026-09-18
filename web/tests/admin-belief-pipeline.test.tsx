import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AdminBeliefPipelineTable from "../components/AdminBeliefPipelineTable";

describe("AdminBeliefPipelineTable Component", () => {
  it("renders belief pipeline table headers, filter tabs, and items", () => {
    render(<AdminBeliefPipelineTable />);

    expect(
      screen.getByRole("heading", { name: /belief markets lifecycle monitor/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/statement & author/i)).toBeInTheDocument();
    expect(screen.getByText(/ai confidence/i)).toBeInTheDocument();
    expect(screen.getByText(/consensus \/ pool/i)).toBeInTheDocument();
    expect(screen.getByText(/eip-712 auth/i)).toBeInTheDocument();
  });

  it("filters beliefs by search input", () => {
    render(<AdminBeliefPipelineTable />);

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
