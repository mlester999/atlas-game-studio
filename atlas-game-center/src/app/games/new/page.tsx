"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useGamesStore, selectAllGames } from "@/store/gamesStore";
import { Panel, PageHeader, SectionHeading } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { LoopBuilder } from "@/components/game/LoopBuilder";
import { categories } from "@/data/categories";
import { templates } from "@/data/templates";
import { analyzeGaps } from "@/lib/analysis/gapAnalyzer";
import {
  buildDraftProject,
  emptyWizardState,
  slugify,
  wizardWarnings,
  PROGRESSION_OPTIONS,
  type WizardState,
} from "@/lib/draftFactory";
import type { CategoryKey, CurrencyType } from "@/lib/types";
import { cn } from "@/lib/cn";

const STEPS = [
  "Game Identity",
  "Visual Identity",
  "Core Gameplay Loop",
  "Progression",
  "Economy",
  "Multiplayer",
  "Content",
  "Technology",
  "Risks",
  "Create Workspace",
];

const PLATFORM_OPTIONS = ["Web", "Desktop", "Mobile", "Console (future)"];

const MULTIPLAYER_FEATURES = [
  "Channels",
  "Chat",
  "Parties",
  "Guilds",
  "Item Trading",
  "Leaderboards",
  "Matchmaking",
  "Cooperative activities",
  "PvP",
  "Moderation tools (report, block, mute)",
];

const CONTENT_SUGGESTIONS = [
  "Worlds",
  "Creatures",
  "Enemies",
  "Crops",
  "Towers",
  "Buildings",
  "Ships",
  "Items",
  "Quests",
  "Activities",
  "Bosses",
  "Events",
  "Seasons",
];

const TECH_FIELDS: { key: keyof WizardState["technology"]; label: string }[] = [
  { key: "renderer", label: "Renderer" },
  { key: "frontend", label: "Frontend" },
  { key: "api", label: "API" },
  { key: "realtime", label: "Realtime" },
  { key: "database", label: "Database" },
  { key: "authentication", label: "Authentication" },
  { key: "wallet", label: "Wallet" },
  { key: "hosting", label: "Hosting" },
  { key: "adminPortal", label: "Admin portal" },
  { key: "assetPipeline", label: "Asset pipeline" },
];

const CURRENCY_TYPES: CurrencyType[] = ["soft", "premium", "seasonal", "token", "material"];

function TextField({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <label className="block text-xs text-mint-300">
      {label}
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="mt-1 block w-full text-sm"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-1 block w-full text-sm"
        />
      )}
    </label>
  );
}

