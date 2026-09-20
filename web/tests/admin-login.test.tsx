import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AdminLoginForm from "../components/AdminLoginForm";

const MOCK_AUTHORIZED_ADMINS = [
  "0x1234567890abcdef1234567890abcdef12345678".toLowerCase(),
];

describe("AdminLoginForm Component", () => {
  it("renders portal header, tabs, and wallet input by default", () => {
    const onLoginSuccess = vi.fn();
    render(
      <AdminLoginForm
        onLoginSuccess={onLoginSuccess}
        authorizedAddresses={MOCK_AUTHORIZED_ADMINS}
      />
    );

    expect(
      screen.getByRole("heading", { name: /admin authentication/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^admin wallet$/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /master key/i })
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/admin whitelist wallet address/i)
    ).toBeInTheDocument();
  });

  it("shows validation error when submitting empty wallet address", async () => {
    const onLoginSuccess = vi.fn();
    render(
      <AdminLoginForm
        onLoginSuccess={onLoginSuccess}
        authorizedAddresses={MOCK_AUTHORIZED_ADMINS}
      />
    );

    const submitBtn = screen.getByRole("button", {
      name: /authenticate admin wallet/i,
    });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText(/please enter an administrative web3 wallet address/i)
    ).toBeInTheDocument();
  });

  it("shows error for invalid EVM address format", async () => {
    const onLoginSuccess = vi.fn();
    render(
      <AdminLoginForm
        onLoginSuccess={onLoginSuccess}
        authorizedAddresses={MOCK_AUTHORIZED_ADMINS}
      />
    );

    const input = screen.getByLabelText(/admin whitelist wallet address/i);
    fireEvent.change(input, { target: { value: "invalid-address-format" } });

    const submitBtn = screen.getByRole("button", {
      name: /authenticate admin wallet/i,
    });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText(/invalid evm address format/i)
    ).toBeInTheDocument();
  });

  it("shows access denied error when wallet is not authorized", async () => {
    const onLoginSuccess = vi.fn();
    render(
      <AdminLoginForm
        onLoginSuccess={onLoginSuccess}
        authorizedAddresses={MOCK_AUTHORIZED_ADMINS}
      />
    );

    const input = screen.getByLabelText(/admin whitelist wallet address/i);
    fireEvent.change(input, {
      target: { value: "0x0000000000000000000000000000000000000001" },
    });

    const submitBtn = screen.getByRole("button", {
      name: /authenticate admin wallet/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/access denied: wallet address 0x0000000000000000000000000000000000000001 is not recognized/i)
      ).toBeInTheDocument();
      expect(onLoginSuccess).not.toHaveBeenCalled();
    });
  });

  it("authenticates successfully with authorized wallet address", async () => {
    const onLoginSuccess = vi.fn();
    render(
      <AdminLoginForm
        onLoginSuccess={onLoginSuccess}
        authorizedAddresses={MOCK_AUTHORIZED_ADMINS}
      />
    );

    const input = screen.getByLabelText(/admin whitelist wallet address/i);
    fireEvent.change(input, {
      target: { value: "0x1234567890abcdef1234567890abcdef12345678" },
    });

    const submitBtn = screen.getByRole("button", {
      name: /authenticate admin wallet/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onLoginSuccess).toHaveBeenCalledWith(
        "0x1234567890abcdef1234567890abcdef12345678"
      );
    });
  });

  it("switches to Master Key tab and validates required key length", async () => {
    const onLoginSuccess = vi.fn();
    render(
      <AdminLoginForm
        onLoginSuccess={onLoginSuccess}
        authorizedAddresses={MOCK_AUTHORIZED_ADMINS}
      />
    );

    const masterKeyTab = screen.getByRole("button", { name: /master key/i });
    fireEvent.click(masterKeyTab);

    expect(
      screen.getByLabelText(/master secret passphrase/i)
    ).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", {
      name: /unlock admin portal/i,
    });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText(/administrator master access key is required/i)
    ).toBeInTheDocument();

    const keyInput = screen.getByLabelText(/master secret passphrase/i);
    fireEvent.change(keyInput, { target: { value: "123" } });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText(/must be at least 6 characters/i)
    ).toBeInTheDocument();
  });

  it("shows error on wrong master key and authenticates on valid master key", async () => {
    const onLoginSuccess = vi.fn();
    render(
      <AdminLoginForm
        onLoginSuccess={onLoginSuccess}
        authorizedAddresses={MOCK_AUTHORIZED_ADMINS}
        validMasterKeys={["omen-admin-2026"]}
      />
    );

    const masterKeyTab = screen.getByRole("button", { name: /master key/i });
    fireEvent.click(masterKeyTab);

    const keyInput = screen.getByLabelText(/master secret passphrase/i);
    fireEvent.change(keyInput, { target: { value: "wrong-password-999" } });

    const submitBtn = screen.getByRole("button", {
      name: /unlock admin portal/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/invalid administrative access key/i)
      ).toBeInTheDocument();
      expect(onLoginSuccess).not.toHaveBeenCalled();
    });

    fireEvent.change(keyInput, { target: { value: "omen-admin-2026" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onLoginSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it("toggles password visibility with show/hide button", () => {
    const onLoginSuccess = vi.fn();
    render(
      <AdminLoginForm
        onLoginSuccess={onLoginSuccess}
        authorizedAddresses={MOCK_AUTHORIZED_ADMINS}
      />
    );

    const masterKeyTab = screen.getByRole("button", { name: /master key/i });
    fireEvent.click(masterKeyTab);

    const keyInput = screen.getByLabelText(/master secret passphrase/i);
    expect(keyInput).toHaveAttribute("type", "password");

    const toggleBtn = screen.getByRole("button", { name: /show password/i });
    fireEvent.click(toggleBtn);
    expect(keyInput).toHaveAttribute("type", "text");

    const hideBtn = screen.getByRole("button", { name: /hide password/i });
    fireEvent.click(hideBtn);
    expect(keyInput).toHaveAttribute("type", "password");
  });

  it("fills demo credentials with quick fill button", () => {
    const onLoginSuccess = vi.fn();
    render(
      <AdminLoginForm
        onLoginSuccess={onLoginSuccess}
        authorizedAddresses={MOCK_AUTHORIZED_ADMINS}
      />
    );

    const quickFillBtn = screen.getByRole("button", {
      name: /use demo admin/i,
    });
    fireEvent.click(quickFillBtn);

    const walletInput = screen.getByLabelText(
      /admin whitelist wallet address/i
    );
    expect(walletInput).toHaveValue(
      "0x1234567890abcdef1234567890abcdef12345678"
    );
  });
});
