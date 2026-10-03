import * as React from "react";
import { cn } from "@/lib/cn";

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string | number;
  label: string;
  accent?: string;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, value, label, accent, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-2 border border-border bg-surface-accent p-4",
          className
        )}
        {...props}
      >
        <div className="font-serif text-3xl font-normal tracking-tight">
          {value}
          {accent && (
            <span className="ml-1 text-lg text-copper">{accent}</span>
          )}
        </div>
        <span className="font-mono text-[8px] uppercase tracking-wider text-text-muted">
          {label}
        </span>
      </div>
    );
  }
);
StatCard.displayName = "StatCard";

export { StatCard };
