import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { privateKeyToAccount } from "viem/accounts";
import { POST as confirmBelief } from "../app/api/beliefs/[id]/confirm/route";
import * as supabaseLib from "../lib/supabase";
import { ETHEREUM_SEPOLIA_CHAIN_ID } from "../lib/constants";

describe("TICKET-88: EIP-712 Creator Confirmation API", () => {
  const TEST_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const testAccount = privateKeyToAccount(TEST_PRIVATE_KEY);

  const OTHER_PRIVATE_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
  const otherAccount = privateKeyToAccount(OTHER_PRIVATE_KEY);

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function createMockPostRequest(url: string, body: unknown) {
    return new NextRequest(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("should adhere strictly to Zero-Comment Policy in confirmation files", () => {
    const filesToCheck = [
      path.resolve(process.cwd(), "app/api/beliefs/[id]/confirm/route.ts"),
      path.resolve(process.cwd(), "lib/eip712/confirmation.ts"),
    ];

    for (const filePath of filesToCheck) {
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
    }
  });

  it("should successfully verify EIP-712 signature and confirm belief", async () => {
    const beliefId = "b-uuid-101";
    const statement = "Solana will flip Ethereum in fees";
    const timestamp = 1726500000;
    const chainId = ETHEREUM_SEPOLIA_CHAIN_ID;

    const signature = await testAccount.signTypedData({
      domain: {
        name: "OMEN",
        version: "1",
        chainId,
      },
      types: {
        BeliefConfirmation: [
          { name: "beliefId", type: "string" },
          { name: "statement", type: "string" },
          { name: "timestamp", type: "uint256" },
        ],
      },
      primaryType: "BeliefConfirmation",
      message: {
        beliefId,
        statement,
        timestamp: BigInt(timestamp),
      },
    });

    const mockBelief = {
      id: beliefId,
      statement,
      status: "DETECTED",
      author: testAccount.address,
    };

    const mockBeliefQuery: any = {};
    mockBeliefQuery.eq = vi.fn().mockReturnValue(mockBeliefQuery);
    mockBeliefQuery.maybeSingle = vi.fn().mockResolvedValue({ data: mockBelief, error: null });

    const mockBeliefUpdate: any = {};
    mockBeliefUpdate.eq = vi.fn().mockResolvedValue({ data: null, error: null });

    const mockConfirmInsert: any = {};
    mockConfirmInsert.select = vi.fn().mockReturnValue(mockConfirmInsert);
    mockConfirmInsert.single = vi.fn().mockResolvedValue({
      data: {
        id: "conf-1",
        belief_id: beliefId,
        creator_wallet: testAccount.address.toLowerCase(),
        signature,
      },
      error: null,
    });

    const mockProfileQuery: any = {};
    mockProfileQuery.eq = vi.fn().mockReturnValue(mockProfileQuery);
    mockProfileQuery.maybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: "prof-1",
        wallet_address: testAccount.address.toLowerCase(),
        confirmed_beliefs_count: 2,
      },
      error: null,
    });

    const mockProfileUpsert: any = {};
    mockProfileUpsert.select = vi.fn().mockResolvedValue({ data: null, error: null });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn((table: string) => {
        if (table === "beliefs") {
          return {
            select: vi.fn().mockReturnValue(mockBeliefQuery),
            update: vi.fn().mockReturnValue(mockBeliefUpdate),
          };
        }
        if (table === "creator_confirmations") {
          return {
            insert: vi.fn().mockReturnValue(mockConfirmInsert),
          };
        }
        if (table === "creator_profiles") {
          return {
            select: vi.fn().mockReturnValue(mockProfileQuery),
            upsert: vi.fn().mockReturnValue(mockProfileUpsert),
          };
        }
        return {} as any;
      }),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockPostRequest(`http://localhost:3000/api/beliefs/${beliefId}/confirm`, {
      creator_address: testAccount.address,
      signature,
      timestamp,
      chain_id: chainId,
    });

    const res = await confirmBelief(req, { params: Promise.resolve({ id: beliefId }) });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toContain("confirmed");
  });

  it("should return HTTP 401 when signature signer does not match creator_address", async () => {
    const beliefId = "b-uuid-101";
    const statement = "Solana will flip Ethereum in fees";
    const timestamp = 1726500000;
    const chainId = ETHEREUM_SEPOLIA_CHAIN_ID;

    const fakeSignature = await otherAccount.signTypedData({
      domain: {
        name: "OMEN",
        version: "1",
        chainId,
      },
      types: {
        BeliefConfirmation: [
          { name: "beliefId", type: "string" },
          { name: "statement", type: "string" },
          { name: "timestamp", type: "uint256" },
        ],
      },
      primaryType: "BeliefConfirmation",
      message: {
        beliefId,
        statement,
        timestamp: BigInt(timestamp),
      },
    });

    const mockBelief = {
      id: beliefId,
      statement,
      status: "DETECTED",
      author: testAccount.address,
    };

    const mockBeliefQuery: any = {};
    mockBeliefQuery.eq = vi.fn().mockReturnValue(mockBeliefQuery);
    mockBeliefQuery.maybeSingle = vi.fn().mockResolvedValue({ data: mockBelief, error: null });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn().mockReturnValue(mockBeliefQuery),
      })),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockPostRequest(`http://localhost:3000/api/beliefs/${beliefId}/confirm`, {
      creator_address: testAccount.address,
      signature: fakeSignature,
      timestamp,
      chain_id: chainId,
    });

    const res = await confirmBelief(req, { params: Promise.resolve({ id: beliefId }) });
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("Invalid signature");
  });

  it("should return HTTP 404 when target belief is not found", async () => {
    const mockBeliefQuery: any = {};
    mockBeliefQuery.eq = vi.fn().mockReturnValue(mockBeliefQuery);
    mockBeliefQuery.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });

    vi.spyOn(supabaseLib, "getSupabaseAdminClient").mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn().mockReturnValue(mockBeliefQuery),
      })),
    } as unknown as ReturnType<typeof supabaseLib.getSupabaseAdminClient>);

    const req = createMockPostRequest(`http://localhost:3000/api/beliefs/non-existent/confirm`, {
      creator_address: testAccount.address,
      signature: "0x1234",
      timestamp: 1726500000,
      chain_id: ETHEREUM_SEPOLIA_CHAIN_ID,
    });

    const res = await confirmBelief(req, { params: Promise.resolve({ id: "non-existent" }) });
    expect(res.status).toBe(404);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("not found");
  });

  it("should return HTTP 400 when required payload fields are missing", async () => {
    const req = createMockPostRequest(`http://localhost:3000/api/beliefs/b-1/confirm`, {
      creator_address: "0x123",
    });

    const res = await confirmBelief(req, { params: Promise.resolve({ id: "b-1" }) });
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
  });
});
