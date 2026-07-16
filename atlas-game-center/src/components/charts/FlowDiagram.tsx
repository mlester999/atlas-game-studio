"use client";

import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Source → currency → sink flow (Sankey-style, simplified).
 * Ribbon width encodes amount; animated dashes suggest circulation
 * (static under reduced motion). A text summary accompanies the visual.
 */
export function FlowDiagram({
  currencyName,
  sources,
  sinks,
}: {
  currencyName: string;
  sources: { name: string; amount: number | null }[];
  sinks: { name: string; amount: number | null }[];
}) {
  const reduced = useReducedMotion();
  const width = 640;
  const rowH = 34;
  const rows = Math.max(sources.length, sinks.length, 1);
  const height = Math.max(140, rows * rowH + 40);
  const midY = height / 2;

  const totalSrc = sources.reduce((a, s) => a + (s.amount ?? 0), 0) || 1;
  const totalSink = sinks.reduce((a, s) => a + (s.amount ?? 0), 0) || 1;

  const ribbon = (amount: number | null, total: number) =>
    Math.max(2, ((amount ?? total / 8) / total) * 22);

  if (sources.length === 0 && sinks.length === 0) {
    return (
      <p className="text-sm text-muted">
        No sources or sinks defined yet — the flow appears once the economy is planned.
      </p>
    );
  }

  return (
    <figure className="viz-root">
      <figcaption className="mb-2 text-sm font-medium text-cream-100">
        {currencyName} flow: sources → circulation → sinks
      </figcaption>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[420px]"
          role="img"
          aria-label={`Flow of ${currencyName}: ${sources.length} sources feed circulation, ${sinks.length} sinks drain it.`}
        >
          {sources.map((s, i) => {
            const sy = 30 + i * rowH;
            const w = ribbon(s.amount, totalSrc);
            return (
              <g key={s.name}>
                <text x={8} y={sy + 4} fontSize={11} fill="var(--text-secondary)">
                  {s.name}
                  {s.amount != null ? ` (${s.amount})` : ""}
                </text>
                <path
                  d={`M 200 ${sy} C 260 ${sy}, 260 ${midY}, 316 ${midY}`}
                  fill="none"
                  stroke="var(--series-1)"
                  strokeWidth={w}
                  strokeOpacity={0.65}
                  strokeDasharray={reduced ? undefined : "8 5"}
                >
                  {!reduced && (
                    <animate
                      attributeName="stroke-dashoffset"
                      from="26"
                      to="0"
                      dur="1.6s"
                      repeatCount="indefinite"
                    />
                  )}
                </path>
              </g>
            );
          })}
          {/* circulation node */}
          <circle cx={320} cy={midY} r={26} fill="var(--forest-800)" stroke="var(--glass-border)" />
          <text
            x={320}
            y={midY + 3}
            fontSize={10}
            textAnchor="middle"
            fill="var(--text-primary)"
          >
            {currencyName}
          </text>
          {sinks.map((s, i) => {
            const sy = 30 + i * rowH;
            const w = ribbon(s.amount, totalSink);
            return (
              <g key={s.name}>
                <path
                  d={`M 324 ${midY} C 390 ${midY}, 390 ${sy}, 446 ${sy}`}
                  fill="none"
                  stroke="var(--series-2)"
                  strokeWidth={w}
                  strokeOpacity={0.65}
                  strokeDasharray={reduced ? undefined : "8 5"}
                >
                  {!reduced && (
                    <animate
                      attributeName="stroke-dashoffset"
                      from="26"
                      to="0"
                      dur="1.6s"
                      repeatCount="indefinite"
                    />
                  )}
                </path>
                <text x={452} y={sy + 4} fontSize={11} fill="var(--text-secondary)">
                  {s.name}
                  {s.amount != null ? ` (${s.amount})` : ""}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-1 text-xs text-muted">
        Green ribbons create {currencyName}; gold ribbons remove it. Ribbon width is
        proportional to the configured amount.
      </p>
    </figure>
  );
}
