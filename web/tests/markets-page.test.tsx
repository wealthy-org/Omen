import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MarketsPage from "@/app/markets/page";

const MOCK_MARKETS = [
  {
    id: "market-1",
    statement: "Will ETH trade above $5000 in Q4 2026?",
    author: "VitalikFan",
    authorHandle: "@vitalikfan",
    isConfirmed: true,
    status: "OPEN",
    agreePool: 100,
    disagreePool: 50,
    agreeParticipants: 70,
    disagreeParticipants: 30,
    closeTime: new Date(Date.now() + 86400000 * 5).toISOString(),
    category: "Crypto",
    volume: 150,
  },
  {
    id: "market-2",
    statement: "Will Solana DEX volume overtake Ethereum mainnet in 2026?",
    author: "SolMaxi",
    authorHandle: "@solmaxi",
    isConfirmed: false,
    status: "DETECTED",
    agreePool: 20,
    disagreePool: 80,
    agreeParticipants: 25,
    disagreeParticipants: 75,
    closeTime: new Date(Date.now() + 86400000 * 2).toISOString(),
    category: "Crypto",
    volume: 100,
  },
  {
    id: "market-3",
    statement: "Will AI agents generate $10B in on-chain revenue by 2027?",
    author: "AIThinker",
    authorHandle: "@aithinker",
    isConfirmed: true,
    status: "OPEN",
    agreePool: 200,
    disagreePool: 100,
    agreeParticipants: 80,
    disagreeParticipants: 20,
    closeTime: new Date(Date.now() + 86400000 * 10).toISOString(),
    category: "AI",
    volume: 300,
  },
];

describe("MarketsPage (/markets)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          markets: MOCK_MARKETS,
        }),
      } as Response)
    );
  });

  it("renders market discovery header and market cards", async () => {
    render(<MarketsPage />);

    expect(screen.getByRole("heading", { level: 1, name: /Explore Belief Markets/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Will ETH trade above $5000 in Q4 2026?")).toBeInTheDocument();
      expect(screen.getByText("Will Solana DEX volume overtake Ethereum mainnet in 2026?")).toBeInTheDocument();
    });
  });

  it("filters markets by discovery tabs (e.g. Confirmed)", async () => {
    render(<MarketsPage />);

    await waitFor(() => {
      expect(screen.getByText("Will Solana DEX volume overtake Ethereum mainnet in 2026?")).toBeInTheDocument();
    });

    const confirmedTab = screen.getByRole("button", { name: /Confirmed/i });
    fireEvent.click(confirmedTab);

    await waitFor(() => {
      expect(screen.getByText("Will ETH trade above $5000 in Q4 2026?")).toBeInTheDocument();
      expect(screen.queryByText("Will Solana DEX volume overtake Ethereum mainnet in 2026?")).not.toBeInTheDocument();
    });
  });

  it("searches markets by query text", async () => {
    render(<MarketsPage />);

    await waitFor(() => {
      expect(screen.getByText("Will ETH trade above $5000 in Q4 2026?")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search markets by statement, creator, or topic\.\.\./i);
    fireEvent.change(searchInput, { target: { value: "Solana DEX" } });

    await waitFor(() => {
      expect(screen.getByText("Will Solana DEX volume overtake Ethereum mainnet in 2026?")).toBeInTheDocument();
      expect(screen.queryByText("Will ETH trade above $5000 in Q4 2026?")).not.toBeInTheDocument();
    });
  });
});
