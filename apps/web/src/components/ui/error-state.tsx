import { AlertTriangle } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/cn";
import { Button } from "./button";

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

function ErrorState({
  title = "Something went wrong",
  description = "An error occurred while loading this content.",
  onRetry,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-16 text-center",
        className
      )}
      role="alert"
      {...props}
    >
      <AlertTriangle className="h-12 w-12 text-error" />
      <div className="flex flex-col gap-2">
        <h3 className="font-serif text-xl font-normal">{title}</h3>
        <p className="text-sm text-text-muted max-w-md">{description}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" size="sm">
          Try again
        </Button>
      )}
    </div>
  );
}

export { ErrorState };
