import {
  createPublicClient,
  http,
  defineChain,
  decodeFunctionData,
  formatEther,
  formatGwei,
  Address,
  Hex,
} from "viem";
import OmenMarketJson from "@/contracts/OmenMarket.json";
import OmenFactoryJson from "@/contracts/OmenFactory.json";
import PredictionMarketJson from "@/contracts/PredictionMarket.json";

import { DecodedParameter, DecodedTxResult } from "@/types";
import {
  ETHEREUM_SEPOLIA_CHAIN_ID,
  ROBINHOOD_TESTNET_CHAIN_ID,
  ETHEREUM_SEPOLIA_RPC_URL,
  ROBINHOOD_TESTNET_RPC_URL,
  ETHEREUM_SEPOLIA_EXPLORER_URL,
  ROBINHOOD_TESTNET_EXPLORER_URL,
  OMEN_FACTORY_ADDRESS_SEPOLIA,
  OMEN_FACTORY_ADDRESS_ROBINHOOD,
} from "./constants";

export type { DecodedParameter, DecodedTxResult };

const sepoliaChain = defineChain({
  id: ETHEREUM_SEPOLIA_CHAIN_ID,
  name: "Ethereum Sepolia",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [ETHEREUM_SEPOLIA_RPC_URL],
    },
  },
  blockExplorers: {
    default: { name: "Etherscan", url: ETHEREUM_SEPOLIA_EXPLORER_URL },
  },
});

const robinhoodChain = defineChain({
  id: ROBINHOOD_TESTNET_CHAIN_ID,
  name: "Robinhood Chain Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [ROBINHOOD_TESTNET_RPC_URL],
    },
  },
  blockExplorers: {
    default: { name: "Robinhood Explorer", url: ROBINHOOD_TESTNET_EXPLORER_URL },
  },
});

export function getPublicClientForChain(chainId?: number) {
  if (chainId === ROBINHOOD_TESTNET_CHAIN_ID) {
    return createPublicClient({
      chain: robinhoodChain,
      transport: http(),
    });
  }
  return createPublicClient({
    chain: sepoliaChain,
    transport: http(),
  });
}

export function decodeRawCalldata(data?: Hex): { functionName: string; params: DecodedParameter[] } | null {
  if (!data || data === "0x") {
    return null;
  }

  const abis = [
    { name: "OmenMarket", abi: OmenMarketJson },
    { name: "OmenFactory", abi: OmenFactoryJson },
    { name: "PredictionMarket", abi: PredictionMarketJson },
  ];

  for (const { abi } of abis) {
    try {
      const decoded = decodeFunctionData({
        abi: abi as any,
        data,
      });

      if (decoded && decoded.functionName) {
        const params: DecodedParameter[] = [];
        if (decoded.args && Array.isArray(decoded.args)) {
          const funcAbi = (abi as any[]).find(
            (item) => item.type === "function" && item.name === decoded.functionName
          );
          decoded.args.forEach((argVal, idx) => {
            const inputDef = funcAbi?.inputs?.[idx];
            const paramName = inputDef?.name || `param_${idx}`;
            const paramType = inputDef?.type || typeof argVal;
            let formattedVal = "";

            if (typeof argVal === "bigint") {
              formattedVal = argVal.toString();
              if (paramName.toLowerCase().includes("amount") || paramName.toLowerCase().includes("value") || paramName.toLowerCase().includes("seed")) {
                formattedVal += ` (${formatEther(argVal)} ETH)`;
              }
            } else if (typeof argVal === "object" && argVal !== null) {
              formattedVal = JSON.stringify(argVal, (_, v) => (typeof v === "bigint" ? v.toString() : v));
            } else {
              formattedVal = String(argVal);
            }

            params.push({
              name: paramName,
              type: paramType,
              value: formattedVal,
            });
          });
        }

        return {
          functionName: `${decoded.functionName}()`,
          params,
        };
      }
    } catch {
    }
  }

  return null;
}

