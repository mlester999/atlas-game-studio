"use client";

import { useGame } from "@/components/game/GameContext";
import { Panel, PageHeader, SectionHeading } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { MaybeValue } from "@/components/ui/Unknown";

export default function WorldPage() {
  const game = useGame();

  return (
    <div className="space-y-6">
      <PageHeader
        headingLevel="h2"
        title="World & Content"
        lede={`The places, things, and content plans that make up ${game.name}'s world.`}
      />

      <Panel>
        <SectionHeading>World identity</SectionHeading>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted">Environment style</dt>
            <dd className="text-mint-200">
              <MaybeValue value={game.visualIdentity.environmentStyle} />
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted">Reference notes</dt>
            <dd className="text-mint-200">
              <MaybeValue value={game.visualIdentity.referenceNotes || null} />
            </dd>
          </div>
        </dl>
      </Panel>

      <Panel>
        <SectionHeading>Content plans</SectionHeading>
        {game.contentPlans.length === 0 ? (
          <p className="text-sm text-muted">
            No content plans defined yet — plan them in the Content Longevity Lab.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-muted">
                  <th scope="col" className="pb-2 pr-3">Content type</th>
                  <th scope="col" className="pb-2 pr-3">Initial quantity</th>
                  <th scope="col" className="pb-2 pr-3">Release cadence</th>
                  <th scope="col" className="pb-2 pr-3">Production cost</th>
                  <th scope="col" className="pb-2 pr-3">Replayability</th>
                  <th scope="col" className="pb-2 pr-3">Exhaustion risk</th>
                  <th scope="col" className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {game.contentPlans.map((c) => (
                  <tr key={c.key} className="border-t border-forest-700/40">
                    <th scope="row" className="py-2 pr-3 font-medium text-cream-100">
                      {c.contentType}
                    </th>
                    <td className="py-2 pr-3 text-mint-200">
                      <MaybeValue value={c.initialQuantity} />
                    </td>
                    <td className="py-2 pr-3 text-mint-200">
                      <MaybeValue value={c.releaseCadence} />
                    </td>
                    <td className="py-2 pr-3 text-mint-200">{c.productionCost}</td>
                    <td className="py-2 pr-3 text-mint-200">{c.replayability}</td>
                    <td
                      className={`py-2 pr-3 ${
                        c.exhaustionRisk === "high" ? "text-warn" : "text-mint-200"
                      }`}
                    >
                      {c.exhaustionRisk}
                    </td>
                    <td className="py-2">
                      <StatusPill status={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
