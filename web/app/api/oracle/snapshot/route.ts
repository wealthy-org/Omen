import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { fetchChainlinkPrice } from "@/lib/oracle/chainlink";
import { ETHEREUM_SEPOLIA_CHAIN_ID } from "@/lib/constants";
import type { SnapshotType, OracleSnapshotSource } from "@/types/database";

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
        chain_id ? Number(chain_id) : ETHEREUM_SEPOLIA_CHAIN_ID,
        feed_address
      );
      resolvedPrice = oracleData.price;
    }

    const [snapshot] = await getDb()
      .insert(schema.oracle_snapshots)
      .values({
        market_id: market_id || null,
        asset: asset.toUpperCase().trim(),
        price: Number(resolvedPrice),
        snapshot_type: (typeof snapshot_type === "string" ? snapshot_type : "DISPLAY") as SnapshotType,
        source: (typeof source === "string" ? source : "chainlink") as OracleSnapshotSource,
        recorded_at: new Date().toISOString(),
      })
      .returning();

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

    const { oracle_snapshots } = schema;
    const snapshots = await getDb().query.oracle_snapshots.findMany({
      where: asset ? eq(oracle_snapshots.asset, asset) : undefined,
      orderBy: desc(oracle_snapshots.recorded_at),
      limit,
    });

    return NextResponse.json({
      success: true,
      snapshots,
      data: snapshots,
      total: snapshots.length,
    });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
