/**
 * Menu — a styled list of action items.
 * Lightweight alternative to DropdownMenu for inline command lists.
 */
import * as React from "react";
import { cn } from "@/lib/cn";

/* ── Root ─────────────────────────────────────────────────────── */

const Menu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    role="menu"
    className={cn(
      "flex flex-col border border-border bg-surface py-1 shadow-md",
      className
    )}
    {...props}
  />
));
Menu.displayName = "Menu";

/* ── Item ─────────────────────────────────────────────────────── */

interface MenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  destructive?: boolean;
}

const MenuItem = React.forwardRef<HTMLButtonElement, MenuItemProps>(
  ({ icon, destructive = false, className, children, ...props }, ref) => (
    <li role="presentation" className="px-1">
      <button
        ref={ref}
        role="menuitem"
        className={cn(
          "flex w-full items-center gap-2.5 rounded px-3 py-2",
          "font-mono text-xs transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-inset",
          "disabled:pointer-events-none disabled:opacity-50",
          destructive
            ? "text-error hover:bg-error/10"
            : "text-text hover:bg-surface-accent",
          className
        )}
        {...props}
      >
        {icon && (
          <span aria-hidden="true" className="shrink-0 text-text-muted">
            {icon}
          </span>
        )}
        {children}
      </button>
    </li>
  )
);
MenuItem.displayName = "MenuItem";

/* ── Label ────────────────────────────────────────────────────── */

const MenuLabel = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    role="presentation"
    className={cn(
      "px-4 py-1.5 font-mono text-[9px] uppercase tracking-wider text-text-muted",
      className
    )}
    {...props}
  />
));
MenuLabel.displayName = "MenuLabel";

/* ── Separator ────────────────────────────────────────────────── */

const MenuSeparator = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    role="presentation"
    aria-hidden="true"
    className={cn("my-1 h-px bg-border mx-1", className)}
    {...props}
  />
));
MenuSeparator.displayName = "MenuSeparator";

export { Menu, MenuItem, MenuLabel, MenuSeparator };
