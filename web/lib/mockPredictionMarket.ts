import type { MockMarketPool, MockBetRecord, MockTransactionResult } from "@/types";

export type { MockMarketPool, MockBetRecord, MockTransactionResult };

export const DEFAULT_DEMO_WALLET_ADDRESS: `0x${string}` =
  "0x71C6793F1e44f80879624Fe2d431c3c97A484B29";

export const INITIAL_VIRTUAL_BALANCE_ETH = 10.0;

class MockPredictionMarketEngine {
  private walletAddress: `0x${string}` = DEFAULT_DEMO_WALLET_ADDRESS;
  private virtualBalance: number = INITIAL_VIRTUAL_BALANCE_ETH;
  private pools: Map<number, MockMarketPool> = new Map();
  private bets: MockBetRecord[] = [];
  private nextMarketId: number = 101;
  private blockNumber: number = 18450100;

  constructor() {
    this.initDefaultPools();
  }

  private initDefaultPools() {
    this.pools.set(1, {
      marketId: 1,
      yesPool: 4.25,
      noPool: 1.75,
      totalPool: 6.0,
      status: "active",
    });
    this.pools.set(2, {
      marketId: 2,
      yesPool: 8.5,
      noPool: 3.5,
      totalPool: 12.0,
      status: "active",
    });
    this.pools.set(3, {
      marketId: 3,
      yesPool: 2.1,
      noPool: 0.9,
      totalPool: 3.0,
      status: "active",
    });
  }

  public isMockMode(): boolean {
    const envVal = process.env.NEXT_PUBLIC_USE_MOCK_CONTRACT;
    if (envVal === "false") {
      return false;
    }
    return true;
  }

  public getDemoWallet() {
    const envAddress = process.env.NEXT_PUBLIC_DEMO_WALLET_ADDRESS as
      | `0x${string}`
      | undefined;
    const address = envAddress || this.walletAddress;

    return {
      address,
      balance: this.virtualBalance,
      formattedBalance: `${this.virtualBalance.toFixed(4)} ETH`,
      chainId: 421614,
      chainName: "Arbitrum Sepolia (Mock Engine)",
    };
  }

  public setDemoWalletAddress(address: `0x${string}`) {
    this.walletAddress = address;
  }

  public getPool(marketId: number): MockMarketPool {
    const existing = this.pools.get(marketId);
    if (existing) {
      return { ...existing };
    }
    const fallback: MockMarketPool = {
      marketId,
      yesPool: 0,
      noPool: 0,
      totalPool: 0,
      status: "active",
    };
    this.pools.set(marketId, fallback);
    return fallback;
  }

  public async placeBet(params: {
    marketId: number;
    side: "YES" | "NO" | "yes" | "no";
    amountEth: string | number;
    userAddress?: string;
  }): Promise<{
    txHash: `0x${string}`;
    blockNumber: number;
    success: boolean;
    pool: MockMarketPool;
    remainingBalance: number;
  }> {
    const amount = typeof params.amountEth === "string" ? parseFloat(params.amountEth) : params.amountEth;
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Invalid bet amount");
    }

    if (amount > this.virtualBalance) {
      throw new Error("Insufficient virtual ETH balance");
    }

    const normalizedSide = params.side.toUpperCase() as "YES" | "NO";
    const marketId = params.marketId;
    const pool = this.getPool(marketId);

    if (pool.status !== "active") {
      throw new Error("Cannot bet on inactive or resolved market");
    }

    await new Promise((resolve) => setTimeout(resolve, 300));

    this.virtualBalance -= amount;
    if (normalizedSide === "YES") {
      pool.yesPool += amount;
    } else {
      pool.noPool += amount;
    }
    pool.totalPool = pool.yesPool + pool.noPool;
    this.pools.set(marketId, pool);

    this.blockNumber += 1;
    const txHash = this.generateTxHash();
    const walletAddress = params.userAddress || this.walletAddress;

