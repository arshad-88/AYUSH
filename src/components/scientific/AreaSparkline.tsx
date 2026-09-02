import { motion } from "framer-motion";

interface Props {
  values: number[];
  max?: number;
  height?: number;
  variant?: "primary" | "accent";
  showFill?: boolean;
}

export function AreaSparkline({
  values,
  max = 100,
  height = 80,
  variant = "primary",
  showFill = true,
}: Props) {
  const w = 240;
  const h = height;
  const stroke = variant === "primary" ? "#3A8DE0" : "#14B8A6";
  const fillFrom = variant === "primary" ? "rgba(58,141,224,0.30)" : "rgba(20,184,166,0.30)";
  const fillTo = variant === "primary" ? "rgba(58,141,224,0)" : "rgba(20,184,166,0)";

  const step = w / Math.max(values.length - 1, 1);
  const points = values.map((v, i) => {
    const x = i * step;
    const y = h - (Math.min(v, max) / max) * (h - 8) - 4;
    return [x, y] as const;
  });

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L ${w} ${h} L 0 ${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`area-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillFrom} />
          <stop offset="100%" stopColor={fillTo} />
        </linearGradient>
      </defs>
      {showFill && (
        <motion.path
          d={areaPath}
          fill={`url(#area-${variant})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
      )}
      <motion.path
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        style={{ filter: `drop-shadow(0 0 6px ${stroke}80)` }}
      />
      {points.map(([x, y], i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r={2}
          fill={stroke}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 + i * 0.04 }}
        />
      ))}
    </svg>
  );
}