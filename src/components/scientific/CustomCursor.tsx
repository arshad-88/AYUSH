import { useEffect, useRef } from "react";

type CursorMode = "default" | "hover" | "press" | "text" | "drag" | "disabled" | "magnetic";

const MODE_CLASSES: Record<CursorMode, string> = {
  default: "",
  hover: "is-hover",
  press: "is-press",
  text: "is-text",
  drag: "is-drag",
  disabled: "is-disabled",
  magnetic: "is-magnetic",
};

/**
 * Custom MedTech cursor with crosshair ring + soft dot.
 * Modes: default, hover, press, text (caret on inputs), drag (dashed ring),
 *        disabled (muted), magnetic (pulsing dashed ring for CTA buttons).
 * The dot follows pointer 1:1; the ring eases toward pointer with a spring lag.
 * Hidden on touch / coarse-pointer devices via CSS.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<CursorMode>("default");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.documentElement.classList.add("has-custom-cursor");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let raf = 0;

    const setMode = (next: CursorMode) => {
      if (modeRef.current === next) return;
      modeRef.current = next;
      const dot = dotRef.current;
      const ring = ringRef.current;
      if (!dot || !ring) return;
      Object.values(MODE_CLASSES).forEach((c) => {
        if (c) {
          dot.classList.remove(c);
          ring.classList.remove(c);
        }
      });
      if (MODE_CLASSES[next]) {
        dot.classList.add(MODE_CLASSES[next]);
        ring.classList.add(MODE_CLASSES[next]);
      }
    };

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      }
    };

    const onDown = () => setMode(modeRef.current === "magnetic" ? "magnetic" : "press");
    const onUp = () => setMode(modeRef.current === "press" ? "default" : modeRef.current);

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const magnetic = target.closest(".cursor-magnetic");
      if (magnetic) {
        setMode("magnetic");
        return;
      }
      const draggable = target.closest("[draggable='true'], [data-cursor='drag'], .cursor-drag");
      if (draggable) {
        setMode("drag");
        return;
      }
      const disabled = target.closest("[disabled], [aria-disabled='true'], .cursor-disabled");
      if (disabled) {
        setMode("disabled");
        return;
      }
      const text = target.closest(
        "input[type='text'], input[type='email'], input[type='search'], input[type='url'], input:not([type]), textarea, [contenteditable='true']",
      );
      if (text) {
        setMode("text");
        return;
      }
      const interactive = target.closest(
        'a, button, [role="button"], select, [data-cursor="hover"]',
      );
      if (interactive) {
        setMode("hover");
        return;
      }
      setMode("default");
    };

    const onLeaveWindow = () => {
      if (dotRef.current) dotRef.current.style.opacity = "0";
      if (ringRef.current) ringRef.current.style.opacity = "0";
    };
    const onEnterWindow = () => {
      if (dotRef.current) dotRef.current.style.opacity = "1";
      if (ringRef.current) ringRef.current.style.opacity = "1";
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
    document.addEventListener("mouseleave", onLeaveWindow);
    document.addEventListener("mouseenter", onEnterWindow);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeaveWindow);
      document.removeEventListener("mouseenter", onEnterWindow);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

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