import { NavLink, useParams } from "react-router";
import {
  BookOpen,
  Compass,
  FileCode2,
  GitBranch,
  Layers,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

export function ProjectNav() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;

  const p = routes.project(id);

  const tabs = [
    { label: "Overview",   to: p.root(),       end: true,  icon: GitBranch },
    { label: "Files",      to: p.files(),      end: false, icon: FileCode2  },
    { label: "Ask AI",     to: p.ask(),        end: false, icon: Sparkles   },
    { label: "Onboarding", to: p.onboarding(), end: false, icon: Compass    },
    { label: "Handoff",    to: p.handoff(),    end: false, icon: BookOpen   },
    { label: "Decisions",  to: p.decisions(),  end: false, icon: Layers     },
    { label: "Search",     to: p.search(),     end: false, icon: Search     },
    { label: "Settings",   to: p.settings(),   end: false, icon: Settings   },
  ];

  return (
    <div className="border-b border-border bg-surface px-6">
      <nav
        className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto py-1 scrollbar-none"
        aria-label="Project Navigation"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded px-3 py-2 text-xs font-medium transition whitespace-nowrap",
                  isActive
                    ? "bg-surface-accent text-copper border-b-2 border-copper font-semibold"
                    : "text-text-muted hover:bg-surface-accent/60 hover:text-text"
                )
              }
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
