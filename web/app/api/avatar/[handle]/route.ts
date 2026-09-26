import { NextRequest, NextResponse } from "next/server";
import { and, eq, ilike, isNotNull, or } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";

const CACHE_HEADER = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const cleanName = decodeURIComponent(handle).trim().replace(/^@/, "");
  const isWallet = /^0x[0-9a-fA-F]{40}$/.test(cleanName);
  const fallbackUrl = `https://unavatar.io/twitter/${encodeURIComponent(cleanName)}`;

  let targetUrl = fallbackUrl;
  if (cleanName) {
    try {
      const { creator_profiles } = schema;
      const profile = await getDb().query.creator_profiles.findFirst({
        columns: { avatar_url: true },
        where: and(
          isNotNull(creator_profiles.avatar_url),
          isWallet
            ? eq(creator_profiles.wallet_address, cleanName.toLowerCase())
            : or(ilike(creator_profiles.handle, `@${cleanName}`), ilike(creator_profiles.handle, cleanName))
        ),
      });
      if (profile?.avatar_url) targetUrl = profile.avatar_url;
      else if (isWallet) return new NextResponse(null, { status: 404, headers: { "Cache-Control": CACHE_HEADER } });
    } catch {
      targetUrl = fallbackUrl;
    }
  }

  const res = NextResponse.redirect(targetUrl, 302);
  res.headers.set("Cache-Control", CACHE_HEADER);
  return res;
}
