import { config } from "dotenv";
import { inArray } from "drizzle-orm";
import { getDb, schema } from "../lib/db";
import type { BeliefClaim } from "../lib/db/schema";
import { cleanJsonOutput } from "../lib/ai/openrouter";

const NEYNAR_BASE_URL = "https://api.neynar.com/v2/farcaster";
const MIN_FOLLOWERS = 50;
const DEFAULT_HORIZON_DAYS = 90;
const MAX_CASTS_PER_QUERY = 100;
const MIN_AI_CONFIDENCE = 0.6;
const MAX_AI_CALLS = () => Number(process.env.SEED_MAX_AI_CALLS ?? (IS_LOCAL_AI() ? 400 : 40));
const FORWARD_LOOKING = /\b(will|could|gonna|going to|should|expect|target|heading|by (?:end|eoy|q[1-4]|20\d\d)|before|next (?:week|month|year)|this (?:cycle|year)|soon)\b/i;

class DailyQuotaError extends Error {}
const AI_BASE_URL = (process.env.AI_BASE_URL || "https://openrouter.ai/api/v1").replace(/\/$/, "");
const AI_MODEL = () => process.env.AI_MODEL || process.env.OPENROUTER_MODEL;
const IS_LOCAL_AI = () => /localhost|127\.0\.0\.1/.test(AI_BASE_URL);

const CLASSIFIER_PROMPT = `You screen Farcaster casts for a public prediction market.
Accept a cast ONLY if its author makes their OWN forward-looking call that a neutral person could later check as true or false.
Reject: news reports, recaps, current or past prices, questions, quotes of other people or institutions, ads, giveaways, bot signals, vague vibes ("up only", "bullish").

Two kinds of calls qualify:
- PRICE: a price target for one of these assets only: BTC, ETH, LINK, WSTETH, SNX, XAU (gold), CSPX (S&P 500), EUR (EUR/USD), GBP (GBP/USD).
- EVENT: anything else with a clear yes/no outcome (a launch ships, a team wins, a rate cut happens, a token lists, a vote passes).

Respond ONLY with raw JSON:
{
  "is_prediction": boolean,
  "kind": "PRICE" | "EVENT" | null,
  "asset": one of the tickers above or null,
  "direction": "ABOVE" | "BELOW" | null,
  "target_price": number in USD or null,
  "question": for EVENT, one yes/no question starting with "Will", under 120 characters, or null,
  "criteria": for EVENT, one sentence saying exactly what makes it YES, or null,
  "category": for EVENT, one of "crypto" | "tech" | "sports" | "politics" | "macro" | "culture", or null,
  "deadline": ISO date (YYYY-MM-DD) the author states or clearly implies, or null,
  "confidence": number 0..1 that this is a genuine, checkable call by the author
}`;

const SEARCH_QUERIES = [
  "\"gold to\"",
  "\"gold will\"",
  "\"s&p will\"",
  "\"spx to\"",
  "\"eurusd\"",
  "\"will win the\"",
  "\"will launch\" before",
  "\"will ship\" before",
  "\"will announce\"",
  "\"rate cut\" will",
  "\"fed will\"",
  "\"will get listed\"",
  "\"will be approved\"",
  "\"calling it now\"",
  "\"mark my words\"",
  "\"by end of 2026\"",
  "\"before 2027\"",
  "\"link to\" chainlink",
  "\"chainlink will\"",
  "\"calling it\" btc",
  "\"calling it\" eth",
  "\"mark my words\" btc",
  "\"screenshot this\" btc",
  "\"by end of year\" btc",
  "\"by eoy\" eth",
  "\"this cycle\" btc top",
  "\"bottom is\" btc",
  "\"we see\" eth k",
  "\"sol will\"",
  "\"solana will hit\"",
  "\"eth to 5k\"",
  "\"btc to 150k\"",
  "\"btc to 200k\"",
  "\"btc to 60k\"",
  "\"eth to 2k\"",
  "\"doge to\"",
  "\"xrp to\"",
  "\"hype to\"",
  "\"btc will\"",
  "\"eth will\"",
  "\"sol will\"",
  "\"bitcoin could\"",
  "\"eth could\"",
  "\"gonna hit\"",
  "\"going to hit\"",
  "\"heading to\" btc",
  "\"will see\" btc",
  "\"will see\" eth",
  "\"btc will hit\"",
  "\"btc to\" k",
  "\"bitcoin will reach\"",
  "\"eth will reach\"",
  "\"eth to\" k",
  "\"ethereum will hit\"",
  "\"sol will hit\"",
  "\"sol to\"",
  "\"will flip\" eth",
  "\"new ath\" before",
  "\"price target\" btc",
  "\"price target\" eth",
];

