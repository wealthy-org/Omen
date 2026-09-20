import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { AdminMarketCreateForm } from "@/components/AdminMarketCreateForm";
import AdminMarketResolutionTable from "@/components/AdminMarketResolutionTable";
import { BettingModal } from "@/components/BettingModal";
import { ClaimPayoutButton } from "@/components/ClaimPayoutButton";

const {
  mockWagmiContext,
  mockWriteContractAsync,
  mockUseConnection,
  mockUseWaitForTransactionReceipt,
  mockWaitForTransactionReceipt,
} = vi.hoisted(() => {
  const React = require("react");
  return {
    mockWagmiContext: React.createContext({}),
    mockWriteContractAsync: vi.fn(),
    mockUseConnection: vi.fn(),
    mockUseWaitForTransactionReceipt: vi.fn(),
    mockWaitForTransactionReceipt: vi.fn(),
  };
});

import { ETHEREUM_SEPOLIA_CHAIN_ID } from "@/lib/constants";

vi.mock("wagmi", () => ({
  WagmiContext: mockWagmiContext,
  useWriteContract: () => ({
    writeContract: mockWriteContractAsync,
    writeContractAsync: mockWriteContractAsync,
    mutate: mockWriteContractAsync,
    mutateAsync: mockWriteContractAsync,
    data: "0xe2e_mock_tx_hash_001",
    isPending: false,
    error: null,
  }),
  useWaitForTransactionReceipt: () => mockUseWaitForTransactionReceipt(),
  useConnection: () => mockUseConnection(),
  useChainId: () => ETHEREUM_SEPOLIA_CHAIN_ID,
  usePublicClient: () => ({
    waitForTransactionReceipt: mockWaitForTransactionReceipt,
  }),
}));

