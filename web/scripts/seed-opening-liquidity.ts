import { config } from "dotenv";
import { and, eq, isNotNull, sql } from "drizzle-orm";
import { createPublicClient, createWalletClient, formatEther, http, parseEther, type Address, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { getDb, schema } from "../lib/db";
import { OMEN_MARKET_ABI } from "../lib/contracts";
import { ROBINHOOD_TESTNET_CHAIN_ID } from "../lib/constants";
import { robinhoodTestnet } from "../lib/wagmi";

const SIDES = ["AGREE", "DISAGREE"] as const;

async function main() {
  config({ path: [".env.local", ".env"], quiet: true });

  const privateKey = process.env.ADMIN_PRIVATE_KEY as Hex | undefined;
  if (!privateKey || !/^0x[0-9a-fA-F]{64}$/.test(privateKey)) throw new Error("ADMIN_PRIVATE_KEY must be a 32-byte hex key");
  if (!process.env.DATABASE_URL) throw new Error("Missing DATABASE_URL");

  const perSide = process.env.OPENING_STAKE_ETH ?? "0.00002";
  const value = parseEther(perSide);
  const account = privateKeyToAccount(privateKey);
  const wallet = account.address.toLowerCase();
  const publicClient = createPublicClient({ chain: robinhoodTestnet, transport: http() });
  const walletClient = createWalletClient({ account, chain: robinhoodTestnet, transport: http() });

  const db = getDb();
  const { markets, market_positions, market_events } = schema;

  const openMarkets = await db.query.markets.findMany({
    columns: { id: true, title: true, contract_address: true, close_time: true },
    where: and(eq(markets.status, "OPEN"), eq(markets.chain_id, ROBINHOOD_TESTNET_CHAIN_ID), isNotNull(markets.contract_address)),
    with: { market_positions: { columns: { id: true } } },
  });
  const targets = openMarkets.filter((m) => m.market_positions.length === 0 && new Date(m.close_time).getTime() > Date.now());

  const balance = await publicClient.getBalance({ address: account.address });
  const needed = value * BigInt(targets.length * SIDES.length);
  console.log(`${targets.length} markets need opening liquidity: ${perSide} ETH per side, ${formatEther(needed)} ETH total, balance ${formatEther(balance)} ETH`);
  if (needed >= balance) throw new Error("Not enough balance for opening liquidity plus gas");

  let done = 0;
  for (const market of targets) {
    try {
      for (const side of SIDES) {
        const hash = await walletClient.writeContract({
          address: market.contract_address as Address,
          abi: OMEN_MARKET_ABI,
          functionName: side === "AGREE" ? "depositAgree" : "depositDisagree",
          value,
        });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        if (receipt.status !== "success") throw new Error(`${side} deposit reverted (${hash})`);

        const amount = Number(perSide);
        await db.insert(market_positions).values({ market_id: market.id, wallet_address: wallet, side, amount, tx_hash: hash });
        await db
          .insert(market_events)
          .values({ market_id: market.id, event_type: "PositionTaken", wallet_address: wallet, amount, tx_hash: hash, block_number: Number(receipt.blockNumber) })
          .onConflictDoNothing();
        await db
          .update(markets)
          .set(side === "AGREE" ? { agree_pool: sql`${markets.agree_pool} + ${amount}` } : { disagree_pool: sql`${markets.disagree_pool} + ${amount}` })
          .where(eq(markets.id, market.id));
      }
      done += 1;
      console.log(`+ ${done}/${targets.length} ${market.title}`);
    } catch (err) {
      console.error(`failed: ${market.title}\n  ${err instanceof Error ? err.message.split("\n")[0] : err}`);
    }
  }

  const after = await publicClient.getBalance({ address: account.address });
  console.log(`\n${done} markets seeded. Balance left: ${formatEther(after)} ETH`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
