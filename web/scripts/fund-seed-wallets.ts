import { createPublicClient, createWalletClient, http, parseEther, formatEther, defineChain, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
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
  const adminKey = (process.env.ADMIN_PRIVATE_KEY || process.env.PRIVATE_KEY) as `0x${string}` | undefined;
  if (!adminKey || !adminKey.startsWith("0x")) {
    console.error("Missing ADMIN_PRIVATE_KEY in .env");
    process.exit(1);
  }

  const adminAccount = privateKeyToAccount(adminKey);
  console.log(`Admin Wallet: ${adminAccount.address}`);

  const seedKeys = [
    process.env.SEED_WALLET_PRIVATE_KEY_1,
    process.env.SEED_WALLET_PRIVATE_KEY_2,
    process.env.SEED_WALLET_PRIVATE_KEY_3,
  ].filter((k): k is `0x${string}` => Boolean(k && k.startsWith("0x")));

  if (seedKeys.length === 0) {
    console.error("No SEED_WALLET_PRIVATE_KEY_1/2/3 found in .env");
    process.exit(1);
  }

  const seedAccounts = seedKeys.map((k) => privateKeyToAccount(k));
  console.log(`Found ${seedAccounts.length} seed wallets:`);
  seedAccounts.forEach((acc, i) => console.log(`  [${i + 1}] ${acc.address}`));

  const chains = [
    { chain: sepoliaChain, id: ETHEREUM_SEPOLIA_CHAIN_ID, name: "Ethereum Sepolia" },
    { chain: robinhoodChain, id: ROBINHOOD_TESTNET_CHAIN_ID, name: "Robinhood Chain Testnet" },
  ];

  const amountToSend = parseEther("0.0015");
  const minThreshold = parseEther("0.001");

  for (const { chain, id, name } of chains) {
    console.log(`\n========================================`);
    console.log(`Funding on ${name} (Chain ID: ${id})...`);
    console.log(`========================================`);

    const publicClient = createPublicClient({ chain, transport: http() });
    const walletClient = createWalletClient({ account: adminAccount, chain, transport: http() });

    const adminBal = await publicClient.getBalance({ address: adminAccount.address });
    console.log(`Admin balance on ${name}: ${formatEther(adminBal)} ETH`);

    for (const recipient of seedAccounts) {
      const recBal = await publicClient.getBalance({ address: recipient.address });
      console.log(`Recipient ${recipient.address} balance: ${formatEther(recBal)} ETH`);

      if (recBal >= minThreshold) {
        console.log(`  -> Already has enough funds (>= 0.001 ETH). Skipping.`);
        continue;
      }

      console.log(`  -> Sending 0.0015 ETH to ${recipient.address}...`);
      try {
        const txHash = await walletClient.sendTransaction({
          to: recipient.address,
          value: amountToSend,
        });
        console.log(`     Tx submitted: ${txHash}. Waiting for confirmation...`);
        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
        console.log(`     Confirmed in block ${receipt.blockNumber}!`);
      } catch (err: any) {
        console.error(`     Failed to transfer: ${err?.message || err}`);
      }
    }
  }

  console.log("\nAll seed wallet funding checks completed!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
