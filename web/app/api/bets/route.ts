import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const walletAddress = searchParams.get("wallet_address")?.trim();

    if (!walletAddress || !EVM_ADDRESS_REGEX.test(walletAddress)) {
      return NextResponse.json(
        { error: "Invalid or missing wallet_address query parameter. Must be a valid 42-character EVM address." },
        { status: 400 }
      );
    }

    const normalizedAddress = walletAddress.toLowerCase();
    const supabase = getSupabaseAdminClient();

    const { data: bets, error: betsError } = await supabase
      .from("bets")
      .select("*")
      .eq("wallet_address", normalizedAddress)
      .order("created_at", { ascending: false });

    if (betsError) {
      return NextResponse.json({ error: betsError.message }, { status: 500 });
    }

    if (!bets || bets.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        bets: [],
      });
    }

    const marketIds = Array.from(new Set(bets.map((b) => b.market_id)));

    const { data: markets, error: marketsError } = await supabase
      .from("markets")
      .select("*")
      .in("id", marketIds);

    if (marketsError) {
      return NextResponse.json({ error: marketsError.message }, { status: 500 });
    }

    const marketMap = new Map((markets || []).map((m) => [m.id, m]));

    const formattedBets = bets.map((bet) => {
      const market = marketMap.get(bet.market_id);
      const betAmount = Number(bet.amount || 0);

      let status: "active" | "won" | "lost" | "cancelled" = "active";
      let payout = 0;

      if (market) {
        const agreePool = Number(market.agree_pool ?? 0);
        const disagreePool = Number(market.disagree_pool ?? 0);
        const totalPool = agreePool + disagreePool;
        const normalizedSide = String(bet.side).toUpperCase();

        if (market.status === "active" || market.status === "OPEN") {
          status = "active";
        } else if (market.status === "cancelled" || market.winner === "VOID") {
          status = "cancelled";
          payout = betAmount;
        } else if (market.winner === "AGREE") {
          if (normalizedSide === "AGREE") {
            status = "won";
            payout = agreePool > 0 ? (betAmount / agreePool) * totalPool : betAmount;
          } else {
            status = "lost";
            payout = 0;
          }
        } else if (market.winner === "DISAGREE") {
          if (normalizedSide === "DISAGREE") {
            status = "won";
            payout = disagreePool > 0 ? (betAmount / disagreePool) * totalPool : betAmount;
          } else {
            status = "lost";
            payout = 0;
          }
        }
      }

      return {
        id: bet.id,
        market_id: bet.market_id,
        contract_market_id: market?.contract_market_id ?? null,
        market_title: market?.title ?? "Unknown Market",
        market_status: market?.status ?? "unknown",
        market_deadline: market?.deadline ?? null,
        wallet_address: bet.wallet_address,
        side: bet.side,
        amount: betAmount,
        payout,
        claimed: Boolean(bet.claimed),
        tx_hash: bet.tx_hash,
        status,
        created_at: bet.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      count: formattedBets.length,
      bets: formattedBets,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