    this.bets.push({
      txHash,
      marketId,
      walletAddress,
      side: normalizedSide,
      amountEth: amount,
      claimed: false,
      timestamp: new Date().toISOString(),
    });

    return {
      txHash,
      blockNumber: this.blockNumber,
      success: true,
      pool: { ...pool },
      remainingBalance: this.virtualBalance,
    };
  }

  public async claimPayout(params: {
    marketId: number;
    userAddress?: string;
  }): Promise<{
    txHash: `0x${string}`;
    claimedEth: number;
    success: boolean;
  }> {
    const pool = this.getPool(params.marketId);
    if (pool.status === "active") {
      throw new Error("Market is still active");
    }

    await new Promise((resolve) => setTimeout(resolve, 300));

    const simulatedPayout = 0.25;
    this.virtualBalance += simulatedPayout;
    this.blockNumber += 1;
    const txHash = this.generateTxHash();

    return {
      txHash,
      claimedEth: simulatedPayout,
      success: true,
    };
  }

  public async createMarket(params: {
    title: string;
    deadline: Date | string | number;
    category?: string;
    description?: string;
  }): Promise<{
    marketId: number;
    txHash: `0x${string}`;
    success: boolean;
  }> {
    if (!params.title || params.title.trim().length === 0) {
      throw new Error("Title cannot be empty");
    }

    await new Promise((resolve) => setTimeout(resolve, 300));

    const marketId = this.nextMarketId++;
    this.pools.set(marketId, {
      marketId,
      yesPool: 0,
      noPool: 0,
      totalPool: 0,
      status: "active",
    });

    this.blockNumber += 1;
    const txHash = this.generateTxHash();

    return {
      marketId,
      txHash,
      success: true,
    };
  }

  public async resolveMarket(params: {
    marketId: number;
    winningSide: "YES" | "NO" | boolean;
  }): Promise<{
    txHash: `0x${string}`;
    status: "resolved_yes" | "resolved_no";
    success: boolean;
  }> {
    const pool = this.getPool(params.marketId);
    if (pool.status !== "active") {
      throw new Error("Market is not in active state");
    }

    await new Promise((resolve) => setTimeout(resolve, 300));

    const isYes =
      typeof params.winningSide === "boolean"
        ? params.winningSide
        : params.winningSide.toUpperCase() === "YES";

    pool.status = isYes ? "resolved_yes" : "resolved_no";
    this.pools.set(params.marketId, pool);

    this.blockNumber += 1;
    const txHash = this.generateTxHash();

    return {
      txHash,
      status: pool.status,
      success: true,
    };
  }

  public async cancelMarket(params: {
    marketId: number;
    reason?: string;
  }): Promise<{
    txHash: `0x${string}`;
    status: "cancelled";
    success: boolean;
  }> {
    const pool = this.getPool(params.marketId);
    if (pool.status !== "active") {
      throw new Error("Market is not in active state");
    }

    await new Promise((resolve) => setTimeout(resolve, 300));

    pool.status = "cancelled";
    this.pools.set(params.marketId, pool);

    this.blockNumber += 1;
    const txHash = this.generateTxHash();

    return {
      txHash,
      status: "cancelled",
      success: true,
    };
  }

  public resetMockState() {
    this.walletAddress = DEFAULT_DEMO_WALLET_ADDRESS;
    this.virtualBalance = INITIAL_VIRTUAL_BALANCE_ETH;
    this.pools.clear();
    this.bets = [];
    this.nextMarketId = 101;
    this.blockNumber = 18450100;
    this.initDefaultPools();
  }

  private generateTxHash(): `0x${string}` {
    const hexChars = "0123456789abcdef";
    let hash = "0x";
    for (let i = 0; i < 64; i++) {
      hash += hexChars[Math.floor(Math.random() * hexChars.length)];
    }
    return hash as `0x${string}`;
  }
}

export const mockPredictionMarket = new MockPredictionMarketEngine();
