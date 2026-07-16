/** Pros and Cons engine display: shared by systems, monetization, earning models. */
export function ProsCons({
  pros,
  cons,
  risks,
}: {
  pros: string[];
  cons: string[];
  risks?: string[];
}) {
  if (pros.length === 0 && cons.length === 0 && (!risks || risks.length === 0)) {
    return null;
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {pros.length > 0 && (
        <div>
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-good">
            <span aria-hidden="true">＋</span> Pros
          </h4>
          <ul className="space-y-1 text-xs text-mint-200">
            {pros.map((p) => (
              <li key={p} className="flex gap-1.5">
                <span aria-hidden="true" className="text-good">
                  •
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}
      {cons.length > 0 && (
        <div>
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-warn">
            <span aria-hidden="true">−</span> Cons
          </h4>
          <ul className="space-y-1 text-xs text-mint-200">
            {cons.map((c) => (
              <li key={c} className="flex gap-1.5">
                <span aria-hidden="true" className="text-warn">
                  •
                </span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
      {risks && risks.length > 0 && (
        <div className="sm:col-span-2">
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-coral-400">
            <span aria-hidden="true">▲</span> Risks
          </h4>
          <ul className="space-y-1 text-xs text-mint-200">
            {risks.map((r) => (
              <li key={r} className="flex gap-1.5">
                <span aria-hidden="true" className="text-coral-400">
                  •
                </span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
