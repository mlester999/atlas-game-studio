"use client";

import type { GalaxyCluster } from "./galaxyData";
import { NODE_TONE_COLOR } from "./galaxyData";

/**
 * 2D constellation fallback: SVG map used on mobile, under reduced motion,
 * when WebGL is unavailable, or by preference. Fully keyboard accessible —
 * every game is a real button.
 */

const WORLD_GLYPH: Record<string, string> = {
  cozy_planet: "🏡",
  creature_habitat: "🐾",
  pixel_town: "🏘",
  tropical_island: "🏝",
  tower: "🗼",
  draft_nebula: "✧",
};

export default function Galaxy2D({
  clusters,
  selectedSlug,
  onSelect,
}: {
  clusters: GalaxyCluster[];
  selectedSlug: string | null;
  onSelect: (slug: string | null) => void;
}) {
  const width = 720;
  const height = 430;
  const cx = width / 2;
  const cy = height / 2;
  const R = 165;

  const placed = clusters.map((cluster, ci) => {
    const angle = (ci / clusters.length) * Math.PI * 2 - Math.PI / 2;
    const center = { x: cx + Math.cos(angle) * R, y: cy + Math.sin(angle) * R * 0.82 };
    const games = cluster.games.map((game, gi) => {
      const ga = (gi / Math.max(1, cluster.games.length)) * Math.PI * 2;
      const spread = cluster.games.length > 1 ? 52 : 0;
      return {
        game,
        x: center.x + Math.cos(ga) * spread,
        y: center.y + Math.sin(ga) * spread * 0.8,
      };
    });
    return { cluster, center, games };
  });

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full min-w-[340px]"
        role="group"
        aria-label="Studio galaxy map (2D). Each game is a selectable star."
      >
        {/* constellation lines */}
        {placed.map(({ cluster, center, games }) => (
          <g key={cluster.key}>
            {games.map(({ game, x, y }) => (
              <line
                key={game.slug}
                x1={center.x}
                y1={center.y}
                x2={x}
                y2={y}
                stroke="#2d8a66"
                strokeOpacity={0.45}
                strokeWidth={1}
              />
            ))}
            <circle cx={center.x} cy={center.y} r={3} fill="#c9a84c" />
            <text
              x={center.x}
              y={center.y - 12}
              textAnchor="middle"
              fontSize={11}
              fill="var(--mint-300)"
            >
              {cluster.name}
            </text>
            {cluster.games.length === 0 && (
              <text
                x={center.x}
                y={center.y + 20}
                textAnchor="middle"
                fontSize={9}
                fill="var(--muted)"
              >
                (drafts appear here)
              </text>
            )}
          </g>
        ))}
        {/* game stars */}
        {placed.flatMap(({ games }) =>
          games.map(({ game, x, y }) => {
            const selected = game.slug === selectedSlug;
            return (
              <g
                key={game.slug}
                role="button"
                tabIndex={0}
                aria-pressed={selected}
                aria-label={`${game.name} — ${game.stage}${game.hasBlocker ? " — has a blocker" : ""}`}
                onClick={() => onSelect(selected ? null : game.slug)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(selected ? null : game.slug);
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                {game.hasBlocker && (
                  <circle cx={x} cy={y} r={24} fill="#e07a6a" fillOpacity={0.16}>
                    <animate
                      attributeName="r"
                      values="22;26;22"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={17}
                  fill={selected ? "#1a4a38" : "#123528"}
                  stroke={selected ? "#d4b85a" : "#2d8a66"}
                  strokeWidth={selected ? 2 : 1}
                />
                <text x={x} y={y + 5} textAnchor="middle" fontSize={14} aria-hidden="true">
                  {WORLD_GLYPH[game.world] ?? "✦"}
                </text>
                <text
                  x={x}
                  y={y + 32}
                  textAnchor="middle"
                  fontSize={11}
                  fill="var(--cream-100)"
                >
                  {game.name}
                </text>
                {/* selected: tiny node ring showing system statuses */}
                {selected &&
                  game.nodes.map((node, ni) => {
                    const na = (ni / Math.max(1, game.nodes.length)) * Math.PI * 2;
                    return (
                      <circle
                        key={node.name}
                        cx={x + Math.cos(na) * 26}
                        cy={y + Math.sin(na) * 26}
                        r={3}
                        fill={NODE_TONE_COLOR[node.tone]}
                      >
                        <title>{node.name}</title>
                      </circle>
                    );
                  })}
              </g>
            );
          }),
        )}
      </svg>
    </div>
  );
}
