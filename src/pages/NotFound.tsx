import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Dna, Search } from "lucide-react";
import { ParticleField } from "@/components/scientific";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col relative"
    >
      <ParticleField density="low" opacity={0.18} />
      <div className="absolute inset-0 surface-grid opacity-15 pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center relative px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto w-20 h-20 rounded-xl bg-gradient-to-br from-trust-500/20 to-teal-500/20 border border-trust-500/30 flex items-center justify-center mb-6 glow-primary">
            <Search className="w-10 h-10 text-trust-300" strokeWidth={1.6} />
            <span className="absolute -inset-0.5 rounded-xl border-2 border-trust-400/40 animate-data-pulse" />
          </div>
          <div className="data-figure text-[10px] tracking-widest text-mint-400 mb-2">
            ● SIGNAL LOST · 404
          </div>
          <h1 className="data-figure text-6xl font-bold text-trust-300 tracking-tight-x mb-2">
            404
          </h1>
          <p className="text-xl font-bold tracking-tight-x mb-2">
            Resource Not Found
          </p>
          <p className="data-figure text-[10px] text-muted-foreground tracking-widest mb-6">
            ENDPOINT NOT IN CLINICAL OS
          </p>
          <Button
            className="bg-gradient-to-r from-trust-500 to-teal-500 hover:from-trust-400 hover:to-teal-400 text-white border-0 glow-primary"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            <span className="data-figure tracking-wider">RETURN TO HOME</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}