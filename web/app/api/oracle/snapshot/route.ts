import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { fetchChainlinkPrice } from "@/lib/oracle/chainlink";

export async function POST(req: NextRequest) {
  try {
    const adminKeyHeader = req.headers.get("x-admin-key")?.trim();
    const authHeader = req.headers.get("authorization")?.trim();
    const configuredKey = process.env.ADMIN_API_KEY?.trim() || process.env.CRON_SECRET?.trim();

    const bearerToken = authHeader && authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : null;

    const providedKey = adminKeyHeader || bearerToken;

    if (!configuredKey || !providedKey || providedKey !== configuredKey) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid or missing admin key" },
        { status: 401 }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Request body must be an object" }, { status: 400 });
    }

    const { market_id, asset, price, snapshot_type, source, chain_id, feed_address } = body;

    if (!asset || typeof asset !== "string" || asset.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required field: asset" },
        { status: 400 }
      );
    }

    let resolvedPrice = price;

    if (resolvedPrice === undefined || resolvedPrice === null) {
      const oracleData = await fetchChainlinkPrice(
        asset,
        chain_id ? Number(chain_id) : 11155111,
        feed_address
      );
      resolvedPrice = oracleData.price;
    }

    const supabase = getSupabaseAdminClient();

    const { data: snapshot, error: insertError } = await supabase
      .from("oracle_snapshots")
      .insert({
        market_id: market_id || null,
        asset: asset.toUpperCase().trim(),
        price: Number(resolvedPrice),
        snapshot_type: typeof snapshot_type === "string" ? snapshot_type : "DISPLAY",
        source: typeof source === "string" ? source : "chainlink",
        recorded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: snapshot,
    });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const asset = searchParams.get("asset")?.toUpperCase().trim();
    const limitParam = parseInt(searchParams.get("limit") || "20", 10);
    const limit = isNaN(limitParam) ? 20 : Math.min(Math.max(limitParam, 1), 100);

    const supabase = getSupabaseAdminClient();
    let query = supabase
      .from("oracle_snapshots")
      .select("*")
      .order("recorded_at", { ascending: false })
      .limit(limit);

    if (asset) {
      query = query.eq("asset", asset);
    }

    const { data: snapshots, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      snapshots: snapshots || [],
      data: snapshots || [],
      total: snapshots ? snapshots.length : 0,
    });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
