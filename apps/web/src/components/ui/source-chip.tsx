import { FileText, GitCommit, GitPullRequest, MessageCircle } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/cn";

const sourceIcons = {
  file: FileText,
  commit: GitCommit,
  pr: GitPullRequest,
  issue: MessageCircle,
  doc: FileText,
} as const;

interface SourceChipProps extends React.HTMLAttributes<HTMLButtonElement> {
  type: keyof typeof sourceIcons;
  label: string;
}

const SourceChip = React.forwardRef<HTMLButtonElement, SourceChipProps>(
  ({ type, label, className, ...props }, ref) => {
    const Icon = sourceIcons[type];

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2 border border-copper/30 bg-copper/10 px-2 py-1 font-mono text-[9px] text-copper-dark transition-colors hover:bg-copper/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2",
          className
        )}
        {...props}
      >
        <Icon className="h-3 w-3" />
        {label}
      </button>
    );
  }
);
SourceChip.displayName = "SourceChip";

export { SourceChip };
