import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { fetchChainlinkPrice } from "@/lib/oracle/chainlink";

export async function POST(req: NextRequest) {
  try {
    const adminKeyHeader = req.headers.get("x-admin-key");
    const authHeader = req.headers.get("authorization");
    const configuredKey = process.env.ADMIN_API_KEY || process.env.CRON_SECRET;

    const providedKey = adminKeyHeader || (authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null);

    if (!configuredKey || !providedKey || providedKey !== configuredKey) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid or missing admin key" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { market_id, asset, price, snapshot_type, source, chain_id, feed_address } = body;

    if (!asset || typeof asset !== "string") {
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
        snapshot_type: snapshot_type || "DISPLAY",
        source: source || "chainlink",
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
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
