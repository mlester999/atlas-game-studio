"use client";

import { useMemo, useRef, useState } from "react";
import { useGame } from "@/components/game/GameContext";
import { useGamesStore } from "@/store/gamesStore";
import { Panel, PageHeader, SectionHeading } from "@/components/ui/Panel";
import { MetricCard } from "@/components/ui/MetricCard";
import type { TestCase, TestState } from "@/lib/types";
import { cn } from "@/lib/cn";

const STATES: { key: TestState; label: string; className: string }[] = [
  { key: "not_tested", label: "Not Tested", className: "border-forest-700 text-muted" },
  { key: "passed", label: "Passed", className: "border-emerald-500/60 bg-emerald-600/20 text-good" },
  { key: "failed", label: "Failed", className: "border-coral-500/60 bg-coral-500/15 text-coral-400" },
  { key: "blocked", label: "Blocked", className: "border-coral-500/40 text-coral-400" },
  { key: "skipped", label: "Skipped", className: "border-gold-600/50 text-warn" },
];

export default function TestingPage() {
  const game = useGame();
  const setTests = useGamesStore((s) => s.setTests);
  const [filterGroup, setFilterGroup] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const tests = game.tests;
  const groups = useMemo(() => [...new Set(tests.map((t) => t.group))], [tests]);
  const visible = filterGroup ? tests.filter((t) => t.group === filterGroup) : tests;

  const counts = useMemo(() => {
    const c: Record<TestState, number> = {
      not_tested: 0,
      passed: 0,
      failed: 0,
      blocked: 0,
      skipped: 0,
    };
    for (const t of tests) c[t.state] += 1;
    return c;
  }, [tests]);

  const update = (key: string, patch: Partial<TestCase>) => {
    const next = tests.map((t) =>
      t.key === key
        ? {
            ...t,
            ...patch,
            testedAt:
              patch.state && patch.state !== "not_tested"
                ? new Date().toISOString().slice(0, 10)
                : patch.state === "not_tested"
                  ? null
                  : t.testedAt,
            testedBy: patch.state && patch.state !== "not_tested" ? "Owner" : t.testedBy,
          }
        : t,
    );
    void setTests(game.slug, next);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ game: game.slug, tests }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${game.slug}-tests.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (file: File) => {
    try {
      const data = JSON.parse(await file.text()) as { game?: string; tests?: TestCase[] };
      if (!Array.isArray(data.tests)) throw new Error("No tests array in file");
      const valid = data.tests.filter(
        (t) => typeof t.key === "string" && typeof t.title === "string",
      );
      await setTests(game.slug, valid);
      setMessage(`Imported ${valid.length} test records.`);
    } catch (e) {
      setMessage(`Import failed: ${e instanceof Error ? e.message : "invalid file"}`);
    }
  };

  const copySummary = async () => {
    const lines = [
      `${game.name} test summary (${new Date().toISOString().slice(0, 10)})`,
      ...STATES.map((s) => `${s.label}: ${counts[s.key]}`),
      "",
      ...tests.map((t) => `[${t.state}] ${t.group} — ${t.title}${t.notes ? ` (${t.notes})` : ""}`),
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
    setMessage("Summary copied to clipboard.");
  };

  const reset = () => {
    void setTests(
      game.slug,
      tests.map((t) => ({ ...t, state: "not_tested" as TestState, notes: "", evidence: "", testedAt: null, testedBy: null })),
    );
    setMessage("All tests reset to Not Tested.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        headingLevel="h2"
        title="Testing & Acceptance Lab"
        lede={`Owner acceptance for ${game.name}: record what you personally verified, with notes and evidence. Results persist in this browser and export as JSON.`}
      />

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {STATES.map((s) => (
          <MetricCard
            key={s.key}
            label={s.label}
            value={String(counts[s.key])}
            tone={
              s.key === "passed"
                ? "good"
                : s.key === "failed" || s.key === "blocked"
                  ? "critical"
                  : "neutral"
            }
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs text-mint-300">
          Group
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="ml-2 text-sm"
          >
            <option value="">All</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <div className="ml-auto flex flex-wrap gap-2">
          <button type="button" onClick={exportJson} className="rounded-lg border border-forest-700 px-3 py-1.5 text-xs text-mint-300 hover:text-cream-100">
            Export JSON
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-lg border border-forest-700 px-3 py-1.5 text-xs text-mint-300 hover:text-cream-100"
          >
            Import JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void importJson(f);
              e.target.value = "";
            }}
          />
          <button type="button" onClick={copySummary} className="rounded-lg border border-forest-700 px-3 py-1.5 text-xs text-mint-300 hover:text-cream-100">
            Copy summary
          </button>
          <button type="button" onClick={() => window.print()} className="rounded-lg border border-forest-700 px-3 py-1.5 text-xs text-mint-300 hover:text-cream-100">
            Print
          </button>
          <button type="button" onClick={reset} className="rounded-lg border border-coral-500/50 px-3 py-1.5 text-xs text-coral-400">
            Reset all
          </button>
        </div>
      </div>
      {message && (
        <p role="status" className="text-xs text-good">
          {message}
        </p>
      )}

      {tests.length === 0 && (
        <Panel>
          <p className="text-sm text-muted">
            No test cases seeded for {game.name} yet. Tests arrive as systems get designed.
          </p>
        </Panel>
      )}

      <div className="space-y-3">
        {visible.map((t) => (
          <Panel key={t.key} as="article" className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted">{t.group}</p>
                <h2 className="font-display text-base font-semibold text-cream-100">{t.title}</h2>
              </div>
              <div role="radiogroup" aria-label={`State for ${t.title}`} className="flex flex-wrap gap-1">
                {STATES.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    role="radio"
                    aria-checked={t.state === s.key}
                    onClick={() => update(t.key, { state: s.key })}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[11px]",
                      t.state === s.key ? s.className : "border-forest-800 text-muted hover:text-mint-300",
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <details>
              <summary className="cursor-pointer text-xs text-mint-300">
                Instructions & expected result
              </summary>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <div>
                  <h3 className="text-[11px] uppercase tracking-wider text-muted">Steps</h3>
                  <ol className="mt-1 list-inside list-decimal space-y-0.5 text-xs text-mint-200">
                    {t.instructions.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h3 className="text-[11px] uppercase tracking-wider text-muted">Expected</h3>
                  <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs text-mint-200">
                    {t.expectedResult.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </details>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="block text-xs text-mint-300">
                Notes
                <textarea
                  value={t.notes}
                  onChange={(e) => update(t.key, { notes: e.target.value })}
                  rows={2}
                  className="mt-0.5 w-full text-xs"
                />
              </label>
              <label className="block text-xs text-mint-300">
                Evidence (links, screenshot names)
                <textarea
                  value={t.evidence}
                  onChange={(e) => update(t.key, { evidence: e.target.value })}
                  rows={2}
                  className="mt-0.5 w-full text-xs"
                />
              </label>
            </div>
            {t.testedAt && (
              <p className="text-[11px] text-muted">
                Last recorded: {t.testedAt}
                {t.testedBy ? ` by ${t.testedBy}` : ""}
              </p>
            )}
          </Panel>
        ))}
      </div>

      <Panel>
        <SectionHeading>Suggested test groups</SectionHeading>
        <p className="text-xs text-muted">
          onboarding · controls · gameplay loop · progression · leveling · economy · shop ·
          multiplayer · chat · trading · activities · graphics · assets · mobile ·
          accessibility · hosted validation · security · treasury · blockchain · load
          testing · retention assumptions
        </p>
      </Panel>
    </div>
  );
}
