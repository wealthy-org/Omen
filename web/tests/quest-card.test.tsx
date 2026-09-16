import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import QuestCard from "@/components/QuestCard";

describe("QuestCard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders quest details, category badge, and reward points", () => {
    render(
      <QuestCard
        id="quest-1"
        title="Connect Web3 Wallet"
        description="Connect your Phantom EVM wallet to initialize your Omen account."
        category="ONBOARDING"
        points={100}
        status="AVAILABLE"
        actionLabel="Connect Now"
      />
    );

    expect(screen.getByRole("article", { name: /quest: connect web3 wallet/i })).toBeInTheDocument();
    expect(screen.getByText("ONBOARDING")).toBeInTheDocument();
    expect(screen.getByText("Connect Web3 Wallet")).toBeInTheDocument();
    expect(
      screen.getByText("Connect your Phantom EVM wallet to initialize your Omen account.")
    ).toBeInTheDocument();
    expect(screen.getByText("+100 PTS")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /connect now/i })).toBeInTheDocument();
  });

  it("triggers action and transitions to verifying and completed states", async () => {
    const onActionMock = vi.fn();
    const onVerifyMock = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 50))
    );

    render(
      <QuestCard
        id="quest-2"
        title="Follow @OmenPredict on X"
        description="Stay updated with protocol announcements."
        category="SOCIAL"
        points={250}
        status="AVAILABLE"
        actionLabel="Follow on X"
        onAction={onActionMock}
        onVerify={onVerifyMock}
      />
    );

    const actionButton = screen.getByRole("button", { name: /follow on x/i });
    await act(async () => {
      fireEvent.click(actionButton);
    });

    expect(onActionMock).toHaveBeenCalledWith("quest-2");
    expect(onVerifyMock).toHaveBeenCalledWith("quest-2");
    await waitFor(() => {
      expect(screen.getByText("Completed")).toBeInTheDocument();
    });
  });

  it("renders verifying state with spinner", () => {
    render(
      <QuestCard
        id="quest-3"
        title="Place First Prediction"
        description="Bet at least 0.01 ETH on any active market."
        category="ON-CHAIN"
        points={500}
        status="VERIFYING"
      />
    );

    expect(screen.getByRole("button", { name: /verifying\.\.\./i })).toBeDisabled();
  });

  it("renders completed state with checkmark badge", () => {
    render(
      <QuestCard
        id="quest-4"
        title="Claim Daily Check-in"
        description="Keep your streak alive today."
        category="DAILY"
        points={50}
        status="COMPLETED"
      />
    );

    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /start quest/i })).not.toBeInTheDocument();
  });
});
