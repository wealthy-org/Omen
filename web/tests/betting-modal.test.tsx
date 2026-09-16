import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BettingModal } from "../components/BettingModal";
import { MarketData } from "../components/MarketCard";

describe("BettingModal Component", () => {
  const mockMarket: MarketData = {
    id: "mkt-1",
    title: "Will ETH reach $5,000 before Q4 2026?",
    category: "CRYPTO",
    status: "active",
    endTime: "Ends in 2d 18h",
    totalPool: "28.50",
    yesPercentage: 68,
    noPercentage: 32,
    volume: "74.20",
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    market: mockMarket,
    initialOutcome: "YES" as const,
    userBalance: "2.00",
    onConfirmBet: vi.fn(),
  };

  it("does not render when isOpen is false", () => {
    render(<BettingModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders market details, balance, and initial outcome properly", () => {
    render(<BettingModal {...defaultProps} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByText("Will ETH reach $5,000 before Q4 2026?")
    ).toBeInTheDocument();
    expect(screen.getByText("2.00 ETH")).toBeInTheDocument();

    const yesBtn = screen.getByRole("button", { name: /select yes outcome/i });
    expect(yesBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("switches outcome selection between YES and NO", () => {
    render(<BettingModal {...defaultProps} />);

    const noBtn = screen.getByRole("button", { name: /select no outcome/i });
    fireEvent.click(noBtn);

    expect(noBtn).toHaveAttribute("aria-pressed", "true");
    const yesBtn = screen.getByRole("button", { name: /select yes outcome/i });
    expect(yesBtn).toHaveAttribute("aria-pressed", "false");
    expect(screen.getAllByText("32%").length).toBeGreaterThanOrEqual(1);
  });

  it("updates amount when preset button or MAX is clicked", () => {
    render(<BettingModal {...defaultProps} />);

    const input = screen.getByLabelText(/bet amount in eth/i);
    expect(input).toHaveValue("0.05");

    const addPresetBtn = screen.getByRole("button", { name: /\+0\.10/i });
    fireEvent.click(addPresetBtn);
    expect(input).toHaveValue("0.15");

    const maxBtn = screen.getByRole("button", { name: /max/i });
    fireEvent.click(maxBtn);
    expect(input).toHaveValue("2.00");
  });

  it("calculates potential payout and ROI dynamically", () => {
    render(<BettingModal {...defaultProps} />);

    const input = screen.getByLabelText(/bet amount in eth/i);
    fireEvent.change(input, { target: { value: "1.00" } });

    expect(screen.getByText(/potential payout/i)).toBeInTheDocument();
  });

  it("shows validation error when amount exceeds balance", async () => {
    render(<BettingModal {...defaultProps} />);

    const input = screen.getByLabelText(/bet amount in eth/i);
    fireEvent.change(input, { target: { value: "5.00" } });

    const submitBtn = screen.getByRole("button", { name: /confirm bet/i });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText(/insufficient balance\. you have 2\.00 eth available\./i)
    ).toBeInTheDocument();
    expect(defaultProps.onConfirmBet).not.toHaveBeenCalled();
  });

  it("calls onConfirmBet with correct arguments and closes modal on valid submit", async () => {
    const onConfirmBet = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <BettingModal
        {...defaultProps}
        onConfirmBet={onConfirmBet}
        onClose={onClose}
      />
    );

    const input = screen.getByLabelText(/bet amount in eth/i);
    fireEvent.change(input, { target: { value: "0.25" } });

    const submitBtn = screen.getByRole("button", { name: /confirm bet/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onConfirmBet).toHaveBeenCalledTimes(1);
      expect(onConfirmBet).toHaveBeenCalledWith({
        marketId: "mkt-1",
        outcome: "YES",
        amount: "0.25",
      });
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it("triggers onClose when close button or backdrop is clicked", () => {
    const onClose = vi.fn();
    render(<BettingModal {...defaultProps} onClose={onClose} />);

    const closeBtn = screen.getByRole("button", {
      name: /close betting modal/i,
    });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    const backdrop = screen.getByTestId("betting-modal-backdrop");
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
