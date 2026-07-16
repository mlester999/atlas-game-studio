"use client";

import { useMemo, useState } from "react";
import { useGamesStore, selectAllGames } from "@/store/gamesStore";
import { Panel, PageHeader, SectionHeading } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { LoopBuilder } from "@/components/game/LoopBuilder";
import { EconomySimulator } from "@/components/game/EconomySimulator";
import { newId, slugify, uniqueSlug } from "@/lib/draftFactory";
import type {
  Currency,
  CurrencyType,
  EconomySink,
  EconomySource,
  Experiment,
  GameProject,
  LoopStep,
} from "@/lib/types";
import { cn } from "@/lib/cn";

/**
 * Game Tinker Lab — a sandbox for safe what-if experiments.
 * Experiments are deep copies: they never alter the verified project.
 */

function cloneProject(game: GameProject): GameProject {
  return structuredClone(game);
}

function newExperiment(base: GameProject, name?: string): Experiment {
  const now = new Date().toISOString();
  return {
    id: newId(),
    name: name ?? `${base.name} experiment`,
    baseGameSlug: base.slug,
    createdAt: now,
    updatedAt: now,
    notes: "",
    snapshot: cloneProject(base),
    simulatorInputs: null,
    promotedToDraft: false,
  };
}

const CURRENCY_TYPES: CurrencyType[] = ["soft", "premium", "seasonal", "token", "material"];

function experimentCurrency(name: string, type: CurrencyType): Currency {
  return {
    key: `${slugify(name) || "currency"}-${Date.now().toString(36)}`,
    name,
    symbol: name.slice(0, 4).toUpperCase(),
    type,
    onChain: false,
    withdrawable: false,
    transferable: false,
    convertible: false,
    purpose: "Experiment currency — planning only.",
    sources: [],
    sinks: [],
    limits: [],
    issuancePolicy: "NOT YET DEFINED",
    destructionPolicy: "NOT YET DEFINED",
    inflationRisk: "unknown",
    sustainabilityStatus: "planned",
  };
}

function experimentSource(name: string): EconomySource {
  return {
    key: `${slugify(name) || "source"}-${Date.now().toString(36)}`,
    name,
    category: "experiment",
    amount: null,
    frequency: "NOT YET DEFINED",
    cooldown: "NOT YET DEFINED",
    dailyLimit: null,
    eligibility: "NOT YET DEFINED",
    abuseRisk: "medium",
    fundingOrigin: "NOT YET DEFINED",
    status: "planned",
  };
}

function experimentSink(name: string): EconomySink {
  return {
    key: `${slugify(name) || "sink"}-${Date.now().toString(36)}`,
    name,
    category: "experiment",
    cost: null,
    repeatability: "unknown",
    playerValue: "NOT YET DEFINED",
    mandatory: false,
    optional: true,
    sustainabilityImpact: "NOT YET DEFINED",
    status: "planned",
  };
}

const TRADING_KEY = "experiment-player-trading";

function tradingEnabled(snapshot: GameProject): boolean {
  return snapshot.systems.some(
    (s) => s.key === TRADING_KEY && s.implementationStatus !== "disabled",
  );
}

