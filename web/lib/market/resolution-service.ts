import { eq, ilike, or, sql } from "drizzle-orm";
import { ResolvedOutcome } from "@/types/database";
import { schema, type Db } from "../db";
import { isValidEvmAddress } from "../validators";
import { calculateSettlementPool } from "./resolution-helper";

export async function updateCreatorProfile(
  db: Db,
  beliefId: string,
  outcome: ResolvedOutcome
): Promise<void> {
  try {
    const { beliefs, creator_profiles } = schema;

    await db.update(beliefs).set({ status: "RESOLVED" }).where(eq(beliefs.id, beliefId));

    const belief = await db.query.beliefs.findFirst({ where: eq(beliefs.id, beliefId) });

    if (!belief || !belief.author) {
      return;
    }

    const isCorrect = outcome === "AGREE";
    const authorStr = belief.author.trim();
    const bareHandle = authorStr.replace(/^@/, "");

    const profile = await db.query.creator_profiles.findFirst({
      where: isValidEvmAddress(authorStr)
        ? eq(creator_profiles.wallet_address, authorStr.toLowerCase())
        : or(
            ilike(creator_profiles.handle, bareHandle),
            ilike(creator_profiles.handle, `@${bareHandle}`),
            ilike(creator_profiles.wallet_address, authorStr)
          ),
    });

    if (profile) {
      await db
        .update(creator_profiles)
        .set({
          resolved_count: sql`${creator_profiles.resolved_count} + 1`,
          correct_count: sql`${creator_profiles.correct_count} + ${isCorrect ? 1 : 0}`,
        })
        .where(eq(creator_profiles.id, profile.id));
    }
  } catch {
    void 0;
  }
}

export async function insertResolutionRecord(
  db: Db,
  params: {
    marketId: string;
    oracleSource: string;
    startPrice?: number | null;
    endPrice?: number | null;
    resolvedOutcome: ResolvedOutcome;
    resolutionTxHash?: string | null;
    resolvedAt?: string;
  }
) {
  try {
    const [resolution] = await db
      .insert(schema.market_resolutions)
      .values({
        market_id: params.marketId,
        oracle_source: params.oracleSource,
        start_price: params.startPrice !== undefined && params.startPrice !== null ? Number(params.startPrice) : null,
        end_price: params.endPrice !== undefined && params.endPrice !== null ? Number(params.endPrice) : null,
        resolved_outcome: params.resolvedOutcome,
        resolution_tx_hash: params.resolutionTxHash || null,
        resolved_at: params.resolvedAt || new Date().toISOString(),
      })
      .returning();
    return resolution;
  } catch {
    return null;
  }
}

export async function insertSettlementRecord(
  db: Db,
  params: {
    marketId: string;
    agreePool: number;
    disagreePool: number;
    outcome: ResolvedOutcome;
    protocolFeeBps?: number;
  }
) {
  const settlement = calculateSettlementPool(
    params.agreePool,
    params.disagreePool,
    params.outcome,
    params.protocolFeeBps
  );

  try {
    const [settlementData] = await db
      .insert(schema.market_settlements)
      .values({
        market_id: params.marketId,
        total_pool: settlement.totalPool,
        distributable_pool: settlement.distributablePool,
        protocol_fee: settlement.protocolFee,
        settled_at: new Date().toISOString(),
      })
      .returning();
    return { settlementData, settlement };
  } catch {
    return { settlementData: null, settlement };
  }
}
