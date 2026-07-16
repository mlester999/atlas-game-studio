"use client";

import { useGame } from "@/components/game/GameContext";
import { Panel, PageHeader, SectionHeading } from "@/components/ui/Panel";
import { retentionSystems, retentionWarnings } from "@/data/retention";

export default function ActivitiesPage() {
  const game = useGame();
  const activitySystems = game.systems.filter(
    (s) => s.category === "gameplay" || s.category === "live_ops",
  );

  return (
    <div className="space-y-6">
      <PageHeader
        headingLevel="h2"
        title="Activities & Retention"
        lede={`What keeps players returning to ${game.name} — and the honest trade-offs of every retention pattern.`}
      />

      {activitySystems.length > 0 && (
        <Panel>
          <SectionHeading>Current activities</SectionHeading>
          <ul className="space-y-1.5 text-sm text-mint-200">
            {activitySystems.map((s) => (
              <li key={s.key}>
                <span className="font-medium text-cream-100">{s.name}</span> —{" "}
                {s.simpleExplanation}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel>
        <SectionHeading>Retention systems compared</SectionHeading>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted">
                <th scope="col" className="pb-2 pr-3">System</th>
                <th scope="col" className="pb-2 pr-3">Pros</th>
                <th scope="col" className="pb-2 pr-3">Cons</th>
                <th scope="col" className="pb-2 pr-3">Fatigue risk</th>
                <th scope="col" className="pb-2">Abuse risk</th>
              </tr>
            </thead>
            <tbody>
              {retentionSystems.map((r) => (
                <tr key={r.key} className="border-t border-forest-700/40 align-top">
                  <th scope="row" className="py-2 pr-3 font-medium text-cream-100">
                    {r.name}
                  </th>
                  <td className="py-2 pr-3 text-mint-200">{r.pros.join("; ")}</td>
                  <td className="py-2 pr-3 text-mint-200">{r.cons.join("; ")}</td>
                  <td className="py-2 pr-3 text-mint-200">{r.fatigueRisk}</td>
                  <td className="py-2 text-mint-200">{r.abuseRisk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel className="border-coral-500/30">
        <SectionHeading className="text-coral-400">Design against these</SectionHeading>
        <ul className="grid gap-1.5 text-sm text-mint-200 sm:grid-cols-2">
          {retentionWarnings.map((w) => (
            <li key={w}>
              <span aria-hidden="true" className="text-coral-400">▲</span> {w}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
