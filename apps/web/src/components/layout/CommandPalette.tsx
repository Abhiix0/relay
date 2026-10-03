import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { BookOpen, Compass, FileCode2, GitBranch, Layers, Search, Sparkles } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { useProjects } from "@/lib/api/hooks";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProjectId?: string;
}

export function CommandPalette({ open, onOpenChange, currentProjectId }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { data: projects = [] } = useProjects();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const activeProject = projects.find((p) => p.id === currentProjectId) || projects[0];
  const targetId = activeProject?.id || "turborepo";

  const navigationItems = [
    {
      title: "Project Overview",
      description: `View ${activeProject?.name || "current project"} summary & stats`,
      icon: GitBranch,
      path: `/projects/${targetId}`,
    },
    {
      title: "Ask Relay AI",
      description: "Ask questions grounded in codebase evidence",
      icon: Sparkles,
      path: `/projects/${targetId}/ask`,
    },
    {
      title: "Codebase Explorer",
      description: "Browse repository files, AST, and artifacts",
      icon: FileCode2,
      path: `/projects/${targetId}/explorer`,
    },
    {
      title: "Onboarding Roadmap",
      description: "Interactive onboarding guide and tasks",
      icon: Compass,
      path: `/projects/${targetId}/onboarding`,
    },
    {
      title: "Architecture Handoff",
      description: "Engineering handoff briefings and invariants",
      icon: BookOpen,
      path: `/projects/${targetId}/handoff`,
    },
    {
      title: "Architecture Decisions (ADRs)",
      description: "Technical decision records and rationale",
      icon: Layers,
      path: `/projects/${targetId}/decisions`,
    },
    {
      title: "Evidence Search",
      description: "Search symbols, files, and commits",
      icon: Search,
      path: `/projects/${targetId}/search`,
    },
  ];

  const filteredItems = navigationItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    onOpenChange(false);
    setQuery("");
    navigate(path);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-charcoal border-border p-0 overflow-hidden text-paper shadow-2xl">
        <div className="flex items-center border-b border-border px-4 py-3">
          <Search className="h-5 w-5 text-text-muted mr-3" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, screen, or search..."
            className="flex-1 bg-transparent text-sm text-paper placeholder:text-text-muted focus:outline-none"
          />
          <Kbd>ESC</Kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-border/20">
          <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-text-muted">
            Quick Navigation
          </div>
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => handleSelect(item.path)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded hover:bg-surface-accent transition text-left group"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-copper group-hover:text-paper transition" />
                  <div>
                    <div className="text-sm font-medium text-paper">{item.title}</div>
                    <div className="text-xs text-text-muted">{item.description}</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-text-muted group-hover:text-paper">Jump ↵</span>
              </button>
            );
          })}
          {filteredItems.length === 0 && (
            <div className="py-8 text-center text-xs text-text-muted">
              No matching destinations found.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
