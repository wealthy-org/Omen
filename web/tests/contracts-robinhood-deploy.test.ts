import { describe, it, expect, beforeEach, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  ROBINHOOD_TESTNET_CHAIN_ID,
  getOmenFactoryAddress,
} from "../lib/contracts";

describe("TICKET-98: Robinhood Chain Testnet Deployment Script & Configuration", () => {
  const originalRobinhood = process.env.NEXT_PUBLIC_OMEN_FACTORY_ADDRESS_ROBINHOOD;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_OMEN_FACTORY_ADDRESS_ROBINHOOD = "0x2222222222222222222222222222222222222222";
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_OMEN_FACTORY_ADDRESS_ROBINHOOD = originalRobinhood;
  });

  it("should adhere strictly to Zero-Comment Policy in Robinhood deploy script", () => {
    const scriptPath = path.resolve(process.cwd(), "../contracts/script/DeployRobinhood.s.sol");

    if (fs.existsSync(scriptPath)) {
      const content = fs.readFileSync(scriptPath, "utf-8");
      const lines = content.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("// SPDX-License-Identifier:")) continue;
        expect(trimmed.startsWith("/" + "/")).toBe(false);
        expect(trimmed.startsWith("/" + "*")).toBe(false);
        expect(trimmed.includes("*" + "/")).toBe(false);
      }
    }
  });

  it("should have DeployRobinhood.s.sol present in contracts/script", () => {
    const scriptPath = path.resolve(process.cwd(), "../contracts/script/DeployRobinhood.s.sol");
    expect(fs.existsSync(scriptPath)).toBe(true);
  });

  it("should export Robinhood Chain ID 46630 and factory address resolver", () => {
    expect(ROBINHOOD_TESTNET_CHAIN_ID).toBe(46630);

    const resolvedAddress = getOmenFactoryAddress(46630);
    expect(resolvedAddress).toBe("0x2222222222222222222222222222222222222222");
  });

  it("should throw an error when Robinhood factory address is not configured", () => {
    delete process.env.NEXT_PUBLIC_OMEN_FACTORY_ADDRESS_ROBINHOOD;
    expect(() => getOmenFactoryAddress(46630)).toThrow(/not configured/i);
  });
});
