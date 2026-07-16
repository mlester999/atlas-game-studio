"use client";

import { useGame } from "@/components/game/GameContext";
import { Panel, PageHeader, SectionHeading } from "@/components/ui/Panel";
import { monetizationModels } from "@/data/monetization";
import { cn } from "@/lib/cn";

const riskTone = (v: string) =>
  v === "high"
    ? "text-coral-400"
    : v === "medium"
      ? "text-warn"
      : "text-mint-200";

export default function MonetizationPage() {
  const game = useGame();

  return (
    <div className="space-y-6">
      <PageHeader
        headingLevel="h2"
        title="Monetization Lab"
        lede={`How ${game.name} could earn revenue — model by model, with fairness and economy impact weighed alongside revenue. Cosmetics-first is the studio default for cozy and social games.`}
      />
      <Panel>
        <SectionHeading>Earning model comparison</SectionHeading>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted">
                <th scope="col" className="pb-2 pr-3">Model</th>
                <th scope="col" className="pb-2 pr-3">Player value</th>
                <th scope="col" className="pb-2 pr-3">Revenue</th>
                <th scope="col" className="pb-2 pr-3">Fairness</th>
                <th scope="col" className="pb-2 pr-3">P2W risk</th>
                <th scope="col" className="pb-2 pr-3">Dev / upkeep</th>
                <th scope="col" className="pb-2 pr-3">Legal</th>
                <th scope="col" className="pb-2">Recommended for</th>
              </tr>
            </thead>
            <tbody>
              {monetizationModels.map((m) => (
                <tr key={m.key} className="border-t border-forest-700/40 align-top">
                  <th scope="row" className="py-2 pr-3 font-medium text-cream-100">
                    {m.name}
                    <span className="mt-0.5 block text-[10px] font-normal text-muted">
                      {m.retentionImpact}
                    </span>
                  </th>
                  <td className="py-2 pr-3 text-mint-200">{m.playerValue}</td>
                  <td className="py-2 pr-3 text-mint-200">{m.revenuePotential}</td>
                  <td className={cn("py-2 pr-3", m.fairness === "low" ? "text-warn" : "text-mint-200")}>
                    {m.fairness}
                  </td>
                  <td className={cn("py-2 pr-3", riskTone(m.payToWinRisk))}>{m.payToWinRisk}</td>
                  <td className="py-2 pr-3 text-mint-200">
                    {m.developmentComplexity} / {m.maintenance}
                  </td>
                  <td className={cn("py-2 pr-3", riskTone(m.legalRisk))}>{m.legalRisk}</td>
                  <td className="py-2 text-mint-200">{m.recommendedFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          Economy impact notes:{" "}
          {monetizationModels
            .filter((m) => m.economyImpact !== "None" && m.economyImpact !== "None — decoupled from the in-game economy")
            .map((m) => `${m.name}: ${m.economyImpact}`)
            .join(" · ")}
        </p>
      </Panel>
    </div>
  );
}
