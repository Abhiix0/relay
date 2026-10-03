import * as React from "react";
import { cn } from "@/lib/cn";

const Kbd = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <kbd
    ref={ref}
    className={cn(
      "inline-flex h-5 items-center border border-border bg-surface-accent px-1.5 font-mono text-[10px] text-text-muted",
      className
    )}
    {...props}
  />
));
Kbd.displayName = "Kbd";

export { Kbd };
