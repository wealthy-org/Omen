import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import QuestsPage from "@/app/quests/page";

const MOCK_LIVE_QUESTS = [
  {
    id: "q-1",
    title: "Connect Web3 Wallet",
    description: "Connect your Phantom EVM wallet to initialize account",
    category: "onboarding",
    points_reward: 100,
    is_completed: false,
    action_url: "",
  },
  {
    id: "q-2",
    title: "Follow @OmenPredict on X",
    description: "Follow the official channel",
    category: "social",
    points_reward: 200,
    is_completed: false,
    action_url: "https://x.com",
  },
  {
    id: "q-3",
    title: "Place Your First Market Prediction",
    description: "Execute a YES or NO prediction slip",
    category: "on-chain",
    points_reward: 500,
    is_completed: true,
    action_url: "",
  },
];

describe("QuestsPage Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders heading and loading skeleton before data arrives", () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() => new Promise(() => {}));

    render(<QuestsPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /quests & points farming/i })
    ).toBeInTheDocument();
  });

  it("renders live quests dynamically and displays user points from api", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlString = String(url);
      if (urlString.includes("/api/quests")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            quests: MOCK_LIVE_QUESTS,
            userProfile: {
              total_points: 3500,
              streak_count: 5,
            },
          }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true }) } as Response);
    });

    render(<QuestsPage />);

    await waitFor(() => {
      expect(screen.getByText("Connect Web3 Wallet")).toBeInTheDocument();
      expect(screen.getByText("Follow @OmenPredict on X")).toBeInTheDocument();
      expect(screen.getByText("Place Your First Market Prediction")).toBeInTheDocument();
    });

    expect(screen.getByText("3,500")).toBeInTheDocument();
    expect(screen.getByText("5 Days")).toBeInTheDocument();
  });

  it("filters dynamic quests by category when tab clicked", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlString = String(url);
      if (urlString.includes("/api/quests")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            quests: MOCK_LIVE_QUESTS,
            userProfile: { total_points: 1000, streak_count: 2 },
          }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true }) } as Response);
    });

    render(<QuestsPage />);

    await waitFor(() => {
      expect(screen.getByText("Follow @OmenPredict on X")).toBeInTheDocument();
    });

    const socialFilterBtn = screen.getByRole("button", { name: /social/i });
    fireEvent.click(socialFilterBtn);

    expect(screen.getByText("Follow @OmenPredict on X")).toBeInTheDocument();
    expect(screen.queryByText("Connect Web3 Wallet")).not.toBeInTheDocument();
    expect(screen.queryByText("Place Your First Market Prediction")).not.toBeInTheDocument();
  });

  it("completes a quest and increments user balance dynamically", async () => {
    let completeCalled = false;
    vi.spyOn(globalThis, "fetch").mockImplementation((url, opts) => {
      const urlString = String(url);
      if (urlString.includes("/api/quests/q-1/complete")) {
        completeCalled = true;
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, pointsAwarded: 100 }),
        } as Response);
      }
      if (urlString.includes("/api/quests")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            quests: MOCK_LIVE_QUESTS,
            userProfile: { total_points: 1000, streak_count: 1 },
          }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true }) } as Response);
    });

    render(<QuestsPage />);

    await waitFor(() => {
      expect(screen.getByText("Follow @OmenPredict on X")).toBeInTheDocument();
    });

    const actionButtons = screen.getAllByRole("button", { name: /complete quest/i });
    fireEvent.click(actionButtons[0]);

    await waitFor(() => {
      expect(completeCalled).toBe(true);
      expect(screen.getByText("1,100")).toBeInTheDocument();
    });
  });

  it("displays empty state if no quests exist in database", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlString = String(url);
      if (urlString.includes("/api/quests")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            quests: [],
            userProfile: { total_points: 0, streak_count: 0 },
          }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true }) } as Response);
    });

    render(<QuestsPage />);

    await waitFor(() => {
      expect(screen.getByText(/no quests found/i)).toBeInTheDocument();
    });
  });
});
