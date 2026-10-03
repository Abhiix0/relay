import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center border px-2 py-1 font-mono text-[8px] uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-surface-accent text-text",
        copper: "border-copper/20 bg-copper/10 text-copper-dark",
        success: "border-success/20 bg-success/10 text-success",
        warning: "border-warning/20 bg-warning/10 text-warning",
        error: "border-error/20 bg-error/10 text-error",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
