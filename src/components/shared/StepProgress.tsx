import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  id: string;
  label: string;
  shortLabel?: string;
}

interface StepProgressProps {
  steps?: Step[];
  currentStep: string;
  completedSteps?: string[];
}

const defaultSteps: Step[] = [
  { id: "login", label: "Login", shortLabel: "Login" },
  { id: "consent", label: "Consent", shortLabel: "Consent" },
  { id: "language", label: "Language", shortLabel: "Lang" },
  { id: "inputMode", label: "Input Mode", shortLabel: "Mode" },
  { id: "interview", label: "Interview", shortLabel: "Intv" },
  { id: "ayush", label: "AYUSH", shortLabel: "AYUSH" },
  { id: "documents", label: "Documents", shortLabel: "Docs" },
  { id: "timeline", label: "Timeline", shortLabel: "Time" },
  { id: "triage", label: "Triage", shortLabel: "Trg" },
  { id: "casesheet", label: "Case Sheet", shortLabel: "Case" },
];

export function StepProgress({
  steps = defaultSteps,
  currentStep,
  completedSteps = [],
}: StepProgressProps) {
  return (
    <div className="w-full overflow-x-auto pb-3">
      <div className="flex items-start gap-1 min-w-max px-4 pt-1">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const isPast =
            steps.findIndex((s) => s.id === step.id) <
            steps.findIndex((s) => s.id === currentStep);

          return (
            <div key={step.id} className="flex items-start">
              <div className="flex flex-col items-center gap-2 min-w-[56px]">
                <div className="relative">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold border transition-all data-figure",
                      isCompleted
                        ? "bg-trust-500/20 text-trust-300 border-trust-500/40"
                        : isCurrent
                          ? "bg-trust-500 text-white border-trust-400 glow-primary"
                          : isPast
                            ? "bg-teal-500/15 text-teal-400 border-teal-500/30"
                            : "bg-bio-surface text-muted-foreground border-bio-border"
                    )}
                  >
                    {isCompleted ? <Check className="w-4 h-4" strokeWidth={2.4} /> : index + 1}
                  </div>
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-md border-2 border-trust-400 animate-data-pulse" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium text-center max-w-[64px] leading-tight tracking-wide",
                    isCurrent
                      ? "text-trust-300 font-bold"
                      : isCompleted
                        ? "text-teal-400"
                        : "text-muted-foreground"
                  )}
                >
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{step.shortLabel || step.label}</span>
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="w-6 sm:w-10 mx-1 mt-3.5 relative">
                  <div className="absolute inset-0 bg-bio-border/50" />
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 bg-gradient-to-r",
                      isCompleted || isPast
                        ? "from-trust-500 to-teal-500 w-full"
                        : "from-transparent to-transparent w-0"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}