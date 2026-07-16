/**
 * Deterministic Markdown report parser for Project Report Import.
 *
 * Extraction is purely mechanical (headings, list items, status keywords).
 * Imported information NEVER overwrites verified data automatically — it is
 * presented for owner review and stored as evidence alongside the source text.
 */

export interface ExtractedClaim {
  section: string;
  text: string;
  /** Status keyword found in the text, if any. */
  claimedStatus: string | null;
}

export interface ParsedReport {
  title: string | null;
  sections: string[];
  claims: ExtractedClaim[];
  sourceText: string;
  parsedAt: string;
}

const STATUS_KEYWORDS = [
  "owner tested",
  "locally complete",
  "hosted pending",
  "acceptance pending",
  "reported complete",
  "in progress",
  "planned",
  "deferred",
  "disabled",
  "blocked",
  "complete",
  "done",
  "passed",
  "failed",
  "not yet defined",
  "planning required",
];

export function parseMarkdownReport(markdown: string): ParsedReport {
  const lines = markdown.split(/\r?\n/);
  let title: string | null = null;
  const sections: string[] = [];
  const claims: ExtractedClaim[] = [];
  let currentSection = "General";

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const h1 = line.match(/^#\s+(.+)$/);
    if (h1) {
      if (!title) title = h1[1].trim();
      continue;
    }
    const heading = line.match(/^#{2,6}\s+(.+)$/);
    if (heading) {
      currentSection = heading[1].trim();
      sections.push(currentSection);
      continue;
    }
    const bullet = line.match(/^[-*+]\s+(.+)$/) ?? line.match(/^\d+[.)]\s+(.+)$/);
    if (bullet) {
      const text = bullet[1].trim();
      const lower = text.toLowerCase();
      const claimedStatus =
        STATUS_KEYWORDS.find((k) => lower.includes(k)) ?? null;
      claims.push({ section: currentSection, text, claimedStatus });
    }
  }

  return {
    title,
    sections,
    claims,
    sourceText: markdown,
    parsedAt: new Date().toISOString(),
  };
}

/**
 * Claims that would upgrade a status ("complete", "done", "passed") require
 * explicit owner review — flag them.
 */
export function claimsNeedingReview(report: ParsedReport): ExtractedClaim[] {
  const upgrades = ["complete", "done", "passed", "owner tested", "locally complete", "reported complete"];
  return report.claims.filter(
    (c) => c.claimedStatus != null && upgrades.some((u) => c.claimedStatus!.includes(u)),
  );
}