export default function TinkerLabPage() {
  const drafts = useGamesStore((s) => s.drafts);
  const experiments = useGamesStore((s) => s.experiments);
  const addExperiment = useGamesStore((s) => s.addExperiment);
  const updateExperiment = useGamesStore((s) => s.updateExperiment);
  const removeExperiment = useGamesStore((s) => s.removeExperiment);
  const addDraft = useGamesStore((s) => s.addDraft);

  const games = useMemo(() => selectAllGames({ drafts }), [drafts]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [baseSlug, setBaseSlug] = useState(games[0]?.slug ?? "");
  const [compareId, setCompareId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loopKey, setLoopKey] = useState(0);

  const selected = experiments.find((e) => e.id === selectedId) ?? null;
  const compared = experiments.find((e) => e.id === compareId) ?? null;

  const patchExperiment = (exp: Experiment, changes: Partial<Experiment>) => {
    void updateExperiment({
      ...exp,
      ...changes,
      updatedAt: new Date().toISOString(),
    });
  };

  const patchSnapshot = (exp: Experiment, changes: Partial<GameProject>) => {
    patchExperiment(exp, { snapshot: { ...exp.snapshot, ...changes } });
  };

  const createExperiment = async () => {
    const base = games.find((g) => g.slug === baseSlug);
    if (!base) return;
    const exp = newExperiment(base);
    await addExperiment(exp);
    setSelectedId(exp.id);
    setLoopKey((k) => k + 1);
  };

  const duplicate = async (exp: Experiment) => {
    const copy: Experiment = {
      ...structuredClone(exp),
      id: newId(),
      name: `${exp.name} (copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      promotedToDraft: false,
    };
    await addExperiment(copy);
    setSelectedId(copy.id);
    setLoopKey((k) => k + 1);
  };

  const reset = (exp: Experiment) => {
    const base = games.find((g) => g.slug === exp.baseGameSlug);
    if (!base) return;
    patchExperiment(exp, { snapshot: cloneProject(base) });
    setLoopKey((k) => k + 1);
  };

  const promote = async (exp: Experiment) => {
    const slug = uniqueSlug(`${exp.snapshot.slug}-plan`, games.map((g) => g.slug));
    const draft: GameProject = {
      ...cloneProject(exp.snapshot),
      id: newId(),
      slug,
      name: `${exp.snapshot.name} (Draft Plan)`,
      currentFocus: `Promoted from Tinker Lab experiment "${exp.name}".`,
      latestVerifiedUpdate:
        "Draft plan promoted from a Tinker Lab experiment — planning only, nothing implemented.",
      origin: "draft",
      publicSafe: false,
    };
    await addDraft(draft);
    patchExperiment(exp, { promotedToDraft: true });
  };

  const exportJson = (exp: Experiment) => {
    const blob = new Blob([JSON.stringify(exp, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tinker-${slugify(exp.name) || "experiment"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const primaryLoopSteps: LoopStep[] =
    selected?.snapshot.coreLoops.find((l) => l.kind === "primary")?.steps ?? [];

  const setLoopSteps = (exp: Experiment, steps: LoopStep[]) => {
    const loops = [...exp.snapshot.coreLoops];
    const idx = loops.findIndex((l) => l.kind === "primary");
    if (idx >= 0) {
      loops[idx] = { ...loops[idx], steps, status: "planned" };
    } else {
      loops.push({
        key: "experiment-primary",
        kind: "primary",
        name: "Primary loop (experiment)",
        steps,
        repeatFrequency: "NOT YET DEFINED",
        playerMotivation: "NOT YET DEFINED",
        reward: "NOT YET DEFINED",
        spendingOpportunity: "NOT YET DEFINED",
        failureState: "NOT YET DEFINED",
        longTermPurpose: "NOT YET DEFINED",
        status: "planned",
      });
    }
    patchSnapshot(exp, { coreLoops: loops });
  };

  const toggleTrading = (exp: Experiment) => {
    const enabled = tradingEnabled(exp.snapshot);
    let systems = exp.snapshot.systems;
    if (enabled) {
      systems = systems.map((s) =>
        s.key === TRADING_KEY ? { ...s, implementationStatus: "disabled" as const } : s,
      );
    } else if (systems.some((s) => s.key === TRADING_KEY)) {
      systems = systems.map((s) =>
        s.key === TRADING_KEY ? { ...s, implementationStatus: "planned" as const } : s,
      );
    } else {
      systems = [
        ...systems,
        {
          key: TRADING_KEY,
          category: "economy" as const,
          name: "Player Trading (experiment)",
          simpleExplanation:
            "Players could give items to each other. Added inside this experiment only.",
          designExplanation:
            "Trading deepens the economy but invites farming, scams, and real-money trade. Needs atomic settlement.",
          technicalExplanation:
            "Would require atomic, server-authoritative settlement with receipts.",
          purpose: "Experiment: test how trading changes the economy plan.",
          playerExperience: "NOT YET DEFINED",
          implementationStatus: "planned" as const,
          hostedStatus: "not_yet_defined" as const,
          ownerAcceptanceStatus: "not_yet_defined" as const,
          publicationStatus: "unpublished" as const,
          dependencies: [],
          pros: ["Player-to-player economy", "Social value"],
          cons: ["Farming pressure", "Scam and moderation burden"],
          risks: ["Duplication exploits without atomic settlement"],
          blockers: [],
          missingItems: [],
          tests: [],
          nextActions: [],
          evidence: [],
          publicSafe: true,
        },
      ];
    }
    patchSnapshot(exp, { systems });
  };

  return (
    <div>
      <PageHeader
        title="Game Tinker Lab"
        lede="Clone any game into a sandbox experiment and change whatever you like — loops, currencies, sources, sinks, trading — then stress-test the result. Experiments never alter the verified project."
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Experiment list */}
        <Panel as="aside" aria-label="Experiments" className="h-fit">
          <SectionHeading className="text-base">Experiments</SectionHeading>
          <div className="mb-3 flex flex-col gap-2">
            <label className="text-xs text-mint-300">
              Base game
              <select
                value={baseSlug}
                onChange={(e) => setBaseSlug(e.target.value)}
                className="mt-1 block w-full text-sm"
              >
                {games.map((g) => (
                  <option key={g.slug} value={g.slug}>
                    {g.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => void createExperiment()}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-cream-100 hover:bg-emerald-500"
            >
              + New experiment
            </button>
          </div>
          {experiments.length === 0 ? (
            <p className="text-xs text-muted">
              No experiments yet. Clone a game to start tinkering safely.
            </p>
          ) : (
            <ul className="space-y-1">
              {experiments.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(e.id);
                      setConfirmDelete(false);
                      setLoopKey((k) => k + 1);
                    }}
                    aria-current={e.id === selectedId ? "true" : undefined}
                    className={cn(
                      "w-full rounded-lg px-3 py-2 text-left text-sm",
                      e.id === selectedId
                        ? "bg-forest-700/60 text-cream-100"
                        : "text-mint-300 hover:bg-forest-800/60",
                    )}
                  >
                    {e.name}
                    <span className="block text-[11px] text-muted">
                      base: {e.baseGameSlug}
                      {e.promotedToDraft ? " · promoted" : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Selected experiment */}
        <div className="min-w-0 space-y-4">
          {!selected ? (
            <Panel>
              <p className="text-sm text-mint-300">
                Select or create an experiment. Everything you change stays inside the
                experiment — the verified game workspaces are untouched.
              </p>
            </Panel>
          ) : (
            <>
              <Panel className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={selected.name}
                    aria-label="Experiment name"
                    onChange={(e) => patchExperiment(selected, { name: e.target.value })}
                    className="w-64 text-sm font-semibold"
                  />
                  <StatusPill status="planned" />
                  <span className="text-xs text-muted">
                    base: {selected.baseGameSlug} · updated{" "}
                    {new Date(selected.updatedAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => void duplicate(selected)} className="rounded-lg border border-forest-700 px-3 py-1.5 text-xs text-mint-300 hover:text-cream-100">
                    Duplicate
                  </button>
                  <button type="button" onClick={() => reset(selected)} className="rounded-lg border border-forest-700 px-3 py-1.5 text-xs text-mint-300 hover:text-cream-100">
                    Reset to base game
                  </button>
                  <button
                    type="button"
                    onClick={() => void promote(selected)}
                    disabled={selected.promotedToDraft}
                    className="rounded-lg border border-gold-600/60 bg-gold-600/15 px-3 py-1.5 text-xs text-gold-400 disabled:opacity-40"
                  >
                    {selected.promotedToDraft ? "Promoted to draft" : "Promote to Draft Plan"}
                  </button>
                  <button type="button" onClick={() => exportJson(selected)} className="rounded-lg border border-forest-700 px-3 py-1.5 text-xs text-mint-300 hover:text-cream-100">
                    Export JSON
                  </button>
                  {confirmDelete ? (
                    <span className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          void removeExperiment(selected.id);
                          setSelectedId(null);
                          setConfirmDelete(false);
                        }}
                        className="rounded-lg border border-coral-500/60 bg-coral-500/15 px-3 py-1.5 text-xs text-coral-400"
                      >
                        Confirm delete
                      </button>
                      <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-lg border border-forest-700 px-3 py-1.5 text-xs text-mint-300">
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <button type="button" onClick={() => setConfirmDelete(true)} className="rounded-lg border border-coral-500/50 px-3 py-1.5 text-xs text-coral-400">
                      Delete
                    </button>
                  )}
                </div>
                <label className="block text-xs text-mint-300">
                  Notes
                  <textarea
                    value={selected.notes}
                    onChange={(e) => patchExperiment(selected, { notes: e.target.value })}
                    rows={2}
                    placeholder="What is this experiment testing?"
                    className="mt-1 block w-full text-sm"
                  />
                </label>
              </Panel>

              <Panel className="space-y-3">
                <SectionHeading className="text-base">Currencies</SectionHeading>
                <ul className="space-y-1.5">
                  {selected.snapshot.currencies.map((c) => (
                    <li key={c.key} className="flex flex-wrap items-center gap-2 text-sm text-mint-200">
                      <span className="font-semibold text-cream-100">{c.name}</span>
                      <span className="text-xs text-muted">({c.type}{c.onChain ? ", on-chain" : ""})</span>
                      <button
                        type="button"
                        aria-label={`Remove currency ${c.name}`}
                        onClick={() =>
                          patchSnapshot(selected, {
                            currencies: selected.snapshot.currencies.filter((x) => x.key !== c.key),
                          })
                        }
                        className="rounded border border-coral-500/50 px-2 py-0.5 text-xs text-coral-400"
                      >
                        remove
                      </button>
                    </li>
                  ))}
                </ul>
                <AddRow
                  placeholder="New currency name"
                  withType
                  onAdd={(name, type) =>
                    patchSnapshot(selected, {
                      currencies: [
                        ...selected.snapshot.currencies,
                        experimentCurrency(name, type ?? "soft"),
                      ],
                    })
                  }
                />
              </Panel>

              <div className="grid gap-4 lg:grid-cols-2">
                <Panel className="space-y-3">
                  <SectionHeading className="text-base">
                    Sources ({selected.snapshot.economySources.length})
                  </SectionHeading>
                  <ul className="space-y-1.5">
                    {selected.snapshot.economySources.map((s) => (
                      <li key={s.key} className="flex flex-wrap items-center gap-2 text-xs text-mint-200">
                        <span className="min-w-32 flex-1">{s.name}</span>
                        <label className="flex items-center gap-1 text-muted">
                          amount
                          <input
                            type="number"
                            min={0}
                            value={s.amount ?? ""}
                            onChange={(e) =>
                              patchSnapshot(selected, {
                                economySources: selected.snapshot.economySources.map((x) =>
                                  x.key === s.key
                                    ? { ...x, amount: e.target.value === "" ? null : Math.max(0, Number(e.target.value)) }
                                    : x,
                                ),
                              })
                            }
                            className="w-20 text-xs"
                          />
                        </label>
                        <button
                          type="button"
                          aria-label={`Remove source ${s.name}`}
                          onClick={() =>
                            patchSnapshot(selected, {
                              economySources: selected.snapshot.economySources.filter((x) => x.key !== s.key),
                            })
                          }
                          className="rounded border border-coral-500/50 px-2 py-0.5 text-coral-400"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                  <AddRow
                    placeholder="New source (how players earn)"
                    onAdd={(name) =>
                      patchSnapshot(selected, {
                        economySources: [...selected.snapshot.economySources, experimentSource(name)],
                      })
                    }
                  />
                </Panel>
                <Panel className="space-y-3">
                  <SectionHeading className="text-base">
                    Sinks ({selected.snapshot.economySinks.length})
                  </SectionHeading>
                  <ul className="space-y-1.5">
                    {selected.snapshot.economySinks.map((s) => (
                      <li key={s.key} className="flex flex-wrap items-center gap-2 text-xs text-mint-200">
                        <span className="min-w-32 flex-1">{s.name}</span>
                        <label className="flex items-center gap-1 text-muted">
                          cost
                          <input
                            type="number"
                            min={0}
                            value={s.cost ?? ""}
                            onChange={(e) =>
                              patchSnapshot(selected, {
                                economySinks: selected.snapshot.economySinks.map((x) =>
                                  x.key === s.key
                                    ? { ...x, cost: e.target.value === "" ? null : Math.max(0, Number(e.target.value)) }
                                    : x,
                                ),
                              })
                            }
                            className="w-20 text-xs"
                          />
                        </label>
                        <button
                          type="button"
                          aria-label={`Remove sink ${s.name}`}
                          onClick={() =>
                            patchSnapshot(selected, {
                              economySinks: selected.snapshot.economySinks.filter((x) => x.key !== s.key),
                            })
                          }
                          className="rounded border border-coral-500/50 px-2 py-0.5 text-coral-400"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                  <AddRow
                    placeholder="New sink (how players spend)"
                    onAdd={(name) =>
                      patchSnapshot(selected, {
                        economySinks: [...selected.snapshot.economySinks, experimentSink(name)],
                      })
                    }
                  />
                </Panel>
              </div>

              <Panel className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <SectionHeading className="mb-0 text-base">Player trading</SectionHeading>
                  <button
                    type="button"
                    aria-pressed={tradingEnabled(selected.snapshot)}
                    onClick={() => toggleTrading(selected)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs",
                      tradingEnabled(selected.snapshot)
                        ? "border-emerald-500 bg-emerald-600/25 text-cream-100"
                        : "border-forest-700 text-mint-300",
                    )}
                  >
                    {tradingEnabled(selected.snapshot) ? "Enabled in experiment" : "Disabled"}
                  </button>
                </div>
                <p className="text-xs text-muted">
                  Toggling trading here only changes this experiment. Real trading requires
                  atomic, server-authoritative settlement.
                </p>
              </Panel>

              <Panel className="space-y-3">
                <SectionHeading className="text-base">Primary gameplay loop</SectionHeading>
                <LoopBuilder
                  key={`${selected.id}-${loopKey}`}
                  initialSteps={primaryLoopSteps}
                  onChange={(steps) => setLoopSteps(selected, steps)}
                />
              </Panel>

              <Panel className="space-y-3">
                <SectionHeading className="text-base">
                  Economy stress lab (per-experiment inputs)
                </SectionHeading>
                <p className="text-xs text-muted">
                  Model player growth, player loss, bot attacks, sink failure, content
                  delays, and token-price scenarios for this experiment. Inputs are saved
                  separately for each experiment.
                </p>
                <EconomySimulator storageKey={`experiment-${selected.id}`} />
              </Panel>

              {/* Compare */}
              <Panel className="space-y-3">
                <SectionHeading className="text-base">Compare experiments</SectionHeading>
                <label className="block max-w-xs text-xs text-mint-300">
                  Compare with
                  <select
                    value={compareId ?? ""}
                    onChange={(e) => setCompareId(e.target.value || null)}
                    className="mt-1 block w-full text-sm"
                  >
                    <option value="">— none —</option>
                    {experiments
                      .filter((e) => e.id !== selected.id)
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                  </select>
                </label>
                {compared && (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] text-left text-xs">
                      <caption className="sr-only">
                        Side-by-side comparison of two experiments
                      </caption>
                      <thead>
                        <tr className="border-b border-forest-700/60 text-muted">
                          <th scope="col" className="py-1.5 pr-3">Aspect</th>
                          <th scope="col" className="py-1.5 pr-3 text-cream-100">{selected.name}</th>
                          <th scope="col" className="py-1.5 text-cream-100">{compared.name}</th>
                        </tr>
                      </thead>
                      <tbody className="text-mint-200">
                        {(
                          [
                            ["Base game", (e: Experiment) => e.baseGameSlug],
                            ["Currencies", (e: Experiment) => e.snapshot.currencies.map((c) => c.name).join(", ") || "none"],
                            ["Sources", (e: Experiment) => String(e.snapshot.economySources.length)],
                            ["Sinks", (e: Experiment) => String(e.snapshot.economySinks.length)],
                            ["Trading", (e: Experiment) => (tradingEnabled(e.snapshot) ? "enabled" : "disabled")],
                            ["Primary loop steps", (e: Experiment) => String(e.snapshot.coreLoops.find((l) => l.kind === "primary")?.steps.length ?? 0)],
                            ["Notes", (e: Experiment) => e.notes || "—"],
                          ] as const
                        ).map(([label, fn]) => (
                          <tr key={label} className="border-b border-forest-800/60">
                            <th scope="row" className="py-1.5 pr-3 font-medium text-mint-300">{label}</th>
                            <td className="py-1.5 pr-3">{fn(selected)}</td>
                            <td className="py-1.5">{fn(compared)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Panel>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AddRow({
  placeholder,
  onAdd,
  withType,
}: {
  placeholder: string;
  onAdd: (name: string, type?: CurrencyType) => void;
  withType?: boolean;
}) {
  const [value, setValue] = useState("");
  const [type, setType] = useState<CurrencyType>("soft");
  const submit = () => {
    if (!value.trim()) return;
    onAdd(value.trim(), withType ? type : undefined);
    setValue("");
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-56 text-sm"
      />
      {withType && (
        <select
          value={type}
          aria-label="Currency type"
          onChange={(e) => setType(e.target.value as CurrencyType)}
          className="text-sm"
        >
          {CURRENCY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      )}
      <button
        type="button"
        onClick={submit}
        className="rounded-lg border border-forest-700 px-3 py-1.5 text-xs text-mint-300 hover:text-cream-100"
      >
        + Add
      </button>
    </div>
  );
}
