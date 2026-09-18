import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AdminDashboardPage from "../app/admin/page";

describe("AdminDashboardPage Component", () => {
  it("renders Admin Login Portal when wallet is unauthorized or not connected", () => {
    render(<AdminDashboardPage initialConnectedAddress="" />);

    expect(
      screen.getByRole("heading", { name: /admin authentication/i })
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/admin whitelist wallet address/i)
    ).toBeInTheDocument();
  });

  it("shows error in login portal when attempting unauthorized wallet address", async () => {
    render(
      <AdminDashboardPage initialConnectedAddress="" />
    );

    const input = screen.getByLabelText(/admin whitelist wallet address/i);
    fireEvent.change(input, {
      target: { value: "0x8888888888888888888888888888888888888888" },
    });

    const submitBtn = screen.getByRole("button", {
      name: /authenticate admin wallet/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/access denied: wallet address 0x8888888888888888888888888888888888888888 is not recognized/i)
      ).toBeInTheDocument();
    });
  });

  it("authorizes and displays Admin Dashboard after successful login", async () => {
    render(<AdminDashboardPage initialConnectedAddress="" />);

    const quickFillBtn = screen.getByRole("button", {
      name: /use demo admin/i,
    });
    fireEvent.click(quickFillBtn);

    const submitBtn = screen.getByRole("button", {
      name: /authenticate admin wallet/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /admin dashboard/i })
      ).toBeInTheDocument();
      expect(screen.getByText(/admin authorized/i)).toBeInTheDocument();
    });
  });

  it("renders metrics overview and default Create Market tab with live badges for authorized admin", () => {
    render(
      <AdminDashboardPage initialConnectedAddress="0x1234567890abcdef1234567890abcdef12345678" />
    );

    expect(
      screen.getByRole("heading", { name: /admin dashboard/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: /admin metrics overview/i })
    ).toBeInTheDocument();

    expect(screen.getByText("Total Markets Created")).toBeInTheDocument();
    expect(screen.getByText("Beliefs Pipeline")).toBeInTheDocument();
    expect(screen.getByText("Oracle Price Feeds")).toBeInTheDocument();
    expect(screen.getByText("Pending Resolutions")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /create prediction market/i })
    ).toBeInTheDocument();
  });

  it("switches to Social Belief Pipeline tab and renders pipeline monitor", () => {
    render(
      <AdminDashboardPage initialConnectedAddress="0x1234567890abcdef1234567890abcdef12345678" />
    );

    const beliefsTab = screen.getByRole("button", {
      name: /social belief pipeline/i,
    });
    fireEvent.click(beliefsTab);

    expect(
      screen.getByRole("heading", { name: /belief markets lifecycle monitor/i })
    ).toBeInTheDocument();
  });

  it("switches to Chainlink Oracle Monitor tab and renders feeds monitor", () => {
    render(
      <AdminDashboardPage initialConnectedAddress="0x1234567890abcdef1234567890abcdef12345678" />
    );

    const oracleTab = screen.getByRole("button", {
      name: /chainlink oracle monitor/i,
    });
    fireEvent.click(oracleTab);

    expect(
      screen.getByRole("heading", { name: /oracle pipeline & live feeds monitor/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /trigger oracle snapshot/i })
    ).toBeInTheDocument();
  });

  it("switches to Resolve Expired Markets tab and renders resolution table", () => {
    render(
      <AdminDashboardPage initialConnectedAddress="0x1234567890abcdef1234567890abcdef12345678" />
    );

    const resolveMarketsTab = screen.getByRole("button", {
      name: /resolve expired markets/i,
    });
    fireEvent.click(resolveMarketsTab);

    expect(
      screen.getByRole("heading", {
        name: /expired markets pending resolution/i,
      })
    ).toBeInTheDocument();
  });

  it("switches to Emergency Governance tab and renders circuit breakers", () => {
    render(
      <AdminDashboardPage initialConnectedAddress="0x1234567890abcdef1234567890abcdef12345678" />
    );

    const emergencyTab = screen.getByRole("button", {
      name: /emergency governance/i,
    });
    fireEvent.click(emergencyTab);

    expect(
      screen.getByRole("heading", { name: /protocol circuit breakers & resolution overrides/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /global protocol pause/i })
    ).toBeInTheDocument();
  });

  it("disconnects admin session and returns to login portal", () => {
    render(
      <AdminDashboardPage initialConnectedAddress="0x1234567890abcdef1234567890abcdef12345678" />
    );

    const disconnectBtn = screen.getByRole("button", {
      name: /disconnect admin session/i,
    });
    fireEvent.click(disconnectBtn);

    expect(
      screen.getByRole("heading", { name: /admin authentication/i })
    ).toBeInTheDocument();
  });
});
