import { useState } from "react";
import { BookOpen, Loader2, Plus } from "lucide-react";
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
import { useCreateHandoff } from "@/lib/api/hooks";

interface NewHandoffModalProps {
  projectId: string;
}

export function NewHandoffModal({ projectId }: NewHandoffModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [heading, setHeading] = useState("");
  const [body, setBody] = useState("");

  const createHandoff = useCreateHandoff(projectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) return;

    createHandoff.mutate(
      {
        title: title.trim(),
        summary: summary.trim(),
        sections: [
          {
            id: `section_${Date.now()}`,
            heading: heading.trim() || "1. Primary Invariants & Architecture",
            body: body.trim() || "Documented codebase constraints and edge cases.",
            sources: [],
          },
        ],
      },
      {
        onSuccess: () => {
          setOpen(false);
          setTitle("");
          setSummary("");
          setHeading("");
          setBody("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-copper hover:bg-copper-dark text-paper text-xs gap-1.5 font-mono">
          <Plus className="h-3.5 w-3.5" />
          <span>New Briefing</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-charcoal border-border text-paper">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="h-4 w-4 text-copper" />
            <DialogTitle className="text-base font-serif">Create Architecture Handoff</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-text-muted">
            Record maintainer handoff briefings, tech debt warnings, and invariants for new contributors.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="handoffTitle" className="text-xs font-mono uppercase text-text-muted">
              Document Title
            </Label>
            <Input
              id="handoffTitle"
              placeholder="e.g. Lead Maintainer Handoff: Engine Architecture"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-surface-accent border-border text-paper text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="handoffSummary" className="text-xs font-mono uppercase text-text-muted">
              Executive Summary
            </Label>
            <Textarea
              id="handoffSummary"
              placeholder="High-level state of codebase invariants, release channels, and critical risks..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="bg-surface-accent border-border text-paper text-xs"
              rows={3}
              required
            />
          </div>

          <div className="space-y-1.5 border-t border-border/40 pt-3">
            <Label htmlFor="initialHeading" className="text-xs font-mono uppercase text-text-muted">
              First Section Heading
            </Label>
            <Input
              id="initialHeading"
              placeholder="e.g. 1. Core Architectural Invariant: Deterministic Hashing"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              className="bg-surface-accent border-border text-paper text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="initialBody" className="text-xs font-mono uppercase text-text-muted">
              Section Details
            </Label>
            <Textarea
              id="initialBody"
              placeholder="Describe constraints, file locations, or gotchas..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="bg-surface-accent border-border text-paper text-xs"
              rows={3}
            />
          </div>

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
              disabled={createHandoff.isPending}
              className="bg-copper hover:bg-copper-dark text-paper text-xs font-mono"
            >
              {createHandoff.isPending ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Briefing"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
