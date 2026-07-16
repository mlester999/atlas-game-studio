"use client";

import Link from "next/link";
import { useGame } from "@/components/game/GameContext";
import { useUiStore } from "@/store/uiStore";
import { Panel, PageHeader, SectionHeading } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { FlowDiagram } from "@/components/charts/FlowDiagram";
import { BarChart } from "@/components/charts/BarChart";
import { MaybeValue, NotYetDefined } from "@/components/ui/Unknown";

export default function EconomyPage() {
  const game = useGame();
  const mode = useUiStore((s) => s.viewingMode);
  const publicShare = useUiStore((s) => s.publicShareMode);
  const softCurrency = game.currencies.find((c) => c.type === "soft");

  return (
    <div className="space-y-6">
      <PageHeader
 headingLevel="h2"
 title="Economy Laboratory" lede={game.economySummary} />

      {/* Currencies */}
      <section aria-label="Currencies" className="grid gap-3 lg:grid-cols-2">
        {game.currencies.map((c) => (
          <Panel key={c.key} className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-semibold text-cream-100">
                {c.name} <span className="text-xs text-muted">({c.symbol})</span>
              </h2>
              <StatusPill status={c.sustainabilityStatus} />
            </div>
            <p className="text-sm text-mint-200">{c.purpose}</p>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {[
                { on: c.onChain, label: "on-chain", off: "off-chain" },
                { on: c.withdrawable, label: "withdrawable", off: "non-withdrawable" },
                { on: c.transferable, label: "transferable", off: "not player-transferable" },
                { on: c.convertible, label: "convertible", off: "not convertible" },
              ].map((p) => (
                <span
                  key={p.label}
                  className={`rounded-full border px-2 py-0.5 ${
                    p.on ? "border-gold-600/50 text-gold-400" : "border-forest-700 text-mint-300"
                  }`}
                >
                  {p.on ? p.label : p.off}
                </span>
              ))}
              <span
                className={`rounded-full border px-2 py-0.5 ${
                  c.inflationRisk === "high"
                    ? "border-coral-500/50 text-coral-400"
                    : c.inflationRisk === "medium"
                      ? "border-gold-600/50 text-warn"
                      : "border-forest-700 text-mint-300"
                }`}
              >
                inflation risk: {c.inflationRisk}
              </span>
            </div>
            {mode !== "simple" && (
              <dl className="grid gap-2 text-xs sm:grid-cols-2">
                <div>
                  <dt className="text-muted">Issuance</dt>
                  <dd className="text-mint-200">
                    <MaybeValue value={c.issuancePolicy} />
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Destruction</dt>
                  <dd className="text-mint-200">
                    <MaybeValue value={c.destructionPolicy} />
                  </dd>
                </div>
                {c.limits.length > 0 && (
                  <div className="sm:col-span-2">
                    <dt className="text-muted">Limits</dt>
                    <dd className="text-mint-200">{c.limits.join(" · ")}</dd>
                  </div>
                )}
              </dl>
            )}
          </Panel>
        ))}
        {game.currencies.length === 0 && (
          <Panel>
            <p className="text-sm text-mint-200">
              No currencies defined. <NotYetDefined />
            </p>
          </Panel>
        )}
      </section>

      {/* Flow */}
      <Panel>
        <SectionHeading>Source → sink flow</SectionHeading>
        <FlowDiagram
          currencyName={softCurrency?.name ?? "Currency"}
          sources={game.economySources.map((s) => ({ name: s.name, amount: s.amount }))}
          sinks={game.economySinks.map((s) => ({ name: s.name, amount: s.cost }))}
        />
      </Panel>

      {/* Sources and sinks detail */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <SectionHeading>Sources (faucets)</SectionHeading>
          {game.economySources.length === 0 ? (
            <NotYetDefined />
          ) : (
            <ul className="space-y-2">
              {game.economySources.map((s) => (
                <li key={s.key} className="rounded-lg bg-forest-900/40 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-cream-100">{s.name}</span>
                    <StatusPill status={s.status} />
                  </div>
                  <p className="text-xs text-muted">
                    {s.amount != null ? `${s.amount} per completion · ` : ""}
                    {s.frequency} · abuse risk: {s.abuseRisk}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel>
          <SectionHeading>Sinks</SectionHeading>
          {game.economySinks.length === 0 ? (
            <NotYetDefined />
          ) : (
            <ul className="space-y-2">
              {game.economySinks.map((s) => (
                <li key={s.key} className="rounded-lg bg-forest-900/40 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-cream-100">{s.name}</span>
                    <StatusPill status={s.status} />
                  </div>
                  <p className="text-xs text-muted">
                    {s.cost != null ? `~${s.cost} per purchase · ` : ""}
                    {s.repeatability.replace(/_/g, " ")} ·{" "}
                    {s.mandatory ? "mandatory" : "optional"}
                  </p>
                  <p className="text-xs text-mint-300">{s.sustainabilityImpact}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Tuning candidates (Starville) */}
      {game.economyCandidates.length > 0 && (
        <Panel>
          <SectionHeading>Tuning candidates (unpublished)</SectionHeading>
          <p className="mb-3 text-xs text-muted">
            Simulated retune options. A favorable simulation is not authority to publish —
            every candidate stays unpublished until the owner explicitly accepts or rejects
            it after hosted, signed-in validation.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-muted">
                  <th scope="col" className="pb-2 pr-3">Candidate</th>
                  <th scope="col" className="pb-2 pr-3">Change</th>
                  <th scope="col" className="pb-2 pr-3">180d ratio</th>
                  <th scope="col" className="pb-2 pr-3">Beginner affordability</th>
                  <th scope="col" className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {game.economyCandidates.map((c) => (
                  <tr key={c.id} className="border-t border-forest-700/40">
                    <th scope="row" className="py-2 pr-3 font-medium text-cream-100">
                      {c.code} — {c.name}
                      {c.isRecommended && (
                        <span className="ml-2 rounded-full border border-emerald-500/50 bg-emerald-600/20 px-2 py-0.5 text-[10px] text-good">
                          recommended
                        </span>
                      )}
                    </th>
                    <td className="py-2 pr-3 text-mint-200">{c.planningChange}</td>
                    <td className="py-2 pr-3 tabular-nums text-mint-200">{c.ratio180dBalanced}</td>
                    <td className="py-2 pr-3 tabular-nums text-mint-200">
                      {c.beginnerAffordability}%
                    </td>
                    <td className="py-2">
                      {c.unpublished && <StatusPill status="acceptance_pending" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <BarChart
              title="Source-to-sink ratio at 180 days (balanced scenario) — planning band 0.95–1.10"
              items={game.economyCandidates.map((c) => ({
                label: `${c.code} — ${c.name}`,
                value: c.ratio180dBalanced,
                color:
                  c.ratio180dBalanced <= 1.1 && c.ratio180dBalanced >= 0.95
                    ? "var(--series-1)"
                    : "var(--series-2)",
              }))}
              format={(v) => v.toFixed(3)}
              summary="Candidate D at 1.094 is the only candidate near the 0.95–1.10 planning band."
            />
          </div>
        </Panel>
      )}

      {/* Treasury */}
      {!publicShare && (
        <Panel>
          <SectionHeading>Treasury</SectionHeading>
          <div className="mb-2">
            <StatusPill status={game.treasury.status} />
          </div>
          {game.treasury.runwayAssumptions.length > 0 ? (
            <ul className="list-inside list-disc space-y-1 text-sm text-mint-200">
              {game.treasury.runwayAssumptions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          ) : (
            <NotYetDefined />
          )}
        </Panel>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/games/${game.slug}/economy/longevity`}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-cream-100 hover:bg-emerald-500"
        >
          Open the Longevity Simulator →
        </Link>
        <Link
          href="/learn/economy-health"
          className="rounded-lg border border-forest-700 px-4 py-2 text-sm text-mint-300 hover:text-cream-100"
        >
          How a game economy survives
        </Link>
      </div>
    </div>
  );
}
