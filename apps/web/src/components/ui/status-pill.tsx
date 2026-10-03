import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/cn";

const statusPillVariants = cva(
  "inline-flex items-center gap-2 font-mono text-[8px] uppercase tracking-wider",
  {
    variants: {
      status: {
        healthy: "text-success",
        indexing: "text-warning",
        error: "text-error",
        idle: "text-text-muted",
      },
    },
    defaultVariants: {
      status: "healthy",
    },
  }
);

export interface StatusPillProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusPillVariants> {
  status: "healthy" | "indexing" | "error" | "idle";
}

function StatusPill({ className, status, children, ...props }: StatusPillProps) {
  return (
    <span className={cn(statusPillVariants({ status }), className)} {...props}>
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "healthy" && "bg-success",
          status === "indexing" &&
            "bg-warning animate-pulse shadow-[0_0_0_3px] shadow-warning/25",
          status === "error" && "bg-error",
          status === "idle" && "bg-text-muted"
        )}
      />
      {children}
    </span>
  );
}

export { StatusPill, statusPillVariants };
