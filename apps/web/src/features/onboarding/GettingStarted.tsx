import { Link } from "react-router";
import { ArrowRight, Sparkles, Search, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { OnboardingData } from "@/lib/api/types";

interface GettingStartedProps {
  data: OnboardingData;
  projectId: string;
}

export function GettingStarted({ data, projectId }: GettingStartedProps) {
  const { gettingStarted } = data;

  return (
    <div className="space-y-4">
      {/* Getting Started Steps */}
      <Card className="border-border bg-surface-accent">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-copper" />
            <h2 className="text-sm font-semibold font-mono text-paper">Getting Started</h2>
          </div>

          <div className="space-y-3">
            {gettingStarted.map((step) => (
              <div key={step.step} className="flex gap-3">
                <div className="shrink-0 w-6 h-6 rounded-full bg-copper/20 border border-copper text-copper text-xs font-mono font-semibold flex items-center justify-center">
                  {step.step}
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-xs font-semibold text-paper">{step.title}</h3>
                  <p className="text-xs text-text-muted leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps Actions */}
      <Card className="border-border bg-surface-accent">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-copper" />
            <h2 className="text-sm font-semibold font-mono text-paper">Next Steps</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link to={`/app/projects/${projectId}/files`}>
              <Button
                variant="secondary"
                className="w-full h-auto p-3 flex flex-col items-start gap-2 border-border text-left"
              >
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-copper" />
                  <span className="text-xs font-semibold text-paper">Explore Repository</span>
                </div>
                <span className="text-xs text-text-muted leading-relaxed">
                  Browse files, search code, and understand project structure.
                </span>
              </Button>
            </Link>

            <Link to={`/app/projects/${projectId}/ask`}>
              <Button
                variant="secondary"
                className="w-full h-auto p-3 flex flex-col items-start gap-2 border-border text-left"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-copper" />
                  <span className="text-xs font-semibold text-paper">Ask Questions</span>
                </div>
                <span className="text-xs text-text-muted leading-relaxed">
                  Get AI-powered answers about architecture and implementation.
                </span>
              </Button>
            </Link>

            <Link to={`/app/projects/${projectId}/handoff`}>
              <Button
                variant="secondary"
                className="w-full h-auto p-3 flex flex-col items-start gap-2 border-border text-left"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-copper" />
                  <span className="text-xs font-semibold text-paper">Generate Handoff</span>
                </div>
                <span className="text-xs text-text-muted leading-relaxed">
                  Create comprehensive documentation for team handoffs.
                </span>
              </Button>
            </Link>
          </div>

          <div className="pt-3 border-t border-border/30">
            <div className="flex flex-col sm:flex-row gap-2">
              <Link to={`/app/projects/${projectId}/ask?q=${encodeURIComponent("How do I get started contributing to this project?")}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-mono text-copper hover:text-paper gap-1.5"
                >
                  <Sparkles className="h-3 w-3" />
                  Ask "How do I get started?"
                </Button>
              </Link>
              
              <Link to={`/app/projects/${projectId}/ask?q=${encodeURIComponent("What's the architecture of this project?")}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-mono text-copper hover:text-paper gap-1.5"
                >
                  <Sparkles className="h-3 w-3" />
                  Ask "What's the architecture?"
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}