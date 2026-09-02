import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  max?: number;
  size?: number;
  thickness?: number;
  label?: string;
  variant?: "primary" | "accent" | "warning" | "critical";
  showValue?: boolean;
  className?: string;
}

const colorMap = {
  primary: { from: "#3A8DE0", to: "#14B8A6" },
  accent: { from: "#14B8A6", to: "#3A8DE0" },
  warning: { from: "#F59E0B", to: "#EF4444" },
  critical: { from: "#EF4444", to: "#DC2626" },
};

export function RingProgress({
  value,
  max = 100,
  size = 80,
  thickness = 6,
  label,
  variant = "primary",
  showValue = true,
  className,
}: Props) {
  const pct = Math.min(1, Math.max(0, value / max));
  const r = size / 2 - thickness / 2;
  const c = 2 * Math.PI * r;
  const offset = c - pct * c;
  const c2 = colorMap[variant];

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(58,141,224,0.15)"
          strokeWidth={thickness}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#ring-grad-${variant})`}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
        <defs>
          <linearGradient id={`ring-grad-${variant}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={c2.from} />
            <stop offset="100%" stopColor={c2.to} />
          </linearGradient>
        </defs>
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="data-figure font-semibold text-sm">{Math.round(pct * 100)}<span className="text-[10px] opacity-70">%</span></span>
          {label && <span className="text-[9px] eyebrow">{label}</span>}
        </div>
      )}
    </div>
  );
}