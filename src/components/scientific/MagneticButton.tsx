import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ButtonHTMLAttributes, ReactNode, useRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "ghost" | "outline" | "danger";

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  icon?: ReactNode;
  size?: "sm" | "md" | "lg";
  strength?: number;
}

/**
 * Magnetic-style button with subtle 3D tracking + gradient sheen + press feedback.
 * Pointer position pulls the inner content slightly toward the cursor within
 * a small radius; on release it returns to center with a spring.
 */
export function MagneticButton({
  children,
  className,
  variant = "primary",
  icon,
  size = "md",
  strength = 14,
  ...rest
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.5 });
  const rotX = useTransform(sy, [-strength, strength], [3, -3]);
  const rotY = useTransform(sx, [-strength, strength], [-3, 3]);

  const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const px = e.clientX - (r.left + r.width / 2);
    const py = e.clientY - (r.top + r.height / 2);
    const dx = (px / (r.width / 2)) * strength;
    const dy = (py / (r.height / 2)) * strength;
    x.set(dx);
    y.set(dy);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  const sizeClass =
    size === "sm"
      ? "h-9 px-4 text-sm"
      : size === "lg"
        ? "h-12 px-7 text-base"
        : "h-10 px-5 text-sm";

  const variantClass =
    variant === "primary"
      ? "bg-gradient-to-r from-trust-500 to-teal-500 text-white border-0 hover:from-trust-400 hover:to-teal-400 glow-primary"
      : variant === "accent"
        ? "bg-gradient-to-r from-teal-500 to-mint-500 text-bio-base border-0 hover:from-teal-400 hover:to-mint-400 glow-accent"
        : variant === "ghost"
          ? "bg-transparent text-foreground/80 hover:bg-trust-500/10 hover:text-foreground border-0"
          : variant === "danger"
            ? "bg-red-urgent/15 text-red-critical border border-red-urgent/40 hover:bg-red-urgent/25"
            : "bg-transparent text-foreground border border-trust-500/30 hover:bg-trust-500/10 hover:border-trust-500/50";

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-lg font-semibold tracking-tight",
        "transition-[background-color,border-color,box-shadow] duration-300 ease-out",
        "overflow-hidden press-shrink cursor-magnetic",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        sizeClass,
        variantClass,
        className,
      )}
      style={{ transformStyle: "preserve-3d" }}
      {...(rest as any)}
    >
      <motion.span
        className="relative z-10 flex items-center gap-2"
        style={{ x: sx, y: sy, rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
      >
        {icon}
        {children}
      </motion.span>

      {/* Specular sheen overlay */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 ease-out"
      />

      {/* Variant-specific underline accent */}
      {(variant === "primary" || variant === "accent") && (
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
        />
      )}
    </motion.button>
  );
}