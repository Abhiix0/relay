import { useState } from "react";
import { useParams } from "react-router";
import { BookOpen, Check, Copy } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useHandoffs, useProject } from "@/lib/api/hooks";
import { HandoffSectionCard } from "./HandoffSectionCard";
import { NewHandoffModal } from "./NewHandoffModal";

export function HandoffPage() {
  const { id } = useParams<{ id: string }>();
  const [copied, setCopied] = useState(false);

  const { data: project } = useProject(id);
  const { data: handoffs = [], isLoading } = useHandoffs(id);

  const activeHandoff = handoffs[0];

  const handleCopyMarkdown = () => {
    if (!activeHandoff) return;
    const md = `# ${activeHandoff.title} (v${activeHandoff.version})\n\n${activeHandoff.summary}\n\n` +
      activeHandoff.sections
        .map((s) => `## ${s.heading}\n\n${s.body}`)
        .join("\n\n");
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-copper">
              Maintainer Transition & Architecture Briefing
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-paper">
              Engineering Handoff
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Documented system constraints, operational gotchas, and architectural invariants for {project?.name || "this project"}.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeHandoff && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyMarkdown}
                className="gap-1.5 border-border text-xs font-mono text-paper"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-moss" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy Markdown"}</span>
              </Button>
            )}
            <NewHandoffModal projectId={id || "turborepo"} />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : !activeHandoff ? (
          <EmptyState
            title="No handoff briefings recorded"
            description="Create an architectural handoff briefing to preserve tribal knowledge and invariants."
            action={<NewHandoffModal projectId={id || "turborepo"} />}
          />
        ) : (
          <div className="space-y-6">
            {/* Briefing Header Card */}
            <div className="rounded border border-border bg-surface-accent p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-copper" />
                  <span className="text-xs font-mono font-semibold text-paper">
                    {activeHandoff.title}
                  </span>
                </div>
                <Badge variant="copper" className="text-[10px] font-mono">
                  v{activeHandoff.version}
                </Badge>
              </div>

              <p className="text-xs text-paper leading-relaxed bg-surface/50 p-4 rounded border border-border/30">
                {activeHandoff.summary}
              </p>

              <div className="text-[10px] font-mono text-text-muted">
                Last updated: {new Date(activeHandoff.updatedAt).toLocaleDateString()}
              </div>
            </div>

            {/* Structured Sections */}
            <div className="space-y-4">
              <h2 className="text-xs font-mono uppercase tracking-wider text-text-muted">
                Architectural Invariants & Gotchas
              </h2>
              {activeHandoff.sections.map((section, idx) => (
                <HandoffSectionCard
                  key={idx}
                  heading={section.heading}
                  body={section.body}
                  sources={section.sources}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
