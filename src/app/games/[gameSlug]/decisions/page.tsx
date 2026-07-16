"use client";

import { useState } from "react";
import { useGame } from "@/components/game/GameContext";
import { useGamesStore } from "@/store/gamesStore";
import { useUiStore } from "@/store/uiStore";
import { Panel, PageHeader } from "@/components/ui/Panel";
import { ProsCons } from "@/components/ui/ProsCons";
import type { DecisionApproval, DecisionRecord } from "@/lib/types";
import { cn } from "@/lib/cn";

const APPROVALS: { key: DecisionApproval; label: string; className: string }[] = [
  { key: "open", label: "Open", className: "border-forest-700 text-mint-300" },
  { key: "recommended", label: "Recommended", className: "border-gold-600/50 text-gold-400" },
  { key: "accepted", label: "Accepted", className: "border-emerald-500/60 bg-emerald-600/20 text-good" },
  { key: "rejected", label: "Rejected", className: "border-coral-500/60 text-coral-400" },
  { key: "deferred", label: "Deferred", className: "border-forest-700 text-muted" },
];

export default function DecisionsPage() {
  const game = useGame();
  const setDecisions = useGamesStore((s) => s.setDecisions);
  const publicShare = useUiStore((s) => s.publicShareMode);
  const [message, setMessage] = useState<string | null>(null);

  const decisions = publicShare
    ? game.decisions.filter((d) => d.publicSafe)
    : game.decisions;

  const update = (key: string, patch: Partial<DecisionRecord>) => {
    const next = game.decisions.map((d) => (d.key === key ? { ...d, ...patch } : d));
    void setDecisions(game.slug, next);
    setMessage("Decision updated.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        headingLevel="h2"
        title="Decision Journal"
        lede={`Questions only the owner can answer for ${game.name}. Recording a decision here is the studio's memory — nothing publishes automatically because of it.`}
      />
      {message && (
        <p role="status" className="text-xs text-good">
          {message}
        </p>
      )}
      {decisions.length === 0 && (
        <Panel>
          <p className="text-sm text-muted">
            {publicShare
              ? "Decisions for this game are private."
              : "No decisions recorded yet."}
          </p>
        </Panel>
      )}
      {decisions.map((d) => (
        <Panel key={d.key} as="article" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-semibold text-cream-100">{d.title}</h2>
            <div role="radiogroup" aria-label={`Approval for ${d.title}`} className="flex flex-wrap gap-1">
              {APPROVALS.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  role="radio"
                  aria-checked={d.approvalStatus === a.key}
                  onClick={() =>
                    update(d.key, {
                      approvalStatus: a.key,
                      reviewDate: new Date().toISOString().slice(0, 10),
                    })
                  }
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px]",
                    d.approvalStatus === a.key
                      ? a.className
                      : "border-forest-800 text-muted hover:text-mint-300",
                  )}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
          <p className="rounded-lg bg-forest-900/40 px-3 py-2 text-sm text-cream-100">
            {d.question}
          </p>
          <p className="text-sm leading-relaxed text-mint-200">{d.context}</p>
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">
              Options
            </h3>
            <div className="flex flex-col gap-1">
              {d.options.map((opt) => (
                <label key={opt} className="flex items-start gap-2 text-sm text-mint-200">
                  <input
                    type="radio"
                    name={`decision-${d.key}`}
                    checked={d.selectedOption === opt}
                    onChange={() => update(d.key, { selectedOption: opt })}
                    className="mt-1"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
          <ProsCons pros={d.pros} cons={d.cons} risks={d.risks} />
          <dl className="grid gap-2 text-xs sm:grid-cols-2">
            {d.evidence.length > 0 && (
              <div>
                <dt className="text-muted">Evidence</dt>
                <dd className="text-mint-200">{d.evidence.join(" · ")}</dd>
              </div>
            )}
            <div>
              <dt className="text-muted">Reversal conditions</dt>
              <dd className="text-mint-200">{d.reversalConditions}</dd>
            </div>
            {d.reviewDate && (
              <div>
                <dt className="text-muted">Last reviewed</dt>
                <dd className="text-mint-200">{d.reviewDate}</dd>
              </div>
            )}
          </dl>
        </Panel>
      ))}
    </div>
  );
}
