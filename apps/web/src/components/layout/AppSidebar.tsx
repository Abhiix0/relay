import { useState, useEffect, useCallback } from "react";
import { NavLink, useNavigate } from "react-router";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  FolderGit2,
  Menu,
  Search,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { RelayMark } from "@/components/ui/relay-mark";
import { routes } from "@/lib/routes";

/* ── Persistence ─────────────────────────────────────────────── */

const STORAGE_KEY = "relay:sidebar:collapsed";

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function writeCollapsed(v: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(v));
  } catch {
    // storage unavailable; ignore
  }
}

/* ── Nav items ───────────────────────────────────────────────── */

const NAV_ITEMS = [
  { label: "Dashboard",  to: routes.app.root(),     icon: LayoutDashboard, end: true  },
  { label: "Projects",   to: routes.app.projects(),  icon: FolderGit2,      end: false },
  { label: "Search",     to: routes.app.search(),    icon: Search,          end: false },
  { label: "Handoff",    to: "/app/handoff",         icon: BookOpen,        end: false },
  { label: "Settings",   to: routes.app.settings(),  icon: Settings,        end: false },
] as const;

/* ── Item ────────────────────────────────────────────────────── */

function SidebarItem({
  to,
  end,
  icon: Icon,
  label,
  collapsed,
}: {
  to: string;
  end?: boolean;
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      aria-label={collapsed ? label : undefined}
      aria-current={undefined} // react-router sets this via isActive below
      className={({ isActive }) =>
        cn(
          "group relative flex items-center gap-3 rounded px-2.5 py-2 font-mono text-[10px] uppercase tracking-wider",
          "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-inset",
          isActive
            ? "bg-[var(--sidebar-item-active)] text-copper border-l-2 border-copper pl-[9px]"
            : "text-[#aaa99d] hover:bg-[var(--sidebar-item-hover)] hover:text-paper border-l-2 border-transparent"
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn("h-4 w-4 shrink-0", isActive ? "text-copper" : "")}
            aria-hidden="true"
          />
          {!collapsed && <span className="truncate">{label}</span>}
          {/* Tooltip when collapsed */}
          {collapsed && (
            <span
              role="tooltip"
              className="pointer-events-none absolute left-full ml-2 z-50 whitespace-nowrap rounded bg-charcoal border border-[var(--product-border)] px-2 py-1 font-mono text-[10px] text-paper opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              {label}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

/* ── Sidebar ─────────────────────────────────────────────────── */

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      writeCollapsed(next);
      return next;
    });
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [navigate]);

  // Trap focus when mobile drawer is open
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const navContent = (
    <nav
      aria-label="Application navigation"
      className="flex flex-col gap-1 px-2 flex-1"
    >
      {NAV_ITEMS.map((item) => (
        <SidebarItem
          key={item.to}
          to={item.to}
          end={"end" in item ? item.end : false}
          icon={item.icon}
          label={item.label}
          collapsed={collapsed}
        />
      ))}
    </nav>
  );

  return (
    <>
      {/* ── Mobile trigger (shown on small screens) ── */}
      <button
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={mobileOpen}
        className="fixed top-3 left-3 z-50 flex h-8 w-8 items-center justify-center rounded bg-[var(--sidebar-bg)] text-paper lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div role="dialog" aria-modal="true" aria-label="Navigation">
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-[var(--overlay)]"
            aria-hidden="true"
            onClick={() => setMobileOpen(false)}
          />
          {/* Panel */}
          <aside
            className="fixed left-0 top-0 z-50 flex h-full w-56 flex-col bg-[var(--sidebar-bg)] border-r border-[var(--product-border)] py-4"
          >
            <div className="flex items-center justify-between px-4 mb-6">
              <RelayMark compact className="text-paper" />
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setMobileOpen(false)}
                className="rounded p-1 text-[#aaa99d] hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            {navContent}
          </aside>
        </div>
      )}

      {/* ── Desktop sidebar ── */}
      <aside
        aria-label="Application navigation"
        className={cn(
          "hidden lg:flex flex-col h-full bg-[var(--sidebar-bg)] border-r border-[var(--product-border)]",
          "transition-[width] duration-200",
          collapsed ? "w-14" : "w-52"
        )}
      >
        {/* Logo + collapse button */}
        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b border-[var(--sidebar-divider)]",
            collapsed ? "justify-center" : "justify-between px-3"
          )}
        >
          {!collapsed && (
            <RelayMark compact className="text-paper ml-1" />
          )}
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={toggle}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded text-[#aaa99d]",
              "hover:bg-[var(--sidebar-item-hover)] hover:text-paper",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
              collapsed && "mx-auto"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-1 px-1.5 pt-3 flex-1">
          {NAV_ITEMS.map((item) => (
            <SidebarItem
              key={item.to}
              to={item.to}
              end={"end" in item ? item.end : false}
              icon={item.icon}
              label={item.label}
              collapsed={collapsed}
            />
          ))}
        </div>
      </aside>
    </>
  );
}
