import { useEffect, useRef, useState } from "react";

/**
 * Custom MedTech cursor with crosshair ring + soft dot.
 * - Dot follows pointer 1:1 (60fps).
 * - Ring eases toward pointer with a spring-like lag.
 * - On hover over interactive elements, both grow/shrink and glow stronger.
 * - Pressing the mouse collapses the ring for tactile feedback.
 * - Hidden on touch / coarse-pointer devices via CSS.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasCoarse = window.matchMedia("(pointer: coarse)").matches;
    if (hasCoarse) return;

    document.documentElement.classList.add("has-custom-cursor");
    setActive(true);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      }
    };
    const onDown = () => {
      dotRef.current?.classList.add("is-press");
      ringRef.current?.classList.add("is-press");
    };
    const onUp = () => {
      dotRef.current?.classList.remove("is-press");
      ringRef.current?.classList.remove("is-press");
    };
    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest(
        'a, button, [role="button"], input, textarea, select, [data-cursor="hover"], .cursor-magnetic',
      );
      if (interactive) {
        dotRef.current?.classList.add("is-hover");
        ringRef.current?.classList.add("is-hover");
      }
    };
    const onOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest(
        'a, button, [role="button"], input, textarea, select, [data-cursor="hover"], .cursor-magnetic',
      );
      if (interactive) {
        dotRef.current?.classList.remove("is-hover");
        ringRef.current?.classList.remove("is-hover");
      }
    };
    const tick = () => {
      const ease = 0.18;
      ringX += (mouseX - ringX) * ease;
      ringY += (mouseY - ringY) * ease;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mouseout", onOut, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  if (!active) return null;

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true">
        <span className="cross-l" />
        <span className="cross-r" />
      </div>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}