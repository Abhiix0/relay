import * as React from "react";
import { cn } from "@/lib/cn";

interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  /** When true, the element is interactive and can receive focus.
   *  Defaults to false — decorative Kbd instances must not be tabbable. */
  interactive?: boolean;
}

const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ className, interactive = false, tabIndex, ...props }, ref) => (
    <kbd
      ref={ref}
      /* Only tabbable when explicitly interactive; decorative usage (the default)
         is removed from tab order via tabIndex=-1. */
      tabIndex={interactive ? (tabIndex ?? 0) : -1}
      aria-hidden={interactive ? undefined : true}
      className={cn(
        "inline-flex h-5 items-center border border-border bg-surface-accent px-1.5 font-mono text-[10px] text-text-muted",
        className
      )}
      {...props}
    />
  )
);
Kbd.displayName = "Kbd";

export { Kbd };
