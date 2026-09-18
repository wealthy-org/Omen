import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BeliefsPage from "@/app/beliefs/page";

const MOCK_BELIEFS = [
  {
    id: "belief-1",
    statement: "ETH will outperform SOL after the Pectra hard fork.",
    author: "VitalikFan",
    source_platform: "vitalikfan",
    source_url: "https://x.com/vitalikfan/1",
    ai_confidence: 92,
    status: "CONFIRMED",
    created_at: new Date().toISOString(),
    markets: [{ id: "market-101" }],
  },
  {
    id: "belief-2",
    statement: "AI agent micro-payments will dominate L2 transaction counts.",
    author: "AgentDev",
    source_platform: "agentdev",
    source_url: "https://warpcast.com/agentdev/1",
    ai_confidence: 85,
    status: "DETECTED",
    created_at: new Date().toISOString(),
    markets: [],
  },
];

describe("BeliefsPage (/beliefs)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          beliefs: MOCK_BELIEFS,
        }),
      } as Response)
    );
  });

  it("renders page title, subtitle, and submit belief CTA", async () => {
    render(<BeliefsPage />);

    expect(screen.getByRole("heading", { level: 1, name: /Social Beliefs Directory/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Submit New Belief/i })).toHaveAttribute("href", "/create");

    await waitFor(() => {
      expect(screen.getByText("ETH will outperform SOL after the Pectra hard fork.")).toBeInTheDocument();
      expect(screen.getByText("AI agent micro-payments will dominate L2 transaction counts.")).toBeInTheDocument();
    });
  });

  it("filters beliefs by status tabs", async () => {
    render(<BeliefsPage />);

    await waitFor(() => {
      expect(screen.getByText("VitalikFan")).toBeInTheDocument();
    });

    const aiTab = screen.getByRole("button", { name: /AI Detected/i });
    fireEvent.click(aiTab);

    expect(screen.getByText("AgentDev")).toBeInTheDocument();
    expect(screen.queryByText("VitalikFan")).not.toBeInTheDocument();
  });

  it("searches beliefs by text query", async () => {
    render(<BeliefsPage />);

    await waitFor(() => {
      expect(screen.getByText("VitalikFan")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search beliefs or authors\.\.\./i);
    fireEvent.change(searchInput, { target: { value: "micro-payments" } });

    expect(screen.getByText("AgentDev")).toBeInTheDocument();
    expect(screen.queryByText("VitalikFan")).not.toBeInTheDocument();
  });
});
