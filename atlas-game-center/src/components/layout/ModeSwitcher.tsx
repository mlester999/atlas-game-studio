"use client";

import { useUiStore } from "@/store/uiStore";
import type { ViewingMode } from "@/lib/types";
import { cn } from "@/lib/cn";

const modes: { key: ViewingMode; label: string; hint: string }[] = [
  { key: "simple", label: "Simple", hint: "Plain language for a new game owner" },
  { key: "design", label: "Design", hint: "Loops, retention, balance, economy" },
  { key: "technical", label: "Technical", hint: "Authority, RLS, receipts, hosting" },
];

/** Global viewing mode. Changes presentation depth only — never the data. */
export function ModeSwitcher() {
  const viewingMode = useUiStore((s) => s.viewingMode);
  const setViewingMode = useUiStore((s) => s.setViewingMode);

  return (
    <fieldset>
      <legend className="mb-1.5 text-[11px] uppercase tracking-wider text-muted">
        Viewing mode
      </legend>
      <div role="radiogroup" aria-label="Viewing mode" className="flex gap-1">
        {modes.map((m) => (
          <button
            key={m.key}
            type="button"
            role="radio"
            aria-checked={viewingMode === m.key}
            title={m.hint}
            onClick={() => setViewingMode(m.key)}
            className={cn(
              "flex-1 rounded-md px-2 py-1.5 text-xs transition-colors",
              viewingMode === m.key
                ? "bg-emerald-600 text-cream-100"
                : "bg-forest-800/60 text-mint-300 hover:text-cream-100",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
