import { cn } from "@/lib/utils";
import { type LucideIcon, ChevronRight } from "lucide-react";

interface WorkflowStepProps {
  number: number;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color?: "blue" | "teal" | "gold" | "green" | "red" | "violet";
  showArrow?: boolean;
}

const colorMap = {
  blue: {
    container: "bg-trust-500/10 text-trust-300 border-trust-500/30",
    glow: "shadow-[0_0_24px_-6px_rgba(58,141,224,0.45)]",
    number: "bg-trust-500 text-white",
    code: "#3A8DE0",
  },
  teal: {
    container: "bg-teal-500/10 text-teal-400 border-teal-500/30",
    glow: "shadow-[0_0_24px_-6px_rgba(20,184,166,0.45)]",
    number: "bg-teal-500 text-bio-base",
    code: "#14B8A6",
  },
  gold: {
    container: "bg-amber-warn/10 text-amber-warn border-amber-warn/30",
    glow: "shadow-[0_0_24px_-6px_rgba(245,158,11,0.45)]",
    number: "bg-amber-warn text-bio-base",
    code: "#F59E0B",
  },
  green: {
    container: "bg-mint-500/10 text-mint-400 border-mint-500/30",
    glow: "shadow-[0_0_24px_-6px_rgba(34,197,94,0.45)]",
    number: "bg-mint-500 text-bio-base",
    code: "#22C55E",
  },
  red: {
    container: "bg-red-urgent/10 text-red-critical border-red-urgent/30",
    glow: "shadow-[0_0_24px_-6px_rgba(220,38,38,0.45)]",
    number: "bg-red-urgent text-white",
    code: "#DC2626",
  },
  violet: {
    container: "bg-violet-500/10 text-violet-300 border-violet-500/30",
    glow: "shadow-[0_0_24px_-6px_rgba(167,139,250,0.45)]",
    number: "bg-violet-500 text-white",
    code: "#A78BFA",
  },
};

export function WorkflowStep({
  number,
  title,
  subtitle,
  icon: Icon,
  color = "blue",
  showArrow = true,
}: WorkflowStepProps) {
  const c = colorMap[color];

  return (
    <div className="flex items-center gap-2">
      <div className={cn("flex flex-col items-center gap-2 min-w-[110px] flex-shrink-0")}>
        <div className="relative">
          <div
            className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center border backdrop-blur-sm hover-lift",
              c.container,
              c.glow
            )}
          >
            <Icon className="w-6 h-6" strokeWidth={1.6} />
          </div>
          <div
            className={cn(
              "absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold data-figure border-2 border-bio-base",
              c.number
            )}
          >
            {number.toString().padStart(2, "0")}
          </div>
        </div>
        <p className="text-xs font-semibold text-foreground text-center leading-tight tracking-tight-x">
          {title}
        </p>
        <p className="data-figure text-[9px] text-muted-foreground text-center leading-tight max-w-[100px] tracking-wider">
          {subtitle}
        </p>
      </div>
      {showArrow && (
        <div className="hidden sm:flex items-center text-muted-foreground/30 mt-[-44px]">
          <div className="w-6 h-px bg-gradient-to-r from-trust-500/40 to-teal-500/40" />
          <ChevronRight className="w-3 h-3 -ml-1 text-trust-500/60" />
        </div>
      )}
    </div>
  );
}