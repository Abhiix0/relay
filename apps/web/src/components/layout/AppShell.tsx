import { createContext, useContext, type ReactNode } from "react";
import { useParams } from "react-router";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { AppHeader } from "./AppHeader";
import { ProjectNav } from "./ProjectNav";

/* ── Shell context ───────────────────────────────────────────── */

/**
 * Set to `true` by the first AppShell in the tree so any nested AppShell
 * call (from a page component) becomes a transparent pass-through and
 * doesn't double-render the header/footer.
 */
const ShellMountedContext = createContext(false);

export function useShellMounted(): boolean {
  return useContext(ShellMountedContext);
}

/* ── Component ───────────────────────────────────────────────── */

interface AppShellProps {
  children: ReactNode;
  showProjectNav?: boolean;
}

export function AppShell({ children, showProjectNav = true }: AppShellProps) {
  const alreadyMounted = useContext(ShellMountedContext);
  const { id } = useParams<{ id: string }>();

  // Pass-through: a layout already rendered the shell.
  // Still render project nav if the outer shell didn't (e.g. AppLayout
  // sets showProjectNav=false, then ProjectGuard asks for it with an id).
  if (alreadyMounted) {
    if (showProjectNav && id) {
      return (
        <>
          <ProjectNav />
          {children}
        </>
      );
    }
    return <>{children}</>;
  }

  return (
    <ShellMountedContext.Provider value={true}>
      <div className="dark-product min-h-screen bg-surface text-text flex flex-col font-sans selection:bg-copper selection:text-paper">
        <AppHeader currentProjectId={id} />
        <OfflineBanner />
        {showProjectNav && id && <ProjectNav />}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>
        <footer className="border-t border-border py-6 px-6 text-center text-[11px] font-mono text-text-muted">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>RELAY · Developer Codebase Intelligence</span>
            <span>Evidence-grounded · Every answer cites its sources</span>
          </div>
        </footer>
      </div>
    </ShellMountedContext.Provider>
  );
}
