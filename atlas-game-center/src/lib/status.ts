/**
 * The Atlas status system.
 *
 * Statuses encode evidence, not optimism:
 * - Planning concepts must never appear implemented.
 * - Local implementation must never appear hosted-accepted.
 * - Architecture-only work must never appear as an active player feature.
 * - Completion percentages are never fabricated.
 */

export const STATUS_VALUES = [
  "owner_tested",
  "locally_complete",
  "hosted_pending",
  "acceptance_pending",
  "reported_complete",
  "in_progress",
  "planned",
  "deferred",
  "disabled",
  "blocked",
  "admin_only",
  "unknown",
  "not_yet_defined",
] as const;

export type Status = (typeof STATUS_VALUES)[number];

export interface StatusMeta {
  label: string;
  /** Short plain-language meaning shown in Simple mode. */
  simple: string;
  /** Tone drives color + icon; status is never communicated by color alone. */
  tone: "verified" | "good" | "warn" | "critical" | "neutral" | "faint";
  /** Symbol rendered beside the label so tone is not color-only. */
  symbol: string;
}

export const STATUS_META: Record<Status, StatusMeta> = {
  owner_tested: {
    label: "Owner Tested",
    simple: "The owner personally verified this working.",
    tone: "verified",
    symbol: "✓✓",
  },
  locally_complete: {
    label: "Locally Complete",
    simple: "Built and working on the development machine, but not proven on hosted servers.",
    tone: "good",
    symbol: "✓",
  },
  hosted_pending: {
    label: "Hosted Pending",
    simple: "Waiting to be deployed and validated on real hosting.",
    tone: "warn",
    symbol: "◔",
  },
  acceptance_pending: {
    label: "Acceptance Pending",
    simple: "Built, but the owner has not yet accepted it after testing.",
    tone: "warn",
    symbol: "◑",
  },
  reported_complete: {
    label: "Reported Complete",
    simple: "A report claims this is done, but it has not been independently verified.",
    tone: "warn",
    symbol: "℞",
  },
  in_progress: {
    label: "In Progress",
    simple: "Actively being worked on right now.",
    tone: "neutral",
    symbol: "…",
  },
  planned: {
    label: "Planned",
    simple: "Decided and designed on paper, but no code exists yet.",
    tone: "faint",
    symbol: "◇",
  },
  deferred: {
    label: "Deferred",
    simple: "Intentionally postponed. Still tracked — deferred is not waived.",
    tone: "neutral",
    symbol: "⏸",
  },
  disabled: {
    label: "Disabled",
    simple: "Exists in some form but is switched off on purpose.",
    tone: "neutral",
    symbol: "⊘",
  },
  blocked: {
    label: "Blocked",
    simple: "Cannot move forward until something else is resolved.",
    tone: "critical",
    symbol: "⛔",
  },
  admin_only: {
    label: "Admin Only",
    simple: "Only administrators can see or use this.",
    tone: "neutral",
    symbol: "🔒",
  },
  unknown: {
    label: "Unknown",
    simple: "No verified information available.",
    tone: "faint",
    symbol: "?",
  },
  not_yet_defined: {
    label: "Not Yet Defined",
    simple: "This has not been designed yet. Planning required.",
    tone: "faint",
    symbol: "∅",
  },
};

export function statusLabel(status: Status): string {
  return STATUS_META[status].label;
}

/** Statuses that count as "needs planning" for the gap analyzer and dashboards. */
export const PLANNING_STATUSES: Status[] = ["unknown", "not_yet_defined", "planned"];

/** Statuses that must never be promoted automatically. */
export function isVerifiedStatus(status: Status): boolean {
  return status === "owner_tested";
}

export function isImplementedStatus(status: Status): boolean {
  return (
    status === "owner_tested" ||
    status === "locally_complete" ||
    status === "reported_complete"
  );
}

export type Severity = "critical" | "blocked" | "high" | "medium" | "low" | "info";

export const SEVERITY_META: Record<Severity, { label: string; tone: StatusMeta["tone"]; symbol: string }> = {
  critical: { label: "Critical", tone: "critical", symbol: "▲" },
  blocked: { label: "Blocked", tone: "critical", symbol: "⛔" },
  high: { label: "High", tone: "warn", symbol: "◆" },
  medium: { label: "Medium", tone: "warn", symbol: "◈" },
  low: { label: "Low", tone: "neutral", symbol: "○" },
  info: { label: "Info", tone: "faint", symbol: "ℹ" },
};
