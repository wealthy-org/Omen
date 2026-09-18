import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdminClient();
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

    let query: any = supabase.from("markets").select("*, beliefs(*, belief_sources(*))");

    if (statusParam === "active") {
      query = query.eq("status", "active");
    } else if (statusParam === "resolved") {
      query = query.in("status", ["resolved_yes", "resolved_no"]);
    } else if (statusParam === "cancelled") {
      query = query.eq("status", "cancelled");
    } else if (statusParam === "open") {
      query = query.in("status", ["OPEN", "open", "active"]);
    }

    if (categoryParam && categoryParam !== "all") {
      query = query.ilike("category", categoryParam);
    }

    if (searchParam.trim()) {
      query = query.or(`title.ilike.%${searchParam}%,description.ilike.%${searchParam}%`);
    }

    if (tabParam === "ending_soon") {
      query = query.order("close_time", { ascending: true });
    } else if (sortParam === "ending_soon") {
      query = query.order("deadline", { ascending: true });
    } else if (tabParam === "most_volume") {
      query = query.order("agree_pool", { ascending: false });
    } else if (sortParam === "highest_pool") {
      query = query.order("total_pool_yes", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const result = typeof query.range === "function"
      ? await query.range(offset, offset + limit - 1)
      : await query;

    const { data: markets, error, count } = result;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const formattedMarkets = (markets || []).map((m: any) => {
      const agreePool = Number(m.agree_pool ?? m.total_pool_yes ?? 0);
      const disagreePool = Number(m.disagree_pool ?? m.total_pool_no ?? 0);
      const totalPool = agreePool + disagreePool;
      const capitalConsensus = totalPool > 0 ? (agreePool / totalPool) * 100 : 50;

      return {
        id: m.id,
        contract_market_id: m.contract_market_id,
        contract_address: m.contract_address ?? null,
        chain_id: typeof m.chain_id === "number" ? m.chain_id : 11155111,
        belief_id: m.belief_id,
        title: m.title ?? m.beliefs?.statement ?? null,
        description: m.description ?? null,
        category: m.category ?? "crypto",
        deadline: m.close_time ?? m.deadline ?? null,
        open_time: m.open_time,
        close_time: m.close_time ?? m.deadline ?? null,
        status: m.status,
        winner: m.winner,
        agree_pool: agreePool,
        disagree_pool: disagreePool,
        total_pool_yes: agreePool,
        total_pool_no: disagreePool,
        total_pool: totalPool,
        capital_consensus: Math.round(capitalConsensus * 100) / 100,
        resolution_type: m.resolution_type,
        resolution_config: m.resolution_config,
        resolution_source: m.resolution_source ?? null,
        metadata_hash: m.metadata_hash,
        beliefs: m.beliefs,
        created_at: m.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      count: formattedMarkets.length,
      total: count ?? formattedMarkets.length,
      markets: formattedMarkets,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

function isAuthorizedAdmin(req: NextRequest): boolean {
  const adminKeyHeader = req.headers.get("x-admin-key")?.trim();
  const authHeader = req.headers.get("authorization")?.trim();
  const bearerToken = authHeader?.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : null;
  const adminWalletHeader = req.headers.get("x-admin-wallet")?.trim().toLowerCase();

  const validAdminKeys = [
    process.env.ADMIN_SECRET_KEY?.trim(),
    process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY?.trim(),
    process.env.ADMIN_API_KEY?.trim(),
  ].filter(Boolean) as string[];

  const validAdminWallets = [
    process.env.ADMIN_WALLET_ADDRESS?.trim().toLowerCase(),
    process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS?.trim().toLowerCase(),
  ].filter(Boolean) as string[];

  if (adminKeyHeader && validAdminKeys.includes(adminKeyHeader)) {
    return true;
  }

  if (bearerToken && validAdminKeys.includes(bearerToken)) {
    return true;
  }

  if (adminWalletHeader && validAdminWallets.includes(adminWalletHeader)) {
    return true;
  }

  return false;
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

    const supabase = getSupabaseAdminClient();

    const { data: existingMarket } = await supabase
      .from("markets")
      .select("id")
      .eq("contract_market_id", parsedMarketId)
      .maybeSingle();

    if (existingMarket) {
      return NextResponse.json(
        { error: `Market with contract_market_id ${parsedMarketId} already exists` },
        { status: 409 }
      );
    }

    const { data: createdMarket, error } = await supabase
      .from("markets")
      .insert({
        contract_market_id: parsedMarketId,
        belief_id: belief_id || null,
        contract_address: contract_address || null,
        chain_id: chain_id ? Number(chain_id) : 11155111,
        title: title.trim(),
        description: sanitizedDescription,
        category: sanitizedCategory,
        deadline: new Date(deadline).toISOString(),
        close_time: new Date(deadline).toISOString(),
        status: "active",
        agree_pool: 0,
        disagree_pool: 0,
        total_pool_yes: 0,
        total_pool_no: 0,
        resolution_source: sanitizedResolutionSource,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const yesPool = Number(createdMarket.total_pool_yes ?? 0);
    const noPool = Number(createdMarket.total_pool_no ?? 0);

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
          yes_pool: yesPool,
          no_pool: noPool,
          agree_pool: yesPool,
          disagree_pool: noPool,
          total_pool: yesPool + noPool,
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
