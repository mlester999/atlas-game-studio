"use client";

import { useGame } from "@/components/game/GameContext";
import { Panel, PageHeader, SectionHeading } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { MaybeValue } from "@/components/ui/Unknown";

const GOOD_ASSET = [
  "Transparent background",
  "Correct perspective",
  "Consistent scale",
  "Readable silhouette",
  "Correct ground anchor",
  "Correct collision",
  "Correct depth behavior",
  "Consistent lighting",
  "Cohesive color style",
];

const BAD_ASSET = [
  "Black or white rectangle",
  "Wrong perspective",
  "Random art style",
  "Incorrect scale",
  "Invisible collision",
  "No ground contact",
  "Incorrect anchor",
  "Excessive detail at small size",
  "Pasted standalone appearance",
];

const PIPELINE = [
  { step: "Upload", who: "Owner / artist", note: "New asset or new version enters the system" },
  { step: "Configure", who: "Owner", note: "Anchor, collision, depth, scale settings" },
  { step: "Validate", who: "System", note: "Automated checks can fail here" },
  { step: "Review", who: "Owner", note: "Human eye on style and placement" },
  { step: "Approve", who: "Owner", note: "Version becomes immutable" },
  { step: "Activate", who: "Owner", note: "Version becomes the live one" },
  { step: "Place in World", who: "Owner / editor", note: "Instances reference the version" },
  { step: "Test", who: "Owner", note: "In-world verification" },
  { step: "Publish", who: "Owner", note: "Players see it" },
  { step: "Supersede", who: "System", note: "A newer version takes over; references stay safe" },
  { step: "Archive", who: "System", note: "Retired but recoverable — rollback path" },
];

export default function GraphicsPage() {
  const game = useGame();
  const v = game.visualIdentity;

  return (
    <div className="space-y-6">
      <PageHeader
        headingLevel="h2"
        title="Graphics & Asset Lab"
        lede={`${game.name}'s visual identity, production-art readiness, and the asset pipeline that keeps the world consistent.`}
      />

      <Panel>
        <SectionHeading>Visual identity</SectionHeading>
        <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted">Dimension</dt>
            <dd className="text-mint-200">
              <MaybeValue value={v.dimension === "not_yet_defined" ? null : v.dimension.toUpperCase()} />
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted">Pixel art</dt>
            <dd className="text-mint-200">
              {v.pixelArt == null ? <MaybeValue value={null} /> : v.pixelArt ? "Yes" : "No — premium non-pixel"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted">Viewpoint</dt>
            <dd className="text-mint-200">
              <MaybeValue value={v.viewpoint === "not_yet_defined" ? null : v.viewpoint.replace(/_/g, "-")} />
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted">Camera</dt>
            <dd className="text-mint-200">
              <MaybeValue value={v.cameraBehavior} />
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted">Characters</dt>
            <dd className="text-mint-200">
              <MaybeValue value={v.characterStyle} />
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted">Environments</dt>
            <dd className="text-mint-200">
              <MaybeValue value={v.environmentStyle} />
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted">Palette</dt>
            <dd className="text-mint-200">
              <MaybeValue value={v.colorPalette} />
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted">Animation</dt>
            <dd className="text-mint-200">
              <MaybeValue value={v.animationStyle} />
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted">Production-art readiness</dt>
            <dd className="mt-0.5">
              <StatusPill status={v.productionArtReadiness} />
            </dd>
          </div>
        </dl>
        {v.missingAssets.length > 0 && (
          <div className="mt-3 rounded-lg border border-gold-600/40 bg-gold-600/10 px-3 py-2">
            <p className="text-xs font-semibold text-warn">Asset attention</p>
            <ul className="mt-1 list-inside list-disc text-xs text-mint-200">
              {v.missingAssets.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        )}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <SectionHeading className="text-good">A good game-ready asset</SectionHeading>
          <ul className="space-y-1 text-sm text-mint-200">
            {GOOD_ASSET.map((g) => (
              <li key={g}>
                <span aria-hidden="true" className="text-good">✓</span> {g}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel>
          <SectionHeading className="text-coral-400">Signs of a bad asset</SectionHeading>
          <ul className="space-y-1 text-sm text-mint-200">
            {BAD_ASSET.map((b) => (
              <li key={b}>
                <span aria-hidden="true" className="text-coral-400">✕</span> {b}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel>
        <SectionHeading>Asset pipeline</SectionHeading>
        <p className="mb-3 text-xs text-muted">
          Versioned and reviewable: approved versions become immutable, references stay
          protected when versions are superseded, and rollback means re-activating a
          previous version. Development markers are replaced during production-art passes.
        </p>
        <ol className="space-y-1.5">
          {PIPELINE.map((p, i) => (
            <li key={p.step} className="flex flex-wrap items-baseline gap-2 rounded-lg bg-forest-900/40 px-3 py-2">
              <span className="w-5 text-xs tabular-nums text-muted">{i + 1}.</span>
              <span className="w-32 text-sm font-medium text-cream-100">{p.step}</span>
              <span className="w-28 text-xs text-gold-400">{p.who}</span>
              <span className="text-xs text-mint-200">{p.note}</span>
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  );
}
