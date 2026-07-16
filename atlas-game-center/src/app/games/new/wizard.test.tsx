import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IDBFactory } from "fake-indexeddb";
import AddGameWizardPage from "./page";
import { useGamesStore } from "@/store/gamesStore";
import { __resetDbForTests } from "@/lib/storage/db";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/games/new",
}));

afterEach(cleanup);

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  __resetDbForTests();
  push.mockClear();
  useGamesStore.setState({
    hydrated: true,
    drafts: [],
    experiments: [],
    testOverrides: {},
    decisionOverrides: {},
  });
});

describe("Add Game wizard", () => {
  it("creates a planned draft workspace from the ten-step flow", async () => {
    const user = userEvent.setup();
    render(<AddGameWizardPage />);

    // Step 1 — identity.
    await user.type(screen.getByLabelText(/^Name$/), "Comet Keepers");
    expect(screen.getByLabelText(/Slug/)).toHaveValue("comet-keepers");

    // Walk forward through every step to the final one.
    for (let i = 0; i < 9; i++) {
      await user.click(screen.getByRole("button", { name: /Next/ }));
    }
    expect(screen.getByText(/Step 10 — Create Workspace/)).toBeInTheDocument();
    expect(screen.getByText(/never marks anything implemented/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Create planning workspace/ }));

    const drafts = useGamesStore.getState().drafts;
    expect(drafts).toHaveLength(1);
    expect(drafts[0].name).toBe("Comet Keepers");
    expect(drafts[0].origin).toBe("draft");
    expect(drafts[0].developmentStage).toBe("concept");
    await waitFor(() => expect(push).toHaveBeenCalledWith("/games/comet-keepers"));
  });

  it("refuses to create a game without a name", async () => {
    const user = userEvent.setup();
    render(<AddGameWizardPage />);
    for (let i = 0; i < 9; i++) {
      await user.click(screen.getByRole("button", { name: /Next/ }));
    }
    const create = screen.getByRole("button", { name: /Create planning workspace/ });
    expect(create).toBeDisabled();
    expect(screen.getByText(/needs a name/)).toBeInTheDocument();
    expect(useGamesStore.getState().drafts).toHaveLength(0);
  });

  it("shows rule-based warnings on the risks step", async () => {
    const user = userEvent.setup();
    render(<AddGameWizardPage />);
    await user.type(screen.getByLabelText(/^Name$/), "Risky Game");
    // Step 5 (economy) is index 4: choose token rewards planned.
    for (let i = 0; i < 4; i++) {
      await user.click(screen.getByRole("button", { name: /Next/ }));
    }
    await user.click(
      screen.getByRole("button", { name: /Token rewards planned/ }),
    );
    // Continue to the risks step (index 8).
    for (let i = 0; i < 4; i++) {
      await user.click(screen.getByRole("button", { name: /Next/ }));
    }
    expect(screen.getByText(/Step 9 — Risks/)).toBeInTheDocument();
    expect(
      screen.getByText(/Token rewards need treasury planning and legal review/),
    ).toBeInTheDocument();
  });
});
