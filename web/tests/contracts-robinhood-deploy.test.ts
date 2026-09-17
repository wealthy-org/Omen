import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  ROBINHOOD_TESTNET_CHAIN_ID,
  OMEN_FACTORY_ADDRESS_ROBINHOOD,
  getOmenFactoryAddress,
} from "../lib/contracts";

describe("TICKET-98: Robinhood Chain Testnet Deployment Script & Configuration", () => {
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
    expect(OMEN_FACTORY_ADDRESS_ROBINHOOD).toBeDefined();

    const resolvedAddress = getOmenFactoryAddress(46630);
    expect(resolvedAddress).toBe(OMEN_FACTORY_ADDRESS_ROBINHOOD);
  });
});
