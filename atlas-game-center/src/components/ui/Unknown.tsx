/**
 * Honest placeholders for unknown information. Dashboards never invent
 * detail — they show NOT YET DEFINED / PLANNING REQUIRED prominently.
 */

export function NotYetDefined({ label = "NOT YET DEFINED" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-forest-700 bg-forest-900/50 px-2 py-0.5 text-[11px] font-medium tracking-wide text-muted">
      <span aria-hidden="true">∅</span>
      {label}
    </span>
  );
}

export function PlanningRequired() {
  return <NotYetDefined label="PLANNING REQUIRED" />;
}

/** Wraps a value: renders it, or the honest placeholder when missing. */
export function MaybeValue({
  value,
  suffix = "",
}: {
  value: string | number | null | undefined;
  suffix?: string;
}) {
  if (value === null || value === undefined || value === "") return <NotYetDefined />;
  if (typeof value === "string" && (value.includes("NOT YET DEFINED") || value.includes("PLANNING REQUIRED"))) {
    return <NotYetDefined label={value.includes("PLANNING") ? "PLANNING REQUIRED" : "NOT YET DEFINED"} />;
  }
  return (
    <>
      {value}
      {suffix}
    </>
  );
}
