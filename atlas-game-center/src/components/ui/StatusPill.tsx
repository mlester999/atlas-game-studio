import { STATUS_META, SEVERITY_META, type Status, type Severity } from "@/lib/status";
import { cn } from "@/lib/cn";

const toneClasses: Record<string, string> = {
  verified: "bg-emerald-600/30 text-good border-emerald-500/40",
  good: "bg-emerald-600/20 text-mint-200 border-emerald-600/30",
  warn: "bg-gold-600/20 text-warn border-gold-600/40",
  critical: "bg-coral-500/15 text-coral-400 border-coral-500/40",
  neutral: "bg-forest-800/60 text-mint-300 border-forest-700",
  faint: "bg-forest-900/60 text-muted border-forest-800",
};

/**
 * Status is communicated by label + symbol + color together —
 * never by color alone.
 */
export function StatusPill({ status, className }: { status: Status; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium",
        toneClasses[meta.tone],
        className,
      )}
      title={meta.simple}
    >
      <span aria-hidden="true">{meta.symbol}</span>
      {meta.label}
    </span>
  );
}

export function SeverityPill({ severity, className }: { severity: Severity; className?: string }) {
  const meta = SEVERITY_META[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium",
        toneClasses[meta.tone],
        className,
      )}
    >
      <span aria-hidden="true">{meta.symbol}</span>
      {meta.label}
    </span>
  );
}
