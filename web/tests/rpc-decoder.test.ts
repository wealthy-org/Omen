import { describe, it, expect, vi, beforeEach } from "vitest";
import { encodeFunctionData, parseEther } from "viem";
import fs from "node:fs";
import path from "node:path";
import {
  getPublicClientForChain,
  decodeRawCalldata,
  fetchAndDecodeTransaction,
} from "../lib/rpc-decoder";
import {
  ETHEREUM_SEPOLIA_CHAIN_ID,
  ROBINHOOD_TESTNET_CHAIN_ID,
} from "../lib/constants";
import OmenMarketJson from "../contracts/OmenMarket.json";
import OmenFactoryJson from "../contracts/OmenFactory.json";

describe("RPC Decoder & On-Chain Transaction Fetcher", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should adhere strictly to Zero-Comment Policy in rpc-decoder.ts", () => {
    const filePath = path.resolve(process.cwd(), "lib/rpc-decoder.ts");
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        expect(trimmed.startsWith("/" + "/")).toBe(false);
        expect(trimmed.startsWith("/" + "*")).toBe(false);
        expect(trimmed.includes("*" + "/")).toBe(false);
      }
    }
  });

  it("should return public client for Sepolia and Robinhood", () => {
    const sepoliaClient = getPublicClientForChain(ETHEREUM_SEPOLIA_CHAIN_ID);
    expect(sepoliaClient.chain?.id).toBe(ETHEREUM_SEPOLIA_CHAIN_ID);

    const robinhoodClient = getPublicClientForChain(ROBINHOOD_TESTNET_CHAIN_ID);
    expect(robinhoodClient.chain?.id).toBe(ROBINHOOD_TESTNET_CHAIN_ID);
  });

  it("should decode depositAgree function calldata", () => {
    const calldata = encodeFunctionData({
      abi: OmenMarketJson as any,
      functionName: "depositAgree",
      args: [],
    });

    const result = decodeRawCalldata(calldata);
    expect(result).not.toBeNull();
    expect(result?.functionName).toBe("depositAgree()");
    expect(result?.params).toHaveLength(0);
  });

  it("should decode depositDisagree function calldata", () => {
    const calldata = encodeFunctionData({
      abi: OmenMarketJson as any,
      functionName: "depositDisagree",
      args: [],
    });

    const result = decodeRawCalldata(calldata);
    expect(result).not.toBeNull();
    expect(result?.functionName).toBe("depositDisagree()");
    expect(result?.params).toHaveLength(0);
  });

  it("should decode claimPayout function calldata", () => {
    const calldata = encodeFunctionData({
      abi: OmenMarketJson as any,
      functionName: "claimPayout",
      args: [],
    });

    const result = decodeRawCalldata(calldata);
    expect(result).not.toBeNull();
    expect(result?.functionName).toBe("claimPayout()");
  });

  it("should decode createMarket function calldata from OmenFactory", () => {
    const dummyHash = "0x1111111111111111111111111111111111111111111111111111111111111111";
    const dummyConfig = {
      resType: 0,
      assetAFeed: "0x0000000000000000000000000000000000000001",
      assetBFeed: "0x0000000000000000000000000000000000000002",
      targetPrice: 400000000000n,
      startTimestamp: 1791244800n,
      endTimestamp: 1792454400n,
    };

    const calldata = encodeFunctionData({
      abi: OmenFactoryJson as any,
      functionName: "createMarket",
      args: [
        dummyHash,
        dummyHash,
        dummyHash,
        1791244800n,
        1792454400n,
        dummyConfig,
      ],
    });

    const result = decodeRawCalldata(calldata);
    expect(result).not.toBeNull();
    expect(result?.functionName).toBe("createMarket()");
    expect(result?.params.length).toBeGreaterThan(0);
  });

  it("should handle invalid transaction hash format gracefully", async () => {
    const result = await fetchAndDecodeTransaction("invalid-hash", ETHEREUM_SEPOLIA_CHAIN_ID);
    expect(result.foundOnRpc).toBe(false);
    expect(result.status).toBe("unknown");
    expect(result.errorMessage).toBe("Invalid transaction hash format.");
  });

  it("should return not found result when RPC returns null transaction and receipt", async () => {
    const randomHash = "0x9999999999999999999999999999999999999999999999999999999999999999";
    const result = await fetchAndDecodeTransaction(randomHash, ETHEREUM_SEPOLIA_CHAIN_ID);
    expect(result.foundOnRpc).toBe(false);
    expect(result.chainId).toBe(ETHEREUM_SEPOLIA_CHAIN_ID);
  });
});
