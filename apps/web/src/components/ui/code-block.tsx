import * as React from "react";
import { cn } from "@/lib/cn";

interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

const CodeBlock = React.forwardRef<HTMLPreElement, CodeBlockProps>(
  ({ code, showLineNumbers = false, className, ...props }, ref) => {
    const lines = code.split("\n");

    return (
      <pre
        ref={ref}
        className={cn(
          "overflow-x-auto border border-border bg-charcoal p-4 font-mono text-xs text-paper",
          className
        )}
        {...props}
      >
        {showLineNumbers ? (
          <code className="flex flex-col">
            {lines.map((line, i) => (
              <span key={i} className="flex gap-4">
                <span className="w-8 text-right text-text-muted select-none">
                  {i + 1}
                </span>
                <span>{line || " "}</span>
              </span>
            ))}
          </code>
        ) : (
          <code>{code}</code>
        )}
      </pre>
    );
  }
);
CodeBlock.displayName = "CodeBlock";

export { CodeBlock };
