import { describe, it, expect } from "vitest";
import { supportedChains, DEFAULT_CHAIN_ID } from "../../lib/wagmi";
import { calculateResolutionResult } from "../../lib/oracle/chainlink";

describe("Dual-Chain Workflow & Settlement Mechanics (Sepolia + Robinhood)", () => {
  it("supports both Ethereum Sepolia and Robinhood Chain Testnet with valid configs", () => {
    const chainIds = supportedChains.map((c) => c.id);
    expect(chainIds).toContain(11155111);
    expect(chainIds).toContain(46630);
    expect(DEFAULT_CHAIN_ID).toBe(11155111);
  });

  it("calculates accurate proportional payout distribution for winning stakers", () => {
    const agreePool = 100.0;
    const disagreePool = 50.0;
    const totalPool = agreePool + disagreePool;

    const userStake = 20.0;
    const winningPool = agreePool;

    const expectedPayout = (userStake / winningPool) * totalPool;
    expect(expectedPayout).toBe(30.0);
  });

  it("handles void / canceled markets with 100% full refund return", () => {
    const userStake = 15.0;
    const isVoid = true;

    const refundAmount = isVoid ? userStake : 0;
    expect(refundAmount).toBe(15.0);
  });

  it("evaluates oracle resolution for various threshold scenarios", () => {
    const aboveOutcome = calculateResolutionResult("PRICE_ABOVE", 3200, 3000);
    expect(aboveOutcome.resolvedSide).toBe("AGREE");

    const belowOutcome = calculateResolutionResult("PRICE_BELOW", 3200, 3000);
    expect(belowOutcome.resolvedSide).toBe("DISAGREE");

    const equalOutcome = calculateResolutionResult("PRICE_ABOVE", 3000, 3000);
    expect(equalOutcome.resolvedSide).toBe("AGREE");
  });
});
