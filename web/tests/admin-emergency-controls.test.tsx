import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AdminEmergencyControls from "../components/AdminEmergencyControls";

describe("AdminEmergencyControls Component", () => {
  it("renders emergency governance controls and audit logs", () => {
    render(<AdminEmergencyControls />);

    expect(
      screen.getByRole("heading", { name: /protocol circuit breakers & resolution overrides/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /global protocol pause/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /emergency market void/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /governance circuit breaker audit log/i })
    ).toBeInTheDocument();
  });

  it("requires justification before opening confirmation modal", () => {
    render(<AdminEmergencyControls />);

    const pauseBtn = screen.getByRole("button", {
      name: /trigger global circuit breaker/i,
    });
    fireEvent.click(pauseBtn);

    expect(
      screen.getByText(/a documented security or governance justification is required/i)
    ).toBeInTheDocument();
  });

  it("executes circuit breaker pause after confirming modal", async () => {
    render(<AdminEmergencyControls />);

    const reasonInput = screen.getByLabelText(/pause protocol justification/i);
    fireEvent.change(reasonInput, {
      target: { value: "Security inspection of smart contract pools" },
    });

    const pauseBtn = screen.getByRole("button", {
      name: /trigger global circuit breaker/i,
    });
    fireEvent.click(pauseBtn);

    expect(
      screen.getByRole("heading", { name: /confirm emergency governance execution/i })
    ).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", {
      name: /confirm & execute/i,
    });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/protocol status updated: global pause enabled/i)
      ).toBeInTheDocument();
    });
  });

  it("executes emergency void and refunds market", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
      }),
    } as any);

    render(<AdminEmergencyControls />);

    const targetInput = screen.getByLabelText(/void target market id/i);
    fireEvent.change(targetInput, {
      target: { value: "market-test-123" },
    });

    const voidReasonInput = screen.getByPlaceholderText(/e\.g\., routine smart contract migration/i);
    fireEvent.change(voidReasonInput, {
      target: { value: "Disputed resolution criteria void" },
    });

    const voidBtn = screen.getByRole("button", {
      name: /void market & refund collateral/i,
    });
    fireEvent.click(voidBtn);

    const confirmBtn = screen.getByRole("button", {
      name: /confirm & execute/i,
    });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/market market-test-123 successfully voided/i)
      ).toBeInTheDocument();
    });
  });
});
