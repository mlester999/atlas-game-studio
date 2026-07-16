"use client";

import { useMemo, useState } from "react";
import type { LoopNodeKind, LoopStep } from "@/lib/types";
import { analyzeLoopSteps, loopHealth } from "@/lib/analysis/loopAnalyzer";
import { LoopDiagram } from "./LoopDiagram";
import { cn } from "@/lib/cn";

const NODE_KINDS: { kind: LoopNodeKind; label: string }[] = [
  { kind: "explore", label: "Explore" },
  { kind: "battle", label: "Battle" },
  { kind: "gather", label: "Gather" },
  { kind: "plant", label: "Plant" },
  { kind: "harvest", label: "Harvest" },
  { kind: "craft", label: "Craft" },
  { kind: "cook", label: "Cook" },
  { kind: "catch", label: "Catch" },
  { kind: "train", label: "Train" },
  { kind: "evolve", label: "Evolve" },
  { kind: "defend", label: "Defend" },
  { kind: "build", label: "Build" },
  { kind: "upgrade", label: "Upgrade" },
  { kind: "trade", label: "Trade" },
  { kind: "socialize", label: "Socialize" },
  { kind: "travel", label: "Travel" },
  { kind: "wait", label: "Wait" },
  { kind: "complete_activity", label: "Complete Activity" },
  { kind: "receive_reward", label: "Receive Reward" },
  { kind: "spend_reward", label: "Spend Reward" },
];

const FLAGS: { key: keyof LoopStep; label: string }[] = [
  { key: "isReward", label: "Reward" },
  { key: "isSpend", label: "Spending" },
  { key: "isWait", label: "Waiting" },
  { key: "isSocial", label: "Social" },
  { key: "isFailureState", label: "Failure" },
  { key: "isRetentionHook", label: "Retention hook" },
];

let stepCounter = 0;
function newStepId() {
  stepCounter += 1;
  return `step-${Date.now().toString(36)}-${stepCounter}`;
}

function defaultFlags(kind: LoopNodeKind): Partial<LoopStep> {
  switch (kind) {
    case "receive_reward":
    case "harvest":
      return { isReward: true };
    case "spend_reward":
      return { isSpend: true };
    case "wait":
      return { isWait: true };
    case "socialize":
      return { isSocial: true };
    default:
      return {};
  }
}

/**
 * Interactive node-based gameplay-loop builder.
 * Add steps, reorder them, mark rewards / spending / waiting / social /
 * failure / retention, and read the live analysis.
 */
export function LoopBuilder({
  initialSteps = [],
  onSave,
  onChange,
  saveLabel = "Save loop",
}: {
  initialSteps?: LoopStep[];
  onSave?: (steps: LoopStep[]) => void;
  /** Fires on every edit — for hosts that track the loop live (wizard, Tinker Lab). */
  onChange?: (steps: LoopStep[]) => void;
  saveLabel?: string;
}) {
  const [steps, setStepsRaw] = useState<LoopStep[]>(initialSteps);
  const setSteps = (update: (s: LoopStep[]) => LoopStep[]) =>
    setStepsRaw((s) => {
      const next = update(s);
      if (next !== s) onChange?.(next);
      return next;
    });
  const [pendingKind, setPendingKind] = useState<LoopNodeKind>("explore");
  const findings = useMemo(() => analyzeLoopSteps(steps), [steps]);
  const health = loopHealth(findings);

  const addStep = () => {
    const meta = NODE_KINDS.find((n) => n.kind === pendingKind);
    setSteps((s) => [
      ...s,
      {
        id: newStepId(),
        kind: pendingKind,
        label: meta?.label ?? pendingKind,
        ...defaultFlags(pendingKind),
      },
    ]);
  };

  const move = (index: number, dir: -1 | 1) => {
    setSteps((s) => {
      const next = [...s];
      const j = index + dir;
      if (j < 0 || j >= next.length) return s;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  };

  const remove = (index: number) => setSteps((s) => s.filter((_, i) => i !== index));

  const toggleFlag = (index: number, key: keyof LoopStep) =>
    setSteps((s) =>
      s.map((step, i) => (i === index ? { ...step, [key]: !step[key] } : step)),
    );

  const rename = (index: number, label: string) =>
    setSteps((s) => s.map((step, i) => (i === index ? { ...step, label } : step)));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs text-mint-300">
          Add step
          <select
            value={pendingKind}
            onChange={(e) => setPendingKind(e.target.value as LoopNodeKind)}
            className="ml-2 text-sm"
          >
            {NODE_KINDS.map((n) => (
              <option key={n.kind} value={n.kind}>
                {n.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={addStep}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-cream-100 hover:bg-emerald-500"
        >
          Add to loop
        </button>
        {steps.length > 0 && (
          <button
            type="button"
            onClick={() => setSteps(() => [])}
            className="rounded-lg border border-forest-700 px-3 py-1.5 text-sm text-mint-300"
          >
            Clear
          </button>
        )}
        {onSave && steps.length > 0 && (
          <button
            type="button"
            onClick={() => onSave(steps)}
            className="rounded-lg border border-gold-600/60 bg-gold-600/15 px-3 py-1.5 text-sm text-gold-400"
          >
            {saveLabel}
          </button>
        )}
      </div>

      <LoopDiagram steps={steps} />

      {steps.length > 0 && (
        <ol className="space-y-2" aria-label="Loop step editor">
          {steps.map((step, i) => (
            <li
              key={step.id}
              className="panel flex flex-wrap items-center gap-2 px-3 py-2"
            >
              <span className="w-5 text-xs tabular-nums text-muted">{i + 1}.</span>
              <input
                type="text"
                value={step.label}
                onChange={(e) => rename(i, e.target.value)}
                aria-label={`Step ${i + 1} label`}
                className="w-36 text-sm"
              />
              <div className="flex flex-wrap gap-1">
                {FLAGS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    aria-pressed={Boolean(step[f.key])}
                    onClick={() => toggleFlag(i, f.key)}
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px]",
                      step[f.key]
                        ? "border-emerald-500 bg-emerald-600/25 text-cream-100"
                        : "border-forest-700 text-muted hover:text-mint-300",
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="ml-auto flex gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label={`Move step ${i + 1} earlier`}
                  className="rounded border border-forest-700 px-2 py-0.5 text-xs text-mint-300 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === steps.length - 1}
                  aria-label={`Move step ${i + 1} later`}
                  className="rounded border border-forest-700 px-2 py-0.5 text-xs text-mint-300 disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label={`Remove step ${i + 1}`}
                  className="rounded border border-coral-500/50 px-2 py-0.5 text-xs text-coral-400"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <section aria-label="Loop analysis" className="panel p-3">
        <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-cream-100">
          Loop analysis
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider",
              health === "good"
                ? "bg-emerald-600/25 text-good"
                : health === "warn"
                  ? "bg-gold-600/20 text-warn"
                  : "bg-coral-500/15 text-coral-400",
            )}
          >
            {health === "good" ? "healthy" : health === "warn" ? "needs attention" : "issues found"}
          </span>
        </h4>
        {findings.length === 0 ? (
          <p className="text-xs text-mint-300">
            No structural issues detected. Remember: analysis checks structure, not fun —
            playtesting is still the judge.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {findings.map((f) => (
              <li key={f.key} className="text-xs">
                <span
                  className={cn(
                    "font-semibold",
                    f.severity === "high"
                      ? "text-coral-400"
                      : f.severity === "medium"
                        ? "text-warn"
                        : "text-mint-300",
                  )}
                >
                  {f.title}:
                </span>{" "}
                <span className="text-mint-200">{f.detail}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