function CheckGroup({
  legend,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-xs text-mint-300">{legend}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = selected.includes(o);
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(o)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs",
                on
                  ? "border-emerald-500 bg-emerald-600/25 text-cream-100"
                  : "border-forest-700 text-mint-300 hover:text-cream-100",
              )}
            >
              {o}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function AddGameWizardPage() {
  const router = useRouter();
  const drafts = useGamesStore((s) => s.drafts);
  const addDraft = useGamesStore((s) => s.addDraft);
  const games = useMemo(() => selectAllGames({ drafts }), [drafts]);
  const existingSlugs = games.map((g) => g.slug);

  const [step, setStep] = useState(0);
  const [maxVisited, setMaxVisited] = useState(0);
  const [state, setState] = useState<WizardState>(emptyWizardState());
  const [creating, setCreating] = useState(false);
  // Remounts the LoopBuilder only when steps are replaced from outside
  // (template prefill) — not on the builder's own edits.
  const [loopBuilderKey, setLoopBuilderKey] = useState(0);
  // The slug follows the name until the owner edits the slug directly.
  const [slugTouched, setSlugTouched] = useState(false);

  const patch = (p: Partial<WizardState>) => setState((s) => ({ ...s, ...p }));

  const goTo = (next: number) => {
    const clamped = Math.max(0, Math.min(STEPS.length - 1, next));
    setStep(clamped);
    setMaxVisited((m) => Math.max(m, clamped));
  };

  const warnings = useMemo(() => wizardWarnings(state), [state]);
  const draftPreview = useMemo(
    () => buildDraftProject(state, existingSlugs),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state],
  );
  const gapFindings = useMemo(() => analyzeGaps(draftPreview), [draftPreview]);

  const matchingTemplate = templates.find((t) =>
    t.forCategories.includes(state.primaryCategory),
  );

  const create = async () => {
    if (creating) return;
    setCreating(true);
    const draft = buildDraftProject(state, existingSlugs);
    await addDraft(draft);
    router.push(`/games/${draft.slug}`);
  };

  const toggleIn = (list: string[], v: string) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  return (
    <div>
      <PageHeader
        title="Add Game"
        lede="Plan a completely new game without writing code. Everything you choose here is a plan: the workspace marks it PLANNED, never implemented."
      />

      {/* Step navigation */}
      <nav aria-label="Wizard steps" className="mb-6">
        <ol className="flex flex-wrap gap-1.5">
          {STEPS.map((s, i) => {
            const reachable = i <= maxVisited;
            return (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => reachable && goTo(i)}
                  disabled={!reachable}
                  aria-current={i === step ? "step" : undefined}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs",
                    i === step
                      ? "border-gold-400 bg-gold-600/20 text-gold-400"
                      : reachable
                        ? "border-forest-700 text-mint-300 hover:text-cream-100"
                        : "border-forest-800 text-muted opacity-50",
                  )}
                >
                  {i + 1}. {s}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <Panel className="space-y-5">
        {step === 0 && (
          <>
            <SectionHeading>Step 1 — Game Identity</SectionHeading>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Name"
                value={state.name}
                onChange={(name) =>
                  patch(slugTouched ? { name } : { name, slug: slugify(name) })
                }
                placeholder="My Next Game"
              />
              <TextField
                label="Slug (URL identifier)"
                value={state.slug}
                onChange={(slug) => {
                  setSlugTouched(slug.length > 0);
                  patch({ slug: slugify(slug) });
                }}
                placeholder="my-next-game"
              />
              <TextField
                label="Tagline"
                value={state.tagline}
                onChange={(tagline) => patch({ tagline })}
                placeholder="One line that captures the game"
              />
              <TextField
                label="Target audience"
                value={state.targetAudience}
                onChange={(targetAudience) => patch({ targetAudience })}
                placeholder="e.g. cozy-game players who like collecting"
              />
            </div>
            <TextField
              label="Description"
              value={state.description}
              onChange={(description) => patch({ description })}
              textarea
              placeholder="What is this game about?"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs text-mint-300">
                Primary category
                <select
                  value={state.primaryCategory}
                  onChange={(e) =>
                    patch({ primaryCategory: e.target.value as CategoryKey })
                  }
                  className="mt-1 block w-full text-sm"
                >
                  {categories.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs text-mint-300">
                Development stage
                <select
                  value={state.developmentStage}
                  onChange={(e) =>
                    patch({
                      developmentStage: e.target.value as WizardState["developmentStage"],
                    })
                  }
                  className="mt-1 block w-full text-sm"
                >
                  <option value="concept">Concept</option>
                  <option value="planning">Planning</option>
                </select>
              </label>
            </div>
            <CheckGroup
              legend="Secondary categories"
              options={categories
                .filter((c) => c.key !== state.primaryCategory)
                .map((c) => c.name)}
              selected={state.secondaryCategories.map(
                (k) => categories.find((c) => c.key === k)?.name ?? k,
              )}
              onToggle={(name) => {
                const cat = categories.find((c) => c.name === name);
                if (!cat) return;
                patch({
                  secondaryCategories: state.secondaryCategories.includes(cat.key)
                    ? state.secondaryCategories.filter((k) => k !== cat.key)
                    : [...state.secondaryCategories, cat.key],
                });
              }}
            />
            <CheckGroup
              legend="Platforms"
              options={PLATFORM_OPTIONS}
              selected={state.platforms}
              onToggle={(p) => patch({ platforms: toggleIn(state.platforms, p) })}
            />
            {matchingTemplate && (
              <p className="rounded-lg border border-emerald-600/30 bg-emerald-600/10 px-3 py-2 text-xs text-mint-200">
                Template available: <strong>{matchingTemplate.name}</strong> can prefill a
                typical core loop in step 3. See the Templates library for its systems and
                risks.
              </p>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <SectionHeading>Step 2 — Visual Identity</SectionHeading>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block text-xs text-mint-300">
                Dimension
                <select
                  value={state.dimension}
                  onChange={(e) =>
                    patch({ dimension: e.target.value as WizardState["dimension"] })
                  }
                  className="mt-1 block w-full text-sm"
                >
                  <option value="not_yet_defined">Not yet defined</option>
                  <option value="2d">2D</option>
                  <option value="3d">3D</option>
                </select>
              </label>
              <label className="block text-xs text-mint-300">
                Pixel art
                <select
                  value={state.pixelArt === null ? "undecided" : state.pixelArt ? "yes" : "no"}
                  onChange={(e) =>
                    patch({
                      pixelArt:
                        e.target.value === "undecided" ? null : e.target.value === "yes",
                    })
                  }
                  className="mt-1 block w-full text-sm"
                >
                  <option value="undecided">Undecided</option>
                  <option value="yes">Pixel art</option>
                  <option value="no">Non-pixel</option>
                </select>
              </label>
              <label className="block text-xs text-mint-300">
                Viewpoint
                <select
                  value={state.viewpoint}
                  onChange={(e) =>
                    patch({ viewpoint: e.target.value as WizardState["viewpoint"] })
                  }
                  className="mt-1 block w-full text-sm"
                >
                  <option value="not_yet_defined">Not yet defined</option>
                  <option value="top_down">Top-down</option>
                  <option value="side_view">Side view</option>
                  <option value="isometric">Isometric</option>
                  <option value="perspective">Perspective (3D)</option>
                </select>
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Camera behavior" value={state.cameraBehavior} onChange={(cameraBehavior) => patch({ cameraBehavior })} placeholder="e.g. smooth follow, slight lookahead" />
              <TextField label="Character style" value={state.characterStyle} onChange={(characterStyle) => patch({ characterStyle })} placeholder="e.g. chibi, painterly, 16-bit" />
              <TextField label="Environment style" value={state.environmentStyle} onChange={(environmentStyle) => patch({ environmentStyle })} placeholder="e.g. cozy village, tropical islands" />
              <TextField label="Color palette" value={state.colorPalette} onChange={(colorPalette) => patch({ colorPalette })} placeholder="e.g. warm greens, lantern gold" />
              <TextField label="Animation style" value={state.animationStyle} onChange={(animationStyle) => patch({ animationStyle })} placeholder="e.g. 8-direction walk cycles" />
            </div>
            <TextField
              label="Reference notes"
              value={state.referenceNotes}
              onChange={(referenceNotes) => patch({ referenceNotes })}
              textarea
              placeholder="Games, art, or moods this should feel like"
            />
          </>
        )}

        {step === 2 && (
          <>
            <SectionHeading>Step 3 — Core Gameplay Loop</SectionHeading>
            <p className="text-xs text-mint-300">
              Build the loop players repeat most. Add steps in order, mark rewards and
              spending, and read the live analysis.
              {matchingTemplate && (
                <>
                  {" "}
                  Or start from the {matchingTemplate.name.toLowerCase()}:
                  <button
                    type="button"
                    onClick={() => {
                      patch({
                        loopSteps: matchingTemplate.typicalCoreLoop.map((label, i) => ({
                          id: `tpl-${i}-${Date.now().toString(36)}`,
                          kind: "custom",
                          label,
                          isReward: /reward|earn|harvest|resource/i.test(label),
                          isSpend: /spend|upgrade|buy/i.test(label),
                        })),
                      });
                      setLoopBuilderKey((k) => k + 1);
                    }}
                    className="ml-2 rounded-lg border border-gold-600/60 bg-gold-600/15 px-2 py-0.5 text-xs text-gold-400"
                  >
                    Prefill from template
                  </button>
                </>
              )}
            </p>
            <LoopBuilder
              key={loopBuilderKey}
              initialSteps={state.loopSteps}
              onChange={(loopSteps) => patch({ loopSteps })}
            />
          </>
        )}

        {step === 3 && (
          <>
            <SectionHeading>Step 4 — Progression</SectionHeading>
            <p className="text-xs text-mint-300">
              Which progression tracks should this game have? Each pick becomes a PLANNED
              progression system you can detail later in the Progression Lab.
            </p>
            <CheckGroup
              legend="Progression tracks"
              options={PROGRESSION_OPTIONS.map(([, label]) => label)}
              selected={state.progressionPicks.map(
                (k) => PROGRESSION_OPTIONS.find(([key]) => key === k)?.[1] ?? k,
              )}
              onToggle={(label) => {
                const entry = PROGRESSION_OPTIONS.find(([, l]) => l === label);
                if (!entry) return;
                const key = entry[0];
                patch({
                  progressionPicks: state.progressionPicks.includes(key)
                    ? state.progressionPicks.filter((k) => k !== key)
                    : [...state.progressionPicks, key],
                });
              }}
            />
          </>
        )}

        {step === 4 && (
          <>
            <SectionHeading>Step 5 — Economy</SectionHeading>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-cream-100">Currencies</h3>
              {state.currencies.length === 0 && (
                <p className="mb-2 text-xs text-muted">No currencies planned yet.</p>
              )}
              <ul className="space-y-2">
                {state.currencies.map((c, i) => (
                  <li key={i} className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={c.name}
                      aria-label={`Currency ${i + 1} name`}
                      onChange={(e) =>
                        patch({
                          currencies: state.currencies.map((x, j) =>
                            j === i ? { ...x, name: e.target.value } : x,
                          ),
                        })
                      }
                      placeholder="Name"
                      className="w-36 text-sm"
                    />
                    <input
                      type="text"
                      value={c.symbol}
                      aria-label={`Currency ${i + 1} symbol`}
                      onChange={(e) =>
                        patch({
                          currencies: state.currencies.map((x, j) =>
                            j === i ? { ...x, symbol: e.target.value } : x,
                          ),
                        })
                      }
                      placeholder="Symbol"
                      className="w-20 text-sm"
                    />
                    <select
                      value={c.type}
                      aria-label={`Currency ${i + 1} type`}
                      onChange={(e) =>
                        patch({
                          currencies: state.currencies.map((x, j) =>
                            j === i ? { ...x, type: e.target.value as CurrencyType } : x,
                          ),
                        })
                      }
                      className="text-sm"
                    >
                      {CURRENCY_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <label className="flex items-center gap-1 text-xs text-mint-300">
                      <input
                        type="checkbox"
                        checked={c.onChain}
                        onChange={(e) =>
                          patch({
                            currencies: state.currencies.map((x, j) =>
                              j === i ? { ...x, onChain: e.target.checked } : x,
                            ),
                          })
                        }
                      />
                      on-chain
                    </label>
                    <button
                      type="button"
                      aria-label={`Remove currency ${i + 1}`}
                      onClick={() =>
                        patch({ currencies: state.currencies.filter((_, j) => j !== i) })
                      }
                      className="rounded border border-coral-500/50 px-2 py-0.5 text-xs text-coral-400"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() =>
                  patch({
                    currencies: [
                      ...state.currencies,
                      { name: "", symbol: "", type: "soft", onChain: false },
                    ],
                  })
                }
                className="mt-2 rounded-lg border border-forest-700 px-3 py-1.5 text-xs text-mint-300"
              >
                + Add currency
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {(["sources", "sinks"] as const).map((kind) => (
                <div key={kind}>
                  <h3 className="mb-2 text-sm font-semibold text-cream-100">
                    {kind === "sources" ? "Sources (how players earn)" : "Sinks (how players spend)"}
                  </h3>
                  <ul className="space-y-2">
                    {state[kind].map((v, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={v}
                          aria-label={`${kind === "sources" ? "Source" : "Sink"} ${i + 1}`}
                          onChange={(e) =>
                            patch({
                              [kind]: state[kind].map((x, j) => (j === i ? e.target.value : x)),
                            } as Partial<WizardState>)
                          }
                          placeholder={kind === "sources" ? "e.g. Daily quest reward" : "e.g. Tool upgrades"}
                          className="w-full text-sm"
                        />
                        <button
                          type="button"
                          aria-label={`Remove ${kind === "sources" ? "source" : "sink"} ${i + 1}`}
                          onClick={() =>
                            patch({
                              [kind]: state[kind].filter((_, j) => j !== i),
                            } as Partial<WizardState>)
                          }
                          className="rounded border border-coral-500/50 px-2 py-0.5 text-xs text-coral-400"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => patch({ [kind]: [...state[kind], ""] } as Partial<WizardState>)}
                    className="mt-2 rounded-lg border border-forest-700 px-3 py-1.5 text-xs text-mint-300"
                  >
                    + Add {kind === "sources" ? "source" : "sink"}
                  </button>
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Reward frequency (how often players are rewarded)"
                value={state.rewardFrequency}
                onChange={(rewardFrequency) => patch({ rewardFrequency })}
                placeholder="e.g. small rewards every session, larger weekly"
              />
              <TextField
                label="Monetization notes"
                value={state.monetizationNotes}
                onChange={(monetizationNotes) => patch({ monetizationNotes })}
                placeholder="e.g. cosmetics only, no pay-to-win"
              />
            </div>

            <fieldset>
              <legend className="mb-1.5 text-xs text-mint-300">Blockchain status</legend>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ["none", "Off-chain only"],
                    ["wallet_gated", "Wallet-gated access"],
                    ["token_rewards_planned", "Token rewards planned (high risk)"],
                    ["undecided", "Undecided"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={state.blockchainStatus === value}
                    onClick={() => patch({ blockchainStatus: value })}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs",
                      state.blockchainStatus === value
                        ? "border-emerald-500 bg-emerald-600/25 text-cream-100"
                        : "border-forest-700 text-mint-300 hover:text-cream-100",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
          </>
        )}

        {step === 5 && (
          <>
            <SectionHeading>Step 6 — Multiplayer</SectionHeading>
            <label className="block max-w-xs text-xs text-mint-300">
              Multiplayer mode
              <select
                value={state.multiplayerMode}
                onChange={(e) =>
                  patch({ multiplayerMode: e.target.value as WizardState["multiplayerMode"] })
                }
                className="mt-1 block w-full text-sm"
              >
                <option value="not_yet_defined">Not yet defined</option>
                <option value="single_player">Single-player</option>
                <option value="nearby_multiplayer">Nearby multiplayer</option>
                <option value="channels">Channels</option>
                <option value="cooperative">Cooperative</option>
                <option value="competitive">Competitive</option>
                <option value="mixed">Mixed</option>
              </select>
            </label>
            {state.multiplayerMode !== "single_player" &&
              state.multiplayerMode !== "not_yet_defined" && (
                <CheckGroup
                  legend="Planned multiplayer and social features"
                  options={MULTIPLAYER_FEATURES}
                  selected={state.multiplayerFeatures}
                  onToggle={(f) =>
                    patch({ multiplayerFeatures: toggleIn(state.multiplayerFeatures, f) })
                  }
                />
              )}
          </>
        )}

        {step === 6 && (
          <>
            <SectionHeading>Step 7 — Content</SectionHeading>
            <p className="text-xs text-mint-300">
              What kinds of content will this game need, and roughly how many at launch?
              Leave quantity blank if unknown.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {CONTENT_SUGGESTIONS.filter(
                (s) => !state.contentTypes.some((c) => c.contentType === s),
              ).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() =>
                    patch({
                      contentTypes: [
                        ...state.contentTypes,
                        { contentType: s, initialQuantity: null },
                      ],
                    })
                  }
                  className="rounded-full border border-forest-700 px-2.5 py-1 text-xs text-mint-300 hover:text-cream-100"
                >
                  + {s}
                </button>
              ))}
            </div>
            <ul className="space-y-2">
              {state.contentTypes.map((c, i) => (
                <li key={i} className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={c.contentType}
                    aria-label={`Content type ${i + 1}`}
                    onChange={(e) =>
                      patch({
                        contentTypes: state.contentTypes.map((x, j) =>
                          j === i ? { ...x, contentType: e.target.value } : x,
                        ),
                      })
                    }
                    className="w-40 text-sm"
                  />
                  <input
                    type="number"
                    min={0}
                    value={c.initialQuantity ?? ""}
                    aria-label={`${c.contentType || "Content"} initial quantity`}
                    onChange={(e) =>
                      patch({
                        contentTypes: state.contentTypes.map((x, j) =>
                          j === i
                            ? {
                                ...x,
                                initialQuantity:
                                  e.target.value === "" ? null : Math.max(0, Number(e.target.value)),
                              }
                            : x,
                        ),
                      })
                    }
                    placeholder="Qty?"
                    className="w-24 text-sm"
                  />
                  <button
                    type="button"
                    aria-label={`Remove content type ${i + 1}`}
                    onClick={() =>
                      patch({ contentTypes: state.contentTypes.filter((_, j) => j !== i) })
                    }
                    className="rounded border border-coral-500/50 px-2 py-0.5 text-xs text-coral-400"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {step === 7 && (
          <>
            <SectionHeading>Step 8 — Technology</SectionHeading>
            <p className="text-xs text-mint-300">
              Optional: note the intended stack. Leave fields blank to keep them NOT YET
              DEFINED.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {TECH_FIELDS.map((f) => (
                <TextField
                  key={f.key}
                  label={f.label}
                  value={state.technology[f.key]}
                  onChange={(v) =>
                    patch({ technology: { ...state.technology, [f.key]: v } })
                  }
                />
              ))}
            </div>
          </>
        )}

        {step === 8 && (
          <>
            <SectionHeading>Step 9 — Risks</SectionHeading>
            <p className="text-xs text-mint-300">
              Rule-based warnings generated from your selections. These are design
              cautions, not verdicts — the workspace tracks them after creation too.
            </p>
            {warnings.length === 0 && (
              <p className="text-sm text-good">
                No wizard-level warnings from the current selections.
              </p>
            )}
            <ul className="space-y-2">
              {warnings.map((w) => (
                <li
                  key={w.key}
                  className={cn(
                    "rounded-lg border px-3 py-2",
                    w.severity === "critical" || w.severity === "blocked"
                      ? "border-coral-500/40 bg-coral-500/10"
                      : "border-gold-600/40 bg-gold-600/10",
                  )}
                >
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      w.severity === "critical" || w.severity === "blocked"
                        ? "text-coral-400"
                        : "text-warn",
                    )}
                  >
                    {w.severity.toUpperCase()} — {w.title}
                  </p>
                  <p className="mt-1 text-xs text-mint-200">{w.detail}</p>
                </li>
              ))}
            </ul>
            {gapFindings.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-cream-100">
                  Gap Analyzer preview ({gapFindings.length})
                </h3>
                <ul className="space-y-1.5">
                  {gapFindings.map((f) => (
                    <li key={f.ruleKey} className="text-xs text-mint-200">
                      <span className="font-semibold uppercase text-warn">{f.severity}</span>{" "}
                      {f.title} — {f.whyItMatters}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {step === 9 && (
          <>
            <SectionHeading>Step 10 — Create Workspace</SectionHeading>
            <div className="space-y-2 text-sm text-mint-200">
              <p>
                <strong className="text-cream-100">{draftPreview.name}</strong>{" "}
                <span className="text-muted">/games/{draftPreview.slug}</span>
              </p>
              <p>{draftPreview.tagline}</p>
              <ul className="grid gap-1 text-xs sm:grid-cols-2">
                <li>Primary category: {draftPreview.primaryCategory}</li>
                <li>Loop steps: {state.loopSteps.length || "none yet"}</li>
                <li>Progression tracks: {state.progressionPicks.length}</li>
                <li>Currencies: {state.currencies.filter((c) => c.name.trim()).length}</li>
                <li>Sources / sinks: {state.sources.filter(Boolean).length} / {state.sinks.filter(Boolean).length}</li>
                <li>Warnings: {warnings.length}</li>
              </ul>
            </div>
            <p className="flex flex-wrap items-center gap-2 rounded-lg border border-emerald-600/30 bg-emerald-600/10 px-3 py-2 text-xs text-mint-200">
              Every selected feature will be created as
              <StatusPill status="planned" />
              — the wizard never marks anything implemented.
            </p>
            <button
              type="button"
              onClick={() => void create()}
              disabled={creating || !state.name.trim()}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-cream-100 hover:bg-emerald-500 disabled:opacity-40"
            >
              {creating ? "Creating…" : "Create planning workspace"}
            </button>
            {!state.name.trim() && (
              <p className="text-xs text-warn">The game needs a name (step 1) first.</p>
            )}
          </>
        )}

        {/* Step controls */}
        <div className="flex items-center justify-between border-t border-forest-700/50 pt-4">
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            disabled={step === 0}
            className="rounded-lg border border-forest-700 px-3 py-1.5 text-sm text-mint-300 disabled:opacity-30"
          >
            ← Back
          </button>
          <p className="text-xs text-muted">
            Step {step + 1} of {STEPS.length}
          </p>
          <button
            type="button"
            onClick={() => goTo(step + 1)}
            disabled={step === STEPS.length - 1}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-cream-100 hover:bg-emerald-500 disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      </Panel>
    </div>
  );
}
