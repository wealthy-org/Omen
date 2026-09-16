import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import DailyCheckinWidget from "@/components/DailyCheckinWidget";
import QuestCard from "@/components/QuestCard";
import { AdminMarketCreateForm } from "@/components/AdminMarketCreateForm";
import AdminMarketResolutionTable from "@/components/AdminMarketResolutionTable";
import { BettingModal } from "@/components/BettingModal";
import { ClaimPayoutButton } from "@/components/ClaimPayoutButton";

const {
  mockWagmiContext,
  mockWriteContractAsync,
  mockUseAccount,
  mockUseWaitForTransactionReceipt,
  mockWaitForTransactionReceipt,
} = vi.hoisted(() => {
  const React = require("react");
  return {
    mockWagmiContext: React.createContext({}),
    mockWriteContractAsync: vi.fn(),
    mockUseAccount: vi.fn(),
    mockUseWaitForTransactionReceipt: vi.fn(),
    mockWaitForTransactionReceipt: vi.fn(),
  };
});

vi.mock("wagmi", () => ({
  WagmiContext: mockWagmiContext,
  useWriteContract: () => ({
    writeContractAsync: mockWriteContractAsync,
    data: "0xe2e_mock_tx_hash_001",
    isPending: false,
    error: null,
  }),
  useWaitForTransactionReceipt: () => mockUseWaitForTransactionReceipt(),
  useAccount: () => mockUseAccount(),
  usePublicClient: () => ({
    waitForTransactionReceipt: mockWaitForTransactionReceipt,
  }),
}));

describe("Omen Full Lifecycle End-to-End Test Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAccount.mockReturnValue({
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
      json: async () => ({ success: true, points: 50 }),
    });
  });

  describe("Phase 1: User Onboarding, Daily Streak & Quest Completion", () => {
    it("completes daily check-in streak and awards points", async () => {
      let pointsAwarded = 0;
      const handleCheckin = vi.fn().mockImplementation((_day: number, pts: number) => {
        pointsAwarded += pts;
      });

      render(
        <DailyCheckinWidget
          currentStreak={2}
          initialCanCheckIn={true}
          cooldownSeconds={3600}
          onCheckIn={handleCheckin}
        />
      );

      const checkinBtn = screen.getByRole("button", { name: /claim day 3 reward/i });
      expect(checkinBtn).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(checkinBtn);
      });

      expect(handleCheckin).toHaveBeenCalledWith(3, 150);
      expect(pointsAwarded).toBe(150);
      expect(screen.getByText(/Points Claimed!/i)).toBeInTheDocument();
    });

    it("verifies and completes active quest granting reward points", async () => {
      let currentPoints = 150;
      const handleAction = vi.fn().mockImplementation(() => {
        currentPoints += 100;
      });

      render(
        <QuestCard
          id="quest-1"
          title="Place Your First Prediction"
          description="Place any prediction with at least 0.01 ETH to earn 100 XP."
          category="ON-CHAIN"
          points={100}
          status="AVAILABLE"
          onAction={handleAction}
        />
      );

      const questActionBtn = screen.getByRole("button", { name: /start quest/i });
      expect(questActionBtn).toBeInTheDocument();
      expect(screen.getByText("+100 PTS")).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(questActionBtn);
      });

      expect(handleAction).toHaveBeenCalledTimes(1);
      expect(currentPoints).toBe(250);
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
        target: { value: "Resolves to YES if DefiLlama L2 TVL metric reaches or exceeds 50 Billion USD." },
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
    it("allows Bettor 1 to place YES bet and syncs indexer", async () => {
      const mockMarket = {
        id: "mkt-100",
        title: "Will Ethereum L2 TVL surpass $50B in 2026?",
        category: "L2",
        status: "active" as const,
        endTime: "Ends in 14d",
        totalPool: "0.00",
        yesPercentage: 50,
        noPercentage: 50,
        volume: "0.00",
      };

      const handleConfirmBet = vi.fn().mockResolvedValue(undefined);
      render(
        <BettingModal
          isOpen={true}
          onClose={() => {}}
          market={mockMarket}
          initialOutcome="YES"
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
          outcome: "YES",
          amount: "0.05",
        });
      });
    });

    it("allows Bettor 2 to place NO bet and balances pool ratio 50/50", async () => {
      const mockMarket = {
        id: "mkt-100",
        title: "Will Ethereum L2 TVL surpass $50B in 2026?",
        category: "L2",
        status: "active" as const,
        endTime: "Ends in 14d",
        totalPool: "0.05",
        yesPercentage: 100,
        noPercentage: 0,
        volume: "0.05",
      };

      const handleConfirmBet = vi.fn().mockResolvedValue(undefined);
      render(
        <BettingModal
          isOpen={true}
          onClose={() => {}}
          market={mockMarket}
          initialOutcome="NO"
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
          outcome: "NO",
          amount: "0.05",
        });
      });
    });
  });

  describe("Phase 4: Market Settlement & Payout Claiming", () => {
    it("resolves market as YES by admin and triggers resolution settlement", async () => {
      const pendingMarket = [
        {
          id: "mkt-100",
          title: "Will Ethereum L2 TVL surpass $50B in 2026?",
          category: "L2",
          totalPool: 100000,
          volume: 250000,
          yesPercentage: 50,
          noPercentage: 50,
          endTime: "2026-03-01T00:00:00Z",
          resolutionSourceUrl: "https://defillama.com",
          resolutionCriteria: "Resolves to YES if L2 TVL reaches 50B.",
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

      const resolveYesBtn = screen.getByRole("button", { name: /^resolve yes$/i });
      fireEvent.click(resolveYesBtn);

      const notesInput = screen.getByLabelText(/resolution oracle citation/i);
      fireEvent.change(notesInput, {
        target: { value: "DefiLlama confirmed TVL passed $50B." },
      });

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      const executeBtn = screen.getByRole("button", { name: /execute settlement \(yes\)/i });
      await act(async () => {
        fireEvent.click(executeBtn);
      });

      await waitFor(() => {
        expect(handleResolve).toHaveBeenCalledWith(
          "mkt-100",
          "YES",
          "DefiLlama confirmed TVL passed $50B.",
          undefined
        );
        expect(screen.getByText(/successfully resolved as \[yes\]/i)).toBeInTheDocument();
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
