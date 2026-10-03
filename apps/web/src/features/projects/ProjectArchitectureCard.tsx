import { Link } from "react-router";
import { Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilePath } from "@/components/ui/file-path";

interface ProjectArchitectureCardProps {
  projectId: string;
}

export function ProjectArchitectureCard({ projectId }: ProjectArchitectureCardProps) {
  const architecturalModules = [
    {
      name: "Task Dependency DAG Builder",
      description: "Generates execution graph with Petgraph and resolves workspace monorepo boundaries.",
      path: "crates/turborepo-lib/src/engine/builder.rs",
      badge: "Core Engine",
    },
    {
      name: "Remote Cache HTTP Client",
      description: "Handles multiplexed HTTP/2 artifact upload and download with gzip compression.",
      path: "crates/turborepo-cache/src/http.rs",
      badge: "Networking",
    },
    {
      name: "Daemon Client & IPC Socket",
      description: "Manages persistent background turbod process via unix socket or Windows named pipe.",
      path: "packages/turbo/src/commands/run.ts",
      badge: "Transport",
    },
  ];

  return (
    <Card className="border-border bg-surface-accent">
      <CardHeader className="p-5 pb-3 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-copper" />
            <CardTitle className="text-base font-serif text-paper">
              Architectural Invariants & Core Modules
            </CardTitle>
          </div>
          <Link
            to={`/projects/${projectId}/explorer`}
            className="text-[11px] font-mono text-copper hover:underline"
          >
            View full tree →
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-5 divide-y divide-border/30">
        {architecturalModules.map((mod) => (
          <div key={mod.name} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-paper">{mod.name}</span>
              <Badge variant="default" className="text-[10px] font-mono border-border">
                {mod.badge}
              </Badge>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">{mod.description}</p>
            <div className="pt-1">
              <Link to={`/projects/${projectId}/explorer`}>
                <FilePath path={mod.path} className="text-copper hover:underline" />
              </Link>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
