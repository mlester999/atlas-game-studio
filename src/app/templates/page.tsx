import Link from "next/link";
import type { Metadata } from "next";
import { templates } from "@/data/templates";
import { categories } from "@/data/categories";
import { Panel, PageHeader, SectionHeading } from "@/components/ui/Panel";
import { ProsCons } from "@/components/ui/ProsCons";

export const metadata: Metadata = {
  title: "Templates — Game Studio Atlas",
};

export default function TemplatesPage() {
  return (
    <div>
      <PageHeader
        title="Category Template Library"
        lede="Reusable blueprints for the kinds of games this studio builds. Templates seed planning — anything adopted from a template starts as PLANNED, never as implemented."
      />

      <div className="space-y-6">
        {templates.map((t) => (
          <Panel key={t.key} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SectionHeading className="mb-0">{t.name}</SectionHeading>
              <div className="flex flex-wrap gap-1.5">
                {t.forCategories.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-forest-700 px-2 py-0.5 text-[11px] text-mint-300"
                  >
                    {categories.find((x) => x.key === c)?.name ?? c}
                  </span>
                ))}
              </div>
            </div>
            <p className="max-w-3xl text-sm text-mint-200">{t.description}</p>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                Typical core loop
              </h3>
              <ol className="flex flex-wrap items-center gap-1.5" aria-label="Core loop steps">
                {t.typicalCoreLoop.map((step, i) => (
                  <li key={step} className="flex items-center gap-1.5">
                    <span className="rounded-lg border border-emerald-600/40 bg-emerald-600/15 px-2.5 py-1 text-xs text-mint-100">
                      {step}
                    </span>
                    {i < t.typicalCoreLoop.length - 1 && (
                      <span aria-hidden="true" className="text-muted">
                        →
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                Possible systems
              </h3>
              <ul className="flex flex-wrap gap-1.5">
                {t.possibleSystems.map((s) => (
                  <li
                    key={s}
                    className="rounded-full border border-forest-700 px-2 py-0.5 text-[11px] text-mint-200"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <ProsCons pros={[]} cons={[]} risks={t.risks} />

            <p className="text-xs text-muted">
              Use this template in the{" "}
              <Link href="/games/new" className="text-gold-400 underline underline-offset-2">
                Add Game wizard
              </Link>{" "}
              — pick a matching primary category and the wizard offers to prefill the loop.
            </p>
          </Panel>
        ))}
      </div>

      <section aria-labelledby="category-encyclopedia" className="mt-10">
        <h2
          id="category-encyclopedia"
          className="font-display mb-2 text-xl font-semibold text-cream-100"
        >
          Category encyclopedia
        </h2>
        <p className="mb-4 max-w-3xl text-sm text-mint-300">
          Every category the studio tracks, with the player experience it implies, what it
          usually needs, and why games in it commonly fail.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {categories.map((c) => (
            <Panel key={c.key} as="article" className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-base font-semibold text-cream-100">
                  {c.name}
                </h3>
                <span className="rounded-full border border-forest-700 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted">
                  {c.axis}
                </span>
              </div>
              <p className="text-xs text-mint-200">{c.typicalPlayerExperience}</p>
              <dl className="space-y-1.5 text-xs">
                <Row label="Common core loops" items={c.commonCoreLoops} />
                <Row label="Progression" items={c.commonProgressionSystems} />
                <Row label="Content needs" items={c.expectedContentNeeds} />
                <Row label="Monetization" items={c.monetizationOpportunities} />
                <Row label="Economy risks" items={c.economyRisks} />
                <Row label="Retention strengths" items={c.retentionStrengths} />
                <div className="flex flex-wrap gap-x-4">
                  <div>
                    <dt className="inline text-muted">Dev complexity: </dt>
                    <dd className="inline text-mint-200">{c.developmentComplexity}</dd>
                  </div>
                  <div>
                    <dt className="inline text-muted">Multiplayer complexity: </dt>
                    <dd className="inline text-mint-200">{c.multiplayerComplexity}</dd>
                  </div>
                </div>
                <Row label="Why games in this category fail" items={c.commonFailureReasons} warn />
              </dl>
            </Panel>
          ))}
        </div>
      </section>
    </div>
  );
}

function Row({ label, items, warn }: { label: string; items: string[]; warn?: boolean }) {
  if (items.length === 0) return null;
  return (
    <div>
      <dt className={warn ? "font-medium text-coral-400" : "text-muted"}>{label}</dt>
      <dd className="text-mint-200">{items.join(" · ")}</dd>
    </div>
  );
}
