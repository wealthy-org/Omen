import { createPublicClient, createWalletClient, http, parseEther, formatEther, defineChain, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { config } from "dotenv";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "../lib/db";
import { OMEN_MARKET_ABI } from "../lib/contracts";
import {
  ETHEREUM_SEPOLIA_CHAIN_ID,
  ROBINHOOD_TESTNET_CHAIN_ID,
  ETHEREUM_SEPOLIA_RPC_URL,
  ROBINHOOD_TESTNET_RPC_URL,
  ETHEREUM_SEPOLIA_EXPLORER_URL,
  ROBINHOOD_TESTNET_EXPLORER_URL,
} from "../lib/constants";

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
  config({ path: [".env.local", ".env"] });

  const seedKeys = [
    process.env.SEED_WALLET_PRIVATE_KEY_1,
    process.env.SEED_WALLET_PRIVATE_KEY_2,
    process.env.SEED_WALLET_PRIVATE_KEY_3,
  ].filter((key): key is string => Boolean(key && key.startsWith("0x")));

  const db = process.env.DATABASE_URL ? getDb() : null;

  if (seedKeys.length === 0) {
    console.log("No SEED_WALLET_PRIVATE_KEY_1/2/3 provided. Seed script running in dry-run verification mode.");
    return;
  }

  const chains = [
    { chain: sepoliaChain, id: ETHEREUM_SEPOLIA_CHAIN_ID, name: "Sepolia" },
    { chain: robinhoodChain, id: ROBINHOOD_TESTNET_CHAIN_ID, name: "Robinhood Chain" },
  ];

  for (const { chain, id: chainId, name } of chains) {
    console.log(`Starting testnet seeding on ${name} (Chain ID: ${chainId})...`);

    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    let targetMarkets: { id: string; contract_address?: string | null; title?: string | null }[] = [];

    if (db) {
      const data = await db.query.markets.findMany({
        columns: { id: true, contract_address: true, title: true, chain_id: true },
        where: and(eq(schema.markets.status, "OPEN"), eq(schema.markets.chain_id, chainId)),
        limit: 5,
      });

      if (data.length > 0) {
        targetMarkets = data;
      }
    }

    if (targetMarkets.length === 0) {
      targetMarkets = [
        { id: `market-${chainId}-demo-1`, contract_address: "0x5FbDB2315678afecb367f032d93F642f64180aa3", title: "Test Market Alpha" },
        { id: `market-${chainId}-demo-2`, contract_address: "0x5FbDB2315678afecb367f032d93F642f64180aa3", title: "Test Market Beta" },
      ];
    }

    for (let i = 0; i < seedKeys.length; i++) {
      const pkey = seedKeys[i] as `0x${string}`;
      const account = privateKeyToAccount(pkey);
      const walletClient = createWalletClient({
        account,
        chain,
        transport: http(),
      });

      const bal = await publicClient.getBalance({ address: account.address });
      if (bal < parseEther("0.0006")) {
        console.log(`Skipping wallet ${account.address} on ${name}: insufficient balance (${formatEther(bal)} ETH).`);
        continue;
      }

      const market = targetMarkets[i % targetMarkets.length];
      const side = i % 2 === 0 ? "AGREE" : "DISAGREE";
      const stakeAmountEth = (0.0002 * (i + 1)).toFixed(4);
      const parsedWei = parseEther(stakeAmountEth);

      if (!market.contract_address) {
        console.log(`Skipping on-chain tx for ${market.id}: No deployed contract address.`);
        continue;
      }

      try {
        const functionName = side === "AGREE" ? "depositAgree" : "depositDisagree";
        const txHash = await walletClient.writeContract({
          address: market.contract_address as Address,
          abi: OMEN_MARKET_ABI,
          functionName,
          value: parsedWei,
        });

        console.log(`Submitted tx on ${name}: ${txHash}. Waiting for confirmation...`);

        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
        console.log(`Tx confirmed in block ${receipt.blockNumber}! Status: ${receipt.status}`);

        if (db) {
          await db.insert(schema.market_events).values({
            market_id: market.id,
            event_type: side,
            wallet_address: account.address,
            amount: parseFloat(stakeAmountEth),
            tx_hash: txHash,
            block_number: Number(receipt.blockNumber),
          });

          await db.insert(schema.market_positions).values({
            market_id: market.id,
            wallet_address: account.address,
            side,
            amount: parseFloat(stakeAmountEth),
            tx_hash: txHash,
          });

          console.log(`Saved activity record to database for ${account.address}`);
        }
      } catch (err: any) {
        console.error(`Failed to execute seed transaction on ${name} with wallet ${account.address}:`, err?.message || err);
      }
    }
  }

  console.log("Testnet activity seeding run complete.");
}

main().catch((err) => {
  console.error("Fatal error during seeding:", err);
  process.exit(1);
});
