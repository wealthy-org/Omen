import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AdminMarketCreateForm } from "../components/AdminMarketCreateForm";

describe("AdminMarketCreateForm Component", () => {
  it("renders all form input fields, AMM calculation, and live card preview", () => {
    render(<AdminMarketCreateForm />);

    expect(
      screen.getByRole("heading", { name: /create prediction market/i })
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/market question \/ title/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/deadline date & time/i)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/initial liquidity seed/i)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/resolution oracle \/ proof url/i)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/resolution rules & criteria/i)
    ).toBeInTheDocument();

    expect(screen.getByText(/automated market maker \(amm\) seed calculation/i)).toBeInTheDocument();
    expect(screen.getByTestId("live-market-preview")).toBeInTheDocument();
  });

  it("updates live preview card dynamically as user types title and chooses category", () => {
    render(<AdminMarketCreateForm />);

    const titleInput = screen.getByLabelText(/market question \/ title/i);
    fireEvent.change(titleInput, {
      target: { value: "Will Solana hit $1,000 in 2026?" },
    });

    const categorySelect = screen.getByLabelText(/category/i);
    fireEvent.change(categorySelect, { target: { value: "TRENDING" } });

    const previewContainer = screen.getByTestId("live-market-preview");
    expect(previewContainer).toHaveTextContent(
      "Will Solana hit $1,000 in 2026?"
    );
    expect(previewContainer).toHaveTextContent("TRENDING");
  });

  it("displays inline validation errors when submitting with invalid fields", async () => {
    render(<AdminMarketCreateForm />);

    const submitBtn = screen.getByRole("button", {
      name: /review & deploy market/i,
    });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText(/market question\/title is required/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/please select a market deadline date and time/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/detailed resolution criteria and rules are required/i)
    ).toBeInTheDocument();
  });

  it("displays validation error when submitting with a past deadline date", async () => {
    render(<AdminMarketCreateForm />);

    const titleInput = screen.getByLabelText(/market question \/ title/i);
    fireEvent.change(titleInput, {
      target: { value: "Will BTC reach $200k in 2026?" },
    });

    const endTimeInput = screen.getByLabelText(/deadline date & time/i);
    fireEvent.change(endTimeInput, {
      target: { value: "2020-01-01T12:00" },
    });

    const criteriaInput = screen.getByLabelText(/resolution rules & criteria/i);
    fireEvent.change(criteriaInput, {
      target: { value: "Resolves to YES if BTC trades above $200,000 on Coinbase before Dec 31." },
    });

    const submitBtn = screen.getByRole("button", {
      name: /review & deploy market/i,
    });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText(/market deadline must be set at least 1 hour into the future/i)
    ).toBeInTheDocument();
  });

  it("validates oracle URL format when non-web URL is entered", () => {
    render(<AdminMarketCreateForm />);

    const titleInput = screen.getByLabelText(/market question \/ title/i);
    fireEvent.change(titleInput, {
      target: { value: "Will Ethereum gas stay low?" },
    });

    const futureDate = new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16);
    const endTimeInput = screen.getByLabelText(/deadline date & time/i);
    fireEvent.change(endTimeInput, { target: { value: futureDate } });

    const criteriaInput = screen.getByLabelText(/resolution rules & criteria/i);
    fireEvent.change(criteriaInput, {
      target: { value: "Resolves to YES if median gas is under 15 gwei across all major L2 rollups." },
    });

    const oracleInput = screen.getByLabelText(/resolution oracle \/ proof url/i);
    fireEvent.change(oracleInput, { target: { value: "invalid-url-string" } });

    const submitBtn = screen.getByRole("button", {
      name: /review & deploy market/i,
    });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText(/please provide a valid web url for the resolution oracle/i)
    ).toBeInTheDocument();
  });

  it("opens review modal and submits valid form data to onSubmitMarket callback", async () => {
    const onSubmitMarket = vi.fn().mockResolvedValue(undefined);
    render(<AdminMarketCreateForm onSubmitMarket={onSubmitMarket} />);

    const titleInput = screen.getByLabelText(/market question \/ title/i);
    fireEvent.change(titleInput, {
      target: { value: "Will Ethereum L2 TVL surpass $100B in 2026?" },
    });

    const futureDate = new Date(Date.now() + 86400000 * 7)
      .toISOString()
      .slice(0, 16);
    const endTimeInput = screen.getByLabelText(/deadline date & time/i);
    fireEvent.change(endTimeInput, { target: { value: futureDate } });

    const oracleInput = screen.getByLabelText(/resolution oracle \/ proof url/i);
    fireEvent.change(oracleInput, {
      target: { value: "https://defillama.com" },
    });

    const criteriaInput = screen.getByLabelText(/resolution rules & criteria/i);
    fireEvent.change(criteriaInput, {
      target: { value: "Resolves to YES if DefiLlama L2 TVL metric exceeds 100 Billion USD." },
    });

    const reviewBtn = screen.getByRole("button", {
      name: /review & deploy market/i,
    });
    fireEvent.click(reviewBtn);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /confirm prediction market deployment/i })
    ).toBeInTheDocument();

    const confirmDeployBtn = screen.getByRole("button", {
      name: /confirm & deploy on-chain/i,
    });
    fireEvent.click(confirmDeployBtn);

    await waitFor(() => {
      expect(onSubmitMarket).toHaveBeenCalledTimes(1);
      expect(onSubmitMarket).toHaveBeenCalledWith({
        title: "Will Ethereum L2 TVL surpass $100B in 2026?",
        category: "CRYPTO",
        endTime: futureDate,
        resolutionSourceUrl: "https://defillama.com",
        resolutionCriteria: "Resolves to YES if DefiLlama L2 TVL metric exceeds 100 Billion USD.",
        initialLiquidity: "0.50",
      });
      expect(
        screen.getByText(/successfully deployed and initialized on-chain!/i)
      ).toBeInTheDocument();
    });
  });

  it("resets form when clicking Clear Form button", () => {
    render(<AdminMarketCreateForm />);

    const titleInput = screen.getByLabelText(/market question \/ title/i);
    fireEvent.change(titleInput, { target: { value: "Draft Market Title" } });
    expect(titleInput).toHaveValue("Draft Market Title");

    const clearBtn = screen.getByRole("button", { name: /clear form/i });
    fireEvent.click(clearBtn);

    expect(titleInput).toHaveValue("");
  });
});
