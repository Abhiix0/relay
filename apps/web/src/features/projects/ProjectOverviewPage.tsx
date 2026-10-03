import { Link, useParams } from "react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { useProject } from "@/lib/api/hooks";
import { ProjectActivityTimeline } from "./ProjectActivityTimeline";
import { ProjectArchitectureCard } from "./ProjectArchitectureCard";
import { ProjectHero } from "./ProjectHero";

export function ProjectOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, error } = useProject(id);

  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-6">
          <Skeleton className="h-36 w-full" />
          <div className="grid gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </AppShell>
    );
  }

  if (error || !project) {
    return (
      <AppShell>
        <div className="space-y-4">
          <ErrorState
            title="Repository not found"
            description="Could not load project context or repository metadata."
          />
          <div className="flex justify-center">
            <Link to="/dashboard">
              <Button size="sm" variant="primary" className="bg-copper text-paper">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const promptSuggestions = [
    "How does the caching algorithm compute hash keys?",
    "Where is the background daemon client initialized?",
    "Explain package DAG resolution during build.",
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Project Header Banner */}
        <ProjectHero project={project} />

        {/* Project Key Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Commits"
            value={project.stats.commits.toLocaleString()}
            accent="git"
          />
          <StatCard
            label="Pull Requests"
            value={project.stats.pullRequests.toLocaleString()}
          />
          <StatCard
            label="Indexed Files"
            value={project.stats.files.toLocaleString()}
          />
          <StatCard
            label="Active Issues"
            value={project.stats.issues.toLocaleString()}
          />
        </div>

        {/* Quick Grounded AI Query Bar */}
        <Card className="border-border bg-gradient-to-r from-surface-accent via-surface-accent to-surface p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-copper" />
                <h3 className="font-serif text-lg font-normal text-paper">
                  Ask Relay about {project.name}
                </h3>
              </div>
              <p className="text-xs text-text-muted">
                Every answer is grounded in AST nodes, source files, and commit history with line citations.
              </p>
            </div>
            <Link to={`/projects/${project.id}/ask`}>
              <Button size="sm" variant="primary" className="bg-copper hover:bg-copper-dark text-paper text-xs gap-2 font-mono">
                <span>Start Agent Conversation</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/40 pt-4">
            <span className="text-[10px] font-mono uppercase text-text-muted">Sample Inquiries:</span>
            {promptSuggestions.map((prompt) => (
              <Link
                key={prompt}
                to={`/projects/${project.id}/ask?q=${encodeURIComponent(prompt)}`}
                className="text-xs font-mono text-copper hover:underline bg-surface px-2.5 py-1 rounded border border-border/60"
              >
                "{prompt}"
              </Link>
            ))}
          </div>
        </Card>

        {/* Split Grid: Architecture on Left, Recent Events on Right */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ProjectArchitectureCard projectId={project.id} />
          <ProjectActivityTimeline projectId={project.id} />
        </div>
      </div>
    </AppShell>
  );
}
