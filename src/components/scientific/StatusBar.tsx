import { cn } from "@/lib/utils";
import { Activity, ShieldCheck, Radio } from "lucide-react";

interface Props {
  online?: boolean;
  sessionId?: string;
  latency?: string;
  className?: string;
}

export function StatusBar({ online = true, sessionId, latency, className }: Props) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 text-[10px] data-figure tracking-widest text-muted-foreground",
        className,
      )}
    >
      <span className="flex items-center gap-1.5">
        <span className={cn("w-1.5 h-1.5 rounded-full", online ? "dot-stable animate-blink-soft" : "dot-critical")} />
        {online ? "SYSTEM ONLINE" : "OFFLINE"}
      </span>
      {latency && (
        <span className="flex items-center gap-1.5">
          <Radio className="w-3 h-3" />
          {latency}
        </span>
      )}
      {sessionId && (
        <span className="flex items-center gap-1.5">
          <Activity className="w-3 h-3" />
          {sessionId}
        </span>
      )}
      <span className="flex items-center gap-1.5">
        <ShieldCheck className="w-3 h-3" />
        HIPAA / DISHA
      </span>
    </div>
  );
}