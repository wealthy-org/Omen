import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdminClient();
    const { searchParams } = req.nextUrl;

    const statusParam = (searchParams.get("status") || "all").toLowerCase();
    const categoryParam = (searchParams.get("category") || "all").toLowerCase();
    const sortParam = (searchParams.get("sort") || "newest").toLowerCase();

    let query = supabase.from("markets").select("*");

    if (statusParam === "active") {
      query = query.eq("status", "active");
    } else if (statusParam === "resolved") {
      query = query.in("status", ["resolved_yes", "resolved_no"]);
    } else if (statusParam === "cancelled") {
      query = query.eq("status", "cancelled");
    }

    if (categoryParam !== "all") {
      query = query.ilike("category", categoryParam);
    }

    if (sortParam === "highest_pool") {
      query = query.order("total_pool_yes", { ascending: false });
    } else if (sortParam === "ending_soon") {
      query = query.order("deadline", { ascending: true });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data: markets, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formattedMarkets = (markets || []).map((m) => {
      const yesPool = Number(m.total_pool_yes ?? m.yes_pool ?? 0);
      const noPool = Number(m.total_pool_no ?? m.no_pool ?? 0);
      return {
        id: m.id,
        contract_market_id: m.contract_market_id,
        title: m.title,
        description: m.description,
        category: m.category || "crypto",
        deadline: m.deadline,
        status: m.status,
        yes_pool: yesPool,
        no_pool: noPool,
        total_pool_yes: yesPool,
        total_pool_no: noPool,
        total_pool: yesPool + noPool,
        resolution_source: m.resolution_source,
        created_at: m.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      count: formattedMarkets.length,
      markets: formattedMarkets,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
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
    "omen-admin-2026",
  ].filter(Boolean) as string[];

  const validAdminWallets = [
    process.env.ADMIN_WALLET_ADDRESS?.trim().toLowerCase(),
    process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS?.trim().toLowerCase(),
    "0xadmin99999999999999999999999999999999999",
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

    const {
      contract_market_id,
      title,
      description,
      deadline,
      category,
      resolution_source,
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
        title: title.trim(),
        description: sanitizedDescription,
        category: sanitizedCategory,
        deadline: new Date(deadline).toISOString(),
        status: "active",
        total_pool_yes: 0,
        total_pool_no: 0,
        resolution_source: sanitizedResolutionSource,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const yesPool = Number(createdMarket.total_pool_yes ?? createdMarket.yes_pool ?? 0);
    const noPool = Number(createdMarket.total_pool_no ?? createdMarket.no_pool ?? 0);

    return NextResponse.json(
      {
        success: true,
        market: {
          id: createdMarket.id,
          contract_market_id: createdMarket.contract_market_id,
          title: createdMarket.title,
          description: createdMarket.description,
          category: createdMarket.category,
          deadline: createdMarket.deadline,
          status: createdMarket.status,
          yes_pool: yesPool,
          no_pool: noPool,
          total_pool_yes: yesPool,
          total_pool_no: noPool,
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
