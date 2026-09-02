import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  height?: number;
  showAxis?: boolean;
  variant?: "primary" | "accent";
}

export function EkgWave({ className, height = 56, showAxis = true, variant = "primary" }: Props) {
  const [seed, setSeed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSeed((s) => s + 1), 2200);
    return () => clearInterval(t);
  }, []);

  const stroke = variant === "primary" ? "#3A8DE0" : "#14B8A6";
  const glow = variant === "primary" ? "rgba(58,141,224,0.55)" : "rgba(20,184,166,0.55)";

  // EKG-style path: flat baseline, sharp QRS complex, recovery
  const buildPath = (offset: number) => {
    const w = 600;
    const mid = height / 2;
    let d = `M 0 ${mid}`;
    const reps = 5;
    const segW = w / reps;
    for (let i = 0; i < reps; i++) {
      const x = i * segW;
      d += ` L ${x + 5} ${mid}`;
      d += ` L ${x + 8} ${mid - 2}`;
      d += ` L ${x + 11} ${mid + 1}`;
      d += ` L ${x + 16} ${mid + 4}`;
      d += ` L ${x + 20} ${mid - height * 0.42}`;
      d += ` L ${x + 24} ${mid + height * 0.18}`;
      d += ` L ${x + 27} ${mid - height * 0.7}`;
      d += ` L ${x + 30} ${mid + height * 0.45}`;
      d += ` L ${x + 34} ${mid - height * 0.18}`;
      d += ` L ${x + 38} ${mid + 2}`;
      d += ` L ${x + 44} ${mid}`;
      d += ` L ${x + segW} ${mid}`;
    }
    return d;
  };

  return (
    <div className={cn("relative w-full overflow-hidden", className)} style={{ height }}>
      {showAxis && (
        <>
          <div className="absolute inset-x-0 top-1/2 h-px bg-bio-border/40" />
          <div className="absolute inset-y-0 left-1/4 w-px bg-bio-border/30" />
          <div className="absolute inset-y-0 left-2/4 w-px bg-bio-border/30" />
          <div className="absolute inset-y-0 left-3/4 w-px bg-bio-border/30" />
        </>
      )}
      <svg
        viewBox={`0 0 600 ${height}`}
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <linearGradient id={`ekg-grad-${variant}`} x1="0" x2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0" />
            <stop offset="50%" stopColor={stroke} stopOpacity="1" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
          <filter id={`ekg-glow-${variant}`}>
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>
        <motion.path
          key={seed}
          d={buildPath(0)}
          fill="none"
          stroke={`url(#ekg-grad-${variant})`}
          strokeWidth="1.6"
          strokeLinejoin="round"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
        />
      </svg>
    </div>
  );
}