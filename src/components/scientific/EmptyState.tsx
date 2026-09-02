import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Inbox } from "lucide-react";

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  variant?: "primary" | "outline";
}

interface Props {
  variant?: "queue" | "timeline" | "documents" | "general";
  className?: string;
  title?: string;
  description?: string;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  showActions?: boolean;
}

/**
 * Custom MedTech/Biotech empty-state illustration.
 * A floating "research vial" / abstract data chamber motif that conveys
 * "ready to receive data" rather than emptiness.
 *
 * Title, description and CTAs are optional. When provided, the illustration
 * sits above a heading block and one or two action buttons so users always
 * have a clear next step.
 */
export function EmptyState({
  variant = "general",
  className,
  title,
  description,
  primaryAction,
  secondaryAction,
  showActions,
}: Props) {
  const accents = {
    queue: ["#3A8DE0", "#14B8A6"],
    timeline: ["#14B8A6", "#A78BFA"],
    documents: ["#F59E0B", "#3A8DE0"],
    general: ["#3A8DE0", "#14B8A6"],
  } as const;
  const [a, b] = accents[variant];

  const renderActions = showActions ?? Boolean(primaryAction || secondaryAction);

  return (
    <div className={`flex flex-col items-center text-center ${className ?? ""}`}>
      <div className="relative w-48 h-48 mx-auto" aria-hidden>
        {/* Background grid */}
        <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full opacity-30">
          <defs>
            <pattern id={`empty-grid-${variant}`} width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(58,141,224,0.18)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="200" height="200" fill={`url(#empty-grid-${variant})`} />
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

      {(title || description) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mt-8 max-w-md"
        >
          {title && (
            <h3 className="text-lg font-bold tracking-tight-x text-foreground inline-flex items-center gap-2">
              <Inbox className="w-4 h-4 text-trust-300" />
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{description}</p>
          )}
        </motion.div>
      )}

      {renderActions && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          {primaryAction && (
            <button
              type="button"
              onClick={primaryAction.onClick}
              className={`group/btn inline-flex items-center justify-center gap-2 rounded-lg font-semibold tracking-tight
                h-10 px-5 text-sm overflow-hidden press-shrink cursor-magnetic btn-press-ripple
                transition-[background-color,border-color,box-shadow] duration-300 ease-out
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background
                ${
                  primaryAction.variant === "outline"
                    ? "bg-transparent text-foreground border border-trust-500/30 hover:bg-trust-500/10 hover:border-trust-500/50"
                    : "bg-gradient-to-r from-trust-500 via-trust-400 to-teal-500 text-white border-0 hover:from-trust-400 hover:via-trust-300 hover:to-teal-400 glow-primary"
                }`}
            >
              <span className="icon-nudge-hover inline-flex">{primaryAction.icon}</span>
              <span className="relative">{primaryAction.label}</span>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-900 ease-out"
              />
            </button>
          )}
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className={`group/btn inline-flex items-center justify-center gap-2 rounded-lg font-semibold tracking-tight
                h-10 px-5 text-sm overflow-hidden press-shrink cursor-magnetic btn-press-ripple
                transition-[background-color,border-color,box-shadow] duration-300 ease-out
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background
                bg-transparent text-foreground border border-trust-500/30 hover:bg-trust-500/10 hover:border-trust-500/50`}
            >
              <span className="relative">{secondaryAction.icon}</span>
              <span className="relative">{secondaryAction.label}</span>
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}