import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LeaderboardTable, { LeaderboardEntry } from "@/components/LeaderboardTable";

const TEST_ENTRIES: LeaderboardEntry[] = [
  { rank: 1, address: "0x1111111111111111111111111111111111111111", ensName: "champion.eth", streakDays: 20, totalPoints: 100000, multiplier: "3.0x" },
  { rank: 2, address: "0x2222222222222222222222222222222222222222", ensName: "second.eth", streakDays: 15, totalPoints: 75000, multiplier: "2.5x" },
  { rank: 3, address: "0x3333333333333333333333333333333333333333", streakDays: 10, totalPoints: 50000, multiplier: "2.0x" },
  { rank: 4, address: "0x4444444444444444444444444444444444444444", streakDays: 5, totalPoints: 25000, multiplier: "1.5x" },
  { rank: 5, address: "0x5555555555555555555555555555555555555555", streakDays: 2, totalPoints: 10000, multiplier: "1.0x" },
];

describe("LeaderboardTable Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders table headers and trader entry details", () => {
    render(<LeaderboardTable entries={TEST_ENTRIES} pageSize={3} />);

    expect(screen.getByRole("region", { name: /points leaderboard/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /rank/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /trader \/ wallet/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /total points/i })).toBeInTheDocument();

    expect(screen.getByText("champion.eth")).toBeInTheDocument();
    expect(screen.getByText("+100,000 PTS")).toBeInTheDocument();
  });

  it("renders podium badges for top 3 ranks", () => {
    render(<LeaderboardTable entries={TEST_ENTRIES} pageSize={5} />);

    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("#2")).toBeInTheDocument();
    expect(screen.getByText("#3")).toBeInTheDocument();
    expect(screen.getByText("#4")).toBeInTheDocument();
  });

  it("highlights current user row and displays YOU badge", () => {
    render(
      <LeaderboardTable
        entries={TEST_ENTRIES}
        currentUserAddress="0x2222222222222222222222222222222222222222"
        pageSize={5}
      />
    );

    expect(screen.getByText("YOU")).toBeInTheDocument();
  });

  it("handles pagination navigation with previous and next buttons", () => {
    render(<LeaderboardTable entries={TEST_ENTRIES} pageSize={2} />);

    expect(screen.getByText("champion.eth")).toBeInTheDocument();
    expect(screen.getByText("second.eth")).toBeInTheDocument();
    expect(screen.queryByText("+50,000 PTS")).not.toBeInTheDocument();

    const nextBtn = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText("+50,000 PTS")).toBeInTheDocument();
    expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();

    const prevBtn = screen.getByRole("button", { name: /previous/i });
    fireEvent.click(prevBtn);

    expect(screen.getByText("champion.eth")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
  });
});
