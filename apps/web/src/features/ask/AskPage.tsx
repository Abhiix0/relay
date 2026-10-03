import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import { CornerDownLeft, Loader2, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAskHistory, useAskQuestion, useProject } from "@/lib/api/hooks";
import { AnswerItem } from "./AnswerItem";

export function AskPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [question, setQuestion] = useState("");
  const [newAnswerIds, setNewAnswerIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: project } = useProject(id);
  const { data: history = [], isLoading } = useAskHistory(id);
  const askMutation = useAskQuestion(id);

  // Pre-fill question from search param if present
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuestion(q);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || askMutation.isPending) return;

    askMutation.mutate(question.trim(), {
      onSuccess: (newAnswer) => {
        // Track this answer as new to trigger streaming
        setNewAnswerIds((prev) => new Set(prev).add(newAnswer.id));
        // Remove from new set after streaming completes (3 seconds)
        setTimeout(() => {
          setNewAnswerIds((prev) => {
            const next = new Set(prev);
            next.delete(newAnswer.id);
            return next;
          });
        }, 3000);
        
        setQuestion("");
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const suggestions = [
    "How does caching compute deterministic hashes?",
    "Where is the daemon RPC client initialized?",
    "How are workspace package dependencies resolved in the DAG?",
    "What happens when a circular dependency is detected?",
  ];

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-b border-border pb-4">
          <div className="text-[10px] font-mono uppercase tracking-wider text-copper">
            Evidence-Grounded AI Agent
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-paper">
            Ask {project?.name || "Codebase"}
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Answers are synthesized directly from AST syntax trees, commits, and PR reviews. No blind guessing.
          </p>
        </div>

        {/* Suggested Queries */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase text-text-muted mr-1">Suggestions:</span>
          {suggestions.map((sug) => (
            <button
              key={sug}
              type="button"
              onClick={() => setQuestion(sug)}
              className="text-[11px] font-mono text-copper hover:underline bg-surface-accent px-2.5 py-1 rounded border border-border/60 transition"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Conversation Stream */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            history.map((ans) => (
              <AnswerItem 
                key={ans.id} 
                answer={ans} 
                isNew={newAnswerIds.has(ans.id)}
              />
            ))
          )}

          {askMutation.isPending && (
            <div className="rounded border border-border bg-surface-accent p-6 flex items-center justify-center gap-3 text-text-muted text-xs font-mono">
              <Loader2 className="h-4 w-4 animate-spin text-copper" />
              <span>Analyzing AST graph & synthesizing grounded answer...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="sticky bottom-4 z-20 rounded border border-border bg-surface-accent p-3 shadow-xl backdrop-blur space-y-2"
        >
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about architecture, data flow, or implementation details... (Enter to send, Shift+Enter for newline)"
            className="w-full resize-none border-0 bg-transparent text-sm text-paper placeholder:text-text-muted focus:ring-0 min-h-[60px]"
            rows={2}
          />

          <div className="flex items-center justify-between border-t border-border/40 pt-2">
            <span className="text-[10px] font-mono text-text-muted">
              Press <span className="text-copper">Enter ↵</span> to send
            </span>
            <Button
              type="submit"
              size="sm"
              disabled={!question.trim() || askMutation.isPending}
              className="bg-copper hover:bg-copper-dark text-paper text-xs gap-1.5 font-mono"
            >
              {askMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Ask Relay</span>
                  <CornerDownLeft className="h-3 w-3 opacity-60" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