const ASSET_ALIASES: Record<string, string> = {
  BTC: "BTC",
  BITCOIN: "BTC",
  ETH: "ETH",
  ETHER: "ETH",
  ETHEREUM: "ETH",
  SOL: "SOL",
  SOLANA: "SOL",
  BNB: "BNB",
  XRP: "XRP",
  DOGE: "DOGE",
  HYPE: "HYPE",
  ZEC: "ZEC",
  LINK: "LINK",
  CHAINLINK: "LINK",
  WSTETH: "WSTETH",
  SNX: "SNX",
  XAU: "XAU",
  GOLD: "XAU",
  CSPX: "CSPX",
  SPX: "CSPX",
  "S&P 500": "CSPX",
  EUR: "EUR",
  EURUSD: "EUR",
  GBP: "GBP",
  GBPUSD: "GBP",
};

const PLAUSIBLE_PRICE_RANGE: Record<string, [number, number]> = {
  BTC: [10_000, 1_000_000],
  ETH: [500, 50_000],
  SOL: [10, 5_000],
  BNB: [100, 10_000],
  XRP: [0.1, 100],
  DOGE: [0.01, 10],
  HYPE: [1, 1_000],
  ZEC: [5, 10_000],
  LINK: [1, 1_000],
  WSTETH: [500, 60_000],
  SNX: [0.05, 100],
  XAU: [1_000, 20_000],
  CSPX: [200, 5_000],
  EUR: [0.5, 2],
  GBP: [0.5, 2.5],
};

const RESOLVABLE_ASSETS = new Set(["BTC", "ETH", "LINK", "WSTETH", "SNX", "XAU", "CSPX", "EUR", "GBP"]);
const EVENT_CATEGORIES = new Set(["crypto", "tech", "sports", "politics", "macro", "culture"]);

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

type NeynarUser = {
  fid: number;
  username: string;
  display_name?: string;
  pfp_url?: string;
  follower_count?: number;
  custody_address?: string;
  profile?: { bio?: { text?: string } };
  verified_addresses?: { eth_addresses?: string[] };
};

type NeynarCast = {
  hash: string;
  text: string;
  timestamp: string;
  author: NeynarUser;
};

type ParsedPrediction = {
  statement: string;
  confidence: number | null;
  claim: BeliefClaim;
};

type AiVerdict = {
  is_prediction: boolean;
  kind: "PRICE" | "EVENT" | null;
  asset: string | null;
  direction: "ABOVE" | "BELOW" | null;
  target_price: number | null;
  question: string | null;
  criteria: string | null;
  category: string | null;
  deadline: string | null;
  confidence: number;
};

function formatDeadline(deadline: Date): string {
  return deadline.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

async function postOpenRouter(body: string, attempt = 0): Promise<Response> {
  const res = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(IS_LOCAL_AI() ? {} : { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, "X-Title": "OMEN Protocol" }),
    },
    body,
  });
  if (res.status === 429) {
    const text = await res.clone().text();
    if (text.includes("per-day")) throw new DailyQuotaError("OpenRouter free daily quota exhausted");
  }
  if (res.status === 429 && attempt < 4) {
    await new Promise((r) => setTimeout(r, 2_000 * 2 ** attempt));
    return postOpenRouter(body, attempt + 1);
  }
  return res;
}

