import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

type StepState = "done" | "current" | "todo";

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: string;
  className?: string;
}

function getState(stepId: string, currentStep: string, steps: Step[]): StepState {
  const currentIdx = steps.findIndex((s) => s.id === currentStep);
  const stepIdx = steps.findIndex((s) => s.id === stepId);
  if (stepIdx < currentIdx) return "done";
  if (stepIdx === currentIdx) return "current";
  return "todo";
}

function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <ol
      aria-label="Progress steps"
      className={cn("flex flex-col gap-0", className)}
    >
      {steps.map((step, index) => {
        const state = getState(step.id, currentStep, steps);
        const isLast = index === steps.length - 1;
        return (
          <li key={step.id} className="relative flex gap-4">
            {/* Connector line */}
            {!isLast && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-3.5 top-8 h-[calc(100%-8px)] w-px",
                  state === "done" ? "bg-success" : "bg-border"
                )}
              />
            )}

            {/* Step indicator */}
            <span
              aria-hidden="true"
              className={cn(
                "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 font-mono text-[9px] font-semibold transition-colors",
                state === "done" &&
                  "border-success bg-success text-paper",
                state === "current" &&
                  "border-copper bg-copper text-paper shadow-[0_0_0_3px] shadow-copper/25",
                state === "todo" &&
                  "border-border bg-surface-accent text-text-muted"
              )}
            >
              {state === "done" ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </span>

            {/* Content */}
            <div className="pb-8 pt-0.5 min-w-0">
              <p
                className={cn(
                  "font-mono text-xs font-semibold uppercase tracking-wider",
                  state === "current" ? "text-copper" : "text-text",
                  state === "todo" && "text-text-muted"
                )}
              >
                {step.title}
              </p>
              {step.description && (
                <p className="mt-1 text-xs text-text-muted leading-relaxed">
                  {step.description}
                </p>
              )}
            </div>

            {/* Screen-reader state */}
            <span className="sr-only">
              {state === "done"
                ? "Completed"
                : state === "current"
                ? "Current step"
                : "Not yet started"}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export { Stepper };
export type { Step, StepState };
