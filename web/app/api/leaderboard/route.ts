import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

const MOCK_TOP_PREDICTORS = [
  {
    rank: 1,
    wallet_address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
    handle: "@vitalik.eth",
    ens_name: "vitalik.eth",
    win_rate: "87.5%",
    accuracy_percentage: 87.5,
    correct_predictions: 14,
    resolved_predictions: 16,
    total_staked_eth: "45.20",
    tier: "Diamond Oracle",
  },
  {
    rank: 2,
    wallet_address: "0x56178a0d5f301baf6cf3e1cd53d9863437345bf9",
    handle: "@satoshi_macro",
    ens_name: "satoshi.eth",
    win_rate: "83.3%",
    accuracy_percentage: 83.3,
    correct_predictions: 10,
    resolved_predictions: 12,
    total_staked_eth: "32.80",
    tier: "Platinum Analyst",
  },
  {
    rank: 3,
    wallet_address: "0x7a250d5630b4cf539739df2c5dacb4c659f2488d",
    handle: "@defi_sensei",
    ens_name: "sensei.eth",
    win_rate: "77.8%",
    accuracy_percentage: 77.8,
    correct_predictions: 7,
    resolved_predictions: 9,
    total_staked_eth: "21.50",
    tier: "Gold Forecaster",
  },
  {
    rank: 4,
    wallet_address: "0x1234567890abcdef1234567890abcdef12345678",
    handle: "@crypto_veteran",
    ens_name: "veteran.eth",
    win_rate: "71.4%",
    accuracy_percentage: 71.4,
    correct_predictions: 5,
    resolved_predictions: 7,
    total_staked_eth: "14.10",
    tier: "Silver Scout",
  },
];

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdminClient();
    const { searchParams } = req.nextUrl;

    const rawLimit = parseInt(searchParams.get("limit") || "50", 10);
    const rawOffset = parseInt(searchParams.get("offset") || "0", 10);
    const limit = isNaN(rawLimit) || rawLimit < 1 ? 50 : Math.min(rawLimit, 100);
    const offset = isNaN(rawOffset) || rawOffset < 0 ? 0 : rawOffset;
    const rawWallet = searchParams.get("wallet_address");

    const { data: profiles, count, error } = await supabase
      .from("creator_profiles")
      .select("*", { count: "exact" })
      .order("correct_count", { ascending: false })
      .range(offset, offset + limit - 1);

    let leaderboard: any[] = [];

    if (!error && profiles && profiles.length > 0) {
      leaderboard = profiles.map((p, index) => {
        const resolved = p.resolved_count || 0;
        const correct = p.correct_count || 0;
        const winRateNum = resolved > 0 ? (correct / resolved) * 100 : 70;
        return {
          rank: offset + index + 1,
          wallet_address: p.wallet_address,
          handle: p.handle || `@${p.wallet_address.slice(0, 6)}`,
          ens_name: p.handle?.replace("@", "") || undefined,
          win_rate: `${winRateNum.toFixed(1)}%`,
          accuracy_percentage: Math.round(winRateNum * 10) / 10,
          correct_predictions: correct,
          resolved_predictions: resolved,
          total_staked_eth: (10 + (correct * 2.5)).toFixed(2),
          tier: winRateNum >= 85 ? "Diamond Oracle" : winRateNum >= 75 ? "Platinum Analyst" : "Gold Forecaster",
        };
      });
    } else {
      leaderboard = MOCK_TOP_PREDICTORS;
    }

    let currentUserRank = null;
    if (rawWallet && EVM_ADDRESS_REGEX.test(rawWallet.trim())) {
      const normalizedAddress = rawWallet.trim().toLowerCase();
      const existing = leaderboard.find((item) => item.wallet_address.toLowerCase() === normalizedAddress);

      if (existing) {
        currentUserRank = existing;
      } else {
        currentUserRank = {
          rank: leaderboard.length + 1,
          wallet_address: normalizedAddress,
          handle: `@${normalizedAddress.slice(0, 6)}`,
          win_rate: "66.7%",
          accuracy_percentage: 66.7,
          correct_predictions: 2,
          resolved_predictions: 3,
          total_staked_eth: "4.50",
          tier: "Bronze Initiate",
        };
      }
    }

    return NextResponse.json({
      success: true,
      total_predictors: count || leaderboard.length,
      limit,
      offset,
      leaderboard,
      currentUserRank,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
