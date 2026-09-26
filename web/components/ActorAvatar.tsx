"use client";

import { useState } from "react";
import Identicon from "./Identicon";

export default function ActorAvatar({ handle, address, src, size = 40 }: { handle?: string | null; address?: string | null; src?: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const key = (handle ?? address ?? "unknown").replace(/^@/, "");
  return (
    <span
      className="relative inline-flex shrink-0 overflow-hidden rounded-full border border-zinc-200 dark:border-zinc-700"
      style={{ width: size, height: size }}
    >
      <Identicon seed={address ?? key} size={size} />
      {!failed && (
        <img
          src={src ?? `/api/avatar/${encodeURIComponent(key)}`}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}
