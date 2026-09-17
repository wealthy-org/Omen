import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreatorProfilePage from "@/app/creator/[address]/page";

const MOCK_PROFILE_DATA = {
  creator: {
    address: "0x1111111111111111111111111111111111111111",
    name: "Vitalik Buterin",
    handle: "@vitalik.eth",
    bio: "Ethereum researcher and decentralization advocate.",
    isVerified: true,
    accuracyRate: 88,
    confirmationRate: 95,
    totalBeliefs: 24,
    volumeGeneratedEth: 540.2,
  },
  beliefs: [
    {
      id: "belief-1",
      statement: "Will ETH trade above $5000 in Q4 2026?",
      author: "Vitalik Buterin",
      authorHandle: "@vitalik.eth",
      isConfirmed: true,
      status: "MARKET_OPEN",
      marketId: "market-101",
    },
    {
      id: "belief-2",
      statement: "Layer 2 transaction count will exceed 100M daily.",
      author: "Vitalik Buterin",
      authorHandle: "@vitalik.eth",
      isConfirmed: true,
      status: "RESOLVED",
      marketId: "market-102",
    },
  ],
};

describe("CreatorProfilePage (/creator/[address])", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          ...MOCK_PROFILE_DATA,
        }),
      } as Response)
    );
  });

  it("renders creator header, reputation metrics, and active beliefs", async () => {
    render(
      <CreatorProfilePage
        params={Promise.resolve({ address: "0x1111111111111111111111111111111111111111" })}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: /Vitalik Buterin/i })).toBeInTheDocument();
      expect(screen.getAllByText("@vitalik.eth").length).toBeGreaterThan(0);
      expect(screen.getByText(/88%/i)).toBeInTheDocument();
      expect(screen.getByText(/95%/i)).toBeInTheDocument();
      expect(screen.getByText("540.2 ETH")).toBeInTheDocument();
      expect(screen.getByText("Will ETH trade above $5000 in Q4 2026?")).toBeInTheDocument();
    });
  });

  it("switches tabs between Active Beliefs and Resolved Beliefs", async () => {
    render(
      <CreatorProfilePage
        params={Promise.resolve({ address: "0x1111111111111111111111111111111111111111" })}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Will ETH trade above $5000 in Q4 2026?")).toBeInTheDocument();
    });

    const resolvedTab = screen.getByRole("button", { name: /Resolved Beliefs/i });
    fireEvent.click(resolvedTab);

    await waitFor(() => {
      expect(screen.getByText("Layer 2 transaction count will exceed 100M daily.")).toBeInTheDocument();
      expect(screen.queryByText("Will ETH trade above $5000 in Q4 2026?")).not.toBeInTheDocument();
    });
  });
});
