import { cn } from "@/lib/cn";

const tones = {
  good: "text-good",
  warn: "text-warn",
  critical: "text-coral-400",
  gold: "text-gold-400",
  neutral: "text-cream-100",
} as const;

export function MetricCard({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: keyof typeof tones;
}) {
  return (
    <div className="panel px-4 py-3">
      <p className="text-[11px] uppercase tracking-wider text-muted">{label}</p>
      <p className={cn("font-display mt-0.5 text-xl font-semibold", tones[tone])}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-mint-300">{hint}</p>}
    </div>
  );
}
