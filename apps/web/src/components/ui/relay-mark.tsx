import * as React from "react";
import { cn } from "@/lib/cn";

interface RelayMarkProps extends React.HTMLAttributes<HTMLSpanElement> {
  compact?: boolean;
  showWordmark?: boolean;
}

export function RelayMark({
  compact = false,
  showWordmark = true,
  className,
  ...props
}: RelayMarkProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5",
        compact ? "gap-2" : "gap-2.5",
        className
      )}
      aria-label="Relay"
      {...props}
    >
      <span
        className={cn(
          "inline-flex",
          compact ? "h-5 w-5" : "h-7 w-7"
        )}
        aria-hidden="true"
      >
        <svg viewBox="0 0 32 32" fill="none" className="h-full w-full">
          <path
            d="M11.7 17.2 17.2 11.7a3.7 3.7 0 0 1 5.2 5.2l-2.1 2.1"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="m20.3 14.8-5.5 5.5a3.7 3.7 0 0 1-5.2-5.2l2.1-2.1"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="m13.5 18.4 5-5"
            stroke="var(--copper)"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {showWordmark && (
        <span
          className={cn(
            "font-sans font-extrabold uppercase tracking-[0.15em]",
            compact ? "text-sm" : "text-lg"
          )}
        >
          Relay
        </span>
      )}
    </span>
  );
}
