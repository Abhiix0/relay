import { useState } from "react";
import { Layers, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateDecision } from "@/lib/api/hooks";

interface NewDecisionModalProps {
  projectId: string;
}

export function NewDecisionModal({ projectId }: NewDecisionModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [rationale, setRationale] = useState("");

  const createDecision = useCreateDecision(projectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) return;

    createDecision.mutate(
      {
        title: title.trim(),
        summary: summary.trim(),
        rationale: rationale.trim(),
        sources: [],
      },
      {
        onSuccess: () => {
          setOpen(false);
          setTitle("");
          setSummary("");
          setRationale("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-copper hover:bg-copper-dark text-paper text-xs gap-1.5 font-mono">
          <Plus className="h-3.5 w-3.5" />
          <span>Record ADR</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-charcoal border-border text-paper">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="h-4 w-4 text-copper" />
            <DialogTitle className="text-base font-serif">Record Architectural Decision (ADR)</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-text-muted">
            Document critical engineering invariants, migrations, and structural decisions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="decTitle" className="text-xs font-mono uppercase text-text-muted">
              Decision Title (e.g. ADR-003: Rust Engine Migration)
            </Label>
            <Input
              id="decTitle"
              placeholder="ADR-00X: Short title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-surface-accent border-border text-paper text-sm font-mono"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="decSummary" className="text-xs font-mono uppercase text-text-muted">
              Summary of Decision
            </Label>
            <Input
              id="decSummary"
              placeholder="What choice was made?"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="bg-surface-accent border-border text-paper text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="decRationale" className="text-xs font-mono uppercase text-text-muted">
              Rationale, Context & Trade-offs
            </Label>
            <Textarea
              id="decRationale"
              placeholder="Why this direction was chosen over alternatives..."
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              className="bg-surface-accent border-border text-paper text-xs"
              rows={4}
            />
          </div>

          {createDecision.isError && (
            <div className="rounded border border-error/40 bg-error/10 p-2.5 text-xs text-error font-mono">
              {createDecision.error instanceof Error
                ? createDecision.error.message
                : "Failed to record decision. Backend service may be unreachable."}
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setOpen(false)}
              className="border-border text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createDecision.isPending}
              className="bg-copper hover:bg-copper-dark text-paper text-xs font-mono"
            >
              {createDecision.isPending ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Recording...
                </>
              ) : (
                "Save Decision"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
