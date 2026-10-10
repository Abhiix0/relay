import { Link } from "react-router";
import { ArrowRight, BookOpen, Compass, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SuggestedActionsCardProps {
  projectId: string;
}

export function SuggestedActionsCard({ projectId }: SuggestedActionsCardProps) {
  const actions = [
    {
      icon: Compass,
      title: "Start onboarding",
      description: "Generate a guided contributor onboarding path",
      to: `/app/projects/${projectId}/onboarding`,
      color: "text-blue",
    },
    {
      icon: Sparkles,
      title: "Ask about authentication",
      description: "Query how auth is implemented in this codebase",
      to: `/app/projects/${projectId}/ask?q=${encodeURIComponent("How does authentication work in this project?")}`,
      color: "text-copper",
    },
    {
      icon: BookOpen,
      title: "Generate handoff",
      description: "Create an architectural handoff briefing",
      to: `/app/projects/${projectId}/handoff`,
      color: "text-moss",
    },
  ];

  return (
    <Card className="border-border bg-surface-accent">
      <CardHeader className="p-5 pb-3 border-b border-border/40">
        <CardTitle className="text-base font-serif text-text">
          Suggested Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              to={action.to}
              className="flex items-start gap-3 p-3 rounded border border-border bg-surface hover:border-copper/60 hover:bg-surface-accent transition group"
            >
              <div className={`mt-0.5 ${action.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-text group-hover:text-copper transition">
                    {action.title}
                  </span>
                  <ArrowRight className="h-3 w-3 text-text-muted group-hover:text-copper transition" />
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
