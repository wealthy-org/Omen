import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateBeliefPage from "@/app/create/page";

const mockRouterPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
  useSearchParams: () => ({
    get: () => null,
  }),
}));

describe("CreateBeliefPage (/create)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockRouterPush.mockReset();

    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlString = String(url);
      if (urlString.includes("/api/beliefs/extract")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            extracted: {
              statement: "ETH will exceed $4,000 by end of Q4 2026.",
              subject: "ETH",
              direction: "ABOVE",
              targetPrice: 4000,
              targetTime: "2026-12-31",
              category: "Crypto",
              confidenceScore: 94,
            },
          }),
        } as Response);
      }
      if (urlString.includes("/api/beliefs/submit")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            marketId: "market-new-999",
          }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true }) } as Response);
    });
  });

  it("renders Step 1 form elements", () => {
    render(<CreateBeliefPage />);

    expect(screen.getByRole("heading", { level: 1, name: /Submit Social Belief/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Raw Post or Opinion Text/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Author Handle/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Analyze with AI/i })).toBeInTheDocument();
  });

  it("advances to Step 2 after AI extraction", async () => {
    render(<CreateBeliefPage />);

    const textarea = screen.getByLabelText(/Raw Post or Opinion Text/i);
    const authorInput = screen.getByLabelText(/Author Handle/i);
    const analyzeBtn = screen.getByRole("button", { name: /Analyze with AI/i });

    fireEvent.change(textarea, { target: { value: "ETH is definitely hitting $4,000 before this year ends!" } });
    fireEvent.change(authorInput, { target: { value: "@cryptoking" } });
    fireEvent.click(analyzeBtn);

    await waitFor(() => {
      expect(screen.getByText("Step 2: Review AI Extraction")).toBeInTheDocument();
      expect(screen.getByDisplayValue("ETH will exceed $4,000 by end of Q4 2026.")).toBeInTheDocument();
      expect(screen.getByText(/94% Confidence/i)).toBeInTheDocument();
    });
  });

  it("completes full 3-step wizard and triggers navigation to /market/[id]", async () => {
    render(<CreateBeliefPage />);

    fireEvent.change(screen.getByLabelText(/Raw Post or Opinion Text/i), {
      target: { value: "ETH will hit 4k!" },
    });
    fireEvent.change(screen.getByLabelText(/Author Handle/i), {
      target: { value: "@cryptoking" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Analyze with AI/i }));

    await waitFor(() => {
      expect(screen.getByText("Step 2: Review AI Extraction")).toBeInTheDocument();
    });

    const proceedBtn = screen.getByRole("button", { name: /Proceed to Confirmation/i });
    fireEvent.click(proceedBtn);

    await waitFor(() => {
      expect(screen.getByText("Step 3: Confirm & Launch Market")).toBeInTheDocument();
    });

    const launchBtn = screen.getByRole("button", { name: /Launch On-Chain Market/i });
    fireEvent.click(launchBtn);

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith("/market/market-new-999");
    });
  });
});
