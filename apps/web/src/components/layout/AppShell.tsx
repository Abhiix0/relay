import { createContext, useContext, type ReactNode } from "react";

/* ── Shell context ───────────────────────────────────────────── */

/**
 * Set to `true` by the first AppShell in the tree so any nested AppShell
 * call (from a page component, e.g. T's features) becomes a transparent
 * pass-through — preventing double-wrapping without needing to edit pages.
 */
const ShellMountedContext = createContext(false);

export function useShellMounted(): boolean {
  return useContext(ShellMountedContext);
}

/** Marks the shell as mounted for all descendants. */
export function ShellMountedProvider({ children }: { children: ReactNode }) {
  return (
    <ShellMountedContext.Provider value={true}>
      {children}
    </ShellMountedContext.Provider>
  );
}

/* ── Component ───────────────────────────────────────────────── */

interface AppShellProps {
  children: ReactNode;
  /**
   * Legacy prop — accepted for backward compat but no longer does anything;
   * nav is rendered by the layout, not by AppShell.
   */
  showProjectNav?: boolean;
}

/**
 * AppShell is now a thin context marker and pass-through wrapper.
 * The sidebar, topbar, and main container are composed by AppLayout /
 * ProjectLayout. AppShell simply signals "shell is already mounted" so
 * pages that still call <AppShell> wrap don't double-render.
 */
export function AppShell({ children }: AppShellProps) {
  const alreadyMounted = useContext(ShellMountedContext);

  if (alreadyMounted) {
    return <>{children}</>;
  }

  // Standalone fallback — should only happen in unit tests or storybook.
  return (
    <ShellMountedContext.Provider value={true}>
      {children}
    </ShellMountedContext.Provider>
  );
}
