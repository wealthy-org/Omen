import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  MarketCategoryFilter,
  MARKET_CATEGORIES,
  MARKET_SORT_OPTIONS,
} from "../components/MarketCategoryFilter";

describe("MarketCategoryFilter Component", () => {
  const defaultProps = {
    selectedCategory: "all",
    onSelectCategory: vi.fn(),
    searchQuery: "",
    onSearchChange: vi.fn(),
    sortBy: "highest-pool",
    onSortChange: vi.fn(),
  };

  it("renders all category pills and active indicator properly", () => {
    render(<MarketCategoryFilter {...defaultProps} />);

    MARKET_CATEGORIES.forEach((cat) => {
      expect(screen.getByText(cat.label)).toBeInTheDocument();
    });

    const allMarketsBtn = screen.getByRole("button", { name: /all markets/i });
    expect(allMarketsBtn).toHaveAttribute("aria-pressed", "true");

    const trendingBtn = screen.getByRole("button", { name: /trending/i });
    expect(trendingBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onSelectCategory when clicking on a category pill", () => {
    const onSelectCategory = vi.fn();
    render(
      <MarketCategoryFilter
        {...defaultProps}
        onSelectCategory={onSelectCategory}
      />
    );

    const cryptoBtn = screen.getByRole("button", { name: /crypto narratives/i });
    fireEvent.click(cryptoBtn);

    expect(onSelectCategory).toHaveBeenCalledTimes(1);
    expect(onSelectCategory).toHaveBeenCalledWith("crypto");
  });

  it("renders search input, calls onSearchChange on typing and clear button click", () => {
    const onSearchChange = vi.fn();
    const { rerender } = render(
      <MarketCategoryFilter
        {...defaultProps}
        searchQuery=""
        onSearchChange={onSearchChange}
      />
    );

    const input = screen.getByLabelText(/search prediction markets/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("");

    fireEvent.change(input, { target: { value: "Bitcoin ETF" } });
    expect(onSearchChange).toHaveBeenCalledWith("Bitcoin ETF");

    rerender(
      <MarketCategoryFilter
        {...defaultProps}
        searchQuery="Bitcoin ETF"
        onSearchChange={onSearchChange}
      />
    );

    const clearBtn = screen.getByRole("button", { name: /clear search/i });
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);
    expect(onSearchChange).toHaveBeenCalledWith("");
  });

  it("renders sort select dropdown and triggers onSortChange on option selection", () => {
    const onSortChange = vi.fn();
    render(
      <MarketCategoryFilter
        {...defaultProps}
        sortBy="highest-pool"
        onSortChange={onSortChange}
      />
    );

    const select = screen.getByLabelText(/sort prediction markets/i);
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue("highest-pool");

    MARKET_SORT_OPTIONS.forEach((opt) => {
      expect(screen.getByRole("option", { name: opt.label })).toBeInTheDocument();
    });

    fireEvent.change(select, { target: { value: "ending-soon" } });
    expect(onSortChange).toHaveBeenCalledWith("ending-soon");
  });

  it("renders category count badges if provided in props", () => {
    const counts = {
      all: 24,
      trending: 8,
      crypto: 12,
    };

    render(
      <MarketCategoryFilter
        {...defaultProps}
        marketCounts={counts}
      />
    );

    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });
});
