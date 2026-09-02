import { useEffect, useState } from "react";

interface Props {
  value: number;
  decimals?: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

/**
 * Animated number readout with tabular-figure monospace numerals.
 * Uses requestAnimationFrame easing so the value smoothly ticks toward target.
 */
export function AnimatedNumber({
  value,
  decimals = 0,
  duration = 900,
  suffix = "",
  prefix = "",
  className,
}: Props) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const initial = display;
    const delta = value - initial;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(initial + delta * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return (
    <span className={`data-figure ${className ?? ""}`}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}