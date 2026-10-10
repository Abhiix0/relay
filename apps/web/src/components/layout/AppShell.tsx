import { useState, type ReactNode } from "react";
import { Link, NavLink, useParams } from "react-router";
import {
  BookOpen,
  Compass,
  FileCode2,
  GitBranch,
  Layers,
  LayoutDashboard,
  Search,
  Sparkles,
  User as UserIcon,
} from "lucide-react";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { RelayMark } from "@/components/ui/relay-mark";
import { cn } from "@/lib/cn";
import { useProjects } from "@/lib/api/hooks";
import { AppHeader } from "./AppHeader";
import { ProjectNav } from "./ProjectNav";

interface AppShellProps {
  children: ReactNode;
  showProjectNav?: boolean;
}

export function AppShell({ children, showProjectNav = true }: AppShellProps) {
  const { id } = useParams<{ id: string }>();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: projects = [] } = useProjects();
  const currentProject = projects.find((p) => p.id === id);

  const mainNavItems = [
    { label: "Dashboard", to: "/app/dashboard", icon: LayoutDashboard },
    { label: "Search", to: "/app/search", icon: Search },
    { label: "Profile", to: "/app/profile", icon: UserIcon },
  ];

  const projectNavItems = id
    ? [
        { label: "Overview", to: `/app/projects/${id}`, end: true, icon: GitBranch },
        { label: "Files", to: `/app/projects/${id}/files`, end: false, icon: FileCode2 },
        { label: "Ask AI", to: `/app/projects/${id}/ask`, end: false, icon: Sparkles },
        { label: "Explorer", to: `/app/projects/${id}/explorer`, end: false, icon: FileCode2 },
        { label: "Onboarding", to: `/app/projects/${id}/onboarding`, end: false, icon: Compass },
        { label: "Handoff", to: `/app/projects/${id}/handoff`, end: false, icon: BookOpen },
        { label: "Decisions", to: `/app/projects/${id}/decisions`, end: false, icon: Layers },
      ]
    : [];

  return (
    <div className="relay-app h-screen h-[100dvh] max-h-[100dvh] bg-surface text-text flex flex-col md:flex-row font-sans selection:bg-copper selection:text-paper overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-charcoal text-paper border-r border-border/20 h-full shrink-0 z-30 overflow-hidden">
        {/* Brand */}
        <div className="p-5 border-b border-border/20 flex items-center justify-between shrink-0">
          <Link to="/app/dashboard" className="flex items-center gap-2 hover:opacity-90 transition">
            <RelayMark compact />
          </Link>
          <span className="text-[10px] font-mono uppercase tracking-wider text-copper bg-copper/10 px-2 py-0.5 rounded border border-copper/30">
            v1.0
          </span>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-none min-h-0">
          {/* Main Links */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-text-muted">
              Main Menu
            </div>
            <nav className="space-y-1" aria-label="Main Navigation">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition",
                        isActive
                          ? "bg-charcoal-soft text-paper border-l-2 border-copper font-semibold"
                          : "text-product-text-muted hover:bg-charcoal-soft/50 hover:text-paper"
                      )
                    }
                  >
                    <Icon className="h-4 w-4 text-copper" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Project Scoped Nav */}
          {id && currentProject && (
            <div>
              <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-text-muted truncate">
                Project: {currentProject.name}
              </div>
              <nav className="space-y-1" aria-label="Project Navigation">
                {projectNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition",
                          isActive
                            ? "bg-charcoal-soft text-paper border-l-2 border-copper font-semibold"
                            : "text-product-text-muted hover:bg-charcoal-soft/50 hover:text-paper"
                        )
                      }
                    >
                      <Icon className="h-4 w-4 text-copper/80" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border/20 text-[10px] font-mono text-text-muted shrink-0">
          <span>RELAY · Codebase Intelligence</span>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 h-full overflow-hidden">
        <AppHeader currentProjectId={id} onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <OfflineBanner />

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden shrink-0 max-h-[50vh] overflow-y-auto bg-charcoal text-paper border-b border-border/20 p-4 space-y-4 z-20">
            <div>
              <div className="px-2 mb-1 text-[10px] font-mono uppercase tracking-wider text-text-muted">
                Main Menu
              </div>
              <nav className="space-y-1">
                {mainNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded text-xs text-paper hover:bg-charcoal-soft"
                  >
                    <item.icon className="h-4 w-4 text-copper" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>

            {id && (
              <div>
                <div className="px-2 mb-1 text-[10px] font-mono uppercase tracking-wider text-text-muted">
                  Project Workspace
                </div>
                <nav className="grid grid-cols-2 gap-1">
                  {projectNavItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded text-xs text-paper hover:bg-charcoal-soft"
                    >
                      <item.icon className="h-3.5 w-3.5 text-copper/80" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  ))}
                </nav>
              </div>
            )}
          </div>
        )}

        {showProjectNav && id && <ProjectNav />}

        {/* Central Scrollable Content Pane */}
        <div
          data-testid="app-content-scroll"
          className="flex-1 flex flex-col min-h-0 min-w-0 overflow-y-auto"
        >
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            {children}
          </main>

          <footer className="shrink-0 border-t border-border/40 py-6 px-6 text-center text-[11px] font-mono text-text-muted bg-surface mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>RELAY · Developer Codebase Intelligence</span>
              <span>Evidence-grounded · Zero hallucinations</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
