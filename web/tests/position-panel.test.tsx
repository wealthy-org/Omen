import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PositionPanel from "@/components/PositionPanel";

describe("PositionPanel Component", () => {
  const defaultProps = {
    marketId: "market-101",
    marketStatement: "Will Ethereum exceed $4000 in Q4?",
    agreePool: 100,
    disagreePool: 50,
    userBalance: "2.50",
    onConfirmPosition: vi.fn().mockResolvedValue(undefined),
  };

  it("renders AGREE and DISAGREE side selectors and default preset", () => {
    render(<PositionPanel {...defaultProps} />);

    expect(screen.getByRole("button", { name: /Select AGREE side/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Select DISAGREE side/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue("0.05")).toBeInTheDocument();
    expect(screen.getByText(/Balance:/i)).toBeInTheDocument();
    expect(screen.getByText(/2.50 ETH/i)).toBeInTheDocument();
  });

  it("switches side when DISAGREE is clicked", () => {
    render(<PositionPanel {...defaultProps} />);

    const disagreeBtn = screen.getByRole("button", { name: /Select DISAGREE side/i });
    fireEvent.click(disagreeBtn);

    expect(disagreeBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("updates amount with preset and MAX buttons", () => {
    render(<PositionPanel {...defaultProps} />);

    const input = screen.getByLabelText(/Position Amount/i);
    const preset01 = screen.getByRole("button", { name: /\+0\.10/i });
    fireEvent.click(preset01);
    expect(input).toHaveValue("0.15");

    const maxBtn = screen.getByRole("button", { name: /MAX/i });
    fireEvent.click(maxBtn);
    expect(input).toHaveValue("2.50");
  });

  it("validates zero amount and insufficient balance", async () => {
    render(<PositionPanel {...defaultProps} userBalance="0.10" />);

    const input = screen.getByLabelText(/Position Amount/i);
    fireEvent.change(input, { target: { value: "0" } });

    const submitBtn = screen.getByRole("button", { name: /Place Position/i });
    fireEvent.click(submitBtn);
    expect(screen.getByText(/greater than 0/i)).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "0.50" } });
    fireEvent.click(submitBtn);
    expect(screen.getByText(/Insufficient balance/i)).toBeInTheDocument();
  });

  it("submits position with chosen side and amount", async () => {
    const onConfirmMock = vi.fn().mockResolvedValue(undefined);
    render(<PositionPanel {...defaultProps} onConfirmPosition={onConfirmMock} />);

    const agreeBtn = screen.getByRole("button", { name: /Select AGREE side/i });
    fireEvent.click(agreeBtn);

    const input = screen.getByLabelText(/Position Amount/i);
    fireEvent.change(input, { target: { value: "0.20" } });

    const submitBtn = screen.getByRole("button", { name: /Place Position/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onConfirmMock).toHaveBeenCalledWith({
        marketId: "market-101",
        side: "AGREE",
        amount: "0.20",
      });
    });
  });

  it("shows loading state when isSubmitting is active", () => {
    render(<PositionPanel {...defaultProps} isSubmitting={true} />);

    expect(screen.getByText(/Processing Position\.\.\./i)).toBeInTheDocument();
  });
});
