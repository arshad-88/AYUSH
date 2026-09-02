import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface PriorityBadgeProps {
  priority: "routine" | "priority" | "urgent";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const config = {
  routine: {
    label: "Routine",
    code: "P3",
    icon: CheckCircle,
    className: "tag-stable",
  },
  priority: {
    label: "Priority",
    code: "P2",
    icon: Clock,
    className: "tag-urgent",
  },
  urgent: {
    label: "Urgent",
    code: "P1",
    icon: AlertTriangle,
    className: "tag-critical",
  },
};

const sizeConfig = {
  sm: "px-2 py-0.5 text-[10px] gap-1.5",
  md: "px-2.5 py-1 text-xs gap-1.5",
  lg: "px-3 py-1.5 text-sm gap-2",
};

const iconSize = {
  sm: "w-3 h-3",
  md: "w-3.5 h-3.5",
  lg: "w-4 h-4",
};

export function PriorityBadge({ priority, size = "md", className }: PriorityBadgeProps) {
  const { label, code, icon: Icon, className: tagClass } = config[priority];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md font-semibold border data-figure tracking-wider",
        tagClass,
        sizeConfig[size],
        className
      )}
    >
      <span className="opacity-70 text-[9px] mr-0.5">{code}</span>
      <Icon className={iconSize[size]} />
      {label}
    </span>
  );
}