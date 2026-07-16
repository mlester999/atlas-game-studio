"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/components/game/GameContext";
import { Panel, PageHeader, SectionHeading } from "@/components/ui/Panel";
import {
  parseMarkdownReport,
  claimsNeedingReview,
  type ParsedReport,
} from "@/lib/analysis/reportImport";
import { loadNote, saveNote } from "@/lib/storage/db";

export default function DocumentationPage() {
  const game = useGame();
  const [report, setReport] = useState<ParsedReport | null>(null);
  const [savedEvidence, setSavedEvidence] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [notesLoaded, setNotesLoaded] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadNote(`docs:${game.slug}`)
      .then((n) => {
        if (!cancelled && n != null) setNotes(n);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setNotesLoaded(true);
      });
    loadNote(`report-evidence:${game.slug}`)
      .then((n) => {
        if (!cancelled && n != null) setSavedEvidence(n);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [game.slug]);

  useEffect(() => {
    if (!notesLoaded) return;
    const t = setTimeout(() => {
      saveNote(`docs:${game.slug}`, notes).catch(() => undefined);
    }, 600);
    return () => clearTimeout(t);
  }, [notes, notesLoaded, game.slug]);

  const handleFile = async (file: File) => {
    const text = await file.text();
    if (file.name.endsWith(".json")) {
      try {
        const data = JSON.parse(text) as Record<string, unknown>;
        setReport({
          title: typeof data.title === "string" ? data.title : file.name,
          sections: Object.keys(data),
          claims: Object.entries(data)
            .filter(([, v]) => typeof v === "string")
            .map(([section, v]) => ({ section, text: String(v), claimedStatus: null })),
          sourceText: text,
          parsedAt: new Date().toISOString(),
        });
        setMessage(null);
      } catch {
        setMessage("JSON import failed: file is not valid JSON.");
      }
    } else {
      setReport(parseMarkdownReport(text));
      setMessage(null);
    }
  };

  const acceptAsEvidence = async () => {
    if (!report) return;
    await saveNote(`report-evidence:${game.slug}`, report.sourceText).catch(() => undefined);
    setSavedEvidence(report.sourceText);
    setMessage(
      "Report stored as evidence. Statuses were NOT changed — update them yourself in the Testing Lab or Decision Journal after review.",
    );
  };

  const review = report ? claimsNeedingReview(report) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        headingLevel="h2"
        title="Documentation & Report Import"
        lede={`Notes and imported reports for ${game.name}. Imports are parsed deterministically and shown for review — they never overwrite verified data automatically.`}
      />

      <Panel>
        <SectionHeading>Owner notes</SectionHeading>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={6}
          aria-label="Owner notes"
          placeholder="Design notes, session summaries, links…"
          className="w-full text-sm"
        />
        <p className="mt-1 text-[11px] text-muted">Saved automatically in this browser.</p>
      </Panel>

      <Panel>
        <SectionHeading>Import a report (Markdown or JSON)</SectionHeading>
        <input
          type="file"
          accept=".md,.markdown,.txt,application/json"
          aria-label="Import report file"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
            e.target.value = "";
          }}
          className="text-sm"
        />
        {message && (
          <p role="status" className="mt-2 text-xs text-warn">
            {message}
          </p>
        )}
        {report && (
          <div className="mt-4 space-y-3">
            <h3 className="text-sm font-semibold text-cream-100">
              Extracted from: {report.title ?? "Untitled report"}
            </h3>
            {review.length > 0 && (
              <div className="rounded-lg border border-gold-600/40 bg-gold-600/10 px-3 py-2">
                <p className="text-xs font-semibold text-warn">
                  {review.length} claim{review.length > 1 ? "s" : ""} would upgrade a status —
                  these require your explicit review and are NOT applied automatically:
                </p>
                <ul className="mt-1 list-inside list-disc text-xs text-mint-200">
                  {review.slice(0, 10).map((c, i) => (
                    <li key={i}>
                      <span className="text-muted">[{c.section}]</span> {c.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="max-h-72 overflow-auto rounded-lg bg-forest-900/50 p-3">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-muted">
                    <th scope="col" className="pb-1 pr-3">Section</th>
                    <th scope="col" className="pb-1 pr-3">Extracted item</th>
                    <th scope="col" className="pb-1">Claimed status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.claims.map((c, i) => (
                    <tr key={i} className="border-t border-forest-700/30 align-top">
                      <td className="py-1 pr-3 text-muted">{c.section}</td>
                      <td className="py-1 pr-3 text-mint-200">{c.text}</td>
                      <td className="py-1 text-warn">{c.claimedStatus ?? "—"}</td>
                    </tr>
                  ))}
                  {report.claims.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-2 text-muted">
                        No list items found — the parser extracts bullet and numbered list lines.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={() => void acceptAsEvidence()}
              className="rounded-lg border border-gold-600/60 bg-gold-600/15 px-3 py-1.5 text-sm text-gold-400"
            >
              Store source text as evidence (no statuses change)
            </button>
          </div>
        )}
        {savedEvidence && !report && (
          <details className="mt-3">
            <summary className="cursor-pointer text-xs text-mint-300">
              Previously stored report evidence
            </summary>
            <pre className="mt-2 max-h-56 overflow-auto rounded-lg bg-forest-900/50 p-3 text-[11px] text-mint-200">
              {savedEvidence}
            </pre>
          </details>
        )}
      </Panel>
    </div>
  );
}
