import { motion } from "framer-motion";

interface DataPoint {
  label: string;
  value: number;
  highlight?: boolean;
}

interface Props {
  title?: string;
  unit?: string;
  data: DataPoint[];
  max?: number;
}

export function BarChart({ title, unit, data, max }: Props) {
  const computedMax = max ?? Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="w-full">
      {title && (
        <div className="flex items-baseline justify-between mb-4">
          <span className="eyebrow">{title}</span>
          {unit && <span className="data-figure text-xs text-muted-foreground">{unit}</span>}
        </div>
      )}
      <div className="flex items-end gap-2 sm:gap-3 h-40">
        {data.map((d, i) => {
          const h = (d.value / computedMax) * 100;
          return (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-2">
              <div className="relative w-full h-full flex items-end">
                <motion.div
                  className="w-full rounded-t-md relative overflow-hidden"
                  style={{
                    background: d.highlight
                      ? "linear-gradient(180deg, #14B8A6, #0D9488)"
                      : "linear-gradient(180deg, #3A8DE0, #1E5FA0)",
                    boxShadow: d.highlight
                      ? "0 0 16px rgba(20,184,166,0.45)"
                      : "0 0 12px rgba(58,141,224,0.35)",
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 0.9, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="absolute inset-0 shimmer pointer-events-none" />
                </motion.div>
              </div>
              <span className="data-figure text-[10px] text-muted-foreground whitespace-nowrap">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}