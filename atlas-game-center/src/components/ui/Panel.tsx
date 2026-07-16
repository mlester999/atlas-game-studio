import { cn } from "@/lib/cn";

export function Panel({
  children,
  className,
  as: Tag = "section",
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  as?: "section" | "div" | "article" | "aside";
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={cn("panel p-4 sm:p-5", className)} {...rest}>
      {children}
    </Tag>
  );
}

export function PageHeader({
  title,
  lede,
  children,
  headingLevel: Heading = "h1",
}: {
  title: string;
  lede?: string;
  children?: React.ReactNode;
  /** Use "h2" inside game workspaces, where the layout's game name is the H1. */
  headingLevel?: "h1" | "h2";
}) {
  return (
    <header className="mb-6">
      <Heading className="font-display text-2xl font-semibold tracking-tight text-cream-100 sm:text-3xl">
        {title}
      </Heading>
      {lede && <p className="mt-2 max-w-3xl text-sm leading-relaxed text-mint-300">{lede}</p>}
      {children}
    </header>
  );
}

export function SectionHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={cn("font-display mb-3 text-lg font-semibold text-cream-100", className)}>
      {children}
    </h2>
  );
}
