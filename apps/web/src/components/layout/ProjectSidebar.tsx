import { NavLink, useNavigate } from "react-router";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  Compass,
  FileCode2,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Layers,
  Package,
  Search,
  Settings,
  Sparkles,
  Tag,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { useProjects } from "@/lib/api/hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Project } from "@/lib/api/types";

/* ── Section label ────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      aria-hidden="true"
      className="px-3 pt-4 pb-1 font-mono text-[8px] uppercase tracking-[0.12em] text-[#5c5d54]"
    >
      {children}
    </p>
  );
}

/* ── Nav item ─────────────────────────────────────────────────── */

function ProjectNavItem({
  to,
  end,
  icon: Icon,
  label,
}: {
  to: string;
  end?: boolean;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 rounded px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider",
          "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-inset",
          isActive
            ? "bg-[var(--sidebar-item-active)] text-copper border-l-2 border-copper pl-[9px]"
            : "text-[#aaa99d] hover:bg-[var(--sidebar-item-hover)] hover:text-paper border-l-2 border-transparent"
        )
      }
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

/* ── Project switcher ─────────────────────────────────────────── */

function ProjectSwitcher({
  project,
}: {
  project: Project;
}) {
  const navigate = useNavigate();
  const { data: projects = [] } = useProjects();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center gap-2 rounded px-2.5 py-2 text-left",
            "hover:bg-[var(--sidebar-item-hover)] transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          )}
          aria-label={`Current project: ${project.fullName}. Switch project`}
        >
          <GitBranch className="h-3.5 w-3.5 shrink-0 text-copper" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[10px] text-paper truncate font-semibold">
              {project.name}
            </p>
            <p className="font-mono text-[8px] text-[#5c5d54] truncate">
              {project.fullName}
            </p>
          </div>
          <ChevronDown className="h-3 w-3 shrink-0 text-[#5c5d54]" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        align="start"
        className="w-64 bg-charcoal border-[var(--product-border)] text-paper"
      >
        <DropdownMenuLabel className="text-[9px] font-mono uppercase tracking-wider text-text-muted">
          Switch project
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/40" />
        {projects.map((p) => (
          <DropdownMenuItem
            key={p.id}
            onClick={() => navigate(routes.project(p.id).root())}
            className="text-xs cursor-pointer font-mono py-2"
          >
            <span className="truncate">{p.fullName}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="bg-border/40" />
        <DropdownMenuItem
          onClick={() => navigate(routes.app.projects())}
          className="text-xs text-copper cursor-pointer font-mono"
        >
          All projects →
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ── ProjectSidebar ───────────────────────────────────────────── */

interface ProjectSidebarProps {
  project: Project;
}

export function ProjectSidebar({ project }: ProjectSidebarProps) {
  const p = routes.project(project.id);
  const navigate = useNavigate();

  return (
    <aside
      aria-label="Project navigation"
      className="hidden lg:flex flex-col w-52 shrink-0 bg-[var(--sidebar-bg)] border-r border-[var(--product-border)] h-full"
    >
      {/* Back to projects */}
      <div className="h-14 flex items-center border-b border-[var(--sidebar-divider)] px-2">
        <button
          type="button"
          onClick={() => navigate(routes.app.projects())}
          className={cn(
            "flex items-center gap-1.5 rounded px-2 py-1 font-mono text-[9px] text-[#aaa99d]",
            "hover:bg-[var(--sidebar-item-hover)] hover:text-paper transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          )}
          aria-label="Back to all projects"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden="true" />
          <span>All projects</span>
        </button>
      </div>

      {/* Project switcher */}
      <div className="px-1.5 py-2 border-b border-[var(--sidebar-divider)]">
        <ProjectSwitcher project={project} />
      </div>

      {/* Nav scroll area */}
      <nav
        aria-label="Project navigation"
        className="flex-1 overflow-y-auto px-1.5 pb-4"
      >
        {/* Overview */}
        <div className="pt-2">
          <ProjectNavItem to={p.root()} end icon={GitBranch} label="Overview" />
        </div>

        {/* Code */}
        <SectionLabel>Code</SectionLabel>
        <ProjectNavItem to={p.files()} icon={FileCode2} label="Files" />
        <ProjectNavItem to={p.issues()} icon={Layers} label="Issues" />
        <ProjectNavItem to={p.pulls()} icon={GitPullRequest} label="Pull Requests" />
        <ProjectNavItem to={p.commits()} icon={GitCommit} label="Commits" />
        <ProjectNavItem to={p.releases()} icon={Tag} label="Releases" />
        <ProjectNavItem to={p.ci()} icon={Workflow} label="CI / CD" />

        {/* Intelligence */}
        <SectionLabel>Intelligence</SectionLabel>
        <ProjectNavItem to={p.ask()} icon={Sparkles} label="Ask AI" />
        <ProjectNavItem to={p.onboarding()} icon={Compass} label="Onboarding" />
        <ProjectNavItem to={p.handoff()} icon={BookOpen} label="Handoff" />
        <ProjectNavItem to={p.decisions()} icon={Package} label="Decisions" />
        <ProjectNavItem to={p.search()} icon={Search} label="Search" />

        {/* Config */}
        <SectionLabel>Config</SectionLabel>
        <ProjectNavItem to={p.settings()} icon={Settings} label="Settings" />
      </nav>
    </aside>
  );
}
