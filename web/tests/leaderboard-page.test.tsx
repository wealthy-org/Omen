import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LeaderboardPage from "@/app/leaderboard/page";

describe("LeaderboardPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders main heading, personal ranking cards, and leaderboard table", () => {
    render(<LeaderboardPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /points leaderboard/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Your Current Rank")).toBeInTheDocument();
    expect(screen.getByText("Your Total Points")).toBeInTheDocument();
    expect(screen.getByText("Gap to Next Tier")).toBeInTheDocument();

    expect(screen.getAllByText("#4").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/52,300/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("region", { name: /points leaderboard/i })).toBeInTheDocument();
  });

  it("filters leaderboard list based on search query", () => {
    render(<LeaderboardPage />);

    const searchInput = screen.getByPlaceholderText(/search by ens name or 0x/i);
    fireEvent.change(searchInput, { target: { value: "oracle-king.eth" } });

    expect(screen.getByText("oracle-king.eth")).toBeInTheDocument();
    expect(screen.queryByText("arbitrum-whale.eth")).not.toBeInTheDocument();
    expect(screen.queryByText("satoshi-prophet.eth")).not.toBeInTheDocument();
  });

  it("clears search input when clear button is clicked", () => {
    render(<LeaderboardPage />);

    const searchInput = screen.getByPlaceholderText(/search by ens name or 0x/i);
    fireEvent.change(searchInput, { target: { value: "arbitrum-whale.eth" } });

    const clearBtn = screen.getByRole("button", { name: /clear search/i });
    fireEvent.click(clearBtn);

    expect(searchInput).toHaveValue("");
    expect(screen.getByText("oracle-king.eth")).toBeInTheDocument();
    expect(screen.getByText("arbitrum-whale.eth")).toBeInTheDocument();
  });
});
