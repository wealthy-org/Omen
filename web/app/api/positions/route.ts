import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const walletParam = searchParams.get("wallet") || searchParams.get("wallet_address");

    if (!walletParam || !walletParam.trim()) {
      return NextResponse.json(
        { success: false, error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();
    const { data: positions, error } = await supabase
      .from("market_positions")
      .select("*, markets(*, beliefs(*))")
      .eq("wallet_address", walletParam.trim().toLowerCase())
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const formattedPositions = (positions || []).map((p: any) => {
      const market = p.markets || {};
      const agreePool = Number(market.agree_pool ?? market.total_pool_yes ?? 0);
      const disagreePool = Number(market.disagree_pool ?? market.total_pool_no ?? 0);
      const totalPool = agreePool + disagreePool;
      const userAmount = Number(p.amount);

      let calculatedStatus: "OPEN" | "WON" | "LOST" | "CLAIMED" | "REFUNDED" = "OPEN";
      let estimatedPayout = 0;

      const winningPool = p.side === "AGREE" ? agreePool : disagreePool;

      if (p.claimed) {
        calculatedStatus = "CLAIMED";
        estimatedPayout = winningPool > 0 ? (userAmount * totalPool) / winningPool : userAmount;
      } else if (market.status === "VOID" || market.status === "void") {
        calculatedStatus = "REFUNDED";
        estimatedPayout = userAmount;
      } else if (market.status === "RESOLVED" || market.status === "resolved") {
        if (market.winner === p.side) {
          calculatedStatus = "WON";
          estimatedPayout = winningPool > 0 ? (userAmount * totalPool) / winningPool : userAmount;
        } else if (market.winner && market.winner !== p.side) {
          calculatedStatus = "LOST";
          estimatedPayout = 0;
        } else {
          calculatedStatus = "OPEN";
          estimatedPayout = winningPool > 0 ? (userAmount * totalPool) / winningPool : userAmount;
        }
      } else {
        calculatedStatus = "OPEN";
        estimatedPayout = winningPool > 0 ? (userAmount * totalPool) / winningPool : userAmount;
      }

      return {
        id: p.id,
        market_id: p.market_id,
        wallet_address: p.wallet_address,
        side: p.side,
        amount: userAmount,
        claimed: p.claimed,
        tx_hash: p.tx_hash,
        calculated_status: calculatedStatus,
        estimated_payout: Math.round(estimatedPayout * 10000) / 10000,
        markets: market,
        created_at: p.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      count: formattedPositions.length,
      positions: formattedPositions,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
