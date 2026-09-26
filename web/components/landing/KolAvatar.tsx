"use client";

export default function KolAvatar({ handle, src, size = 40 }: { handle: string; src?: string | null; size?: number }) {
  const clean = handle.replace(/^@/, "");
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-emerald-900/10 dark:border-white/10 bg-emerald-50 dark:bg-emerald-500/10 font-mono font-bold text-emerald-800 dark:text-emerald-300"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden="true"
    >
      {clean.slice(0, 1).toUpperCase()}
      <img
        src={src || `/api/avatar/${encodeURIComponent(clean)}`}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    </span>
  );
}
