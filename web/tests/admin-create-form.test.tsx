import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AdminMarketCreateForm } from "../components/AdminMarketCreateForm";

describe("AdminMarketCreateForm Component", () => {
  it("renders all form input fields and live card preview", () => {
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
      screen.getByLabelText(/resolution oracle \/ source url/i)
    ).toBeInTheDocument();

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

  it("displays validation error when submitting with a past deadline date", async () => {
    render(<AdminMarketCreateForm />);

    const titleInput = screen.getByLabelText(/market question \/ title/i);
    fireEvent.change(titleInput, {
      target: { value: "Will BTC reach $200k?" },
    });

    const endTimeInput = screen.getByLabelText(/deadline date & time/i);
    fireEvent.change(endTimeInput, {
      target: { value: "2020-01-01T12:00" },
    });

    const submitBtn = screen.getByRole("button", {
      name: /publish market to blockchain/i,
    });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText(/market deadline must be set in the future/i)
    ).toBeInTheDocument();
  });

  it("submits valid form data to onSubmitMarket callback", async () => {
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

    const oracleInput = screen.getByLabelText(/resolution oracle \/ source url/i);
    fireEvent.change(oracleInput, {
      target: { value: "https://defillama.com" },
    });

    const submitBtn = screen.getByRole("button", {
      name: /publish market to blockchain/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmitMarket).toHaveBeenCalledTimes(1);
      expect(onSubmitMarket).toHaveBeenCalledWith({
        title: "Will Ethereum L2 TVL surpass $100B in 2026?",
        category: "CRYPTO",
        endTime: futureDate,
        resolutionSourceUrl: "https://defillama.com",
        initialLiquidity: "0.50",
      });
      expect(
        screen.getByText(/published successfully to testnet!/i)
      ).toBeInTheDocument();
    });
  });
});
