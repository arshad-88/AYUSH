import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Hotspot {
  id: string;
  /** CSS positioned relative to the heart asset (top/left). */
  top: string;
  left: string;
  /** Visual + clinical label. */
  label: string;
  /** Short clinical fact revealed on hover/click. */
  fact: string;
  /** Status accent. */
  accent: "stable" | "warning" | "critical" | "info";
  /** Optional numeric metric (e.g. "72 BPM") shown in the tooltip. */
  metric?: { label: string; value: string };
}

interface Props {
  className?: string;
  size?: number;
  hotspots?: Hotspot[];
}

/**
 * The interactive counterpart to AnatomicalHeart — the same parallax
 * webp rendering, but with clickable / hoverable anatomical hotspots
 * that surface real clinical data. Use this in cardiology / cardiac
 * health contexts (Patient Detail, Doctor Dashboard vitals, etc.).
 *
 * - Pointer parallax tilts the asset.
 * - Hotspots reveal tooltips on hover or focus.
 * - Status-colored accent ring signals stable / warning / critical.
 * - Fully keyboard accessible: hotspots are focusable buttons.
 */
export function AnatomicalHeartDetail({
  className,
  size = 520,
  hotspots,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [activeId, setActiveId] = useState<string | null>(null);

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

  const accentRing = (a: Hotspot["accent"]) => {
    switch (a) {
      case "stable":
        return "rgba(74, 222, 128, 0.95)";
      case "warning":
        return "rgba(245, 158, 11, 0.95)";
      case "critical":
        return "rgba(239, 68, 68, 0.95)";
      default:
        return "rgba(58, 141, 224, 0.95)";
    }
  };

  const defaultHotspots: Hotspot[] = [
    {
      id: "aorta",
      top: "8%",
      left: "62%",
      label: "Aorta",
      fact: "Largest artery. Carries oxygenated blood from the left ventricle to the body.",
      accent: "info",
      metric: { label: "PRESSURE", value: "120/80" },
    },
    {
      id: "left-ventricle",
      top: "44%",
      left: "28%",
      label: "Left Ventricle",
      fact: "Main pumping chamber. Wall thickness correlates with cardiac risk.",
      accent: "stable",
      metric: { label: "EF", value: "62%" },
    },
    {
      id: "right-ventricle",
      top: "56%",
      left: "12%",
      label: "Right Ventricle",
      fact: "Pumps deoxygenated blood to the lungs via the pulmonary artery.",
      accent: "info",
      metric: { label: "EF", value: "58%" },
    },
    {
      id: "apex",
      top: "78%",
      left: "58%",
      label: "Apex",
      fact: "Inferior tip of the heart. Apex beat is a key clinical landmark.",
      accent: "stable",
    },
    {
      id: "coronary",
      top: "30%",
      left: "78%",
      label: "Coronary",
      fact: "Supplies the myocardium. Stenosis here drives ischemic chest pain.",
      accent: "warning",
      metric: { label: "CALCIUM", value: "+42" },
    },
  ];

  const items = hotspots ?? defaultHotspots;

  return (
    <div
      ref={wrapRef}
      className={`relative ${className ?? ""}`}
      style={{ perspective: 1200, width: "100%", height: "100%" }}
      role="img"
      aria-label="Interactive anatomical heart with clinical hotspots"
    >
      {/* Atmospheric radial backdrop — harmonized with the trust/teal palette. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(20,184,166,0.18) 0%, rgba(58,141,224,0.10) 35%, transparent 72%)",
          filter: "blur(22px)",
        }}
      />

      {/* Heart with parallax tilt */}
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: "spring", stiffness: 120, damping: 18, mass: 0.6 }}
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      >
        <img
          src="/heart-1.webp"
          alt="Anatomical human heart — 3D rendered with clinical hotspots"
          draggable={false}
          className="relative z-10 w-full h-full object-contain select-none pointer-events-none"
          style={{
            filter:
              "drop-shadow(0 30px 60px rgba(20, 184, 166, 0.30)) drop-shadow(0 8px 18px rgba(0,0,0,0.7))",
          }}
        />

        <div
          aria-hidden
          className="absolute inset-0 z-20 pointer-events-none mix-blend-screen opacity-50"
          style={{
            background:
              "radial-gradient(ellipse at 35% 25%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 45%)",
          }}
        />

        <div
          aria-hidden
          className="absolute inset-0 z-0 pointer-events-none animate-data-pulse"
          style={{
            background:
              "radial-gradient(circle at 50% 55%, rgba(252,165,165,0.16) 0%, transparent 55%)",
            filter: "blur(28px)",
          }}
        />
      </motion.div>

      {/* Hotspot layer */}
      <div className="absolute inset-0 z-30">
        {items.map((spot, idx) => {
          const isActive = activeId === spot.id;
          const color = accentRing(spot.accent);
          return (
            <div
              key={spot.id}
              className="absolute"
              style={{ top: spot.top, left: spot.left }}
            >
              <button
                type="button"
                aria-label={`${spot.label} hotspot`}
                onMouseEnter={() => setActiveId(spot.id)}
                onMouseLeave={() => setActiveId(null)}
                onFocus={() => setActiveId(spot.id)}
                onBlur={() => setActiveId(null)}
                onClick={() =>
                  setActiveId((current) => (current === spot.id ? null : spot.id))
                }
                className="relative block w-5 h-5 rounded-full cursor-magnetic press-shrink focus-visible:outline-none"
                style={{
                  background: color,
                  boxShadow: `0 0 0 4px ${color.replace("0.95", "0.18")}, 0 0 14px ${color}`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: color,
                    opacity: 0.6,
                    animation: isActive ? "dataPointPing 1.4s ease-out infinite" : undefined,
                  }}
                />
              </button>

              {/* Label pill (always visible) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: idx % 2 === 0 ? 12 : -12,
                }}
                transition={{ delay: 0.4 + idx * 0.08, duration: 0.5 }}
                className={`absolute top-1/2 -translate-y-1/2 ${
                  idx % 2 === 0 ? "left-3" : "right-3"
                } pointer-events-none`}
              >
                <div className="lab-card-floating px-2.5 py-1 flex items-center gap-2">
                  <span
                    className="block w-1.5 h-1.5 rounded-full"
                    style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                  />
                  <span
                    className="data-figure text-[9px] tracking-widest font-semibold whitespace-nowrap"
                    style={{ color }}
                  >
                    {spot.label}
                  </span>
                </div>
              </motion.div>

              {/* Detail tooltip (active only) */}
              {isActive && (
                <motion.div
                  role="tooltip"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className={`absolute top-1/2 -translate-y-1/2 ${
                    idx % 2 === 0 ? "left-10" : "right-10"
                  } z-40 lab-card-floating p-4 w-64`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="eyebrow text-[9px]"
                      style={{ color }}
                    >
                      {spot.label.toUpperCase()}
                    </span>
                    <span
                      className="data-figure text-[9px] tracking-widest px-1.5 py-0.5 rounded border"
                      style={{
                        color,
                        borderColor: color.replace("0.95", "0.4"),
                        background: color.replace("0.95", "0.10"),
                      }}
                    >
                      {spot.accent.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {spot.fact}
                  </p>
                  {spot.metric && (
                    <div className="mt-3 flex items-center justify-between rounded-md bg-bio-base/60 border border-trust-500/20 px-3 py-2">
                      <span className="data-figure text-[10px] tracking-widest text-muted-foreground">
                        {spot.metric.label}
                      </span>
                      <span
                        className="data-figure-lg text-base font-bold"
                        style={{ color }}
                      >
                        {spot.metric.value}
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* BPM badge */}
      <div className="absolute bottom-6 left-6 z-30 pointer-events-none">
        <div className="lab-card-floating px-4 py-3 flex items-center gap-3">
          <span className="relative flex w-2.5 h-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-mint-500 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-mint-500" />
          </span>
          <div>
            <div className="eyebrow text-[9px]">HEART RATE</div>
            <div className="data-figure-lg text-xl font-bold text-mint-400 leading-none mt-1">
              72 <span className="text-[10px] text-muted-foreground ml-1">BPM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hotspot hint */}
      <div className="absolute bottom-6 right-6 z-30 pointer-events-none">
        <div className="lab-card-floating px-3 py-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-trust-400 animate-data-pulse" />
          <span className="data-figure text-[9px] tracking-widest text-trust-300">
            HOVER · HOTSPOTS
          </span>
        </div>
      </div>
    </div>
  );
}