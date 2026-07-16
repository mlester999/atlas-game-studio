"use client";

import { useId, useState } from "react";

/**
 * Horizontal bar chart with direct labels, per-mark hover, and table fallback.
 * Single-hue by default (magnitude), optional per-bar color for status.
 */
export function BarChart({
  title,
  items,
  format = (v) => v.toLocaleString(),
  summary,
}: {
  title: string;
  items: { label: string; value: number; color?: string }[];
  format?: (v: number) => string;
  summary?: string;
}) {
  const id = useId();
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...items.map((i) => Math.abs(i.value)));

  return (
    <figure className="viz-root" aria-labelledby={`${id}-cap`}>
      <figcaption id={`${id}-cap`} className="mb-2 text-sm font-medium text-cream-100">
        {title}
      </figcaption>
      {summary && <p className="sr-only">{summary}</p>}
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div
            key={item.label}
            className="grid grid-cols-[minmax(90px,160px)_1fr_auto] items-center gap-2"
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
          >
            <span className="truncate text-xs text-mint-300" title={item.label}>
              {item.label}
            </span>
            <div className="h-4 rounded-r-[4px] bg-forest-900/70">
              <div
                className="h-4 rounded-r-[4px] transition-[width]"
                style={{
                  width: `${(Math.abs(item.value) / max) * 100}%`,
                  background: item.color ?? "var(--series-1)",
                  opacity: hover === null || hover === i ? 1 : 0.55,
                }}
              />
            </div>
            <span className="text-xs tabular-nums text-cream-200">{format(item.value)}</span>
          </div>
        ))}
      </div>
    </figure>
  );
}
