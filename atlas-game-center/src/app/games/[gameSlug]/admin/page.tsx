"use client";

import { useGame } from "@/components/game/GameContext";
import { useUiStore } from "@/store/uiStore";
import { Panel, PageHeader } from "@/components/ui/Panel";
import { SystemCard } from "@/components/game/SystemCard";

export default function AdminPage() {
  const game = useGame();
  const publicShare = useUiStore((s) => s.publicShareMode);
  const adminSystems = game.systems.filter((s) => s.category === "admin");

  if (publicShare) {
    return (
      <Panel>
        <p className="text-sm text-muted">
          Admin details are hidden in Public Share Mode.
        </p>
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        headingLevel="h2"
        title="Admin"
        lede={`Operational controls for ${game.name} — role separation, safety rails, and what administrators can and cannot do.`}
      />
      {adminSystems.length === 0 ? (
        <Panel>
          <p className="text-sm text-muted">No admin systems defined yet.</p>
        </Panel>
      ) : (
        adminSystems.map((s) => <SystemCard key={s.key} system={s} />)
      )}
    </div>
  );
}
