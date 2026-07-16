import type { LoopStep } from "@/lib/types";
import { cn } from "@/lib/cn";

const flagBadges = (step: LoopStep) => {
  const badges: { label: string; className: string }[] = [];
  if (step.isReward) badges.push({ label: "reward", className: "text-good" });
  if (step.isSpend) badges.push({ label: "spend", className: "text-gold-400" });
  if (step.isWait) badges.push({ label: "wait", className: "text-muted" });
  if (step.isSocial) badges.push({ label: "social", className: "text-mint-300" });
  if (step.isFailureState) badges.push({ label: "can fail", className: "text-coral-400" });
  if (step.isRetentionHook) badges.push({ label: "retention", className: "text-warn" });
  return badges;
};

/** Visual loop: chips joined by arrows, cycling back to the start. */
export function LoopDiagram({ steps }: { steps: LoopStep[] }) {
  if (steps.length === 0) {
    return <p className="text-sm text-muted">No steps defined yet.</p>;
  }
  return (
    <ol className="flex flex-wrap items-center gap-y-3" aria-label="Gameplay loop steps">
      {steps.map((step, i) => (
        <li key={step.id} className="flex items-center">
          <div
            className={cn(
              "rounded-lg border px-2.5 py-1.5",
              step.isReward
                ? "border-emerald-500/50 bg-emerald-600/15"
                : step.isSpend
                  ? "border-gold-600/50 bg-gold-600/10"
                  : "border-forest-700 bg-forest-900/50",
            )}
          >
            <span className="block text-xs font-medium text-cream-100">{step.label}</span>
            <span className="flex gap-1.5">
              {flagBadges(step).map((b) => (
                <span key={b.label} className={cn("text-[9px] uppercase tracking-wide", b.className)}>
                  {b.label}
                </span>
              ))}
            </span>
          </div>
          <span aria-hidden="true" className="mx-1.5 text-muted">
            {i === steps.length - 1 ? "↻" : "→"}
          </span>
        </li>
      ))}
    </ol>
  );
}
