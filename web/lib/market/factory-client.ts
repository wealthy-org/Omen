import { keccak256, toHex, Address, Hex, createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia, arbitrumSepolia } from "viem/chains";
import { OMEN_FACTORY_ABI, getOmenFactoryAddress, ROBINHOOD_TESTNET_CHAIN_ID } from "../contracts";
import type { BeliefHashes, CreateOnChainMarketParams, CreatedMarketResult } from "@/types";

export type { BeliefHashes, CreateOnChainMarketParams, CreatedMarketResult };

export function computeBeliefHashes(
  statement: string,
  sourceText: string,
  config?: Record<string, unknown>
): BeliefHashes {
  const beliefHash = keccak256(toHex(statement.trim()));
  const sourceHash = keccak256(toHex(sourceText.trim()));
  const resolutionHash = keccak256(toHex(JSON.stringify(config || {})));

  return {
    beliefHash,
    sourceHash,
    resolutionHash,
  };
}

export async function createOnChainMarket(
  params: CreateOnChainMarketParams
): Promise<CreatedMarketResult> {
  const chainId = params.chainId || 11155111;
  const privateKey = (process.env.ADMIN_PRIVATE_KEY || process.env.PRIVATE_KEY) as Hex | undefined;

  if (!privateKey || process.env.NEXT_PUBLIC_USE_MOCK_CONTRACT === "true") {
    const rawHash = keccak256(toHex(params.beliefHash + Date.now().toString()));
    const mockAddress = ("0x" + rawHash.slice(26)) as Address;
    return {
      contractAddress: mockAddress,
      contractMarketId: Math.floor(Math.random() * 1000) + 1,
      txHash: "0xmock" + rawHash.slice(6),
    };
  }

  const account = privateKeyToAccount(privateKey);
  const chain = chainId === 421614 ? arbitrumSepolia : sepolia;

  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(),
  });

  const factoryAddress = getOmenFactoryAddress(chainId);

  const resolutionConfig = {
    resType: params.config?.resType || 0,
    assetAFeed: params.config?.assetAFeed || ("0x0000000000000000000000000000000000000000" as Address),
    assetBFeed: params.config?.assetBFeed || ("0x0000000000000000000000000000000000000000" as Address),
    targetPrice: BigInt(params.config?.targetPrice || 0),
    startTimestamp: BigInt(params.config?.startTimestamp || params.openTime || 0),
    endTimestamp: BigInt(params.config?.endTimestamp || params.closeTime || 0),
  };

  const txHash = await walletClient.writeContract({
    address: factoryAddress,
    abi: OMEN_FACTORY_ABI as any,
    functionName: "createMarket",
    args: [
      params.beliefHash,
      params.sourceHash,
      params.resolutionHash,
      BigInt(params.openTime || 0),
      BigInt(params.closeTime || 0),
      resolutionConfig,
    ],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

  let deployedAddress = "0x0000000000000000000000000000000000000000";
  let marketId = 1;

  if (receipt.logs && receipt.logs.length > 0) {
    for (const log of receipt.logs) {
      if (log.topics && log.topics.length >= 3) {
        const potentialAddress = "0x" + log.topics[2]?.slice(26);
        if (potentialAddress.length === 42) {
          deployedAddress = potentialAddress;
          break;
        }
      }
    }
  }

  return {
    contractAddress: deployedAddress,
    contractMarketId: marketId,
    txHash,
  };
}
