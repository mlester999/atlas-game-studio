"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNav } from "./nav";
import { ModeSwitcher } from "./ModeSwitcher";
import { useGamesStore } from "@/store/gamesStore";
import { useUiStore } from "@/store/uiStore";
import { cn } from "@/lib/cn";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hydrate = useGamesStore((s) => s.hydrate);
  const publicShareMode = useUiStore((s) => s.publicShareMode);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  // Close the mobile menu on navigation (state adjusted during render,
  // per React guidance, instead of a cascading effect).
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (mobileOpen) setMobileOpen(false);
  }

  return (
    <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
      {/* Desktop sidebar */}
      <nav
        aria-label="Primary"
        className="panel-strong sticky top-0 z-30 hidden h-screen w-56 shrink-0 flex-col gap-1 overflow-y-auto rounded-none border-y-0 border-l-0 p-4 lg:flex"
      >
        <Link href="/" className="mb-4 block">
          <span className="font-display block text-xl font-semibold tracking-tight text-cream-100">
            Game Studio <span className="text-gold-400">Atlas</span>
          </span>
          <span className="mt-1 block text-[11px] leading-tight text-muted">
            Design, Economy, Progression, and Development Command Center
          </span>
        </Link>
        {primaryNav.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-forest-700/60 text-cream-100"
                  : "text-mint-300 hover:bg-forest-800/60 hover:text-cream-100",
              )}
            >
              <span aria-hidden="true" className="w-4 text-center text-gold-400">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
        <div className="mt-auto pt-4">
          <ModeSwitcher />
        </div>
      </nav>

      {/* Mobile header */}
      <header className="panel-strong sticky top-0 z-30 flex items-center justify-between gap-2 rounded-none border-x-0 border-t-0 px-4 py-3 lg:hidden">
        <Link href="/" className="font-display text-lg font-semibold text-cream-100">
          Game Studio <span className="text-gold-400">Atlas</span>
        </Link>
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-lg border border-forest-700 px-3 py-1.5 text-sm text-mint-200"
        >
          {mobileOpen ? "Close" : "Menu"}
        </button>
      </header>

      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Primary"
          className="panel-strong fixed inset-x-0 top-14 z-40 mx-3 flex flex-col gap-1 p-3 lg:hidden"
        >
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2.5 text-sm text-mint-200 hover:bg-forest-800/60"
            >
              <span aria-hidden="true" className="mr-2 text-gold-400">
                {item.icon}
              </span>
              {item.label}
              <span className="block pl-6 text-xs text-muted">{item.description}</span>
            </Link>
          ))}
          <div className="border-t border-forest-700/50 pt-3">
            <ModeSwitcher />
          </div>
        </nav>
      )}

      <div className="min-w-0 flex-1">
        {publicShareMode && (
          <p
            role="status"
            className="bg-gold-600/20 px-4 py-2 text-center text-xs text-gold-400"
          >
            Public Share Mode is on — private details (treasury, security findings,
            internal notes) are hidden. Turn it off in Settings.
          </p>
        )}
        <main id="main-content" className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
          {children}
        </main>
        <footer className="mx-auto w-full max-w-6xl px-4 pb-8 text-xs text-muted lg:px-8">
          <p>
            Planning studio — all data lives in this browser. Simulations are planning
            estimates, not guarantees and not financial forecasts.
          </p>
        </footer>
      </div>
    </div>
  );
}
