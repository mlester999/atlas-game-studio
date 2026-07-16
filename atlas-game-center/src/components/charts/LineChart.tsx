"use client";

import { useId, useMemo, useRef, useState } from "react";

/**
 * Accessible multi-series SVG line chart.
 * - 2px lines, recessive grid, one y-axis
 * - crosshair + tooltip hover layer
 * - legend for >= 2 series; text wears text tokens, never series color
 * - data table fallback via <details>
 */

export interface Series {
  name: string;
  values: number[];
  /** CSS var name, e.g. "var(--series-1)" */
  color: string;
}

export function LineChart({
  title,
  xLabels,
  series,
  yFormat = (v) => v.toLocaleString(),
  height = 220,
  summary,
}: {
  title: string;
  xLabels: string[];
  series: Series[];
  yFormat?: (v: number) => string;
  height?: number;
  summary?: string;
}) {
  const id = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const width = 640;
  const pad = { top: 12, right: 16, bottom: 26, left: 56 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const { yMin, yMax, ticks } = useMemo(() => {
    const all = series.flatMap((s) => s.values).filter((v) => Number.isFinite(v));
    const min = Math.min(0, ...all);
    let max = Math.max(1, ...all);
    if (min === max) max = min + 1;
    const span = max - min;
    const step = Math.pow(10, Math.floor(Math.log10(span / 4)));
    const niceStep = span / step > 20 ? step * 5 : span / step > 8 ? step * 2 : step;
    const tickVals: number[] = [];
    const start = Math.ceil(min / niceStep) * niceStep;
    for (let v = start; v <= max; v += niceStep) tickVals.push(v);
    return { yMin: min, yMax: max, ticks: tickVals };
  }, [series]);

  const x = (i: number) =>
    pad.left + (xLabels.length <= 1 ? innerW / 2 : (i / (xLabels.length - 1)) * innerW);
  const y = (v: number) => pad.top + innerH - ((v - yMin) / (yMax - yMin)) * innerH;

  const paths = series.map((s) =>
    s.values
      .map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
      .join(" "),
  );

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = ((e.clientX - rect.left) / rect.width) * width;
    const frac = (px - pad.left) / innerW;
    const idx = Math.round(frac * (xLabels.length - 1));
    setHoverIdx(Math.max(0, Math.min(xLabels.length - 1, idx)));
  };

  return (
    <figure className="viz-root">
      <figcaption className="mb-1 text-sm font-medium text-cream-100">{title}</figcaption>
      {series.length >= 2 && (
        <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1" aria-label="Legend">
          {series.map((s) => (
            <li key={s.name} className="flex items-center gap-1.5 text-xs text-mint-300">
              <span
                aria-hidden="true"
                className="inline-block h-2 w-4 rounded-sm"
                style={{ background: s.color }}
              />
              {s.name}
            </li>
          ))}
        </ul>
      )}
      <div className="overflow-x-auto">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-labelledby={`${id}-title`}
          className="w-full min-w-[320px] touch-pan-y"
          onPointerMove={onMove}
          onPointerLeave={() => setHoverIdx(null)}
        >
          <title id={`${id}-title`}>{summary ?? title}</title>
          {/* recessive grid */}
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={y(t)}
                y2={y(t)}
                stroke="var(--glass-border)"
                strokeWidth={1}
              />
              <text
                x={pad.left - 8}
                y={y(t) + 3}
                textAnchor="end"
                fontSize={10}
                fill="var(--text-muted)"
              >
                {yFormat(t)}
              </text>
            </g>
          ))}
          {/* x labels: first, middle, last */}
          {[0, Math.floor((xLabels.length - 1) / 2), xLabels.length - 1]
            .filter((v, i, arr) => arr.indexOf(v) === i)
            .map((i) => (
              <text
                key={i}
                x={x(i)}
                y={height - 8}
                textAnchor="middle"
                fontSize={10}
                fill="var(--text-muted)"
              >
                {xLabels[i]}
              </text>
            ))}
          {/* series lines */}
          {series.map((s, si) => (
            <path key={s.name} d={paths[si]} fill="none" stroke={s.color} strokeWidth={2} />
          ))}
          {/* crosshair + hover markers */}
          {hoverIdx !== null && (
            <g>
              <line
                x1={x(hoverIdx)}
                x2={x(hoverIdx)}
                y1={pad.top}
                y2={pad.top + innerH}
                stroke="var(--text-muted)"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              {series.map((s) => (
                <circle
                  key={s.name}
                  cx={x(hoverIdx)}
                  cy={y(s.values[hoverIdx])}
                  r={4}
                  fill={s.color}
                  stroke="var(--surface-1)"
                  strokeWidth={2}
                />
              ))}
            </g>
          )}
        </svg>
      </div>
      {/* tooltip readout (also serves keyboard/screen-reader users via table) */}
      <div aria-live="polite" className="min-h-[1.5rem] text-xs text-mint-300">
        {hoverIdx !== null && (
          <span>
            {xLabels[hoverIdx]}:{" "}
            {series
              .map((s) => `${s.name} ${yFormat(s.values[hoverIdx])}`)
              .join(" · ")}
          </span>
        )}
      </div>
      <details className="mt-1">
        <summary className="cursor-pointer text-xs text-muted hover:text-mint-300">
          View data table
        </summary>
        <div className="mt-2 max-h-56 overflow-auto">
          <table className="w-full text-left text-xs text-mint-200">
            <thead>
              <tr>
                <th scope="col" className="pr-3 font-medium text-muted">
                  X
                </th>
                {series.map((s) => (
                  <th key={s.name} scope="col" className="pr-3 font-medium text-muted">
                    {s.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {xLabels.map((label, i) => (
                <tr key={label + i}>
                  <th scope="row" className="pr-3 font-normal text-muted">
                    {label}
                  </th>
                  {series.map((s) => (
                    <td key={s.name} className="pr-3">
                      {yFormat(s.values[i])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
