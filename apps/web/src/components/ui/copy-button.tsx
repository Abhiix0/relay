import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/cn";

interface CopyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  label?: string;
}

function CopyButton({
  value,
  label = "Copy",
  className,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : label}
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1.5 border border-border bg-surface-accent px-2 py-1",
        "font-mono text-[9px] uppercase tracking-wider text-text-muted",
        "transition-colors hover:text-text hover:border-copper/40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-[var(--focus-ring-offset)]",
        className
      )}
      {...props}
    >
      {copied ? (
        <Check className="h-3 w-3 text-success" aria-hidden="true" />
      ) : (
        <Copy className="h-3 w-3" aria-hidden="true" />
      )}
      {copied ? "Copied" : label}
    </button>
  );
}

export { CopyButton };