async function classifyWithAi(cast: NeynarCast): Promise<ParsedPrediction | null> {
  const res = await postOpenRouter(
    JSON.stringify({
      model: AI_MODEL(),
      temperature: 0,
      ...(IS_LOCAL_AI() ? { response_format: { type: "json_object" } } : {}),
      messages: [
        { role: "system", content: CLASSIFIER_PROMPT },
        { role: "user", content: `Cast date: ${cast.timestamp.slice(0, 10)}\nAuthor: @${cast.author.username}\nText: ${cast.text}` },
      ],
    })
  );
  if (!res.ok) throw new Error(`AI provider ${res.status}: ${await res.text()}`);

  const payload = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) return null;

  let verdict: AiVerdict;
  try {
    verdict = JSON.parse(cleanJsonOutput(content));
  } catch {
    return null;
  }
  if (!verdict.is_prediction || verdict.confidence < MIN_AI_CONFIDENCE) return null;

  const castDate = new Date(cast.timestamp);
  const parsedDeadline = verdict.deadline ? new Date(`${verdict.deadline}T23:59:59Z`) : null;
  const statedDeadline = parsedDeadline && !isNaN(parsedDeadline.getTime()) ? parsedDeadline : null;

  if (verdict.kind === "EVENT") {
    const question = verdict.question?.trim().replace(/\s+/g, " ");
    const criteria = verdict.criteria?.trim();
    const category = EVENT_CATEGORIES.has(verdict.category ?? "") ? verdict.category! : "culture";
    if (!question || !/^will\b/i.test(question) || question.length > 160 || !criteria || !statedDeadline) return null;
    if (statedDeadline.getTime() <= Date.now()) return null;
    const base = question.replace(/\?+$/, "");
    const statement = /\b20\d\d\b/.test(base) ? `${base}?` : `${base} before ${formatDeadline(statedDeadline)}?`;
    return {
      statement,
      confidence: verdict.confidence,
      claim: { kind: "EVENT", question: statement, criteria, category, deadline: statedDeadline.toISOString() },
    };
  }

  const asset = verdict.asset ? ASSET_ALIASES[verdict.asset.toUpperCase()] : undefined;
  const targetPrice = Number(verdict.target_price);
  if (!asset || !RESOLVABLE_ASSETS.has(asset) || !targetPrice || !verdict.direction) return null;

  const deadline = statedDeadline ?? new Date(castDate.getTime() + DEFAULT_HORIZON_DAYS * 86_400_000);
  return buildPrediction(asset, targetPrice, verdict.direction === "BELOW" ? "PRICE_BELOW" : "PRICE_ABOVE", deadline, verdict.confidence);
}

function buildPrediction(
  asset: string,
  targetPrice: number,
  direction: "PRICE_ABOVE" | "PRICE_BELOW",
  deadline: Date,
  confidence: number | null
): ParsedPrediction | null {
  if (!RESOLVABLE_ASSETS.has(asset)) return null;
  const [minPrice, maxPrice] = PLAUSIBLE_PRICE_RANGE[asset] ?? [0, Infinity];
  if (targetPrice < minPrice || targetPrice > maxPrice) return null;
  if (deadline.getTime() <= Date.now()) return null;

  const verb = direction === "PRICE_ABOVE" ? "trade at or above" : "trade at or below";
  return {
    statement: `Will ${asset} ${verb} $${targetPrice.toLocaleString("en-US")} before ${formatDeadline(deadline)}?`,
    confidence,
    claim: {
      kind: "PRICE",
      asset,
      direction: direction === "PRICE_ABOVE" ? "ABOVE" : "BELOW",
      targetPrice,
      deadline: deadline.toISOString(),
    },
  };
}

const ROUGH_CANDIDATE = /\b(btc|bitcoin|eth|ether|ethereum|sol|solana|bnb|xrp|doge|hype|zec|link|chainlink)\b[\s\S]*\$?\d[\d,.]*\s*[km]?\b/i;