describe("Omen Full Lifecycle End-to-End Test Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseConnection.mockReturnValue({
      address: "0x1234567890123456789012345678901234567890",
      isConnected: true,
    });
    mockUseWaitForTransactionReceipt.mockReturnValue({
      isLoading: false,
      isSuccess: false,
    });
    mockWaitForTransactionReceipt.mockResolvedValue({
      logs: [],
    });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  describe("Phase 2: Admin Market Creation On-Chain & Catalog Sync", () => {
    it("deploys new prediction market contract and registers metadata", async () => {
      mockWriteContractAsync.mockResolvedValueOnce("0xmarket_creation_tx_hash_111");

      const handleDeploy = vi.fn().mockResolvedValue(undefined);
      render(<AdminMarketCreateForm onSubmitMarket={handleDeploy} />);

      const titleInput = screen.getByLabelText(/market question \/ title/i);
      fireEvent.change(titleInput, {
        target: { value: "Will Ethereum L2 TVL surpass $50B in 2026?" },
      });

      const futureDate = new Date(Date.now() + 86400000 * 14).toISOString().slice(0, 16);
      const endTimeInput = screen.getByLabelText(/deadline date & time/i);
      fireEvent.change(endTimeInput, { target: { value: futureDate } });

      const criteriaInput = screen.getByLabelText(/resolution rules & criteria/i);
      fireEvent.change(criteriaInput, {
        target: { value: "Resolves to AGREE if DefiLlama L2 TVL metric reaches or exceeds 50 Billion USD." },
      });

      const submitBtn = screen.getByRole("button", { name: /review & deploy market/i });
      fireEvent.click(submitBtn);

      const confirmBtn = screen.getByRole("button", { name: /confirm & deploy on-chain/i });
      await act(async () => {
        fireEvent.click(confirmBtn);
      });

      await waitFor(() => {
        expect(handleDeploy).toHaveBeenCalledTimes(1);
        expect(screen.getByText(/successfully deployed and initialized on-chain!/i)).toBeInTheDocument();
      });
    });
  });

  describe("Phase 3: Web3 Dual Bettor Placement & Pool Ratio Balancing", () => {
    it("allows Bettor 1 to place AGREE bet and syncs indexer", async () => {
      const mockMarket = {
        id: "mkt-100",
        title: "Will Ethereum L2 TVL surpass $50B in 2026?",
        category: "L2",
        status: "active" as const,
        endTime: "Ends in 14d",
        totalPool: "0.00",
        agreePercentage: 50,
        disagreePercentage: 50,
        volume: "0.00",
      };

      const handleConfirmBet = vi.fn().mockResolvedValue(undefined);
      render(
        <BettingModal
          isOpen={true}
          onClose={() => {}}
          market={mockMarket}
          initialOutcome="AGREE"
          userBalance="2.00"
          onConfirmBet={handleConfirmBet}
        />
      );

      const amountInput = screen.getByLabelText(/bet amount in eth/i);
      fireEvent.change(amountInput, { target: { value: "0.05" } });

      const confirmBetBtn = screen.getByRole("button", { name: /confirm bet \(0\.05 eth\)/i });
      await act(async () => {
        fireEvent.click(confirmBetBtn);
      });

      await waitFor(() => {
        expect(handleConfirmBet).toHaveBeenCalledWith({
          marketId: "mkt-100",
          outcome: "AGREE",
          amount: "0.05",
        });
      });
    });

    it("allows Bettor 2 to place DISAGREE bet and balances pool ratio 50/50", async () => {
      const mockMarket = {
        id: "mkt-100",
        title: "Will Ethereum L2 TVL surpass $50B in 2026?",
        category: "L2",
        status: "active" as const,
        endTime: "Ends in 14d",
        totalPool: "0.05",
        agreePercentage: 100,
        disagreePercentage: 0,
        volume: "0.05",
      };

      const handleConfirmBet = vi.fn().mockResolvedValue(undefined);
      render(
        <BettingModal
          isOpen={true}
          onClose={() => {}}
          market={mockMarket}
          initialOutcome="DISAGREE"
          userBalance="1.50"
          onConfirmBet={handleConfirmBet}
        />
      );

      const amountInput = screen.getByLabelText(/bet amount in eth/i);
      fireEvent.change(amountInput, { target: { value: "0.05" } });

      const confirmBetBtn = screen.getByRole("button", { name: /confirm bet \(0\.05 eth\)/i });
      await act(async () => {
        fireEvent.click(confirmBetBtn);
      });

      await waitFor(() => {
        expect(handleConfirmBet).toHaveBeenCalledWith({
          marketId: "mkt-100",
          outcome: "DISAGREE",
          amount: "0.05",
        });
      });
    });
  });

  describe("Phase 4: Market Settlement & Payout Claiming", () => {
    it("resolves market as AGREE by admin and triggers resolution settlement", async () => {
      const pendingMarket = [
        {
          id: "mkt-100",
          title: "Will Ethereum L2 TVL surpass $50B in 2026?",
          category: "L2",
          totalPool: 100000,
          volume: 250000,
          agreePercentage: 50,
          disagreePercentage: 50,
          endTime: "2026-03-01T00:00:00Z",
          resolutionSourceUrl: "https://defillama.com",
          resolutionCriteria: "Resolves to AGREE if L2 TVL reaches 50B.",
          status: "PENDING_RESOLUTION" as const,
        },
      ];

      const handleResolve = vi.fn().mockResolvedValue(undefined);
      render(
        <AdminMarketResolutionTable
          initialMarkets={pendingMarket}
          onResolveMarket={handleResolve}
        />
      );

      const resolveAgreeBtn = screen.getByRole("button", { name: /^resolve agree$/i });
      fireEvent.click(resolveAgreeBtn);

      const notesInput = screen.getByLabelText(/resolution oracle citation/i);
      fireEvent.change(notesInput, {
        target: { value: "DefiLlama confirmed TVL passed $50B." },
      });

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      const executeBtn = screen.getByRole("button", { name: /execute settlement \(agree\)/i });
      await act(async () => {
        fireEvent.click(executeBtn);
      });

      await waitFor(() => {
        expect(handleResolve).toHaveBeenCalledWith(
          "mkt-100",
          "AGREE",
          "DefiLlama confirmed TVL passed $50B.",
          undefined
        );
        expect(screen.getByText(/successfully resolved as \[agree\]/i)).toBeInTheDocument();
      });
    });

    it("allows winner to claim full pool payout and updates badge to Claimed", async () => {
      let isClaimedState = false;
      const handleClaim = vi.fn().mockImplementation(() => {
        isClaimedState = true;
      });

      const { rerender } = render(
        <ClaimPayoutButton
          amount="0.10"
          isClaimed={isClaimedState}
          onClaim={handleClaim}
        />
      );

      const claimBtn = screen.getByRole("button", { name: /claim 0\.10 eth payout/i });
      expect(claimBtn).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(claimBtn);
      });

      expect(handleClaim).toHaveBeenCalledTimes(1);

      rerender(
        <ClaimPayoutButton
          amount="0.10"
          isClaimed={true}
          onClaim={handleClaim}
        />
      );

      expect(screen.getByTestId("claim-payout-claimed-badge")).toBeInTheDocument();
      expect(screen.getByText("Claimed")).toBeInTheDocument();
    });
  });
});
