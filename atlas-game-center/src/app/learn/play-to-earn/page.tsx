import Link from "next/link";
import type { Metadata } from "next";
import { Panel, PageHeader, SectionHeading } from "@/components/ui/Panel";
import { ProsCons } from "@/components/ui/ProsCons";
import {
  p2eModels,
  continuousP2EFailureReasons,
  sustainableFundingSources,
  modelsToAvoid,
} from "@/data/playToEarn";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Play-to-Earn Education — Game Studio Atlas",
};

const RISK_STYLES: Record<string, string> = {
  low: "border-emerald-600/40 bg-emerald-600/15 text-good",
  medium: "border-gold-600/40 bg-gold-600/15 text-warn",
  high: "border-coral-500/40 bg-coral-500/10 text-coral-400",
  "very high": "border-coral-500/60 bg-coral-500/20 text-coral-400",
};

export default function PlayToEarnPage() {
  return (
    <div>
      <PageHeader
        title="Play-to-Earn Education Center"
        lede="How earning models actually work, what funds them, and why the most exciting-sounding one usually fails. Nothing on this page promises profit — it exists so this studio never has to learn these lessons the expensive way."
      />

      <p className="mb-6 rounded-lg border border-gold-600/40 bg-gold-600/10 px-3 py-2 text-xs leading-relaxed text-gold-400">
        <strong>Studio position:</strong> token claims are disabled across all games. Any
        future external-value reward requires a treasury model, anti-farming controls, and
        legal review first. The{" "}
        <Link href="/games/starville/economy/longevity" className="underline underline-offset-2">
          Economy Longevity Simulator
        </Link>{" "}
        exists to test these ideas safely on paper.
      </p>

      <section aria-labelledby="spectrum">
        <h2 id="spectrum" className="font-display mb-3 text-xl font-semibold text-cream-100">
          The earning spectrum
        </h2>
        <p className="mb-4 max-w-3xl text-sm text-mint-300">
          Six models, ordered from safest to riskiest. The further down the list, the more
          the game becomes a financial product — and the more ways it can fail.
        </p>
        <div className="space-y-4">
          {p2eModels.map((m) => (
            <Panel key={m.key} as="article" className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-base font-semibold text-cream-100">
                  {m.name}
                </h3>
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
                    RISK_STYLES[m.riskLevel],
                  )}
                >
                  {m.riskLevel === "very high" ? "HIGH RISK" : `${m.riskLevel} risk`}
                </span>
              </div>
              <p className="max-w-3xl text-sm text-mint-200">{m.summary}</p>
              <ul className="list-inside space-y-1 text-xs text-mint-300">
                {m.howItWorks.map((h) => (
                  <li key={h} className="flex gap-1.5">
                    <span aria-hidden="true" className="text-muted">
                      →
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
              <ProsCons pros={m.pros} cons={m.cons} />
              {m.notes && (
                <p className="rounded-lg border border-coral-500/40 bg-coral-500/10 px-3 py-2 text-xs font-semibold tracking-wide text-coral-400">
                  {m.notes}
                </p>
              )}
            </Panel>
          ))}
        </div>
      </section>

      <section aria-labelledby="why-fails" className="mt-10">
        <h2 id="why-fails" className="font-display mb-3 text-xl font-semibold text-cream-100">
          Why continuous Play-to-Earn usually fails
        </h2>
        <Panel>
          <ul className="grid gap-2 text-xs text-mint-200 sm:grid-cols-2">
            {continuousP2EFailureReasons.map((r) => (
              <li key={r} className="flex gap-1.5">
                <span aria-hidden="true" className="text-coral-400">
                  ▲
                </span>
                {r}
              </li>
            ))}
          </ul>
        </Panel>
      </section>

      <section aria-labelledby="sustainable" className="mt-10">
        <h2 id="sustainable" className="font-display mb-3 text-xl font-semibold text-cream-100">
          Sustainable reward principles
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel>
            <SectionHeading className="text-base text-good">
              External-value rewards should be funded by
            </SectionHeading>
            <ul className="space-y-1.5 text-xs text-mint-200">
              {sustainableFundingSources.map((s) => (
                <li key={s} className="flex gap-1.5">
                  <span aria-hidden="true" className="text-good">
                    ✓
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </Panel>
          <Panel>
            <SectionHeading className="text-base text-coral-400">
              Avoid models where…
            </SectionHeading>
            <ul className="space-y-2 text-xs">
              {modelsToAvoid.map((m) => (
                <li key={m.pattern}>
                  <p className="font-semibold text-cream-100">{m.pattern}</p>
                  <p className="text-mint-300">{m.why}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </section>

      <section aria-labelledby="next" className="mt-10">
        <h2 id="next" className="font-display mb-3 text-xl font-semibold text-cream-100">
          Test it before believing it
        </h2>
        <Panel>
          <p className="max-w-3xl text-sm text-mint-200">
            Every model above can be stress-tested on paper before a single token moves.
            Use the per-game{" "}
            <Link
              href="/games/starville/economy/longevity"
              className="text-gold-400 underline underline-offset-2"
            >
              Economy Longevity Simulator
            </Link>{" "}
            to model treasury runway, bot attacks, and token-price scenarios, or clone a
            game in the{" "}
            <Link href="/tinker" className="text-gold-400 underline underline-offset-2">
              Tinker Lab
            </Link>{" "}
            and compare an off-chain economy against a token-reward variant side by side.
            Simulations are planning estimates — not guarantees, and never financial
            forecasts.
          </p>
        </Panel>
      </section>
    </div>
  );
}