export async function fetchAndDecodeTransaction(
  txHash: string,
  chainId?: number
): Promise<DecodedTxResult> {
  const isRobinhood = chainId === ROBINHOOD_TESTNET_CHAIN_ID;
  const chainName = isRobinhood ? "Robinhood Chain Testnet" : "Ethereum Sepolia";
  const effectiveChainId = isRobinhood ? ROBINHOOD_TESTNET_CHAIN_ID : ETHEREUM_SEPOLIA_CHAIN_ID;

  if (!txHash || !txHash.startsWith("0x") || txHash.length < 10) {
    return {
      foundOnRpc: false,
      txHash,
      chainId: effectiveChainId,
      chainName,
      status: "unknown",
      errorMessage: "Invalid transaction hash format.",
    };
  }

  try {
    const client = getPublicClientForChain(chainId);
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
    const [tx, receipt, latestBlock] = await Promise.all([
      Promise.race([client.getTransaction({ hash: txHash as Hex }).catch(() => null), timeoutPromise]),
      Promise.race([client.getTransactionReceipt({ hash: txHash as Hex }).catch(() => null), timeoutPromise]),
      Promise.race([client.getBlockNumber().catch(() => null), timeoutPromise]),
    ]);

    if (!tx && !receipt) {
      return {
        foundOnRpc: false,
        txHash,
        chainId: effectiveChainId,
        chainName,
        status: "unknown",
        errorMessage: `Transaction not found on ${chainName} RPC.`,
      };
    }

    const blockNumber = tx?.blockNumber ? Number(tx.blockNumber) : receipt?.blockNumber ? Number(receipt.blockNumber) : undefined;
    const confirmations = (latestBlock !== null && blockNumber) ? Number(latestBlock - BigInt(blockNumber) + 1n) : 1;
    const status: DecodedTxResult["status"] = receipt?.status === "success" ? "success" : receipt?.status === "reverted" ? "reverted" : "pending";

    const gasPriceGwei = tx?.gasPrice ? formatGwei(tx.gasPrice) : receipt?.effectiveGasPrice ? formatGwei(receipt.effectiveGasPrice) : "12.0";
    const gasUsed = receipt?.gasUsed ? receipt.gasUsed.toString() : undefined;
    const executionFeeEth = (receipt?.gasUsed && receipt?.effectiveGasPrice)
      ? formatEther(receipt.gasUsed * receipt.effectiveGasPrice)
      : undefined;

    const from = tx?.from || receipt?.from;
    const to = tx?.to || receipt?.to || undefined;

    let toContractName = "Omen Protocol";
    if (to) {
      const lower = to.toLowerCase();
      const sepoliaFactory = OMEN_FACTORY_ADDRESS_SEPOLIA.toLowerCase();
      const robinhoodFactory = OMEN_FACTORY_ADDRESS_ROBINHOOD.toLowerCase();
      if (lower === sepoliaFactory || lower === robinhoodFactory) {
        toContractName = "OmenFactory";
      } else {
        toContractName = "OmenMarket";
      }
    }

    const valueEth = tx?.value ? formatEther(tx.value) : undefined;
    const decodedCalldata = decodeRawCalldata(tx?.input);

    return {
      foundOnRpc: true,
      txHash,
      chainId: effectiveChainId,
      chainName,
      status,
      blockNumber,
      confirmations,
      from,
      to,
      toContractName,
      valueEth,
      gasPriceGwei,
      gasUsed,
      executionFeeEth,
      functionName: decodedCalldata?.functionName,
      params: decodedCalldata?.params,
      rawInput: tx?.input,
    };
  } catch (error: any) {
    return {
      foundOnRpc: false,
      txHash,
      chainId: effectiveChainId,
      chainName,
      status: "unknown",
      errorMessage: error?.message || "Failed to query RPC.",
    };
  }
}
