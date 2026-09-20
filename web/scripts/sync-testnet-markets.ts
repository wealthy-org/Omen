import { createPublicClient, createWalletClient, http, defineChain, Address, Hex, decodeEventLog } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { createClient } from "@supabase/supabase-js";
import { OMEN_FACTORY_ABI, getOmenFactoryAddress } from "../lib/contracts";
import {
  ETHEREUM_SEPOLIA_CHAIN_ID,
  ROBINHOOD_TESTNET_CHAIN_ID,
  ETHEREUM_SEPOLIA_RPC_URL,
  ROBINHOOD_TESTNET_RPC_URL,
  ETHEREUM_SEPOLIA_EXPLORER_URL,
  ROBINHOOD_TESTNET_EXPLORER_URL,
  CHAINLINK_ETH_USD_FEED,
} from "../lib/constants";
import { computeBeliefHashes } from "../lib/market/factory-client";

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

async function main() {
  const adminPrivateKey = (process.env.ADMIN_PRIVATE_KEY || process.env.PRIVATE_KEY) as Hex | undefined;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }

  const supabase = createClient(
    supabaseUrl.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, ""),
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  const { data: markets, error: marketsError } = await supabase
    .from("markets")
    .select("*, beliefs(*)")
    .eq("status", "OPEN");

  if (marketsError || !markets || markets.length === 0) {
    console.log("No OPEN markets found in database.");
    return;
  }

  console.log(`Found ${markets.length} OPEN markets in database.`);

  if (!adminPrivateKey || !adminPrivateKey.startsWith("0x")) {
    console.log("\n[DRY RUN MODE] No ADMIN_PRIVATE_KEY provided.");
    console.log("To deploy and sync markets to testnet, run with:");
    console.log("ADMIN_PRIVATE_KEY=0x... npx ts-node web/scripts/sync-testnet-markets.ts\n");
    for (const m of markets) {
      const belief = m.beliefs;
      const statement = belief?.statement || m.title;
      const hashes = computeBeliefHashes(statement, belief?.source_url || "https://omen.org", m.resolution_config);
      console.log(`Market [${m.id}]: "${m.title}" -> Chain ${m.chain_id}`);
      console.log(`  beliefHash: ${hashes.beliefHash}`);
    }
    return;
  }

  const adminAccount = privateKeyToAccount(adminPrivateKey);
  console.log(`Using admin deployer: ${adminAccount.address}`);

  for (const m of markets) {
    const chainId = Number(m.chain_id);
    const chain = chainId === ROBINHOOD_TESTNET_CHAIN_ID ? robinhoodChain : sepoliaChain;
    const chainName = chainId === ROBINHOOD_TESTNET_CHAIN_ID ? "Robinhood Chain Testnet" : "Ethereum Sepolia";

    const publicClient = createPublicClient({ chain, transport: http() });
    const walletClient = createWalletClient({ account: adminAccount, chain, transport: http() });

    const factoryAddress = getOmenFactoryAddress(chainId);
    const belief = m.beliefs;
    const statement = belief?.statement || m.title;
    const hashes = computeBeliefHashes(statement, belief?.source_url || "https://omen.org", m.resolution_config);

    const nowSec = Math.floor(Date.now() / 1000);
    const openTime = BigInt(m.open_time ? Math.floor(new Date(m.open_time).getTime() / 1000) : nowSec);
    const closeTime = BigInt(m.close_time ? Math.floor(new Date(m.close_time).getTime() / 1000) : nowSec + 86400 * 30);

    const config = m.resolution_config || {};
    const defaultFeed = CHAINLINK_ETH_USD_FEED;

    const resolutionConfig = {
      resType: config.resType || 0,
      assetAFeed: (config.assetAFeed || defaultFeed) as Address,
      assetBFeed: (config.assetBFeed || defaultFeed) as Address,
      targetPrice: BigInt(config.targetPrice || 0),
      startTimestamp: BigInt(config.startTimestamp || openTime),
      endTimestamp: BigInt(config.endTimestamp || closeTime),
      strikePrice: BigInt(config.strikePrice || 0),
    };

    console.log(`Deploying on-chain market for "${m.title}" on ${chainName}...`);

    try {
      const txHash = await walletClient.writeContract({
        address: factoryAddress,
        abi: OMEN_FACTORY_ABI,
        functionName: "createMarket",
        args: [
          hashes.beliefHash,
          hashes.sourceHash,
          hashes.resolutionHash,
          openTime,
          closeTime,
          resolutionConfig,
        ],
      });

      console.log(`Tx submitted: ${txHash}. Waiting for confirmation...`);
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

      let deployedMarketAddress: Address | null = null;
      let onChainMarketId: number | null = null;

      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: OMEN_FACTORY_ABI,
            data: log.data,
            topics: log.topics,
          });

          if (decoded.eventName === "MarketCreated") {
            const args = decoded.args as any;
            deployedMarketAddress = args.marketAddress as Address;
            onChainMarketId = Number(args.marketId);
            break;
          }
        } catch {
        }
      }

      if (deployedMarketAddress) {
        console.log(`Market deployed at ${deployedMarketAddress} (On-chain ID: ${onChainMarketId})`);

        await supabase
          .from("markets")
          .update({
            contract_address: deployedMarketAddress,
            contract_market_id: onChainMarketId ?? m.contract_market_id,
          })
          .eq("id", m.id);

        console.log(`Updated database record for market ${m.id}`);
      }
    } catch (err: any) {
      console.error(`Error deploying market ${m.id}:`, err?.message || err);
    }
  }

  console.log("Market deployment and sync process finished.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
