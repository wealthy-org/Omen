import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react";
import { useCreatorConfirm } from "../hooks/useCreatorConfirm";
import { CreatorConfirmation } from "../components/CreatorConfirmation";

const mocks = vi.hoisted(() => ({
  signTypedDataAsyncMock: vi.fn().mockResolvedValue("0xMockSignatureValidEIP712"),
  accountAddress: "0x1234567890123456789012345678901234567890",
}));

vi.mock("wagmi", () => ({
  useAccount: () => ({
    address: mocks.accountAddress,
    isConnected: true,
  }),
  useChainId: () => 11155111,
  useSignTypedData: () => ({
    signTypedData: mocks.signTypedDataAsyncMock,
    signTypedDataAsync: mocks.signTypedDataAsyncMock,
    mutate: mocks.signTypedDataAsyncMock,
    mutateAsync: mocks.signTypedDataAsyncMock,
    isPending: false,
  }),
}));

describe("Creator Confirmation EIP-712 (Hook & Component)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  it("executes useCreatorConfirm hook and produces signature", async () => {
    const { result } = renderHook(() => useCreatorConfirm());

    let sigResult: { signature: string } | undefined;
    await act(async () => {
      sigResult = await result.current.confirmBelief({
        beliefId: "belief-99",
        statement: "ETH reaches $5k",
      });
    });

    expect(sigResult?.signature).toBeDefined();
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.signature).toBe(sigResult?.signature);
  });

  it("renders CreatorConfirmation component and allows signing", async () => {
    const onConfirmedMock = vi.fn();

    render(
      <CreatorConfirmation
        beliefId="belief-99"
        statement="ETH reaches $5k"
        authorHandle="vitalik"
        creatorAddress="0x1234567890123456789012345678901234567890"
        onConfirmed={onConfirmedMock}
      />
    );

    expect(screen.getByText(/@vitalik/i)).toBeInTheDocument();
    const btn = screen.getByRole("button", { name: /Confirm Belief/i });
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByText(/EIP-712 Authenticated/i)).toBeInTheDocument();
    });

    expect(onConfirmedMock).toHaveBeenCalled();
  });

  it("renders already confirmed state directly", () => {
    render(
      <CreatorConfirmation
        beliefId="belief-100"
        statement="Already signed belief"
        authorHandle="elonmusk"
        isConfirmed={true}
      />
    );

    expect(screen.getByText(/EIP-712 Authenticated/i)).toBeInTheDocument();
    expect(screen.getByText(/Confirmed by @elonmusk/i)).toBeInTheDocument();
  });
});
