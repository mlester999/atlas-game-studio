"use client";

import { useGame } from "@/components/game/GameContext";
import { useUiStore } from "@/store/uiStore";
import { Panel, PageHeader, SectionHeading } from "@/components/ui/Panel";
import { SeverityPill } from "@/components/ui/StatusPill";
import { analyzeGaps } from "@/lib/analysis/gapAnalyzer";

export default function RisksPage() {
  const game = useGame();
  const publicShare = useUiStore((s) => s.publicShareMode);
  const findings = analyzeGaps(game);
  const risks = publicShare ? game.risks.filter((r) => r.publicSafe) : game.risks;

  return (
    <div className="space-y-6">
      <PageHeader
        headingLevel="h2"
        title="Risks & Gap Analyzer"
        lede={`Known risks for ${game.name} plus rule-based gaps the analyzer found in the current data. Rules fire on evidence, never on guesses.`}
      />

      <section aria-label="Gap analyzer findings">
        <SectionHeading>Gap Analyzer ({findings.length} findings)</SectionHeading>
        {findings.length === 0 ? (
          <Panel>
            <p className="text-sm text-good">No rule-based gaps detected in the current data.</p>
          </Panel>
        ) : (
          <div className="space-y-3">
            {findings.map((f) => (
              <Panel key={f.ruleKey} as="article" className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-display text-base font-semibold text-cream-100">
                    {f.title}
                  </h3>
                  <SeverityPill severity={f.severity} />
                </div>
                <p className="text-sm text-mint-200">{f.whyItMatters}</p>
                <dl className="grid gap-2 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="text-muted">Affected</dt>
                    <dd className="text-mint-200">{f.affectedSystems.join(", ") || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Recommended action</dt>
                    <dd className="text-mint-200">{f.recommendedAction}</dd>
                  </div>
                  {f.relatedTest && (
                    <div>
                      <dt className="text-muted">Related test</dt>
                      <dd className="text-mint-200">{f.relatedTest}</dd>
                    </div>
                  )}
                  {f.relatedDecision && (
                    <div>
                      <dt className="text-muted">Related decision</dt>
                      <dd className="text-mint-200">{f.relatedDecision}</dd>
                    </div>
                  )}
                </dl>
              </Panel>
            ))}
          </div>
        )}
      </section>

      <section aria-label="Known risks">
        <SectionHeading>Risk register ({risks.length})</SectionHeading>
        {risks.length === 0 && (
          <Panel>
            <p className="text-sm text-muted">
              {publicShare ? "Risk details for this game are private." : "No risks recorded."}
            </p>
          </Panel>
        )}
        <div className="space-y-3">
          {risks.map((r) => (
            <Panel key={r.key} as="article" className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-base font-semibold text-cream-100">{r.title}</h3>
                <div className="flex items-center gap-2">
                  <SeverityPill severity={r.severity} />
                  <span className="text-[11px] uppercase tracking-wider text-muted">{r.status}</span>
                </div>
              </div>
              <p className="text-sm text-mint-200">{r.explanation}</p>
              <dl className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <dt className="text-muted">Impact</dt>
                  <dd className="text-mint-200">{r.impact}</dd>
                </div>
                <div>
                  <dt className="text-muted">Likelihood</dt>
                  <dd className="text-mint-200">{r.likelihood}</dd>
                </div>
                <div>
                  <dt className="text-muted">Prevention</dt>
                  <dd className="text-mint-200">{r.prevention}</dd>
                </div>
                <div>
                  <dt className="text-muted">Detection</dt>
                  <dd className="text-mint-200">{r.detection}</dd>
                </div>
                <div>
                  <dt className="text-muted">Response</dt>
                  <dd className="text-mint-200">{r.response}</dd>
                </div>
                <div>
                  <dt className="text-muted">Owner action</dt>
                  <dd className="text-gold-400">{r.ownerAction}</dd>
                </div>
              </dl>
            </Panel>
          ))}
        </div>
      </section>
    </div>
  );
}
