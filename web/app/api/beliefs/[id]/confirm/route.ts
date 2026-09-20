import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { verifyBeliefConfirmationSignature } from "@/lib/eip712/confirmation";
import { isValidEvmAddress } from "@/lib/validators";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Belief ID is required" },
        { status: 400 }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Request body must be an object" },
        { status: 400 }
      );
    }

    const { creator_address, signature, timestamp, chain_id, tx_hash } = body;

    if (!isValidEvmAddress(creator_address)) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing creator_address: must be a valid 42-character EVM address" },
        { status: 400 }
      );
    }

    if (!signature || typeof signature !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing required field: signature" },
        { status: 400 }
      );
    }

    const parsedTimestamp = Number(timestamp);
    if (timestamp === undefined || timestamp === null || isNaN(parsedTimestamp) || parsedTimestamp <= 0) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid field: timestamp must be a positive integer" },
        { status: 400 }
      );
    }

    const parsedChainId = Number(chain_id);
    if (chain_id === undefined || chain_id === null || isNaN(parsedChainId) || parsedChainId <= 0) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid field: chain_id must be a positive integer" },
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

    const isValid = await verifyBeliefConfirmationSignature({
      beliefId: id,
      statement: belief.statement,
      timestamp: parsedTimestamp,
      chainId: parsedChainId,
      creatorAddress: creator_address.trim(),
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

    const normalizedWallet = creator_address.trim().toLowerCase();

    const { data: confirmation } = await supabase
      .from("creator_confirmations")
      .insert({
        belief_id: id,
        creator_wallet: normalizedWallet,
        signature,
        tx_hash: typeof tx_hash === "string" ? tx_hash : null,
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
