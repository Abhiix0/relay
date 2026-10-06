import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ExternalLink,
  LogOut,
  Search,
  Settings,
  User as UserIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
import { OfflineBanner } from "@/components/ui/offline-banner";
import { StatusPill } from "@/components/ui/status-pill";
import { useSession } from "@/app/session/SessionContext";
import { useProject } from "@/lib/api/hooks";
import { routes } from "@/lib/routes";
import { CommandPalette } from "./CommandPalette";

function getSyncStatus(
  status?: string
): "healthy" | "indexing" | "error" | "idle" {
  switch (status) {
    case "succeeded": return "healthy";
    case "running":   return "indexing";
    case "failed":    return "error";
    default:          return "idle";
  }
}

interface TopBarProps {
  /** Pass true when inside a project route so breadcrumb shows project name */
  projectMode?: boolean;
}

export function TopBar({ projectMode = false }: TopBarProps) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, signOut } = useSession();
  const { data: project } = useProject(projectMode ? id : undefined);

  const handleSignOut = () => {
    signOut()
      .then(() => navigate(routes.signIn()))
      .catch(() => navigate(routes.signIn()));
  };

  return (
    <>
      <header
        className="flex h-14 shrink-0 items-center border-b border-[var(--product-border)] bg-[var(--product-surface)] px-4 lg:px-6 gap-4"
        role="banner"
      >
        {/* Skip link — positioned first so it's the first Tab stop */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:left-4 focus:top-4 focus:rounded focus:bg-copper focus:px-3 focus:py-1.5 focus:font-mono focus:text-xs focus:text-paper"
        >
          Skip to main content
        </a>

        {/* Left: breadcrumb */}
        <div className="flex-1 min-w-0 pl-8 lg:pl-0">
          {projectMode && project ? (
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href={routes.app.root()}
                    className="font-mono text-[10px] text-[#aaa99d] hover:text-paper"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(routes.app.root());
                    }}
                  >
                    Projects
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-[#5c5d54]" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-mono text-[10px] text-paper font-semibold truncate max-w-[200px]">
                    {project.fullName}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#aaa99d]">
              RELAY
            </span>
          )}
        </div>

        {/* Right: search + sync status + avatar */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Project sync status */}
          {projectMode && project && (
            <div className="hidden lg:flex items-center gap-2">
              <StatusPill status={getSyncStatus(project.syncStatus)}>
                {project.syncStatus}
              </StatusPill>
              <span className="font-mono text-[9px] text-[#aaa99d] hidden xl:inline">
                {project.healthLabel}
              </span>
            </div>
          )}

          {/* Search / command palette trigger */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPaletteOpen(true)}
            className="hidden md:flex gap-2 border-[var(--product-border)] bg-[var(--product-surface-soft)] text-xs text-[#aaa99d] hover:text-paper px-3 h-7"
            aria-label="Open command palette"
          >
            <Search className="h-3.5 w-3.5 text-copper" aria-hidden="true" />
            <span className="hidden lg:inline">Search or ask…</span>
            <Kbd className="hidden lg:inline-flex bg-[var(--product-surface)] border-[var(--product-border)]">
              ⌘K
            </Kbd>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPaletteOpen(true)}
            className="md:hidden h-7 w-7 text-[#aaa99d]"
            aria-label="Open command palette"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </Button>

          {/* Avatar / user menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="rounded-full ring-1 ring-[var(--product-border)] p-0.5 hover:ring-copper transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                aria-label="User menu"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage
                    src={user?.avatarUrl ?? undefined}
                    alt={user?.name ?? "User"}
                  />
                  <AvatarFallback className="bg-charcoal-soft text-[11px] font-mono text-paper">
                    {user?.name?.slice(0, 2).toUpperCase() ?? "AC"}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-charcoal border-[var(--product-border)] text-paper"
            >
              <DropdownMenuLabel className="font-normal p-3">
                <p className="text-xs font-semibold">{user?.name}</p>
                <p className="text-[11px] text-text-muted truncate">{user?.email}</p>
                <p className="text-[10px] font-mono text-copper mt-1">
                  @{user?.githubLogin}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[var(--product-border)]" />
              <DropdownMenuItem
                onClick={() => navigate(routes.app.profile())}
                className="flex items-center gap-2 text-xs cursor-pointer"
              >
                <UserIcon className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
                Profile & Tokens
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate(routes.app.settings())}
                className="flex items-center gap-2 text-xs cursor-pointer"
              >
                <Settings className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
                Settings
              </DropdownMenuItem>
              {projectMode && id && (
                <DropdownMenuItem
                  onClick={() => navigate(routes.project(id).settings())}
                  className="flex items-center gap-2 text-xs cursor-pointer"
                >
                  <Settings className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
                  Project Settings
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => navigate(routes.designSystem())}
                className="flex items-center gap-2 text-xs cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
                Design System
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[var(--product-border)]" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="flex items-center gap-2 text-xs text-error cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <OfflineBanner />

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        currentProjectId={id}
      />
    </>
  );
}
