import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Props {
  text: string;
  className?: string;
  speed?: number;
  align?: "left" | "center";
}

export function ScanText({ text, className, speed = 1.2, align = "left" }: Props) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), text.length * 35 + 600);
    return () => clearTimeout(t);
  }, [text]);

  return (
    <span
      className={`inline-flex flex-wrap ${align === "center" ? "justify-center" : ""} ${className ?? ""}`}
    >
      {text.split("").map((ch, i) => (
        <motion.span
          key={`${ch}-${i}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: i * 0.025 * speed }}
          className="inline-block"
        >
          {ch === " " ? "\u00A0" : ch}
        </motion.span>
      ))}
      {!done && (
        <motion.span
          className="ml-0.5 inline-block w-[2px] h-[1em] align-middle bg-trust-400"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.9, repeat: Infinity }}
        />
      )}
    </span>
  );
}