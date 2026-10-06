import * as React from "react";
import { cn } from "@/lib/cn";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "ghost" | "destructive";
}

const sizeMap = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-11 w-11",
} as const;

const variantMap = {
  default: "bg-surface-accent border border-border hover:bg-surface-raised text-text",
  ghost: "bg-transparent hover:bg-surface-accent text-text",
  destructive: "bg-transparent hover:bg-error/10 text-error",
} as const;

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, size = "md", variant = "ghost", className, children, ...props }, ref) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            ref={ref}
            aria-label={label}
            className={cn(
              "inline-flex items-center justify-center rounded transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-[var(--focus-ring-offset)]",
              "disabled:pointer-events-none disabled:opacity-50",
              sizeMap[size],
              variantMap[variant],
              className
            )}
            {...props}
          >
            {children}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
);
IconButton.displayName = "IconButton";

export { IconButton };
