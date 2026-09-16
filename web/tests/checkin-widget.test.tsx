import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import DailyCheckinWidget from "@/components/DailyCheckinWidget";

describe("DailyCheckinWidget Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders 7-day grid with correct checked, active, and locked states", () => {
    render(
      <DailyCheckinWidget
        currentStreak={2}
        totalDays={7}
        streakMultiplier="1.5x Multiplier Active"
        initialCanCheckIn={true}
      />
    );

    expect(screen.getByRole("region", { name: /daily check-in streak/i })).toBeInTheDocument();
    expect(screen.getByText("1.5x Multiplier Active")).toBeInTheDocument();
    expect(screen.getByText("2-Day Streak Active • Day 7 unlocks 3.0x Max Multiplier Vault")).toBeInTheDocument();

    expect(screen.getByText("Day 1")).toBeInTheDocument();
    expect(screen.getByText("Day 2")).toBeInTheDocument();
    expect(screen.getByText("Day 3")).toBeInTheDocument();
    expect(screen.getByText("Day 7")).toBeInTheDocument();

    const claimedBadges = screen.getAllByText("Claimed");
    expect(claimedBadges.length).toBe(2);

    expect(screen.getByText("Today")).toBeInTheDocument();

    const lockedBadges = screen.getAllByText("Locked");
    expect(lockedBadges.length).toBe(4);
  });

  it("handles claim interaction and transitions to countdown cooldown state", async () => {
    vi.useFakeTimers();
    const onCheckInMock = vi.fn();

    render(
      <DailyCheckinWidget
        currentStreak={2}
        initialCanCheckIn={true}
        cooldownSeconds={3600}
        onCheckIn={onCheckInMock}
      />
    );

    const claimButton = screen.getByRole("button", {
      name: /claim day 3 reward/i,
    });
    expect(claimButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(claimButton);
    });

    expect(onCheckInMock).toHaveBeenCalledWith(3, 150);
    expect(screen.getByText(/Points Claimed!/i)).toBeInTheDocument();
    expect(screen.getByText(/Next Check-in in 1h 00m 00s/i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText(/Next Check-in in 0h 59m 58s/i)).toBeInTheDocument();
  });

  it("renders countdown cooldown timer when initialCanCheckIn is false", () => {
    render(
      <DailyCheckinWidget
        currentStreak={3}
        initialCanCheckIn={false}
        cooldownSeconds={51730}
      />
    );

    expect(screen.queryByRole("button", { name: /claim day/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Next Check-in in 14h 22m 10s/i)).toBeInTheDocument();
  });
});
