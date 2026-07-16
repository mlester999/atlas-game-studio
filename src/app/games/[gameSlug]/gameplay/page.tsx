"use client";

import { useMemo, useState } from "react";
import { useGame } from "@/components/game/GameContext";
import { useGamesStore } from "@/store/gamesStore";
import { Panel, SectionHeading, PageHeader } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { LoopDiagram } from "@/components/game/LoopDiagram";
import { LoopBuilder } from "@/components/game/LoopBuilder";
import { analyzeLoop } from "@/lib/analysis/loopAnalyzer";
import type { GameplayLoop, LoopStep } from "@/lib/types";

const LOOP_KIND_LABEL: Record<GameplayLoop["kind"], string> = {
  primary: "PRIMARY LOOP",
  secondary: "SECONDARY LOOP",
  long_term: "LONG-TERM LOOP",
  social: "SOCIAL LOOP",
  economy: "ECONOMY LOOP",
};

export default function GameplayPage() {
  const game = useGame();
  const updateDraft = useGamesStore((s) => s.updateDraft);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const loops = game.coreLoops;
  const isDraft = game.origin !== "seed";

  const saveLoop = useMemo(() => {
    if (!isDraft) return undefined;
    return (steps: LoopStep[]) => {
      const newLoop: GameplayLoop = {
        key: `loop-${Date.now().toString(36)}`,
        kind: loops.some((l) => l.kind === "primary") ? "secondary" : "primary",
        name: "Designed loop",
        steps,
        repeatFrequency: "To be tuned",
        playerMotivation: "To be described",
        reward: steps.find((s) => s.isReward)?.label ?? "None marked",
        spendingOpportunity: steps.find((s) => s.isSpend)?.label ?? "None marked",
        failureState: steps.find((s) => s.isFailureState)?.label ?? "None marked",
        longTermPurpose: steps.find((s) => s.isRetentionHook)?.label ?? "None marked",
        status: "planned",
      };
      void updateDraft({ ...game, coreLoops: [...game.coreLoops, newLoop] });
      setSavedMessage("Loop saved to this draft as PLANNED.");
    };
  }, [game, isDraft, loops, updateDraft]);

  return (
    <div className="space-y-6">
      <PageHeader
        headingLevel="h2"
        title="Gameplay Loops"
        lede="What players actually do, cycle by cycle. The analyzer checks each loop for missing rewards, missing spending, waiting, grind, and weak long-term purpose."
      />

      {loops.length === 0 && (
        <Panel>
          <p className="text-sm text-mint-200">
            No loops are defined for {game.name} yet — that itself is the finding. Use the
            builder below to design the first one.
          </p>
        </Panel>
      )}

      {loops.map((loop) => {
        const findings = analyzeLoop(loop);
        return (
          <Panel key={loop.key} className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gold-400">
                  {LOOP_KIND_LABEL[loop.kind]}
                </p>
                <h2 className="font-display text-lg font-semibold text-cream-100">{loop.name}</h2>
              </div>
              <StatusPill status={loop.status} />
            </div>
            <LoopDiagram steps={loop.steps} />
            <dl className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-muted">Repeats</dt>
                <dd className="text-mint-200">{loop.repeatFrequency}</dd>
              </div>
              <div>
                <dt className="text-muted">Motivation</dt>
                <dd className="text-mint-200">{loop.playerMotivation}</dd>
              </div>
              <div>
                <dt className="text-muted">Reward</dt>
                <dd className="text-mint-200">{loop.reward}</dd>
              </div>
              <div>
                <dt className="text-muted">Spending</dt>
                <dd className="text-mint-200">{loop.spendingOpportunity}</dd>
              </div>
              <div>
                <dt className="text-muted">Failure</dt>
                <dd className="text-mint-200">{loop.failureState}</dd>
              </div>
              <div>
                <dt className="text-muted">Long-term purpose</dt>
                <dd className="text-mint-200">{loop.longTermPurpose}</dd>
              </div>
            </dl>
            {findings.length > 0 && (
              <ul className="space-y-1 border-t border-forest-700/50 pt-2">
                {findings.map((f) => (
                  <li key={f.key} className="text-xs text-mint-200">
                    <span
                      className={
                        f.severity === "high"
                          ? "font-semibold text-coral-400"
                          : f.severity === "medium"
                            ? "font-semibold text-warn"
                            : "font-semibold text-mint-300"
                      }
                    >
                      {f.title}:
                    </span>{" "}
                    {f.detail}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        );
      })}

      <Panel>
        <SectionHeading>Loop Builder</SectionHeading>
        <p className="mb-3 text-xs text-muted">
          {isDraft
            ? "Design a loop and save it into this draft (it will be marked PLANNED)."
            : `${game.name} is a verified seed — the builder here is a sandbox. To keep a design, use the Tinker Lab to clone ${game.name} into an experiment.`}
        </p>
        {savedMessage && (
          <p role="status" className="mb-2 text-xs text-good">
            {savedMessage}
          </p>
        )}
        <LoopBuilder onSave={saveLoop} saveLabel="Save to draft (PLANNED)" />
      </Panel>
    </div>
  );
}
