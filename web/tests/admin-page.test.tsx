import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AdminDashboardPage from "../app/admin/page";

describe("AdminDashboardPage Component", () => {
  it("renders Admin Login Portal when wallet is unauthorized or not connected", () => {
    render(<AdminDashboardPage initialConnectedAddress="" />);

    expect(
      screen.getByRole("heading", { name: /protocol admin portal/i })
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
      name: /use demo admin credentials/i,
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

  it("renders metrics overview and default Create Market tab for authorized admin", () => {
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
    expect(screen.getByText("Configured Quests")).toBeInTheDocument();
    expect(screen.getByText("Pending Resolutions")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /create prediction market/i })
    ).toBeInTheDocument();
  });

  it("switches to Manage Quests tab and renders quest management panel", () => {
    render(
      <AdminDashboardPage initialConnectedAddress="0x1234567890abcdef1234567890abcdef12345678" />
    );

    const manageQuestsTab = screen.getByRole("button", {
      name: /manage quests/i,
    });
    fireEvent.click(manageQuestsTab);

    expect(
      screen.getByRole("heading", { name: /create new quest/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /manage existing quests/i })
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

  it("disconnects admin session and returns to login portal", () => {
    render(
      <AdminDashboardPage initialConnectedAddress="0x1234567890abcdef1234567890abcdef12345678" />
    );

    const disconnectBtn = screen.getByRole("button", {
      name: /disconnect admin session/i,
    });
    fireEvent.click(disconnectBtn);

    expect(
      screen.getByRole("heading", { name: /protocol admin portal/i })
    ).toBeInTheDocument();
  });
});
