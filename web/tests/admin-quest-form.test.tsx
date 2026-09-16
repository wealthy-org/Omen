import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AdminQuestManagementForm, { AdminQuestItem } from "../components/AdminQuestManagementForm";

const MOCK_QUESTS: AdminQuestItem[] = [
  {
    id: "quest-1",
    title: "Connect Web3 Wallet",
    description: "Connect your Web3 crypto wallet to Omen prediction platform",
    category: "ONBOARDING",
    points: 100,
    isActive: true,
  },
  {
    id: "quest-2",
    title: "Follow Omen on X (Twitter)",
    description: "Follow official @OmenMarket account on X to receive platform alpha",
    category: "SOCIAL",
    points: 150,
    isActive: false,
  },
];

describe("AdminQuestManagementForm Component", () => {
  it("renders form inputs and existing quests table", () => {
    render(<AdminQuestManagementForm initialQuests={MOCK_QUESTS} />);

    expect(screen.getByRole("heading", { name: /create new quest/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /manage existing quests/i })).toBeInTheDocument();

    expect(screen.getByLabelText(/quest title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description & instructions/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/points reward/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/action target url/i)).toBeInTheDocument();

    expect(screen.getByText("Connect Web3 Wallet")).toBeInTheDocument();
    expect(screen.getByText("Follow Omen on X (Twitter)")).toBeInTheDocument();
  });

  it("shows error validation when submitting empty required fields", async () => {
    render(<AdminQuestManagementForm initialQuests={MOCK_QUESTS} />);

    const submitBtn = screen.getByRole("button", { name: /create quest/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/quest title is required/i)).toBeInTheDocument();
  });

  it("validates that points reward must be a positive integer", async () => {
    render(<AdminQuestManagementForm initialQuests={MOCK_QUESTS} />);

    const titleInput = screen.getByLabelText(/quest title/i);
    const descInput = screen.getByLabelText(/description & instructions/i);
    const pointsInput = screen.getByLabelText(/points reward/i);

    fireEvent.change(titleInput, { target: { value: "Test Quest" } });
    fireEvent.change(descInput, { target: { value: "Test Description" } });
    fireEvent.change(pointsInput, { target: { value: "-50" } });

    const submitBtn = screen.getByRole("button", { name: /create quest/i });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText(/points reward must be a positive integer greater than 0/i)
    ).toBeInTheDocument();
  });

  it("creates a new quest and triggers onCreateQuest callback", async () => {
    const onCreateQuest = vi.fn().mockResolvedValue(undefined);
    render(
      <AdminQuestManagementForm
        initialQuests={MOCK_QUESTS}
        onCreateQuest={onCreateQuest}
      />
    );

    const titleInput = screen.getByLabelText(/quest title/i);
    const descInput = screen.getByLabelText(/description & instructions/i);
    const categorySelect = screen.getByLabelText(/category/i);
    const pointsInput = screen.getByLabelText(/points reward/i);
    const actionUrlInput = screen.getByLabelText(/action target url/i);

    fireEvent.change(titleInput, { target: { value: "Join Discord Community" } });
    fireEvent.change(descInput, {
      target: { value: "Join our discord server and verify role" },
    });
    fireEvent.change(categorySelect, { target: { value: "SOCIAL" } });
    fireEvent.change(pointsInput, { target: { value: "250" } });
    fireEvent.change(actionUrlInput, { target: { value: "https://discord.gg/omen" } });

    const submitBtn = screen.getByRole("button", { name: /create quest/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onCreateQuest).toHaveBeenCalledTimes(1);
      expect(onCreateQuest).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Join Discord Community",
          description: "Join our discord server and verify role",
          category: "SOCIAL",
          points: 250,
          actionUrl: "https://discord.gg/omen",
          isActive: true,
        })
      );
      expect(
        screen.getByText(/quest "Join Discord Community" created successfully!/i)
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Join Discord Community")).toBeInTheDocument();
    expect(screen.getByText("+250 PTS")).toBeInTheDocument();
  });

  it("toggles quest status and calls onToggleQuestStatus", async () => {
    const onToggleQuestStatus = vi.fn().mockResolvedValue(undefined);
    render(
      <AdminQuestManagementForm
        initialQuests={MOCK_QUESTS}
        onToggleQuestStatus={onToggleQuestStatus}
      />
    );

    const toggleBtn = screen.getByLabelText(/toggle status for connect web3 wallet/i);
    expect(toggleBtn).toHaveAttribute("aria-checked", "true");

    fireEvent.click(toggleBtn);

    await waitFor(() => {
      expect(onToggleQuestStatus).toHaveBeenCalledWith("quest-1", false);
      expect(toggleBtn).toHaveAttribute("aria-checked", "false");
    });
  });

  it("filters existing quests with search bar", () => {
    render(<AdminQuestManagementForm initialQuests={MOCK_QUESTS} />);

    const searchInput = screen.getByLabelText(/search quests/i);
    fireEvent.change(searchInput, { target: { value: "Twitter" } });

    expect(screen.getByText("Follow Omen on X (Twitter)")).toBeInTheDocument();
    expect(screen.queryByText("Connect Web3 Wallet")).not.toBeInTheDocument();
  });

  it("filters quests by active / inactive filter buttons", () => {
    render(<AdminQuestManagementForm initialQuests={MOCK_QUESTS} />);

    const inactiveBtn = screen.getByRole("button", { name: /inactive/i });
    fireEvent.click(inactiveBtn);

    expect(screen.getByText("Follow Omen on X (Twitter)")).toBeInTheDocument();
    expect(screen.queryByText("Connect Web3 Wallet")).not.toBeInTheDocument();

    const activeBtn = screen.getByRole("button", { name: /^active \(/i });
    fireEvent.click(activeBtn);

    expect(screen.getByText("Connect Web3 Wallet")).toBeInTheDocument();
    expect(screen.queryByText("Follow Omen on X (Twitter)")).not.toBeInTheDocument();
  });
});
