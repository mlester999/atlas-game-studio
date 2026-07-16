"use client";

import { useRef, useState } from "react";
import { useUiStore } from "@/store/uiStore";
import { Panel, PageHeader, SectionHeading } from "@/components/ui/Panel";
import { buildExport, validateImport, applyImport, ImportError } from "@/lib/storage/db";
import { cn } from "@/lib/cn";

export default function SettingsPage() {
  const ui = useUiStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ tone: "good" | "bad"; text: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [busy, setBusy] = useState(false);

  const exportAll = async () => {
    setBusy(true);
    try {
      const data = await buildExport();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `atlas-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ tone: "good", text: "Backup exported. Keep it somewhere safe." });
    } catch {
      setMessage({
        tone: "bad",
        text: "Export failed — local storage may be unavailable in this browser mode.",
      });
    } finally {
      setBusy(false);
    }
  };

  const importFile = async (file: File) => {
    setBusy(true);
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const data = validateImport(parsed);
      await applyImport(data);
      setMessage({
        tone: "good",
        text: `Imported ${data.drafts.length} drafts and ${data.experiments.length} experiments. Reloading…`,
      });
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      setMessage({
        tone: "bad",
        text:
          err instanceof ImportError
            ? err.message
            : "Import failed: the file is not valid JSON.",
      });
      setBusy(false);
    }
  };

  const resetAll = () => {
    indexedDB.deleteDatabase("atlas-game-center");
    localStorage.removeItem("atlas-ui-preferences");
    window.location.reload();
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        lede="Preferences, backups, and local data. Everything lives in this browser — no accounts, no servers, no secrets."
      />

      {message && (
        <p
          role="status"
          className={cn(
            "mb-4 rounded-lg border px-3 py-2 text-xs",
            message.tone === "good"
              ? "border-emerald-600/40 bg-emerald-600/10 text-good"
              : "border-coral-500/40 bg-coral-500/10 text-coral-400",
          )}
        >
          {message.text}
        </p>
      )}

      <div className="space-y-4">
        <Panel className="space-y-4">
          <SectionHeading className="text-base">Viewing preferences</SectionHeading>

          <fieldset>
            <legend className="mb-1.5 text-xs text-mint-300">
              Viewing mode (presentation depth only — never changes data)
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ["simple", "Simple", "Plain language, as if teaching a new game owner."],
                  ["design", "Design", "Loops, retention, balancing, economy trade-offs."],
                  ["technical", "Technical", "Authority, RLS, idempotency, hosted status."],
                ] as const
              ).map(([mode, label, hint]) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={ui.viewingMode === mode}
                  onClick={() => ui.setViewingMode(mode)}
                  title={hint}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs",
                    ui.viewingMode === mode
                      ? "border-emerald-500 bg-emerald-600/25 text-cream-100"
                      : "border-forest-700 text-mint-300 hover:text-cream-100",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-1.5 text-xs text-mint-300">Galaxy rendering</legend>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ["auto", "Auto (3D when capable)"],
                  ["3d", "Always 3D"],
                  ["2d", "Always 2D constellation"],
                ] as const
              ).map(([pref, label]) => (
                <button
                  key={pref}
                  type="button"
                  aria-pressed={ui.galaxyPreference === pref}
                  onClick={() => ui.setGalaxyPreference(pref)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs",
                    ui.galaxyPreference === pref
                      ? "border-emerald-500 bg-emerald-600/25 text-cream-100"
                      : "border-forest-700 text-mint-300 hover:text-cream-100",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="flex items-center gap-2 text-xs text-mint-300">
            <input
              type="checkbox"
              checked={ui.soundEnabled}
              onChange={(e) => ui.setSoundEnabled(e.target.checked)}
            />
            Enable interface sounds (off by default)
          </label>
        </Panel>

        <Panel className="space-y-3">
          <SectionHeading className="text-base">Public Share Mode</SectionHeading>
          <p className="max-w-3xl text-xs text-mint-300">
            When on, the site hides private details everywhere: treasury reserves, security
            findings, anti-abuse thresholds, private test notes, legal concerns, internal
            financial assumptions, and unpublished decisions. Use it before showing the
            atlas to anyone outside the studio.
          </p>
          <button
            type="button"
            aria-pressed={ui.publicShareMode}
            onClick={() => ui.setPublicShareMode(!ui.publicShareMode)}
            className={cn(
              "rounded-lg border px-4 py-2 text-sm",
              ui.publicShareMode
                ? "border-gold-600/60 bg-gold-600/20 text-gold-400"
                : "border-forest-700 text-mint-300 hover:text-cream-100",
            )}
          >
            {ui.publicShareMode ? "Public Share Mode is ON" : "Public Share Mode is OFF"}
          </button>
        </Panel>

        <Panel className="space-y-3">
          <SectionHeading className="text-base">Backup & restore</SectionHeading>
          <p className="max-w-3xl text-xs text-mint-300">
            Exports include your drafts, experiments, test results, decisions, and notes as
            one JSON file. Seeded game data is built in and never needs backing up.
            Importing merges the file into this browser — it never overwrites seeded data.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void exportAll()}
              disabled={busy}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-cream-100 hover:bg-emerald-500 disabled:opacity-40"
            >
              Export backup (JSON)
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="rounded-lg border border-forest-700 px-4 py-2 text-sm text-mint-300 hover:text-cream-100 disabled:opacity-40"
            >
              Import backup…
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              aria-label="Import backup file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void importFile(file);
                e.target.value = "";
              }}
            />
          </div>
        </Panel>

        <Panel className="space-y-3">
          <SectionHeading className="text-base text-coral-400">Danger zone</SectionHeading>
          <p className="max-w-3xl text-xs text-mint-300">
            Reset deletes all local data in this browser: drafts, experiments, test
            results, decisions, notes, simulator inputs, and preferences. Seeded games
            (Starville, Pokentara, Mythimon, Sailana, SolTower) are built in and come back
            untouched. Export a backup first.
          </p>
          {confirmReset ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={resetAll}
                className="rounded-lg border border-coral-500/60 bg-coral-500/20 px-4 py-2 text-sm text-coral-400"
              >
                Yes, delete all local data
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="rounded-lg border border-forest-700 px-4 py-2 text-sm text-mint-300"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="rounded-lg border border-coral-500/50 px-4 py-2 text-sm text-coral-400"
            >
              Reset all local data…
            </button>
          )}
        </Panel>
      </div>
    </div>
  );
}
