export function SimDisclaimer({ text }: { text?: string }) {
  return (
    <p
      role="note"
      className="rounded-lg border border-gold-600/40 bg-gold-600/10 px-3 py-2 text-xs leading-relaxed text-gold-400"
    >
      <strong className="font-semibold">ESTIMATED PLANNING RUNWAY.</strong>{" "}
      <strong className="font-semibold">NOT A GUARANTEE.</strong>{" "}
      <strong className="font-semibold">NOT A FINANCIAL FORECAST.</strong>{" "}
      {text ?? "These are planning estimates based on the assumptions you entered."}
    </p>
  );
}

export function PlanningEstimateNote({ text }: { text?: string }) {
  return (
    <p role="note" className="text-xs italic text-muted">
      {text ?? "These are planning estimates based on assumptions. They do not promise exact player behavior."}
    </p>
  );
}
