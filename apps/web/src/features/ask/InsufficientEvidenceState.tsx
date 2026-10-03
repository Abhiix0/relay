import { AlertCircle, Search } from "lucide-react";

interface InsufficientEvidenceStateProps {
  question: string;
}

export function InsufficientEvidenceState({ question }: InsufficientEvidenceStateProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 rounded bg-surface border border-border/60">
        <AlertCircle className="h-5 w-5 text-sun shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1">
          <h3 className="text-sm font-semibold text-paper">
            Not Enough Repository Evidence
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            I couldn't find enough information in the indexed repository to answer this
            question confidently. Relay only provides answers grounded in actual codebase
            evidence.
          </p>
        </div>
      </div>

      {/* What was searched */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Search className="h-3.5 w-3.5 text-text-muted" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
            Searched For
          </span>
        </div>
        <div className="rounded bg-surface-accent border border-border p-3">
          <p className="text-xs font-mono text-paper">{question}</p>
        </div>
      </div>

      {/* Suggestions */}
      <div className="rounded bg-surface-accent border border-border/40 p-4 space-y-2">
        <h4 className="text-xs font-semibold text-paper">Try asking about:</h4>
        <ul className="space-y-1.5 text-[11px] text-text-muted">
          <li className="flex items-start gap-2">
            <span className="text-copper shrink-0">•</span>
            <span>Implementation details found in the source code</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-copper shrink-0">•</span>
            <span>Architecture patterns visible in the repository structure</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-copper shrink-0">•</span>
            <span>Technical decisions documented in the codebase</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-copper shrink-0">•</span>
            <span>Specific function or module behavior</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
