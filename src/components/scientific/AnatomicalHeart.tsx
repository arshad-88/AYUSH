import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  className?: string;
  size?: number;
}

/**
 * Anatomical heart rendered from a high-quality webp asset with a parallax
 * tilt that responds to pointer position. Specular overlays and a subtle
 * ambient pulse convey biological vitality. The asset is the only source of
 * truth for surface detail — overlay layers add atmosphere without obscuring it.
 */
export function AnatomicalHeart({ className, size = 520 }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      setTilt({ x: dy * -8, y: dx * 10 });
    };
    const onLeave = () => setTilt({ x: 0, y: 0 });
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`relative ${className ?? ""}`}
      style={{ perspective: 1200, width: "100%", height: "100%" }}
    >
      {/* Atmospheric radial backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(220,38,38,0.18) 0%, rgba(58,141,224,0.10) 35%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      {/* Heart with parallax tilt */}
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: "spring", stiffness: 120, damping: 18, mass: 0.6 }}
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      >
        {/* Main webp asset */}
        <img
          src="/heart-1.webp"
          alt="Anatomical human heart — 3D rendered"
          draggable={false}
          className="relative z-10 w-full h-full object-contain select-none pointer-events-none"
          style={{
            filter: "drop-shadow(0 30px 60px rgba(220, 38, 38, 0.45)) drop-shadow(0 8px 18px rgba(0,0,0,0.7))",
          }}
        />

        {/* Specular highlight pass */}
        <div
          aria-hidden
          className="absolute inset-0 z-20 pointer-events-none mix-blend-screen opacity-50"
          style={{
            background:
              "radial-gradient(ellipse at 35% 25%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 45%)",
          }}
        />

        {/* Subtle pulse glow */}
        <div
          aria-hidden
          className="absolute inset-0 z-0 pointer-events-none animate-data-pulse"
          style={{
            background:
              "radial-gradient(circle at 50% 55%, rgba(252,165,165,0.30) 0%, transparent 55%)",
            filter: "blur(28px)",
          }}
        />
      </motion.div>

      {/* Floating annotation tags */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        <Annotation top="12%" left="78%" label="AORTA" accent="#FCA5A5" />
        <Annotation top="38%" left="10%" label="VENTRICLE" accent="#3A8DE0" />
        <Annotation top="70%" left="82%" label="APEX" accent="#14B8A6" />
      </div>

      {/* BPM badge */}
      <div className="absolute bottom-6 left-6 z-30">
        <div className="lab-card-floating px-4 py-3 flex items-center gap-3 card-sheen">
          <span className="relative flex w-2.5 h-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-critical opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-critical" />
          </span>
          <div>
            <div className="eyebrow text-[9px]">HEART RATE</div>
            <div className="data-figure-lg text-xl font-bold text-red-critical leading-none mt-1">
              72 <span className="text-[10px] text-muted-foreground ml-1">BPM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Annotation({
  top,
  left,
  label,
  accent,
}: {
  top: string;
  left: string;
  label: string;
  accent: string;
}) {
  return (
    <motion.div
      className="absolute"
      style={{ top, left }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6, duration: 0.6 }}
    >
      <div className="flex items-center gap-2">
        <span
          className="block w-2 h-2 rounded-full"
          style={{ background: accent, boxShadow: `0 0 10px ${accent}` }}
        />
        <div className="lab-card-floating px-2.5 py-1">
          <span
            className="data-figure text-[9px] tracking-widest"
            style={{ color: accent }}
          >
            {label}
          </span>
        </div>
      </div>
    </motion.div>
  );
}