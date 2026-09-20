import { keccak256, toHex, Address, Hex, createWalletClient, createPublicClient, http, decodeEventLog } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { OMEN_FACTORY_ABI, getOmenFactoryAddress } from "../contracts";
import {
  ETHEREUM_SEPOLIA_CHAIN_ID,
  ROBINHOOD_TESTNET_CHAIN_ID,
  robinhoodChain,
  CHAINLINK_ETH_USD_FEED,
  ETHEREUM_SEPOLIA_RPC_URL,
  ROBINHOOD_TESTNET_RPC_URL,
} from "../constants";
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
  if (!params.chainId) {
    throw new Error("Missing chainId for on-chain market creation");
  }
  const chainId = params.chainId;
  const privateKey = (process.env.ADMIN_PRIVATE_KEY || process.env.PRIVATE_KEY) as Hex | undefined;

  if (!privateKey) {
    throw new Error("Missing ADMIN_PRIVATE_KEY or PRIVATE_KEY for on-chain market creation");
  }

  const account = privateKeyToAccount(privateKey);
  const isRobinhood = chainId === ROBINHOOD_TESTNET_CHAIN_ID;
  const chain = isRobinhood ? robinhoodChain : sepolia;
  const rpcUrl = isRobinhood ? ROBINHOOD_TESTNET_RPC_URL : ETHEREUM_SEPOLIA_RPC_URL;

  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(rpcUrl),
  });

  const factoryAddress = getOmenFactoryAddress(chainId);
  const defaultFeed = CHAINLINK_ETH_USD_FEED;

  let rawTargetPrice: bigint = 0n;
  if (params.config?.targetPrice !== undefined && params.config?.targetPrice !== null) {
    const num = Number(params.config.targetPrice);
    if (!Number.isNaN(num)) {
      rawTargetPrice = BigInt(Math.round(num));
    }
  }

  const resolutionConfig = {
    resType: params.config?.resType || 0,
    assetAFeed: (params.config?.assetAFeed || defaultFeed) as Address,
    assetBFeed: (params.config?.assetBFeed || defaultFeed) as Address,
    targetPrice: rawTargetPrice,
    startTimestamp: BigInt(params.config?.startTimestamp || params.openTime || 0),
    endTimestamp: BigInt(params.config?.endTimestamp || params.closeTime || 0),
  };

  let gasLimit = 1750000n;
  try {
    const estimated = await publicClient.estimateContractGas({
      address: factoryAddress,
      abi: OMEN_FACTORY_ABI as any,
      functionName: "createMarket",
      account,
      args: [
        params.beliefHash,
        params.sourceHash,
        params.resolutionHash,
        BigInt(params.openTime || 0),
        BigInt(params.closeTime || 0),
        resolutionConfig,
      ],
    });
    gasLimit = (estimated * 110n) / 100n;
  } catch {
    gasLimit = 1750000n;
  }

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
    gas: gasLimit,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

  let deployedAddress: Address | undefined;
  let marketId = 1;

  if (receipt.logs && receipt.logs.length > 0) {
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: OMEN_FACTORY_ABI,
          data: log.data,
          topics: log.topics,
        });
        if (decoded.eventName === "MarketCreated" && decoded.args) {
          const args = decoded.args as { marketId?: bigint; marketAddress?: Address };
          if (args.marketAddress) {
            deployedAddress = args.marketAddress;
          }
          if (args.marketId !== undefined) {
            marketId = Number(args.marketId);
          }
          break;
        }
      } catch {
        if (log.topics && log.topics.length >= 3) {
          const potentialAddress = ("0x" + log.topics[2]?.slice(26)) as Address;
          if (potentialAddress.length === 42) {
            deployedAddress = potentialAddress;
          }
        }
      }
    }
  }

  if (!deployedAddress) {
    throw new Error("Failed to extract deployed market address from transaction receipt logs");
  }

  return {
    contractAddress: deployedAddress,
    contractMarketId: marketId,
    txHash,
  };
}
