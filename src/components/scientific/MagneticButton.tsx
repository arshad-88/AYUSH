import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ButtonHTMLAttributes, ReactNode, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  icon?: ReactNode;
  iconRight?: ReactNode;
  size?: Size;
  strength?: number;
  showRipple?: boolean;
}

/**
 * Magnetic-style button with subtle 3D tracking, gradient sheen, and press ripple.
 * Pointer position pulls the inner content slightly toward the cursor within a
 * small radius; on release it returns to center with a spring.
 * - Press ripple expands from the cursor point for tactile feedback.
 * - Icon rotates 90° on hover for subtle visual interest.
 * - Sheen sweep travels across the surface on hover.
 */
export function MagneticButton({
  children,
  className,
  variant = "primary",
  icon,
  iconRight,
  size = "md",
  strength = 14,
  showRipple = true,
  ...rest
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.5 });
  const rotX = useTransform(sy, [-strength, strength], [3, -3]);
  const rotY = useTransform(sx, [-strength, strength], [-3, 3]);
  const [ripple, setRipple] = useState<{ x: number; y: number; key: number } | null>(null);

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
  const onPress = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!showRipple) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setRipple({
      x: e.clientX - r.left,
      y: e.clientY - r.top,
      key: Date.now(),
    });
  };

  const sizeClass =
    size === "sm"
      ? "h-9 px-4 text-[13px]"
      : size === "lg"
        ? "h-12 px-7 text-[15px]"
        : "h-10 px-5 text-sm";

  const variantClass =
    variant === "primary"
      ? "bg-gradient-to-r from-trust-500 via-trust-400 to-teal-500 text-white border-0 hover:from-trust-400 hover:via-trust-300 hover:to-teal-400 glow-primary"
      : variant === "accent"
        ? "bg-gradient-to-r from-teal-500 to-mint-500 text-bio-base border-0 hover:from-teal-400 hover:to-mint-400 glow-accent"
        : variant === "ghost"
          ? "bg-transparent text-foreground/80 hover:bg-trust-500/10 hover:text-foreground border-0"
          : variant === "danger"
            ? "bg-red-urgent/15 text-red-critical border border-red-urgent/40 hover:bg-red-urgent/25 hover:border-red-urgent/70"
            : "bg-transparent text-foreground border border-trust-500/30 hover:bg-trust-500/10 hover:border-trust-500/50";

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onMouseDown={onPress}
      whileTap={{ scale: 0.96 }}
      className={cn(
        "group/btn relative inline-flex items-center justify-center gap-2 rounded-lg font-semibold tracking-tight",
        "transition-[background-color,border-color,box-shadow] duration-300 ease-out",
        "overflow-hidden press-shrink cursor-magnetic btn-press-ripple",
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
        {icon && <span className="icon-spin-hover inline-flex">{icon}</span>}
        {children}
        {iconRight && <span className="icon-nudge-hover inline-flex">{iconRight}</span>}
      </motion.span>

      {/* Specular sheen overlay */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-900 ease-out"
      />

      {/* Press ripple */}
      {ripple && (
        <span
          key={ripple.key}
          aria-hidden
          className="pointer-events-none absolute rounded-full"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
            background:
              variant === "primary" || variant === "accent"
                ? "radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 70%)"
                : "radial-gradient(circle, rgba(58,141,224,0.45) 0%, rgba(58,141,224,0) 70%)",
            animation: "rippleExpand 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            transform: "translate(-50%, -50%)",
          }}
        />
      )}

      {/* Variant-specific underline accent */}
      {(variant === "primary" || variant === "accent") && (
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
        />
      )}
    </motion.button>
  );
}