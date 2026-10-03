import { StatCard } from "@/components/ui/stat-card";
import type { Project } from "@/lib/api/types";

interface DashboardStatsProps {
  projects: Project[];
}

export function DashboardStats({ projects }: DashboardStatsProps) {
  // Calculate total projects
  const totalProjects = projects.length;

  // Calculate total open issues across all projects
  const totalIssues = projects.reduce((acc, p) => acc + (p.stats?.issues || 0), 0);

  // Calculate total active PRs across all projects
  const totalPRs = projects.reduce(
    (acc, p) => acc + (p.stats?.pullRequests || 0),
    0
  );

  // Calculate CI failures (projects with failed sync status)
  const ciFailures = projects.filter((p) => p.syncStatus === "failed").length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total Projects" value={totalProjects} accent="active" />
      <StatCard label="Open Issues" value={totalIssues.toLocaleString()} />
      <StatCard label="Active PRs" value={totalPRs.toLocaleString()} />
      <StatCard label="CI Failures" value={ciFailures} />
    </div>
  );
}
