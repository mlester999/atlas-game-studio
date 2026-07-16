"use client";

import type { GameSystem } from "@/lib/types";
import { useUiStore } from "@/store/uiStore";
import { StatusPill } from "@/components/ui/StatusPill";
import { ProsCons } from "@/components/ui/ProsCons";
import { MaybeValue } from "@/components/ui/Unknown";
import { Panel } from "@/components/ui/Panel";

/**
 * A game system rendered at the current viewing-mode depth.
 * Modes change presentation only — the underlying system data is identical.
 */
export function SystemCard({ system }: { system: GameSystem }) {
  const mode = useUiStore((s) => s.viewingMode);
  const publicShare = useUiStore((s) => s.publicShareMode);

  if (publicShare && !system.publicSafe) return null;

  const explanation =
    mode === "simple"
      ? system.simpleExplanation
      : mode === "design"
        ? system.designExplanation
        : system.technicalExplanation;

  return (
    <Panel as="article" className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-base font-semibold text-cream-100">{system.name}</h3>
          <p className="text-[11px] uppercase tracking-wider text-muted">{system.category.replace(/_/g, " ")}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <StatusPill status={system.implementationStatus} />
          {mode === "technical" && system.hostedStatus !== "not_yet_defined" && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted">
              hosted: <StatusPill status={system.hostedStatus} />
            </span>
          )}
        </div>
      </div>

      <p className="text-sm leading-relaxed text-mint-200">
        <MaybeValue value={explanation} />
      </p>

      {mode !== "simple" && (
        <dl className="grid gap-2 text-xs sm:grid-cols-2">
          <div>
            <dt className="text-muted">Purpose</dt>
            <dd className="text-mint-200">
              <MaybeValue value={system.purpose} />
            </dd>
          </div>
          <div>
            <dt className="text-muted">Player experience</dt>
            <dd className="text-mint-200">
              <MaybeValue value={system.playerExperience} />
            </dd>
          </div>
          {mode === "technical" && (
            <>
              <div>
                <dt className="text-muted">Owner acceptance</dt>
                <dd>
                  <StatusPill status={system.ownerAcceptanceStatus} />
                </dd>
              </div>
              {system.dependencies.length > 0 && (
                <div>
                  <dt className="text-muted">Dependencies</dt>
                  <dd className="text-mint-200">{system.dependencies.join(", ")}</dd>
                </div>
              )}
            </>
          )}
        </dl>
      )}

      {mode !== "simple" && <ProsCons pros={system.pros} cons={system.cons} risks={system.risks} />}

      {system.blockers.length > 0 && (
        <div className="rounded-lg border border-coral-500/40 bg-coral-500/10 px-3 py-2">
          <p className="text-xs font-semibold text-coral-400">
            <span aria-hidden="true">⛔</span> Blocked by
          </p>
          <ul className="mt-1 list-inside list-disc text-xs text-mint-200">
            {system.blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {mode !== "simple" && system.missingItems.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-warn">Missing</p>
          <ul className="mt-1 list-inside list-disc text-xs text-mint-200">
            {system.missingItems.map((miss) => (
              <li key={miss}>{miss}</li>
            ))}
          </ul>
        </div>
      )}

      {system.nextActions.length > 0 && (
        <p className="text-xs text-mint-300">
          <span className="font-semibold text-gold-400">Next:</span> {system.nextActions.join(" · ")}
        </p>
      )}

      {mode === "technical" && system.evidence.length > 0 && (
        <p className="text-[11px] text-muted">Evidence: {system.evidence.join(" · ")}</p>
      )}
    </Panel>
  );
}
