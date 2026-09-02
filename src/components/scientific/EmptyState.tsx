import { motion } from "framer-motion";

interface Props {
  variant?: "queue" | "timeline" | "documents" | "general";
  className?: string;
}

/**
 * Custom MedTech/Biotech empty-state illustration.
 * A floating "research vial" / abstract data chamber motif that conveys
 * "ready to receive data" rather than emptiness.
 */
export function EmptyState({ variant = "general", className }: Props) {
  const accents = {
    queue: ["#3A8DE0", "#14B8A6"],
    timeline: ["#14B8A6", "#A78BFA"],
    documents: ["#F59E0B", "#3A8DE0"],
    general: ["#3A8DE0", "#14B8A6"],
  } as const;
  const [a, b] = accents[variant];

  return (
    <div className={`relative w-48 h-48 mx-auto ${className ?? ""}`} aria-hidden>
      {/* Background grid */}
      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full opacity-30">
        <defs>
          <pattern id="empty-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(58,141,224,0.18)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#empty-grid)" />
      </svg>

      {/* Soft halo */}
      <div
        className="absolute inset-8 rounded-full blur-2xl opacity-30 animate-data-pulse"
        style={{ background: `radial-gradient(circle, ${a}, transparent 70%)` }}
      />

      {/* Central orb */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${a}, ${b})`,
          boxShadow: `0 0 32px ${a}80, inset 0 0 18px ${b}80`,
        }}
        animate={{ scale: [1, 1.05, 1], rotate: [0, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-2 rounded-full border border-white/40" />
        <div className="absolute inset-4 rounded-full border border-white/25" />
      </motion.div>

      {/* Orbiting dots */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32"
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      >
        <span
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
          style={{ background: a, boxShadow: `0 0 10px ${a}` }}
        />
        <span
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full"
          style={{ background: b, boxShadow: `0 0 8px ${b}` }}
        />
      </motion.div>

      {/* Outer orbit */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44"
        animate={{ rotate: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      >
        <span
          className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-1.5 h-1.5 rounded-full"
          style={{ background: b, boxShadow: `0 0 8px ${b}` }}
        />
        <span
          className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
          style={{ background: a, boxShadow: `0 0 6px ${a}` }}
        />
      </motion.div>

      {/* Corner ticks */}
      {[
        "top-2 left-2",
        "top-2 right-2",
        "bottom-2 left-2",
        "bottom-2 right-2",
      ].map((pos, i) => (
        <span
          key={i}
          className={`absolute ${pos} w-3 h-3 border border-trust-500/40`}
          style={{
            borderTopWidth: pos.includes("top") ? "1.5px" : 0,
            borderBottomWidth: pos.includes("bottom") ? "1.5px" : 0,
            borderLeftWidth: pos.includes("left") ? "1.5px" : 0,
            borderRightWidth: pos.includes("right") ? "1.5px" : 0,
          }}
        />
      ))}
    </div>
  );
}