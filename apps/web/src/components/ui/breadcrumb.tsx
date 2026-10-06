import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

/* ── Root ─────────────────────────────────────────────────────── */

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav"> & { separator?: React.ReactNode }
>(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    aria-label="breadcrumb"
    className={cn("flex", className)}
    {...props}
  />
));
Breadcrumb.displayName = "Breadcrumb";

/* ── List ─────────────────────────────────────────────────────── */

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<"ol">
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      "flex flex-wrap items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-text-muted",
      className
    )}
    {...props}
  />
));
BreadcrumbList.displayName = "BreadcrumbList";

/* ── Item ─────────────────────────────────────────────────────── */

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("inline-flex items-center gap-1", className)}
    {...props}
  />
));
BreadcrumbItem.displayName = "BreadcrumbItem";

/* ── Link ─────────────────────────────────────────────────────── */

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & { asChild?: boolean }
>(({ className, asChild: _asChild, children, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
      className
    )}
    {...props}
  >
    {children}
  </a>
));
BreadcrumbLink.displayName = "BreadcrumbLink";

/* ── Current page ─────────────────────────────────────────────── */

const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-current="page"
    aria-disabled="true"
    className={cn("text-text font-semibold", className)}
    {...props}
  />
));
BreadcrumbPage.displayName = "BreadcrumbPage";

/* ── Separator ────────────────────────────────────────────────── */

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"li">) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn("text-text-muted", className)}
    {...props}
  >
    {children ?? <ChevronRight className="h-3 w-3" />}
  </li>
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
};
