import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronDown, GitBranch, LogOut, Menu, Search, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import { RelayMark } from "@/components/ui/relay-mark";
import { StatusPill } from "@/components/ui/status-pill";
import { useCurrentUser, useProjects } from "@/lib/api/hooks";
import { CommandPalette } from "./CommandPalette";

interface AppHeaderProps {
  currentProjectId?: string;
  onMobileMenuToggle?: () => void;
}

export function AppHeader({ currentProjectId, onMobileMenuToggle }: AppHeaderProps) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const { data: projects = [] } = useProjects();

  const currentProject = projects.find((p) => p.id === currentProjectId);

  const getSyncStatus = (status?: string): "healthy" | "indexing" | "error" | "idle" => {
    switch (status) {
      case "succeeded":
        return "healthy";
      case "running":
        return "indexing";
      case "failed":
        return "error";
      default:
        return "idle";
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/40 bg-surface/95 backdrop-blur px-4 sm:px-6 py-3 shrink-0">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            {onMobileMenuToggle && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMobileMenuToggle}
                className="md:hidden h-8 w-8 text-text-muted"
                aria-label="Toggle navigation menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            <Link to="/app/dashboard" className="flex items-center gap-2 hover:opacity-90 transition">
              <RelayMark compact />
            </Link>

            <div className="h-4 w-px bg-border hidden sm:block" />

            {/* Project Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2 border-border bg-surface-accent text-xs font-mono text-text"
                >
                  <GitBranch className="h-3.5 w-3.5 text-copper" />
                  <span className="font-semibold truncate max-w-[140px] sm:max-w-[200px]">
                    {currentProject ? currentProject.fullName : "All Projects"}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-text-muted opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 bg-charcoal border-border text-paper">
                <DropdownMenuLabel className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                  Repositories
                </DropdownMenuLabel>
                {projects.map((p) => (
                  <DropdownMenuItem
                    key={p.id}
                    onClick={() => navigate(`/app/projects/${p.id}`)}
                    className="flex items-center justify-between text-xs cursor-pointer py-2"
                  >
                    <span className="font-mono truncate">{p.fullName}</span>
                    <span className="text-[10px] text-text-muted">{p.language}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-border/40" />
                <DropdownMenuItem
                  onClick={() => navigate("/app/projects")}
                  className="text-xs text-copper cursor-pointer"
                >
                  Manage all repositories →
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {currentProject && (
              <div className="hidden lg:flex items-center gap-2">
                <StatusPill status={getSyncStatus(currentProject.syncStatus)}>
                  {currentProject.syncStatus}
                </StatusPill>
                <span className="text-[10px] font-mono text-text-muted">
                  {currentProject.healthLabel}
                </span>
              </div>
            )}
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPaletteOpen(true)}
              className="gap-3 border-border bg-surface-accent text-xs text-text-muted hover:text-text px-3 py-1.5 h-8 hidden md:flex"
            >
              <Search className="h-3.5 w-3.5 text-copper" />
              <span>Search or ask AI...</span>
              <Kbd>⌘K</Kbd>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPaletteOpen(true)}
              className="md:hidden h-8 w-8 text-text-muted"
              aria-label="Open command palette"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="rounded-full ring-1 ring-border p-0.5 hover:ring-copper transition"
                  aria-label="User menu"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user?.avatarUrl || undefined} alt={user?.name || "User"} />
                    <AvatarFallback className="bg-surface-accent text-[11px] font-mono text-paper">
                      {user?.name?.slice(0, 2).toUpperCase() || "AC"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-charcoal border-border text-paper">
                <DropdownMenuLabel className="font-normal p-3">
                  <div className="text-xs font-semibold">{user?.name}</div>
                  <div className="text-[11px] text-text-muted truncate">{user?.email}</div>
                  <div className="text-[10px] font-mono text-copper mt-1">@{user?.githubLogin}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/40" />
                <DropdownMenuItem
                  onClick={() => navigate("/app/profile")}
                  className="flex items-center gap-2 text-xs cursor-pointer"
                >
                  <UserIcon className="h-3.5 w-3.5 text-text-muted" />
                  <span>Profile & Tokens</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/40" />
                <DropdownMenuItem
                  onClick={() => navigate("/sign-in")}
                  className="flex items-center gap-2 text-xs text-error cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        currentProjectId={currentProjectId}
      />
    </>
  );
}
