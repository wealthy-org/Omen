import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const sort = searchParams.get("sort");

    const supabase = getSupabaseAdminClient();
    let query = supabase.from("markets").select("*");

    if (status && status !== "all") {
      if (status === "active") {
        query = query.eq("status", "active");
      } else if (status === "resolved") {
        query = query.in("status", ["resolved_yes", "resolved_no"]);
      } else if (status === "cancelled") {
        query = query.eq("status", "cancelled");
      }
    }

    if (category && category !== "all") {
      query = query.ilike("category", category);
    }

    if (sort === "ending_soon") {
      query = query.order("deadline", { ascending: true });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data: markets, error: marketsError } = await query;
    if (marketsError) {
      return NextResponse.json({ error: marketsError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, markets: markets || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contract_market_id, title, deadline, category, description } = body;

    if (!title || contract_market_id === undefined || !deadline) {
      return NextResponse.json({ error: "Missing required market fields" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { data: newMarket, error: insertError } = await supabase
      .from("markets")
      .insert({
        contract_market_id: Number(contract_market_id),
        title,
        deadline: new Date(deadline).toISOString(),
        category: (category || "CRYPTO").toUpperCase(),
        description: description || null,
        status: "active",
        yes_pool: 0,
        no_pool: 0,
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json({ error: "Market already exists" }, { status: 409 });
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, market: newMarket }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
