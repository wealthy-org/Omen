import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import QuestsPage from "@/app/quests/page";

describe("QuestsPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders main heading, points summary balance, and daily check-in section", () => {
    render(<QuestsPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /quests & points farming/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/2,450/i)).toBeInTheDocument();
    expect(screen.getByText("PTS")).toBeInTheDocument();
    expect(screen.getByText("Tier II • Silver Hunter")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /daily check-in streak/i })).toBeInTheDocument();
  });

  it("renders all category filter buttons and defaults to All Quests", () => {
    render(<QuestsPage />);

    expect(screen.getByRole("button", { name: /all quests/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /onboarding/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /social/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /on-chain/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /daily/i })).toBeInTheDocument();

    expect(screen.getByText("Follow @OmenPredict on X")).toBeInTheDocument();
    expect(screen.getByText("Place Your First Market Prediction")).toBeInTheDocument();
  });

  it("filters quest list by category when tab is clicked", () => {
    render(<QuestsPage />);

    const socialFilterBtn = screen.getByRole("button", { name: /social/i });
    fireEvent.click(socialFilterBtn);

    expect(screen.getByText("Follow @OmenPredict on X")).toBeInTheDocument();
    expect(screen.getByText("Join Official Discord Community")).toBeInTheDocument();
    expect(
      screen.queryByText("Place Your First Market Prediction")
    ).not.toBeInTheDocument();
  });

  it("completes a quest on button action click and updates accumulated balance", async () => {
    render(<QuestsPage />);

    const faucetActionBtn = screen.getByRole("button", { name: /claim faucet/i });
    await act(async () => {
      fireEvent.click(faucetActionBtn);
    });

    await waitFor(() => {
      expect(screen.getByText("2,600")).toBeInTheDocument();
    });
  });
});
