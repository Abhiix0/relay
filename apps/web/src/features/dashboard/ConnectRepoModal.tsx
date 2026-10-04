import { useState } from "react";
import { useNavigate } from "react-router";
import { Github, Loader2, Plus } from "lucide-react";
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
import { useCreateProject } from "@/lib/api/hooks";

export function ConnectRepoModal() {
  const [open, setOpen] = useState(false);
  const [repoName, setRepoName] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("TypeScript");

  const navigate = useNavigate();
  const createProject = useCreateProject();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoName.trim()) return;

    createProject.mutate(
      {
        fullName: repoName.trim(),
        description: description.trim() || "Connected codebase via GitHub app",
        language,
      },
      {
        onSuccess: (newProj) => {
          setOpen(false);
          setRepoName("");
          setDescription("");
          // Navigate to the new project
          navigate(`/app/projects/${newProj.id}`);
        },
      }
    );
  };

  const sampleRepos = [
    "shadcn-ui/ui",
    "facebook/react",
    "tailwindlabs/tailwindcss",
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="primary" size="sm" className="gap-2 bg-copper hover:bg-copper-dark text-paper">
          <Plus className="h-4 w-4" />
          <span>Connect Repository</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-charcoal border-border text-paper">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Github className="h-5 w-5 text-copper" />
            <DialogTitle className="text-lg font-serif">Connect GitHub Repository</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-text-muted">
            Relay indexes your codebase into AST nodes, commits, and PR evidence for instant reasoning.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="repoName" className="text-xs font-mono uppercase text-text-muted">
              Repository (owner/repo)
            </Label>
            <Input
              id="repoName"
              placeholder="e.g. vercel/next.js"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              className="bg-surface-accent border-border text-paper text-sm font-mono"
              required
            />
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-text-muted">Suggestions:</span>
              {sampleRepos.map((sample) => (
                <button
                  type="button"
                  key={sample}
                  onClick={() => setRepoName(sample)}
                  className="text-[10px] font-mono text-copper hover:underline"
                >
                  {sample.split("/")[1]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-mono uppercase text-text-muted">
              Brief Description
            </Label>
            <Input
              id="description"
              placeholder="Web framework and serverless runtime"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-surface-accent border-border text-paper text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="language" className="text-xs font-mono uppercase text-text-muted">
              Primary Language
            </Label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded border border-border bg-surface-accent px-3 py-2 text-xs font-mono text-paper focus:outline-none focus:ring-1 focus:ring-copper"
            >
              <option value="TypeScript">TypeScript</option>
              <option value="Rust">Rust</option>
              <option value="Python">Python</option>
              <option value="Go">Go</option>
            </select>
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
              disabled={createProject.isPending}
              className="bg-copper hover:bg-copper-dark text-paper text-xs"
            >
              {createProject.isPending ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Index & Connect"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
