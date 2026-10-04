import { Link, useParams } from "react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { ProjectGuard } from "@/components/layout/ProjectGuard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { useProject } from "@/lib/api/hooks";
import { ProjectActivityTimeline } from "./ProjectActivityTimeline";
import { ProjectArchitectureCard } from "./ProjectArchitectureCard";
import { ProjectHealthCard } from "./ProjectHealthCard";
import { ProjectHero } from "./ProjectHero";
import { SuggestedActionsCard } from "./SuggestedActionsCard";

export function ProjectOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);

  const promptSuggestions = [
    "How does the caching algorithm compute hash keys?",
    "Where is the background daemon client initialized?",
    "Explain package DAG resolution during build.",
  ];

  // ProjectGuard handles loading, error, and not-found states
  return (
    <ProjectGuard>
      {project && (
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
              label="Active Issues"
              value={project.stats.issues.toLocaleString()}
            />
            <StatCard
              label="Releases"
              value={project.stats.releases.toLocaleString()}
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
                  Every answer is grounded in AST nodes, source files, and commit
                  history with line citations.
                </p>
              </div>
              <Link to={`/app/projects/${project.id}/ask`}>
                <Button
                  size="sm"
                  variant="primary"
                  className="bg-copper hover:bg-copper-dark text-paper text-xs gap-2 font-mono"
                >
                  <span>Start Agent Conversation</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/40 pt-4">
              <span className="text-[10px] font-mono uppercase text-text-muted">
                Sample Inquiries:
              </span>
              {promptSuggestions.map((prompt) => (
                <Link
                  key={prompt}
                  to={`/app/projects/${project.id}/ask?q=${encodeURIComponent(prompt)}`}
                  className="text-xs font-mono text-copper hover:underline bg-surface px-2.5 py-1 rounded border border-border/60"
                >
                  "{prompt}"
                </Link>
              ))}
            </div>
          </Card>

          {/* Two-Column Layout: Main content + Sidebar */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content - Left Column (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              <ProjectArchitectureCard projectId={project.id} />
              <ProjectActivityTimeline projectId={project.id} />
            </div>

            {/* Sidebar - Right Column (1/3) */}
            <div className="space-y-6">
              <ProjectHealthCard project={project} />
              <SuggestedActionsCard projectId={project.id} />
            </div>
          </div>
        </div>
      )}
    </ProjectGuard>
  );
}
