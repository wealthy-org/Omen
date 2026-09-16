import { describe, it, expect, beforeEach } from "vitest";
import {
  mockPredictionMarket,
  DEFAULT_DEMO_WALLET_ADDRESS,
  INITIAL_VIRTUAL_BALANCE_ETH,
} from "../lib/mockPredictionMarket";

describe("MockPredictionMarket Engine", () => {
  beforeEach(() => {
    mockPredictionMarket.resetMockState();
  });

  it("initializes with default demo wallet and initial balance", () => {
    const wallet = mockPredictionMarket.getDemoWallet();
    expect(wallet.address).toBe(DEFAULT_DEMO_WALLET_ADDRESS);
    expect(wallet.balance).toBe(INITIAL_VIRTUAL_BALANCE_ETH);
    expect(wallet.chainId).toBe(421614);
    expect(mockPredictionMarket.isMockMode()).toBe(true);
  });

  it("allows setting custom demo wallet address", () => {
    const customAddress = "0x1234567890123456789012345678901234567890" as `0x${string}`;
    mockPredictionMarket.setDemoWalletAddress(customAddress);
    expect(mockPredictionMarket.getDemoWallet().address).toBe(customAddress);
  });

  it("handles placing a bet on YES and NO properly", async () => {
    const resYes = await mockPredictionMarket.placeBet({
      marketId: 1,
      side: "YES",
      amountEth: 0.5,
    });

    expect(resYes.success).toBe(true);
    expect(resYes.txHash).toMatch(/^0x[a-f0-9]{64}$/);
    expect(resYes.pool.yesPool).toBe(4.75);
    expect(resYes.remainingBalance).toBe(INITIAL_VIRTUAL_BALANCE_ETH - 0.5);

    const resNo = await mockPredictionMarket.placeBet({
      marketId: 1,
      side: "NO",
      amountEth: "1.0",
    });

    expect(resNo.success).toBe(true);
    expect(resNo.pool.noPool).toBe(2.75);
    expect(resNo.pool.totalPool).toBe(4.75 + 2.75);
    expect(resNo.remainingBalance).toBe(INITIAL_VIRTUAL_BALANCE_ETH - 1.5);
  });

  it("rejects invalid bet amounts or insufficient balance", async () => {
    await expect(
      mockPredictionMarket.placeBet({
        marketId: 1,
        side: "YES",
        amountEth: 0,
      })
    ).rejects.toThrow("Invalid bet amount");

    await expect(
      mockPredictionMarket.placeBet({
        marketId: 1,
        side: "YES",
        amountEth: 999.0,
      })
    ).rejects.toThrow("Insufficient virtual ETH balance");
  });

  it("handles creating a new market", async () => {
    const res = await mockPredictionMarket.createMarket({
      title: "Will ETH reach $5,000 by End of Year?",
      deadline: new Date(Date.now() + 86400000 * 30),
      category: "CRYPTO",
    });

    expect(res.success).toBe(true);
    expect(res.marketId).toBe(101);
    expect(res.txHash).toMatch(/^0x[a-f0-9]{64}$/);

    const createdPool = mockPredictionMarket.getPool(101);
    expect(createdPool.status).toBe("active");
    expect(createdPool.totalPool).toBe(0);
  });

  it("handles market resolution and rejection of betting on resolved market", async () => {
    const res = await mockPredictionMarket.resolveMarket({
      marketId: 1,
      winningSide: "YES",
    });

    expect(res.success).toBe(true);
    expect(res.status).toBe("resolved_yes");

    await expect(
      mockPredictionMarket.placeBet({
        marketId: 1,
        side: "YES",
        amountEth: 0.1,
      })
    ).rejects.toThrow("Cannot bet on inactive or resolved market");
  });

  it("handles emergency market cancellation", async () => {
    const res = await mockPredictionMarket.cancelMarket({
      marketId: 2,
      reason: "Oracle failure",
    });

    expect(res.success).toBe(true);
    expect(res.status).toBe("cancelled");
    expect(mockPredictionMarket.getPool(2).status).toBe("cancelled");
  });

  it("handles claiming payout for non-active market", async () => {
    await mockPredictionMarket.resolveMarket({
      marketId: 3,
      winningSide: "YES",
    });

    const res = await mockPredictionMarket.claimPayout({
      marketId: 3,
    });

    expect(res.success).toBe(true);
    expect(res.claimedEth).toBe(0.25);
    expect(res.txHash).toMatch(/^0x[a-f0-9]{64}$/);
  });
});
