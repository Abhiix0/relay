import * as React from "react";
import { cn } from "@/lib/cn";

interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-3.5 w-3.5 border",
  md: "h-5 w-5 border-2",
  lg: "h-7 w-7 border-2",
} as const;

const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ size = "md", className, ...props }, ref) => (
    <span
      ref={ref}
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block rounded-full border-border border-t-copper animate-spin",
        sizeMap[size],
        className
      )}
      {...props}
    />
  )
);
Spinner.displayName = "Spinner";

export { Spinner };
