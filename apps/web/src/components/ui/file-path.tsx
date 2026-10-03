import { FileCode2 } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/cn";

interface FilePathProps extends React.HTMLAttributes<HTMLSpanElement> {
  path: string;
  showIcon?: boolean;
}

const FilePath = React.forwardRef<HTMLSpanElement, FilePathProps>(
  ({ path, showIcon = true, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2 border border-border bg-surface-accent px-2 py-1 font-mono text-[10px] text-text",
          className
        )}
        {...props}
      >
        {showIcon && <FileCode2 className="h-3 w-3 text-copper" />}
        {path}
      </span>
    );
  }
);
FilePath.displayName = "FilePath";

export { FilePath };
