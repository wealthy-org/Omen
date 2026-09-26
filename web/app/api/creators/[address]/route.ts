import { NextRequest, NextResponse } from "next/server";
import { desc, ilike, or } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import type { CreatorProfileDetail, Belief } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!address || typeof address !== "string" || address.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Creator address or handle is required" },
        { status: 400 }
      );
    }

    const rawAddress = decodeURIComponent(address).trim();
    const cleanHandle = rawAddress.startsWith("@") ? rawAddress : `@${rawAddress}`;
    const cleanName = rawAddress.replace(/^@/, "");
    const db = getDb();
    const { beliefs, creator_profiles } = schema;
    const findBeliefsByAuthor = (...authors: string[]) =>
      db.query.beliefs.findMany({
        where: or(...authors.map((a) => ilike(beliefs.author, a))),
        orderBy: desc(beliefs.created_at),
      });

    const profile = await db.query.creator_profiles.findFirst({
      where: or(
        ilike(creator_profiles.wallet_address, rawAddress),
        ilike(creator_profiles.handle, cleanHandle),
        ilike(creator_profiles.handle, cleanName)
      ),
    });

    let creatorProfile: CreatorProfileDetail | null = (profile ?? null) as CreatorProfileDetail | null;
    let creatorBeliefs: Belief[] = [];

    if (creatorProfile) {
      const authors = [creatorProfile.wallet_address, cleanName];
      if (creatorProfile.handle) authors.unshift(creatorProfile.handle);

      creatorBeliefs = (await findBeliefsByAuthor(...authors)) as Belief[];
    } else {
      const authoredBeliefs = await findBeliefsByAuthor(rawAddress, cleanHandle, cleanName);

      if (authoredBeliefs.length > 0) {
        const typedBeliefs = authoredBeliefs as Belief[];
        creatorBeliefs = typedBeliefs;
        const firstBelief = typedBeliefs[0];
        const confirmedCount = typedBeliefs.filter((b) => b.status === "CONFIRMED").length;
        const authorText = typeof firstBelief.author === "string" ? firstBelief.author : cleanName;
        const handleText = authorText.startsWith("@") ? authorText : `@${authorText}`;

        creatorProfile = {
          id: `creator-${cleanName}`,
          wallet_address: rawAddress,
          handle: handleText,
          display_name: authorText.replace("@", ""),
          bio: "Social Belief Creator on Omen Protocol",
          avatar_url: null,
          total_beliefs_count: typedBeliefs.length,
          confirmed_beliefs_count: confirmedCount,
          resolved_count: 0,
          correct_count: 0,
          created_at: firstBelief.created_at ?? new Date().toISOString(),
        };
      } else {
        return NextResponse.json(
          { success: false, error: "Creator profile not found" },
          { status: 404 }
        );
      }
    }

    const resolved = Number(creatorProfile.resolved_count ?? 0);
    const correct = Number(creatorProfile.correct_count ?? 0);
    const accuracy = resolved > 0 ? Number(((correct / resolved) * 100).toFixed(2)) : 100;

    const formattedData = {
      ...creatorProfile,
      accuracy_percentage: accuracy,
      beliefs: creatorBeliefs,
    };

    return NextResponse.json({
      success: true,
      data: formattedData,
      creator: formattedData,
      beliefs: creatorBeliefs,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
