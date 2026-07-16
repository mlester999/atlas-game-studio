"use client";

import { useGame } from "@/components/game/GameContext";
import { useUiStore } from "@/store/uiStore";
import { Panel, PageHeader, SectionHeading } from "@/components/ui/Panel";
import { SystemCard } from "@/components/game/SystemCard";
import { SeverityPill } from "@/components/ui/StatusPill";

export default function SecurityPage() {
  const game = useGame();
  const publicShare = useUiStore((s) => s.publicShareMode);
  const securitySystems = game.systems.filter(
    (s) => s.category === "security" || s.category === "blockchain",
  );
  const securityRisks = game.risks.filter(
    (r) => r.category === "blockchain" || r.category === "economy" || r.category === "security",
  );

  if (publicShare) {
    return (
      <Panel>
        <p className="text-sm text-muted">
          Security findings, exploit details, and anti-abuse thresholds are never shown in
          Public Share Mode.
        </p>
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        headingLevel="h2"
        title="Security"
        lede={`Security posture for ${game.name}: authority boundaries, abuse controls, and open security-relevant risks. This page is private.`}
      />
      {securitySystems.map((s) => (
        <SystemCard key={s.key} system={s} />
      ))}
      <Panel>
        <SectionHeading>Security-relevant risks</SectionHeading>
        {securityRisks.length === 0 ? (
          <p className="text-sm text-muted">None recorded.</p>
        ) : (
          <ul className="space-y-2">
            {securityRisks.map((r) => (
              <li key={r.key} className="flex items-start justify-between gap-2 rounded-lg bg-forest-900/40 px-3 py-2">
                <div>
                  <p className="text-sm text-cream-100">{r.title}</p>
                  <p className="text-xs text-mint-300">{r.prevention}</p>
                </div>
                <SeverityPill severity={r.severity} />
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
