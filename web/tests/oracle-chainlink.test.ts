import { describe, it, expect, vi } from "vitest";
import {
  normalizeChainlinkPrice,
  evaluateResolution,
  getLatestPrice,
  CHAINLINK_SEPOLIA_FEEDS,
} from "@/lib/oracle/chainlink";

describe("Chainlink Oracle Module", () => {
  it("normalizes Chainlink 8-decimal and 18-decimal price formats", () => {
    const ethPrice8 = normalizeChainlinkPrice(BigInt("350050000000"), 8);
    expect(ethPrice8).toBe(3500.5);

    const tokenPrice18 = normalizeChainlinkPrice(BigInt("1500000000000000000"), 18);
    expect(tokenPrice18).toBe(1.5);
  });

  describe("evaluateResolution", () => {
    it("evaluates PRICE_ABOVE conditions correctly", () => {
      expect(
        evaluateResolution({
          type: "PRICE_ABOVE",
          targetPrice: 4000,
          endPriceA: 4050,
        })
      ).toBe("AGREE_WON");

      expect(
        evaluateResolution({
          type: "PRICE_ABOVE",
          targetPrice: 4000,
          endPriceA: 3950,
        })
      ).toBe("DISAGREE_WON");
    });

    it("evaluates PRICE_BELOW conditions correctly", () => {
      expect(
        evaluateResolution({
          type: "PRICE_BELOW",
          targetPrice: 2000,
          endPriceA: 1950,
        })
      ).toBe("AGREE_WON");

      expect(
        evaluateResolution({
          type: "PRICE_BELOW",
          targetPrice: 2000,
          endPriceA: 2050,
        })
      ).toBe("DISAGREE_WON");
    });

    it("evaluates RELATIVE_PERFORMANCE conditions correctly", () => {
      expect(
        evaluateResolution({
          type: "RELATIVE_PERFORMANCE",
          startPriceA: 100,
          endPriceA: 120,
          startPriceB: 1000,
          endPriceB: 1100,
        })
      ).toBe("AGREE_WON");

      expect(
        evaluateResolution({
          type: "RELATIVE_PERFORMANCE",
          startPriceA: 100,
          endPriceA: 105,
          startPriceB: 1000,
          endPriceB: 1150,
        })
      ).toBe("DISAGREE_WON");
    });
  });

  describe("getLatestPrice", () => {
    it("fetches and normalizes price from Viem public client", async () => {
      const mockClient = {
        readContract: vi
          .fn()
          .mockResolvedValueOnce([
            BigInt(1),
            BigInt("350000000000"),
            BigInt(0),
            BigInt(Math.floor(Date.now() / 1000)),
            BigInt(1),
          ])
          .mockResolvedValueOnce(8),
      };

      const res = await getLatestPrice(
        mockClient as any,
        CHAINLINK_SEPOLIA_FEEDS.ETH_USD
      );

      expect(res.price).toBe(3500);
      expect(res.decimals).toBe(8);
      expect(res.rawAnswer).toBe(BigInt("350000000000"));
    });

    it("throws error if price data is stale", async () => {
      const staleTime = BigInt(Math.floor(Date.now() / 1000) - 7200);
      const mockClient = {
        readContract: vi
          .fn()
          .mockResolvedValueOnce([BigInt(1), BigInt("350000000000"), BigInt(0), staleTime, BigInt(1)])
          .mockResolvedValueOnce(8),
      };

      await expect(
        getLatestPrice(
          mockClient as any,
          CHAINLINK_SEPOLIA_FEEDS.ETH_USD,
          3600
        )
      ).rejects.toThrow(/stale/i);
    });
  });
});
