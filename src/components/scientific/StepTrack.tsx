import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  label: string;
  status: "complete" | "active" | "pending";
}

interface Props {
  steps: Step[];
  className?: string;
}

export function StepTrack({ steps, className }: Props) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div className="relative flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: s.status === "active" ? 1.05 : 1,
                }}
                className={cn(
                  "relative w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                  s.status === "complete" && "bg-trust-500 border-trust-500 text-white",
                  s.status === "active" && "bg-bio-surface border-trust-400 text-trust-300 glow-primary",
                  s.status === "pending" && "bg-bio-surface border-bio-border text-muted-foreground",
                )}
              >
                {s.status === "complete" ? (
                  <Check className="w-4 h-4" strokeWidth={3} />
                ) : (
                  <span className="data-figure text-xs font-bold">{i + 1}</span>
                )}
                {s.status === "active" && (
                  <span className="absolute inset-0 rounded-full border-2 border-trust-400 animate-data-pulse" />
                )}
              </motion.div>
              <span
                className={cn(
                  "absolute top-10 whitespace-nowrap data-figure text-[10px] tracking-widest",
                  s.status === "active" ? "text-trust-300" : "text-muted-foreground",
                )}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px mx-2 relative">
                <div className="absolute inset-0 bg-bio-border/40" />
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-trust-500 to-teal-500"
                  initial={{ width: 0 }}
                  animate={{
                    width: s.status === "complete" ? "100%" : "0%",
                  }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}