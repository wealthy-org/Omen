import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get("wallet_address");

    if (!walletAddress) {
      return NextResponse.json({ error: "Missing required wallet_address" }, { status: 400 });
    }

    const normalizedAddress = walletAddress.toLowerCase();
    const supabase = getSupabaseAdminClient();

    const { data: bets, error: betsError } = await supabase
      .from("bets")
      .select("*, markets(*)")
      .eq("wallet_address", normalizedAddress)
      .order("created_at", { ascending: false });

    if (betsError) {
      return NextResponse.json({ error: betsError.message }, { status: 500 });
    }

    const formattedBets = (bets || []).map((b: any) => {
      const market = b.markets;
      let status = "active";
      let payout = Number(b.amount || 0);

      if (market) {
        if (market.status === "cancelled") {
          status = "cancelled";
          payout = Number(b.amount || 0);
        } else if (market.status === "resolved_yes") {
          if (b.side === "yes") {
            status = "won";
            payout = Number(b.amount) * 1.5;
          } else {
            status = "lost";
            payout = 0;
          }
        } else if (market.status === "resolved_no") {
          if (b.side === "no") {
            status = "won";
            payout = Number(b.amount) * 1.5;
          } else {
            status = "lost";
            payout = 0;
          }
        }
      }

      return {
        ...b,
        status,
        payout,
      };
    });

    return NextResponse.json({ success: true, bets: formattedBets });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
