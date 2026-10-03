import { CheckCircle2, HelpCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { AskAnswer } from "@/lib/api/types";
import { EvidenceCitations } from "./EvidenceCitations";

interface AnswerItemProps {
  answer: AskAnswer;
}

export function AnswerItem({ answer }: AnswerItemProps) {
  const getConfidenceBadge = (confidence: AskAnswer["confidence"]) => {
    switch (confidence) {
      case "high":
        return (
          <Badge variant="success" className="text-[10px] font-mono gap-1">
            <CheckCircle2 className="h-3 w-3" /> High Confidence
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="warning" className="text-[10px] font-mono">
            Medium Confidence
          </Badge>
        );
      default:
        return (
          <Badge variant="default" className="text-[10px] font-mono">
            Low Confidence
          </Badge>
        );
    }
  };

  return (
    <Card className="border-border bg-surface-accent overflow-hidden">
      {/* Question Header */}
      <div className="flex items-start gap-3 p-4 sm:p-5 border-b border-border/40 bg-surface/60">
        <HelpCircle className="h-4 w-4 text-copper shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
            Question
          </div>
          <h2 className="text-sm sm:text-base font-semibold text-paper mt-0.5">
            {answer.question}
          </h2>
        </div>
        <div className="shrink-0">{getConfidenceBadge(answer.confidence)}</div>
      </div>

      {/* Answer Content */}
      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-4 w-4 text-copper shrink-0 mt-1" />
          <div className="flex-1 space-y-3 text-xs sm:text-sm text-paper leading-relaxed whitespace-pre-line font-sans">
            {answer.answer}
          </div>
        </div>

        {/* Evidence Drawer */}
        <EvidenceCitations sources={answer.sources} />
      </CardContent>
    </Card>
  );
}
