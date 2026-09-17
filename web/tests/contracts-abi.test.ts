import { describe, it, expect, beforeEach, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  OMEN_FACTORY_ABI,
  OMEN_MARKET_ABI,
  OMEN_FACTORY_ADDRESS_SEPOLIA,
  OMEN_FACTORY_ADDRESS_ROBINHOOD,
  getOmenFactoryAddress,
} from "../lib/contracts";
import {
  MOCK_OMEN_FACTORY_ADDRESS_SEPOLIA,
  MOCK_OMEN_FACTORY_ADDRESS_ROBINHOOD,
  USE_MOCK_CONTRACT,
  getMockOmenFactoryAddress,
} from "../lib/mock-contracts";

describe("TICKET-71: Smart Contract ABI Exports & Separate Mock Configuration", () => {
  const originalSepolia = process.env.NEXT_PUBLIC_OMEN_FACTORY_ADDRESS_SEPOLIA;
  const originalRobinhood = process.env.NEXT_PUBLIC_OMEN_FACTORY_ADDRESS_ROBINHOOD;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_OMEN_FACTORY_ADDRESS_SEPOLIA = "0x1234567890123456789012345678901234567890";
    process.env.NEXT_PUBLIC_OMEN_FACTORY_ADDRESS_ROBINHOOD = "0x0987654321098765432109876543210987654321";
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_OMEN_FACTORY_ADDRESS_SEPOLIA = originalSepolia;
    process.env.NEXT_PUBLIC_OMEN_FACTORY_ADDRESS_ROBINHOOD = originalRobinhood;
  });

  it("should adhere strictly to Zero-Comment Policy in contracts config, mock config, and deploy script", () => {
    const filesToCheck = [
      path.resolve(process.cwd(), "lib/contracts.ts"),
      path.resolve(process.cwd(), "lib/mock-contracts.ts"),
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

  it("should isolate mock fallback addresses into mock-contracts.ts and preserve production contracts.ts purity", () => {
    const contractsFileContent = fs.readFileSync(path.resolve(process.cwd(), "lib/contracts.ts"), "utf-8");
    expect(contractsFileContent).not.toContain("0x1111111111111111111111111111111111111111");
    expect(contractsFileContent).not.toContain("0x2222222222222222222222222222222222222222");
    expect(contractsFileContent).not.toContain("0x5FbDB2315678afecb367f032d93F642f64180aa3");
    expect(contractsFileContent).not.toContain("USE_MOCK_CONTRACT");

    expect(MOCK_OMEN_FACTORY_ADDRESS_SEPOLIA).toBe("0x1111111111111111111111111111111111111111");
    expect(MOCK_OMEN_FACTORY_ADDRESS_ROBINHOOD).toBe("0x2222222222222222222222222222222222222222");
    expect(USE_MOCK_CONTRACT).toBe(true);
    expect(getMockOmenFactoryAddress(11155111)).toBe("0x1111111111111111111111111111111111111111");
    expect(getMockOmenFactoryAddress(46630)).toBe("0x2222222222222222222222222222222222222222");
  });

  it("should resolve correct factory address per chain", () => {
    expect(OMEN_FACTORY_ADDRESS_SEPOLIA).toBeDefined();
    expect(OMEN_FACTORY_ADDRESS_ROBINHOOD).toBeDefined();

    const sepoliaAddr = getOmenFactoryAddress(11155111);
    expect(sepoliaAddr).toBeDefined();

    const robinhoodAddr = getOmenFactoryAddress(46630);
    expect(robinhoodAddr).toBeDefined();
  });
});
