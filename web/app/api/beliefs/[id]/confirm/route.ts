import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { verifyBeliefConfirmationSignature } from "@/lib/eip712/confirmation";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { creator_address, signature, timestamp, chain_id, tx_hash } = body;

    if (!creator_address || !signature || timestamp === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: creator_address, signature, or timestamp" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();

    const { data: belief, error: beliefError } = await supabase
      .from("beliefs")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (beliefError || !belief) {
      return NextResponse.json(
        { success: false, error: "Belief not found" },
        { status: 404 }
      );
    }

    const effectiveChainId = Number(chain_id) || 11155111;

    const isValid = await verifyBeliefConfirmationSignature({
      beliefId: id,
      statement: belief.statement,
      timestamp,
      chainId: effectiveChainId,
      creatorAddress: creator_address,
      signature,
    });

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid signature or creator address mismatch" },
        { status: 401 }
      );
    }

    await supabase
      .from("beliefs")
      .update({ status: "CONFIRMED" })
      .eq("id", id);

    const normalizedWallet = creator_address.toLowerCase();

    const { data: confirmation } = await supabase
      .from("creator_confirmations")
      .insert({
        belief_id: id,
        creator_wallet: normalizedWallet,
        signature,
        tx_hash: tx_hash || null,
      })
      .select()
      .single();

    const { data: profile } = await supabase
      .from("creator_profiles")
      .select("*")
      .eq("wallet_address", normalizedWallet)
      .maybeSingle();

    if (profile) {
      await supabase
        .from("creator_profiles")
        .upsert({
          ...profile,
          wallet_address: normalizedWallet,
          confirmed_beliefs_count: (profile.confirmed_beliefs_count || 0) + 1,
        })
        .select();
    } else {
      await supabase
        .from("creator_profiles")
        .upsert({
          wallet_address: normalizedWallet,
          confirmed_beliefs_count: 1,
          resolved_count: 0,
          correct_count: 0,
        })
        .select();
    }

    return NextResponse.json({
      success: true,
      message: "Belief successfully confirmed by creator",
      data: confirmation || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
