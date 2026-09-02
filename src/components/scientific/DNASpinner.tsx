import { cn } from "@/lib/utils";

interface Props {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export function DNASpinner({ size = "md", className, label }: Props) {
  const dim = size === "sm" ? 28 : size === "lg" ? 56 : 40;
  const r = dim / 2 - 2;
  const c = 2 * Math.PI * r;
  const dash = c * 0.55;

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div
        className="relative animate-helix"
        style={{ width: dim, height: dim }}
      >
        <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
          <defs>
            <linearGradient id="dna-a" x1="0" x2="1">
              <stop offset="0%" stopColor="#3A8DE0" stopOpacity="0" />
              <stop offset="50%" stopColor="#3A8DE0" stopOpacity="1" />
              <stop offset="100%" stopColor="#3A8DE0" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="dna-b" x1="0" x2="1">
              <stop offset="0%" stopColor="#14B8A6" stopOpacity="0" />
              <stop offset="50%" stopColor="#14B8A6" stopOpacity="1" />
              <stop offset="100%" stopColor="#14B8A6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            fill="none"
            stroke="url(#dna-a)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c - dash}`}
          />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={r - 4}
            fill="none"
            stroke="url(#dna-b)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c - dash}`}
            transform={`rotate(60 ${dim / 2} ${dim / 2})`}
          />
          <circle cx={dim / 2} cy={dim / 2} r={2.5} fill="#3A8DE0" />
        </svg>
      </div>
      {label && <span className="data-figure text-sm text-muted-foreground">{label}</span>}
    </div>
  );
}