"use client";

import { useMemo, useState } from "react";
import type { MarketDetailPosition } from "@/types";

const RANGES = [
  { label: "1D", ms: 86_400_000 },
  { label: "1W", ms: 7 * 86_400_000 },
  { label: "1M", ms: 30 * 86_400_000 },
  { label: "ALL", ms: Infinity },
] as const;

const WIDTH = 640;
const HEIGHT = 220;
const PAD_RIGHT = 40;

type Point = { t: number; pct: number };

export function buildProbabilitySeries(positions: MarketDetailPosition[], openedAt: string | undefined): Point[] {
  const start = openedAt ? new Date(openedAt).getTime() : Date.now();
  const points: Point[] = [{ t: start, pct: 50 }];
  let agree = 0;
  let disagree = 0;
  for (const p of positions) {
    if (p.side === "AGREE") agree += p.amount;
    else disagree += p.amount;
    const total = agree + disagree;
    points.push({ t: new Date(p.created_at).getTime(), pct: total > 0 ? (agree / total) * 100 : 50 });
  }
  points.push({ t: Date.now(), pct: points[points.length - 1].pct });
  return points;
}

export default function ProbabilityChart({
  positions,
  openedAt,
}: {
  positions: MarketDetailPosition[];
  openedAt?: string;
}) {
  const [range, setRange] = useState<(typeof RANGES)[number]["label"]>("ALL");
  const series = useMemo(() => buildProbabilitySeries(positions, openedAt), [positions, openedAt]);

  const windowMs = RANGES.find((r) => r.label === range)!.ms;
  const cutoff = Date.now() - windowMs;
  const inRange = series.filter((p) => p.t >= cutoff);
  const before = series.filter((p) => p.t < cutoff).pop();
  const visible = before ? [{ t: cutoff, pct: before.pct }, ...inRange] : inRange;

  const current = series[series.length - 1].pct;
  const first = visible[0]?.pct ?? current;
  const delta = current - first;

  const tMin = visible[0]?.t ?? Date.now();
  const tMax = Math.max(visible[visible.length - 1]?.t ?? Date.now(), tMin + 1);
  const x = (t: number) => ((t - tMin) / (tMax - tMin)) * (WIDTH - PAD_RIGHT);
  const y = (pct: number) => HEIGHT - (pct / 100) * HEIGHT;

  const line = visible
    .map((p, i) => (i === 0 ? `M${x(p.t)},${y(p.pct)}` : `H${x(p.t)} V${y(p.pct)}`))
    .join(" ");
  const area = `${line} V${HEIGHT} H${x(visible[0]?.t ?? tMin)} Z`;
  const last = visible[visible.length - 1];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-4xl font-black text-emerald-600 dark:text-emerald-400">
              {Math.round(current)}
              <span className="text-xl">%</span>
            </span>
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400">agree</span>
          </div>
          <div
            className={`font-mono text-xs mt-1 ${
              delta > 0 ? "text-emerald-600 dark:text-emerald-400" : delta < 0 ? "text-rose-600 dark:text-rose-400" : "text-zinc-500"
            }`}
          >
            {delta > 0 ? "▲" : delta < 0 ? "▼" : "•"} {Math.abs(delta).toFixed(1)} pts · {range}
          </div>
        </div>
        <div className="flex rounded-lg border border-zinc-200 dark:border-white/10 overflow-hidden" role="group" aria-label="Chart range">
          {RANGES.map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => setRange(r.label)}
              aria-pressed={range === r.label}
              className={`px-3 py-1.5 font-mono text-[11px] font-bold transition-colors ${
                range === r.label
                  ? "bg-emerald-600 text-white"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-black/30 p-3">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full h-[200px] sm:h-[240px] overflow-visible"
          preserveAspectRatio="none"
          role="img"
          aria-label={`Agree probability ${Math.round(current)} percent, ${positions.length} positions`}
        >
          <defs>
            <linearGradient id="prob-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgb(16 185 129)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="rgb(16 185 129)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 25, 50, 75, 100].map((g) => (
            <g key={g}>
              <line
                x1={0}
                x2={WIDTH - PAD_RIGHT}
                y1={y(g)}
                y2={y(g)}
                className="stroke-zinc-200 dark:stroke-white/10"
                strokeDasharray={g === 50 ? "4 4" : undefined}
                vectorEffect="non-scaling-stroke"
              />
              <text x={WIDTH - PAD_RIGHT + 6} y={y(g) + 4} className="fill-zinc-400 font-mono" fontSize="11">
                {g}%
              </text>
            </g>
          ))}
          <path d={area} fill="url(#prob-area)" />
          <path d={line} fill="none" className="stroke-emerald-500" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          {last && <circle cx={x(last.t)} cy={y(last.pct)} r="4" className="fill-emerald-500" />}
        </svg>
      </div>
      <p className="mt-2 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
        {positions.length === 0
          ? "No trades yet · the line starts at 50% until the first position"
          : `${positions.length} position${positions.length === 1 ? "" : "s"} · implied from pool share`}
      </p>
    </div>
  );
}
