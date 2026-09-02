import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "warning" | "critical" | "stable" | "neutral";

const colorMap: Record<Variant, { stroke: string; fill: string; text: string }> = {
  primary: { stroke: "#3A8DE0", fill: "rgba(58, 141, 224, 0.15)", text: "#93C5FD" },
  accent: { stroke: "#14B8A6", fill: "rgba(20, 184, 166, 0.18)", text: "#5EEAD4" },
  warning: { stroke: "#F59E0B", fill: "rgba(245, 158, 11, 0.18)", text: "#FCD34D" },
  critical: { stroke: "#EF4444", fill: "rgba(239, 68, 68, 0.18)", text: "#FCA5A5" },
  stable: { stroke: "#22C55E", fill: "rgba(34, 197, 94, 0.18)", text: "#86EFAC" },
  neutral: { stroke: "#7C92AC", fill: "rgba(124, 146, 172, 0.16)", text: "#B8C6D8" },
};

interface Props {
  value: number;
  max?: number;
  label?: string;
  unit?: string;
  variant?: Variant;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  className?: string;
}

export function BiomarkerBar({
  value,
  max = 100,
  label,
  unit,
  variant = "primary",
  showValue = true,
  size = "md",
  pulse = false,
  className,
}: Props) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const c = colorMap[variant];

  const heightClass = size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2";

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex items-baseline justify-between mb-1.5">
          {label && (
            <span className="eyebrow tracking-widest">{label}</span>
          )}
          {showValue && (
            <span className="data-figure text-sm font-semibold" style={{ color: c.text }}>
              {value.toFixed(value < 10 ? 1 : 0)}
              {unit && <span className="text-[10px] ml-0.5 opacity-70">{unit}</span>}
            </span>
          )}
        </div>
      )}
      <div
        className={cn("w-full rounded-full overflow-hidden relative", heightClass)}
        style={{ background: c.fill }}
      >
        <motion.div
          className="h-full rounded-full relative overflow-hidden"
          style={{
            background: `linear-gradient(90deg, ${c.stroke}, ${c.text})`,
            boxShadow: `0 0 12px ${c.stroke}80`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {pulse && (
            <span
              className="absolute inset-0 animate-data-pulse"
              style={{ background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)` }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}