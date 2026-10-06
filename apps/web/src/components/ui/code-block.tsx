/**
 * CodeBlock — line-numbered code display with lazy syntax highlighting.
 * Highlighting loads via dynamic import so it never enters the entry chunk.
 */
import * as React from "react";
import { cn } from "@/lib/cn";

interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

/** Lazily highlight a code string using highlight.js. Returns HTML string. */
async function highlight(code: string, language: string): Promise<string> {
  const { default: hljs } = await import("highlight.js/lib/core");

  // Register only the languages we actually use to keep the chunk small
  const langModules: Record<string, () => Promise<{ default: unknown }>> = {
    typescript: () => import("highlight.js/lib/languages/typescript"),
    javascript: () => import("highlight.js/lib/languages/javascript"),
    rust: () => import("highlight.js/lib/languages/rust"),
    python: () => import("highlight.js/lib/languages/python"),
    json: () => import("highlight.js/lib/languages/json"),
    markdown: () => import("highlight.js/lib/languages/markdown"),
    bash: () => import("highlight.js/lib/languages/bash"),
    toml: () => import("highlight.js/lib/languages/ini"),  // hljs uses ini for toml
  };

  const lang = language.toLowerCase();
  const loader = langModules[lang];
  if (loader && !hljs.getLanguage(lang)) {
    const mod = await loader();
    hljs.registerLanguage(lang, mod.default as Parameters<typeof hljs.registerLanguage>[1]);
  }

  try {
    const result = hljs.highlight(code, { language: lang, ignoreIllegals: true });
    return result.value;
  } catch {
    return code;
  }
}

const CodeBlock = React.forwardRef<HTMLPreElement, CodeBlockProps>(
  ({ code, language, showLineNumbers = false, className, ...props }, ref) => {
    const [highlighted, setHighlighted] = React.useState<string | null>(null);

    React.useEffect(() => {
      if (!language) return;
      let cancelled = false;
      highlight(code, language).then((html) => {
        if (!cancelled) setHighlighted(html);
      });
      return () => { cancelled = true; };
    }, [code, language]);

    const lines = code.split("\n");

    return (
      <pre
        ref={ref}
        className={cn(
          "overflow-x-auto border border-border bg-surface-code p-4 font-mono text-xs text-paper",
          className
        )}
        {...props}
      >
        {showLineNumbers ? (
          <code className="flex flex-col gap-0" aria-label={language ? `${language} code` : "code"}>
            {highlighted
              ? lines.map((_, i) => {
                  // Extract per-line HTML from the highlighted output
                  const lineHtml = highlighted.split("\n")[i] ?? "";
                  return (
                    <span key={i} className="flex gap-4 leading-relaxed">
                      <span
                        className="w-8 shrink-0 text-right text-text-muted select-none"
                        aria-hidden="true"
                      >
                        {i + 1}
                      </span>
                      <span
                        dangerouslySetInnerHTML={{ __html: lineHtml || " " }}
                        className="hljs flex-1"
                      />
                    </span>
                  );
                })
              : lines.map((line, i) => (
                  <span key={i} className="flex gap-4 leading-relaxed">
                    <span
                      className="w-8 shrink-0 text-right text-text-muted select-none"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <span className="flex-1">{line || " "}</span>
                  </span>
                ))}
          </code>
        ) : (
          <code aria-label={language ? `${language} code` : "code"}>
            {highlighted ? (
              <span
                className="hljs"
                dangerouslySetInnerHTML={{ __html: highlighted }}
              />
            ) : (
              code
            )}
          </code>
        )}
      </pre>
    );
  }
);
CodeBlock.displayName = "CodeBlock";

export { CodeBlock };
