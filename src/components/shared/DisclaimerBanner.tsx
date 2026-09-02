import { cn } from "@/lib/utils";
import { Info, AlertTriangle, Sparkles, ShieldCheck } from "lucide-react";

interface DisclaimerBannerProps {
  type?: "ai-generated" | "simulated" | "warning" | "demo" | "verified";
  message?: string;
  className?: string;
}

const config = {
  "ai-generated": {
    icon: Sparkles,
    label: "AI-ASSISTED DRAFT",
    description: "Doctor verification required.",
    className: "tag-info",
  },
  simulated: {
    icon: Info,
    label: "DEMO / SIMULATED",
    description: "This is a simulated result for demonstration purposes.",
    className: "tag-urgent",
  },
  warning: {
    icon: AlertTriangle,
    label: "CRITICAL NOTICE",
    description: "This system does not diagnose diseases. Doctor has final clinical decision.",
    className: "tag-critical",
  },
  demo: {
    icon: Info,
    label: "DEMO DATA",
    description: "All patient information shown is fictional demo data.",
    className: "tag-neutral",
  },
  verified: {
    icon: ShieldCheck,
    label: "PHYSICIAN VERIFIED",
    description: "Reviewed and confirmed by a licensed clinician.",
    className: "tag-stable",
  },
};

export function DisclaimerBanner({
  type = "ai-generated",
  message,
  className,
}: DisclaimerBannerProps) {
  const { icon: Icon, label, description, className: configClass } = config[type];

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 rounded-md border backdrop-blur-sm",
        configClass,
        className
      )}
    >
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <div>
        <p className="data-figure text-[10px] font-bold uppercase tracking-widest">
          {label}
        </p>
        <p className="text-xs mt-0.5 opacity-85 leading-relaxed">
          {message || description}
        </p>
      </div>
    </div>
  );
}