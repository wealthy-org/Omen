import { NextResponse } from "next/server";
import { ExtractBeliefRequestSchema } from "../../../../types/belief";
import { extractBeliefFromText } from "../../../../lib/ai/openrouter";
import { extractMockBelief, isMockAiEnabled } from "../../../../lib/ai/mockOpenRouter";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const validation = ExtractBeliefRequestSchema.safeParse(body);
    if (!validation.success) {
      const errorMsg = validation.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");
      return NextResponse.json(
        { success: false, error: `Invalid request payload: ${errorMsg}` },
        { status: 400 }
      );
    }

    const { raw_text, author_handle, source_url } = validation.data;

    if (process.env.NODE_ENV !== "test" && isMockAiEnabled()) {
      const mockData = extractMockBelief(raw_text);
      return NextResponse.json(
        { success: true, data: mockData },
        { status: 200 }
      );
    }

    if (process.env.NODE_ENV !== "test" && !process.env.AI_MODEL && !process.env.OPENROUTER_MODEL) {
      process.env.OPENROUTER_MODEL = "nex-agi/nex-n2.5-mini:free";
    }

    const result = await extractBeliefFromText(
      raw_text,
      author_handle || undefined,
      source_url || undefined
    );

    if (!result.success) {
      if (process.env.NODE_ENV !== "test" && isMockAiEnabled()) {
        const fallbackData = extractMockBelief(raw_text);
        return NextResponse.json(
          { success: true, data: fallbackData },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status || 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json(
      { success: false, error: `Internal server error: ${message}` },
      { status: 500 }
    );
  }
}
