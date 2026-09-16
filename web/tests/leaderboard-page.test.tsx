import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LeaderboardPage from "@/app/leaderboard/page";

const MOCK_LEADERBOARD = [
  {
    rank: 1,
    wallet_address: "0x71C8364f3B3979B6396c5678440A4418652D875F",
    ens_name: "oracle-king.eth",
    streak_days: 24,
    total_points: 128500,
    win_rate: "82",
  },
  {
    rank: 2,
    wallet_address: "0x3A945b630B72d8e6E1fE46a297E59b20757Ebb30",
    ens_name: "arbitrum-whale.eth",
    streak_days: 21,
    total_points: 94200,
    win_rate: "78",
  },
  {
    rank: 3,
    wallet_address: "0x98Fc4E2551e737B244243684B98818c3B1280B3A",
    ens_name: "satoshi-prophet.eth",
    streak_days: 19,
    total_points: 81400,
    win_rate: "75",
  },
  {
    rank: 4,
    wallet_address: "0x1234567890abcdef1234567890abcdef12345678",
    ens_name: "omen-hunter.eth",
    streak_days: 14,
    total_points: 52300,
    win_rate: "71",
  },
];

describe("LeaderboardPage Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders main heading and loading skeleton before data arrives", () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() => new Promise(() => {}));

    render(<LeaderboardPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /points leaderboard/i })
    ).toBeInTheDocument();
  });

  it("renders dynamic leaderboard entries and user summary from api", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlString = String(url);
      if (urlString.includes("/api/leaderboard/points")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            leaderboard: MOCK_LEADERBOARD,
            currentUserRank: {
              rank: 4,
              totalPoints: 52300,
              streakDays: 14,
              ensName: "omen-hunter.eth",
            },
          }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true }) } as Response);
    });

    render(<LeaderboardPage />);

    await waitFor(() => {
      expect(screen.getByText("oracle-king.eth")).toBeInTheDocument();
      expect(screen.getByText("arbitrum-whale.eth")).toBeInTheDocument();
      expect(screen.getByText("satoshi-prophet.eth")).toBeInTheDocument();
    });

    expect(screen.getAllByText("#4").length).toBeGreaterThan(0);
    expect(screen.getByText("52,300")).toBeInTheDocument();
  });

  it("filters leaderboard list based on search query", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlString = String(url);
      if (urlString.includes("/api/leaderboard/points")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            leaderboard: MOCK_LEADERBOARD,
            currentUserRank: { rank: 4, totalPoints: 52300 },
          }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true }) } as Response);
    });

    render(<LeaderboardPage />);

    await waitFor(() => {
      expect(screen.getByText("oracle-king.eth")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by ens name or 0x/i);
    fireEvent.change(searchInput, { target: { value: "oracle-king.eth" } });

    expect(screen.getByText("oracle-king.eth")).toBeInTheDocument();
    expect(screen.queryByText("arbitrum-whale.eth")).not.toBeInTheDocument();
  });

  it("clears search input when clear button is clicked", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlString = String(url);
      if (urlString.includes("/api/leaderboard/points")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            leaderboard: MOCK_LEADERBOARD,
            currentUserRank: { rank: 4, totalPoints: 52300 },
          }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true }) } as Response);
    });

    render(<LeaderboardPage />);

    await waitFor(() => {
      expect(screen.getByText("oracle-king.eth")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by ens name or 0x/i);
    fireEvent.change(searchInput, { target: { value: "arbitrum-whale.eth" } });

    const clearBtn = screen.getByRole("button", { name: /clear search/i });
    fireEvent.click(clearBtn);

    expect(searchInput).toHaveValue("");
    expect(screen.getByText("oracle-king.eth")).toBeInTheDocument();
    expect(screen.getByText("arbitrum-whale.eth")).toBeInTheDocument();
  });

  it("displays empty state when no leaderboard entries exist", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlString = String(url);
      if (urlString.includes("/api/leaderboard/points")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            leaderboard: [],
            currentUserRank: null,
          }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true }) } as Response);
    });

    render(<LeaderboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/no ranked traders found/i)).toBeInTheDocument();
    });
  });
});
