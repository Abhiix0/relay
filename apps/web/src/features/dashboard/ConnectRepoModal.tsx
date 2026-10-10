import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Github, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateProject, useGithubRepos } from "@/lib/api/hooks";

const FULL_NAME = /^[\w.-]+\/[\w.-]+$/;

// Mounted only while the dialog is open, so the repo list is fetched lazily.
// shortcut: search fires per keystroke (cached 30s), add a debounce if the API rate-limits.
function RepoPicker({ onConnected }: { onConnected: (id: string) => void }) {
  const [q, setQ] = useState("");
  const [manual, setManual] = useState("");
  const repos = useGithubRepos(q.trim());
  const createProject = useCreateProject();

  const connect = (fullName: string) => {
    if (createProject.isPending) return;
    createProject.mutate({ fullName }, { onSuccess: (p) => onConnected(p.id) });
  };
  const manualValid = FULL_NAME.test(manual.trim());

  return (
    <div className="space-y-3 py-2">
      <Input
        aria-label="Search repositories"
        placeholder="Search your repositories"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="bg-surface-accent border-border text-text text-sm font-mono"
      />

      {repos.data && !repos.data.canAccessPrivate && (
        <p className="text-[11px] text-text-muted">Only public repositories are listed.</p>
      )}

      <div className="max-h-64 overflow-y-auto space-y-1">
        {repos.isLoading && (
          <p className="flex items-center gap-2 text-xs text-text-muted">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading repositories...
          </p>
        )}
        {repos.isError && (
          <div role="alert" className="rounded border border-error/40 bg-error/10 p-2.5 text-xs text-error font-mono">
            {repos.error instanceof Error ? repos.error.message : "Unable to load repositories."}
          </div>
        )}
        {repos.data?.repos.length === 0 && (
          <p className="text-xs text-text-muted">No repositories found.</p>
        )}
        {repos.data?.repos.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-2 rounded border border-border px-2.5 py-1.5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {r.connected && r.connectedProjectId ? (
                  <Link to={`/app/projects/${r.connectedProjectId}`} className="truncate text-xs font-mono text-copper hover:underline">
                    {r.fullName}
                  </Link>
                ) : (
                  <span className="truncate text-xs font-mono">{r.fullName}</span>
                )}
                {r.private && (
                  <span className="rounded border border-border px-1 text-[10px] text-text-muted">Private</span>
                )}
              </div>
              {r.language && <span className="text-[10px] text-text-muted">{r.language}</span>}
            </div>
            <Button
              type="button"
              size="sm"
              disabled={r.connected || createProject.isPending}
              onClick={() => connect(r.fullName)}
              aria-label={`Connect ${r.fullName}`}
              className="bg-copper hover:bg-copper-dark text-paper text-xs"
            >
              {r.connected ? "Connected" : "Connect"}
            </Button>
          </div>
        ))}
      </div>

      <details className="text-xs">
        <summary className="cursor-pointer text-text-muted">Connect a public repo by name</summary>
        <form
          className="flex gap-2 pt-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (manualValid) connect(manual.trim());
          }}
        >
          <Input
            aria-label="Repository (owner/repo)"
            placeholder="e.g. vercel/next.js"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            className="bg-surface-accent border-border text-text text-sm font-mono"
          />
          <Button type="submit" size="sm" disabled={!manualValid || createProject.isPending} className="bg-copper hover:bg-copper-dark text-paper text-xs">
            Connect
          </Button>
        </form>
      </details>

      {createProject.isError && (
        <div role="alert" className="rounded border border-error/40 bg-error/10 p-2.5 text-xs text-error font-mono">
          {createProject.error instanceof Error
            ? createProject.error.message
            : "Unable to connect repository."}
        </div>
      )}
    </div>
  );
}

export function ConnectRepoModal() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

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
            Relay indexes files, commits, issues and pull requests.
          </DialogDescription>
        </DialogHeader>
        <RepoPicker
          onConnected={(id) => {
            setOpen(false);
            navigate(`/app/projects/${id}`);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
