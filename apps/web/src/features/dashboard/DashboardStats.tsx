import { StatCard } from "@/components/ui/stat-card";
import type { Project } from "@/lib/api/types";

interface DashboardStatsProps {
  projects: Project[];
}

export function DashboardStats({ projects }: DashboardStatsProps) {
  const totalFiles = projects.reduce((acc, p) => acc + (p.stats?.files || 0), 0);
  const totalCommits = projects.reduce((acc, p) => acc + (p.stats?.commits || 0), 0);
  const healthyCount = projects.filter((p) => p.syncStatus === "succeeded").length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Connected Repos"
        value={projects.length}
        accent="active"
      />
      <StatCard
        label="AST & Source Files"
        value={totalFiles.toLocaleString()}
      />
      <StatCard
        label="Historical Commits"
        value={totalCommits.toLocaleString()}
      />
      <StatCard
        label="Index Health"
        value={`${Math.round((healthyCount / (projects.length || 1)) * 100)}%`}
      />
    </div>
  );
}
