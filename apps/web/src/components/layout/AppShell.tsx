import { type ReactNode } from "react";
import { useParams } from "react-router";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { AppHeader } from "./AppHeader";
import { ProjectNav } from "./ProjectNav";

interface AppShellProps {
  children: ReactNode;
  showProjectNav?: boolean;
}

export function AppShell({ children, showProjectNav = true }: AppShellProps) {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="relay-app dark-product min-h-screen bg-surface text-text flex flex-col font-sans selection:bg-copper selection:text-paper">
      <AppHeader currentProjectId={id} />
      <OfflineBanner />
      {showProjectNav && id && <ProjectNav />}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
      <footer className="border-t border-border py-6 px-6 text-center text-[11px] font-mono text-text-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>RELAY · Developer Codebase Intelligence</span>
          <span>Evidence-grounded · Zero hallucinations</span>
        </div>
      </footer>
    </div>
  );
}