async function neynar<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${NEYNAR_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  const res = await fetch(url, { headers: { "x-api-key": process.env.NEYNAR_API_KEY! } });
  if (!res.ok) {
    throw new Error(`Neynar ${path} failed: ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

function parseTargetPrice(raw: string): number | null {
  const match = raw.replace(/,/g, "").match(/^\$?(\d+(?:\.\d+)?)\s*(k|m)?$/i);
  if (!match) return null;
  const multiplier = match[2]?.toLowerCase() === "k" ? 1_000 : match[2]?.toLowerCase() === "m" ? 1_000_000 : 1;
  const value = Number(match[1]) * multiplier;
  return value > 0 ? value : null;
}

function parseDeadline(text: string, castDate: Date): Date {
  const lower = text.toLowerCase();

  const monthYear = lower.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(20\d{2})\b/);
  if (monthYear) {
    const month = MONTHS.indexOf(monthYear[1]);
    return new Date(Date.UTC(Number(monthYear[2]), month + 1, 0, 23, 59, 59));
  }

  const year = lower.match(/\b(?:by|before|in|end of)\s+(20\d{2})\b/);
  if (year) {
    return new Date(Date.UTC(Number(year[1]), 11, 31, 23, 59, 59));
  }

  if (/\b(next month|this month)\b/.test(lower)) {
    return new Date(castDate.getTime() + 30 * 86_400_000);
  }

  if (/\b(this year|by year end|by eoy|eoy)\b/.test(lower)) {
    return new Date(Date.UTC(castDate.getUTCFullYear(), 11, 31, 23, 59, 59));
  }

  return new Date(castDate.getTime() + DEFAULT_HORIZON_DAYS * 86_400_000);
}

function parsePrediction(cast: NeynarCast): ParsedPrediction | null {
  const text = cast.text.replace(/\s+/g, " ");
  if (/\?\s*$/.test(text.split(/[.!]/)[0] ?? "")) return null;

  const pattern =
    /\$?\b(btc|bitcoin|eth|ether|ethereum|sol|solana|bnb|xrp|doge|hype|zec)\b[^.!?\n]{0,25}?\b(?:will|could|can|gonna|going to|should|is headed to|heading to|about to|set to|poised to|on (?:its|the) way to)\s+(?:easily\s+|likely\s+|probably\s+|finally\s+)?(hit|reach|see|touch|break|tap|retest|go to|pump to|run to|drop to|fall to|dump to|crash to|revisit)\s+(\$?\d[\d,]*(?:\.\d+)?\s*[km]?)\b/i;
  const match = text.match(pattern);
  if (!match) return null;
  if (/\b(overview|morning minute|breaking|just in|report|according to|holdings)\b/i.test(text)) return null;

  const asset = ASSET_ALIASES[match[1].toUpperCase()];
  const targetPrice = parseTargetPrice(match[3].trim());
  if (!asset || !targetPrice) return null;
  const direction = /drop|fall|dump|crash|retest|revisit/i.test(match[2]) ? "PRICE_BELOW" : "PRICE_ABOVE";
  return buildPrediction(asset, targetPrice, direction, parseDeadline(text, new Date(cast.timestamp)), null);
}

function isQuestion(text: string): boolean {
  const firstSentence = text.trim().split(/(?<=[.!?])\s|\n/)[0] ?? "";
  return /\?\s*$/.test(firstSentence) || /^(do|does|will|would|can|could|should|is|are|what|when|who|how)\b[^.!]*\?/i.test(text.trim());
}

function isLikelyBot(user: NeynarUser): boolean {
  return /(agent|bot|signal|feed|digest|weather)/i.test(user.username);
}

function castUrl(cast: NeynarCast): string {
  return `https://farcaster.xyz/${cast.author.username}/${cast.hash.slice(0, 10)}`;
}

function walletFor(user: NeynarUser): string {
  return (user.verified_addresses?.eth_addresses?.[0] || user.custody_address || `farcaster:${user.fid}`).toLowerCase();
}

async function main() {
  config({ path: [".env.local", ".env"] });

  if (!process.env.NEYNAR_API_KEY) throw new Error("Missing NEYNAR_API_KEY");
  if (!process.env.DATABASE_URL) throw new Error("Missing DATABASE_URL");

  const db = getDb();
  const { beliefs, belief_sources, creator_profiles } = schema;

  const casts = new Map<string, NeynarCast>();
  for (const q of SEARCH_QUERIES) {
    const data = await neynar<{ result: { casts: NeynarCast[] } }>("/cast/search", {
      q,
      limit: String(MAX_CASTS_PER_QUERY),
    });
    for (const cast of data.result.casts) casts.set(cast.hash, cast);
    console.log(`search ${q}: ${data.result.casts.length} casts`);
  }

  const useAi = IS_LOCAL_AI() ? Boolean(AI_MODEL()) : Boolean(process.env.OPENROUTER_API_KEY && AI_MODEL());
  console.log(useAi ? `AI filter: ${AI_MODEL()} via ${AI_BASE_URL}` : "AI filter off (no AI configured), using strict pattern");

  const pool = [...casts.values()].filter(
    (c) =>
      (c.author.follower_count ?? 0) >= MIN_FOLLOWERS &&
      !isLikelyBot(c.author) &&
      (useAi ? c.text.length >= 25 : ROUGH_CANDIDATE.test(c.text))
  );

  const aiPool = pool
    .filter((c) => FORWARD_LOOKING.test(c.text) && !isQuestion(c.text))
    .sort((a, b) => (b.author.follower_count ?? 0) - (a.author.follower_count ?? 0))
    .slice(0, MAX_AI_CALLS());
  const checked = useAi ? aiPool : pool;

  const candidates: { cast: NeynarCast; prediction: ParsedPrediction }[] = [];
  for (const cast of checked) {
    let prediction: ParsedPrediction | null = null;
    try {
      prediction = useAi ? await classifyWithAi(cast) : parsePrediction(cast);
    } catch (err) {
      if (err instanceof DailyQuotaError) {
        console.warn(err.message);
        break;
      }
      console.warn(`skip ${cast.hash}: ${err instanceof Error ? err.message : err}`);
    }
    if (prediction) candidates.push({ cast, prediction });
  }

  const sourceUrls = candidates.map((c) => castUrl(c.cast));
  const existing = sourceUrls.length
    ? await db.query.beliefs.findMany({ columns: { source_url: true }, where: inArray(beliefs.source_url, sourceUrls) })
    : [];
  const seen = new Set(existing.map((b) => b.source_url));

  const authorFids = [...new Set(candidates.map((c) => c.cast.author.fid))];
  const fullUsers = new Map<number, NeynarUser>();
  for (let i = 0; i < authorFids.length; i += 100) {
    const data = await neynar<{ users: NeynarUser[] }>("/user/bulk", { fids: authorFids.slice(i, i + 100).join(",") });
    for (const user of data.users) fullUsers.set(user.fid, user);
  }

  let inserted = 0;
  for (const { cast, prediction } of candidates) {
    const sourceUrl = castUrl(cast);
    if (seen.has(sourceUrl)) continue;
    seen.add(sourceUrl);

    const user = fullUsers.get(cast.author.fid) ?? cast.author;
    const handle = `@${user.username}`;

    await db
      .insert(creator_profiles)
      .values({
        wallet_address: walletFor(user),
        handle,
        display_name: user.display_name ?? user.username,
        avatar_url: user.pfp_url ?? null,
        bio: user.profile?.bio?.text ?? null,
        farcaster_fid: user.fid,
      })
      .onConflictDoUpdate({
        target: creator_profiles.farcaster_fid,
        set: {
          handle,
          display_name: user.display_name ?? user.username,
          avatar_url: user.pfp_url ?? null,
          bio: user.profile?.bio?.text ?? null,
        },
      });

    const [belief] = await db
      .insert(beliefs)
      .values({
        author: handle,
        statement: prediction.statement,
        source_url: sourceUrl,
        source_platform: "farcaster",
        source_timestamp: cast.timestamp,
        claim: prediction.claim,
        ai_confidence: prediction.confidence !== null ? Math.round(prediction.confidence * 100) : null,
        status: "DETECTED",
      })
      .returning({ id: beliefs.id });

    await db.insert(belief_sources).values({
      belief_id: belief.id,
      raw_text: cast.text,
      submitted_by_wallet: null,
    });

    inserted += 1;
    console.log(`+ ${handle}: ${prediction.statement}`);
  }

  console.log(`\n${casts.size} casts scanned, ${checked.length} candidates checked, ${candidates.length} predictions parsed, ${inserted} new beliefs saved.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
