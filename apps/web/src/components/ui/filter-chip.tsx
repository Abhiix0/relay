import * as React from "react";
import { cn } from "@/lib/cn";

interface FilterChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

const FilterChip = React.forwardRef<HTMLButtonElement, FilterChipProps>(
  ({ className, active, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-2 font-mono text-[9px] uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2",
          active
            ? "bg-copper/10 text-copper border-b-2 border-copper"
            : "text-text-muted hover:text-text border-b-2 border-transparent hover:border-border",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
FilterChip.displayName = "FilterChip";

export { FilterChip };
