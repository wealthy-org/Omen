import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ClaimPayoutButton } from "../components/ClaimPayoutButton";

describe("ClaimPayoutButton Component", () => {
  it("renders claimable button with correct amount and icon", () => {
    render(<ClaimPayoutButton amount="0.45" />);

    const button = screen.getByRole("button", { name: /claim 0\.45 eth payout/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Claim 0.45 ETH");
    expect(button).not.toBeDisabled();
  });

  it("calls onClaim callback when clicked and shows claiming state", async () => {
    let resolvePromise: () => void;
    const promise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    const onClaim = vi.fn().mockImplementation(() => promise);

    render(<ClaimPayoutButton amount="1.20" onClaim={onClaim} />);

    const button = screen.getByRole("button", { name: /claim 1\.20 eth payout/i });
    fireEvent.click(button);

    expect(onClaim).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Claiming...")).toBeInTheDocument();
    expect(button).toBeDisabled();

    resolvePromise!();
    await waitFor(() => {
      expect(screen.getByText("Claim 1.20 ETH")).toBeInTheDocument();
    });
  });

  it("renders claimed badge when isClaimed is true", () => {
    render(<ClaimPayoutButton amount="0.80" isClaimed={true} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByTestId("claim-payout-claimed-badge")).toBeInTheDocument();
    expect(screen.getByText("Claimed")).toBeInTheDocument();
  });

  it("does not trigger onClaim when disabled is true", () => {
    const onClaim = vi.fn();
    render(<ClaimPayoutButton amount="0.50" disabled={true} onClaim={onClaim} />);

    const button = screen.getByRole("button", { name: /claim 0\.50 eth payout/i });
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(onClaim).not.toHaveBeenCalled();
  });

  it("renders with marketId and triggers claim payout flow", async () => {
    render(<ClaimPayoutButton amount="0.75" marketId="1" />);
    const button = screen.getByRole("button", { name: /claim 0\.75 eth payout/i });
    expect(button).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(button);
    });
  });
});
