import * as React from "react";
import { cn } from "@/lib/cn";

const Panel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("border border-border bg-surface p-6", className)}
    {...props}
  />
));
Panel.displayName = "Panel";

export { Panel };
