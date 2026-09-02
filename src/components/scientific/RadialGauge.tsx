import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  size?: number;
  label?: string;
  unit?: string;
  variant?: "primary" | "accent" | "warning" | "critical" | "stable";
  thickness?: number;
  showTicks?: boolean;
}

const colorMap = {
  primary: { stroke: "#3A8DE0", glow: "rgba(58,141,224,0.55)" },
  accent: { stroke: "#14B8A6", glow: "rgba(20,184,166,0.55)" },
  warning: { stroke: "#F59E0B", glow: "rgba(245,158,11,0.55)" },
  critical: { stroke: "#EF4444", glow: "rgba(239,68,68,0.55)" },
  stable: { stroke: "#22C55E", glow: "rgba(34,197,94,0.55)" },
};

export function RadialGauge({
  value,
  size = 140,
  label,
  unit,
  variant = "primary",
  thickness = 8,
  showTicks = true,
}: Props) {
  const v = Math.min(100, Math.max(0, value));
  const c = colorMap[variant];
  const r = size / 2 - thickness;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (v / 100) * circumference * 0.75;
  const rotation = 135;

  return (
    <div className="relative inline-flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={`gauge-${variant}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={c.stroke} stopOpacity="0.4" />
            <stop offset="100%" stopColor={c.stroke} stopOpacity="1" />
          </linearGradient>
        </defs>
        {showTicks &&
          Array.from({ length: 24 }).map((_, i) => {
            const angle = (rotation - 135 + (i * 270) / 23) * (Math.PI / 180);
            const x1 = cx + (r + 4) * Math.cos(angle);
            const y1 = cy + (r + 4) * Math.sin(angle);
            const x2 = cx + (r + (i % 3 === 0 ? 8 : 6)) * Math.cos(angle);
            const y2 = cy + (r + (i % 3 === 0 ? 8 : 6)) * Math.sin(angle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(124,146,172,0.35)"
                strokeWidth={i % 3 === 0 ? 1.4 : 0.8}
              />
            );
          })}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgba(58,141,224,0.12)"
          strokeWidth={thickness}
          strokeDasharray={`${(circumference * 0.75)} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(${rotation} ${cx} ${cy})`}
        />
        <motion.circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={`url(#gauge-${variant})`}
          strokeWidth={thickness}
          strokeDasharray={`${(circumference * 0.75)} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(${rotation} ${cx} ${cy})`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${c.glow})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="data-figure font-bold text-2xl"
          style={{ color: c.stroke }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {v.toFixed(0)}
          {unit && <span className="text-xs ml-0.5 opacity-70">{unit}</span>}
        </motion.span>
        {label && (
          <span className="eyebrow mt-1 text-[10px]">{label}</span>
        )}
      </div>
    </div>
  );
}