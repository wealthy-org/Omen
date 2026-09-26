import { NextRequest, NextResponse } from "next/server";
import { and, asc, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { isAuthorizedAdmin } from "@/lib/admin-auth";
import { ETHEREUM_SEPOLIA_CHAIN_ID } from "@/lib/constants";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const tabParam = searchParams.get("tab")?.toLowerCase();
    const statusParam = searchParams.get("status")?.toLowerCase();
    const categoryParam = searchParams.get("category")?.toLowerCase();
    const sortParam = searchParams.get("sort")?.toLowerCase();
    const searchParam = searchParams.get("search") || searchParams.get("q") || "";
    const rawLimit = searchParams.get("limit");
    const rawOffset = searchParams.get("offset");

    const limit = rawLimit ? Math.min(Math.max(parseInt(rawLimit, 10) || 20, 1), 100) : 20;
    const offset = rawOffset ? Math.max(parseInt(rawOffset, 10) || 0, 0) : 0;

    const db = getDb();
    const { markets } = schema;

    const statusFilter =
      statusParam === "active" ? eq(markets.status, "active")
      : statusParam === "resolved" ? inArray(markets.status, ["RESOLVED", "resolved"])
      : statusParam === "cancelled" ? eq(markets.status, "cancelled")
      : statusParam === "open" ? inArray(markets.status, ["OPEN", "open", "active"])
      : undefined;
    const search = searchParam.trim();

    const where = and(
      statusFilter,
      categoryParam && categoryParam !== "all" ? ilike(markets.category, categoryParam) : undefined,
      search ? or(ilike(markets.title, `%${search}%`), ilike(markets.description, `%${search}%`)) : undefined
    );

    const orderBy =
      tabParam === "ending_soon" ? asc(markets.close_time)
      : sortParam === "ending_soon" ? asc(markets.deadline)
      : tabParam === "most_volume" || sortParam === "highest_pool" ? desc(markets.agree_pool)
      : desc(markets.created_at);

    const [marketRows, count] = await Promise.all([
      db.query.markets.findMany({
        where,
        orderBy,
        limit,
        offset,
        with: {
          beliefs: { with: { belief_sources: true } },
          market_positions: { columns: { id: true, side: true, wallet_address: true } },
        },
      }),
      db.$count(markets, where),
    ]);

    const formattedMarkets = marketRows.map((m) => {
      const agreePool = Number(m.agree_pool ?? 0);
      const disagreePool = Number(m.disagree_pool ?? 0);
      const totalPool = agreePool + disagreePool;
      const capitalConsensus = totalPool > 0 ? (agreePool / totalPool) * 100 : 0;
      const positions = Array.isArray(m.market_positions) ? m.market_positions : [];
      const agreeParticipants = positions.filter((p: any) => p.side === "AGREE").length;
      const disagreeParticipants = positions.filter((p: any) => p.side === "DISAGREE").length;
      const uniqueParticipants = new Set(positions.map((p: any) => p.wallet_address)).size;

      return {
        id: m.id,
        contract_market_id: m.contract_market_id,
        contract_address: m.contract_address ?? null,
        chain_id: typeof m.chain_id === "number" ? m.chain_id : ETHEREUM_SEPOLIA_CHAIN_ID,
        belief_id: m.belief_id,
        title: m.title ?? m.beliefs?.statement ?? null,
        description: m.description ?? null,
        category: m.category ?? "crypto",
        deadline: m.close_time ?? m.deadline ?? null,
        open_time: m.open_time,
        close_time: m.close_time ?? m.deadline ?? null,
        status: m.status,
        resolution_source: m.resolution_source ?? null,
        resolution_type: m.resolution_type,
        resolution_config: m.resolution_config,
        winner: m.winner,
        agree_pool: agreePool,
        disagree_pool: disagreePool,
        total_pool: totalPool,
        capital_consensus: Math.round(capitalConsensus * 100) / 100,
        agree_participants: agreeParticipants,
        disagree_participants: disagreeParticipants,
        participants_count: uniqueParticipants,
        metadata_hash: m.metadata_hash,
        beliefs: m.beliefs,
        created_at: m.created_at,
        belief: m.beliefs
          ? {
              id: m.beliefs.id,
              author: m.beliefs.author,
              statement: m.beliefs.statement,
              source_url: m.beliefs.source_url,
              source_platform: m.beliefs.source_platform,
              source_timestamp: m.beliefs.source_timestamp,
              ai_confidence: m.beliefs.ai_confidence,
              status: m.beliefs.status,
              created_at: m.beliefs.created_at,
              sources: m.beliefs.belief_sources || [],
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedMarkets,
      count: formattedMarkets.length,
      total: count ?? formattedMarkets.length,
      markets: formattedMarkets,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorizedAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Request body must be an object" }, { status: 400 });
    }

    const {
      contract_market_id,
      title,
      description,
      deadline,
      category,
      resolution_source,
      belief_id,
      contract_address,
      chain_id,
      open_time,
      resolution_type,
      resolution_config,
      tx_hash,
    } = body;

    const parsedMarketId = Number(contract_market_id);
    if (
      contract_market_id === undefined ||
      contract_market_id === null ||
      !Number.isInteger(parsedMarketId) ||
      parsedMarketId < 0
    ) {
      return NextResponse.json(
        { error: "Invalid or missing contract_market_id: must be a non-negative integer" },
        { status: 400 }
      );
    }

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Invalid or missing title: must be a non-empty string" },
        { status: 400 }
      );
    }

    if (!deadline || typeof deadline !== "string" || isNaN(Date.parse(deadline))) {
      return NextResponse.json(
        { error: "Invalid or missing deadline: must be a valid ISO date string" },
        { status: 400 }
      );
    }

    const sanitizedCategory =
      typeof category === "string" && category.trim().length > 0
        ? category.trim().toLowerCase()
        : "crypto";

    const sanitizedDescription =
      typeof description === "string" && description.trim().length > 0
        ? description.trim()
        : null;

    const sanitizedResolutionSource =
      typeof resolution_source === "string" && resolution_source.trim().length > 0
        ? resolution_source.trim()
        : null;

    const db = getDb();
    const { markets, beliefs, market_events } = schema;

    const existingMarket = await db.query.markets.findFirst({
      columns: { id: true },
      where: eq(markets.contract_market_id, parsedMarketId),
    });

    if (existingMarket) {
      return NextResponse.json(
        { error: `Market with contract_market_id ${parsedMarketId} already exists` },
        { status: 409 }
      );
    }

    const [createdMarket] = await db
      .insert(markets)
      .values({
        contract_market_id: parsedMarketId,
        belief_id: belief_id || null,
        contract_address: contract_address || null,
        chain_id: chain_id ? Number(chain_id) : ETHEREUM_SEPOLIA_CHAIN_ID,
        title: title.trim(),
        description: sanitizedDescription,
        category: sanitizedCategory,
        deadline: new Date(deadline).toISOString(),
        close_time: new Date(deadline).toISOString(),
        status: "OPEN",
        agree_pool: 0,
        disagree_pool: 0,
        resolution_source: sanitizedResolutionSource,
        open_time: typeof open_time === "string" && !isNaN(Date.parse(open_time)) ? new Date(open_time).toISOString() : undefined,
        resolution_type: resolution_type === "PRICE_ABOVE" || resolution_type === "PRICE_BELOW" || resolution_type === "RELATIVE_PERFORMANCE" ? resolution_type : null,
        resolution_config: resolution_config && typeof resolution_config === "object" ? resolution_config : null,
      })
      .returning();

    if (belief_id) {
      await db.update(beliefs).set({ status: "OPEN" }).where(eq(beliefs.id, belief_id));
    }

    if (typeof tx_hash === "string" && tx_hash.startsWith("0x")) {
      await db
        .insert(market_events)
        .values({
          market_id: createdMarket.id,
          event_type: "MarketCreated",
          wallet_address: req.headers.get("x-admin-wallet")?.toLowerCase() ?? null,
          tx_hash,
        })
        .onConflictDoNothing();
    }

    const agreePool = Number(createdMarket.agree_pool ?? 0);
    const disagreePool = Number(createdMarket.disagree_pool ?? 0);

    return NextResponse.json(
      {
        success: true,
        market: {
          id: createdMarket.id,
          contract_market_id: createdMarket.contract_market_id,
          contract_address: createdMarket.contract_address,
          chain_id: createdMarket.chain_id,
          belief_id: createdMarket.belief_id,
          title: createdMarket.title,
          description: createdMarket.description,
          category: createdMarket.category,
          deadline: createdMarket.deadline,
          status: createdMarket.status,
          agree_pool: agreePool,
          disagree_pool: disagreePool,
          total_pool: agreePool + disagreePool,
          resolution_source: createdMarket.resolution_source,
          created_at: createdMarket.created_at,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
