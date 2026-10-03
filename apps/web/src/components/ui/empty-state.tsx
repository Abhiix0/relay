import * as React from "react";
import { cn } from "@/lib/cn";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-16 text-center",
        className
      )}
      {...props}
    >
      {icon && <div className="text-text-muted">{icon}</div>}
      <div className="flex flex-col gap-2">
        <h3 className="font-serif text-xl font-normal">{title}</h3>
        {description && (
          <p className="text-sm text-text-muted max-w-md">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export { EmptyState };
