import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  OMEN_FACTORY_ABI,
  OMEN_MARKET_ABI,
  OMEN_FACTORY_ADDRESS_SEPOLIA,
  OMEN_FACTORY_ADDRESS_ROBINHOOD,
  PREDICTION_MARKET_ADDRESS,
  getOmenFactoryAddress,
  getPredictionMarketAddress,
} from "../lib/contracts";

describe("TICKET-71: Smart Contract ABI Exports & Static Configuration", () => {
  it("should adhere strictly to Zero-Comment Policy in contracts config, mock config, and deploy script", () => {
    const filesToCheck = [
      path.resolve(process.cwd(), "lib/contracts.ts"),
      path.resolve(process.cwd(), "lib/constants.ts"),
      path.resolve(process.cwd(), "../contracts/script/DeploySepolia.s.sol"),
    ];

    for (const filePath of filesToCheck) {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf-8");
        const lines = content.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("// SPDX-License-Identifier:")) continue;
          expect(trimmed.startsWith("/" + "/")).toBe(false);
          expect(trimmed.startsWith("/" + "*")).toBe(false);
          expect(trimmed.includes("*" + "/")).toBe(false);
        }
      }
    }
  });

  it("should have valid exported ABI JSON files in web/contracts directory", () => {
    const factoryAbiPath = path.resolve(process.cwd(), "contracts/OmenFactory.json");
    const marketAbiPath = path.resolve(process.cwd(), "contracts/OmenMarket.json");

    expect(fs.existsSync(factoryAbiPath)).toBe(true);
    expect(fs.existsSync(marketAbiPath)).toBe(true);

    const factoryJson = JSON.parse(fs.readFileSync(factoryAbiPath, "utf-8"));
    const marketJson = JSON.parse(fs.readFileSync(marketAbiPath, "utf-8"));

    const factoryAbi = Array.isArray(factoryJson) ? factoryJson : factoryJson.abi;
    const marketAbi = Array.isArray(marketJson) ? marketJson : marketJson.abi;

    expect(Array.isArray(factoryAbi)).toBe(true);
    expect(Array.isArray(marketAbi)).toBe(true);

    const factoryFunctions = factoryAbi
      .filter((item: any) => item.type === "function")
      .map((item: any) => item.name);
    expect(factoryFunctions).toContain("createMarket");
    expect(factoryFunctions).toContain("getMarket");

    const marketFunctions = marketAbi
      .filter((item: any) => item.type === "function")
      .map((item: any) => item.name);
    expect(marketFunctions).toContain("depositAgree");
    expect(marketFunctions).toContain("depositDisagree");
    expect(marketFunctions).toContain("resolveMarket");
    expect(marketFunctions).toContain("claimPayout");
  });

  it("should export typed OMEN_FACTORY_ABI and OMEN_MARKET_ABI with required functions", () => {
    expect(Array.isArray(OMEN_FACTORY_ABI)).toBe(true);
    expect(Array.isArray(OMEN_MARKET_ABI)).toBe(true);

    const factoryNames = OMEN_FACTORY_ABI.map((item: any) => item.name).filter(Boolean);
    expect(factoryNames).toContain("createMarket");

    const marketNames = OMEN_MARKET_ABI.map((item: any) => item.name).filter(Boolean);
    expect(marketNames).toContain("depositAgree");
    expect(marketNames).toContain("depositDisagree");
  });

  it("should export valid static contract addresses without environment dependency", () => {
    expect(OMEN_FACTORY_ADDRESS_SEPOLIA).toBeDefined();
    expect(OMEN_FACTORY_ADDRESS_SEPOLIA).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(OMEN_FACTORY_ADDRESS_ROBINHOOD).toBeDefined();
    expect(OMEN_FACTORY_ADDRESS_ROBINHOOD).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(PREDICTION_MARKET_ADDRESS).toBeDefined();
    expect(PREDICTION_MARKET_ADDRESS).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  it("should resolve static factory address and prediction market address for supported chains", () => {
    const sepoliaAddr = getOmenFactoryAddress(11155111);
    expect(sepoliaAddr).toBe(OMEN_FACTORY_ADDRESS_SEPOLIA);

    const robinhoodAddr = getOmenFactoryAddress(46630);
    expect(robinhoodAddr).toBe(OMEN_FACTORY_ADDRESS_ROBINHOOD);

    const predictionAddr = getPredictionMarketAddress();
    expect(predictionAddr).toBe(OMEN_FACTORY_ADDRESS_SEPOLIA);
  });
});
