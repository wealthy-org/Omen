import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { isUuid } from "@/lib/db/filters";

export async function GET(
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

    const belief = isUuid(id)
      ? await getDb().query.beliefs.findFirst({
          where: eq(schema.beliefs.id, id),
          with: { belief_sources: true, markets: true, creator_confirmations: true },
        })
      : undefined;

    if (!belief) {
      return NextResponse.json(
        { success: false, error: `Belief with ID ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      belief,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
