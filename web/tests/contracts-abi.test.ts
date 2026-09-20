import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  OMEN_FACTORY_ABI,
  OMEN_MARKET_ABI,
  getOmenFactoryAddress,
} from "../lib/contracts";
import {
  OMEN_FACTORY_ADDRESS_SEPOLIA,
  OMEN_FACTORY_ADDRESS_ROBINHOOD,
  OMEN_FACTORY_ADDRESS,
  ETHEREUM_SEPOLIA_CHAIN_ID,
  ROBINHOOD_TESTNET_CHAIN_ID,
} from "../lib/constants";

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
  });

  it("should export valid OmenFactory and OmenMarket ABIs", () => {
    expect(OMEN_FACTORY_ABI).toBeDefined();
    expect(Array.isArray(OMEN_FACTORY_ABI)).toBe(true);
    expect(OMEN_FACTORY_ABI.length).toBeGreaterThan(0);

    const factoryNames = OMEN_FACTORY_ABI.map((item: any) => item.name).filter(Boolean);
    expect(factoryNames).toContain("createMarket");
    expect(factoryNames).toContain("getMarket");

    expect(OMEN_MARKET_ABI).toBeDefined();
    expect(Array.isArray(OMEN_MARKET_ABI)).toBe(true);
    expect(OMEN_MARKET_ABI.length).toBeGreaterThan(0);

    const marketNames = OMEN_MARKET_ABI.map((item: any) => item.name).filter(Boolean);
    expect(marketNames).toContain("depositAgree");
    expect(marketNames).toContain("depositDisagree");
  });

  it("should export valid static contract addresses without environment dependency", () => {
    expect(OMEN_FACTORY_ADDRESS_SEPOLIA).toBeDefined();
    expect(OMEN_FACTORY_ADDRESS_SEPOLIA).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(OMEN_FACTORY_ADDRESS_ROBINHOOD).toBeDefined();
    expect(OMEN_FACTORY_ADDRESS_ROBINHOOD).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(OMEN_FACTORY_ADDRESS).toBeDefined();
    expect(OMEN_FACTORY_ADDRESS).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  it("should resolve static factory address for supported chains", () => {
    const sepoliaAddr = getOmenFactoryAddress(ETHEREUM_SEPOLIA_CHAIN_ID);
    expect(sepoliaAddr).toBe(OMEN_FACTORY_ADDRESS_SEPOLIA);

    const robinhoodAddr = getOmenFactoryAddress(ROBINHOOD_TESTNET_CHAIN_ID);
    expect(robinhoodAddr).toBe(OMEN_FACTORY_ADDRESS_ROBINHOOD);

    const defaultAddr = getOmenFactoryAddress();
    expect(defaultAddr).toBe(OMEN_FACTORY_ADDRESS_SEPOLIA);
  });
});
