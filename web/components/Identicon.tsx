"use client";

function hashBytes(seed: string): number[] {
  let h1 = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h1 = Math.imul(h1 ^ seed.charCodeAt(i), 0x01000193);
  }
  let state = h1 >>> 0 || 1;
  const bytes: number[] = [];
  for (let i = 0; i < 16; i++) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    bytes.push((state >>> 24) & 0xff);
  }
  return bytes;
}

export default function Identicon({ seed, size = 40 }: { seed: string; size?: number }) {
  const bytes = hashBytes(seed.toLowerCase());
  const hue = Math.round((bytes[0] / 255) * 360);
  const fg = `hsl(${hue} 62% 42%)`;
  const bg = `hsl(${(hue + 180) % 360} 45% 92%)`;
  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 3; x++) {
      if (bytes[1 + y * 3 + x] % 2 === 0) {
        cells.push({ x, y });
        if (x < 2) cells.push({ x: 4 - x, y });
      }
    }
  }
  return (
    <svg width={size} height={size} viewBox="0 0 5 5" shapeRendering="crispEdges" aria-hidden="true" className="block">
      <rect width="5" height="5" fill={bg} />
      {cells.map((c) => (
        <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width="1" height="1" fill={fg} />
      ))}
    </svg>
  );
}
