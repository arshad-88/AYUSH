import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { usePatientStore } from "@/store/patientStore";
import { useConvexConsultation } from "@/hooks/useConvexConsultation";
import { Header } from "@/components/shared/Header";
import { StepProgress } from "@/components/shared/StepProgress";
import { Mic, Touchpad, ArrowRight, ArrowLeft, Activity } from "lucide-react";
import { useState } from "react";
import { StatusBar, ParticleField } from "@/components/scientific";

export default function InputMode() {
  const navigate = useNavigate();
  const { inputMode, setInputMode, setStep } = usePatientStore();
  const { persistConsultationUpdate } = useConvexConsultation();
  const [isSaving, setIsSaving] = useState(false);

  const handleContinue = async () => {
    if (!inputMode) return;
    setIsSaving(true);
    try {
      await persistConsultationUpdate({ inputMode });
      setStep("interview");
      navigate("/patient/interview");
    } catch (error) {
      console.error("Failed to save input mode:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <ParticleField density="low" opacity={0.18} />
      <div className="absolute inset-0 surface-grid opacity-15 pointer-events-none" />
      <Header />
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-8 relative">
        <div className="mb-6">
          <StepProgress currentStep="inputMode" completedSteps={["login", "consent", "language"]} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col"
        >
          <div className="lab-card lab-card-accent p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <StatusBar latency="42ms" sessionId="INPUT-MODE" />
            </div>
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 rounded-xl bg-gradient-to-br from-trust-500/20 to-teal-500/20 border border-trust-500/30 flex items-center justify-center mb-4 glow-primary">
                <Activity className="w-8 h-8 text-trust-300" strokeWidth={1.6} />
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="data-figure text-[10px] tracking-widest text-mint-400">● INTERACTION MODE</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight-x">
                How would you like to answer?
              </h2>
              <p className="data-figure text-[10px] text-muted-foreground tracking-widest mt-1">
                ASR · TTS · TOUCH · TYPE
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <motion.button
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setInputMode("voice")}
                className={`p-6 rounded-xl border transition-all flex flex-col items-center justify-center gap-4 text-center relative overflow-hidden ${
                  inputMode === "voice"
                    ? "border-trust-500/60 bg-trust-500/10 glow-primary"
                    : "border-trust-500/20 bg-bio-base/40 hover:border-trust-400/40 hover:bg-bio-elevated/60"
                }`}
              >
                {inputMode === "voice" && (
                  <span className="absolute inset-0 bg-gradient-to-br from-trust-500/15 via-transparent to-transparent animate-data-pulse pointer-events-none" />
                )}
                <div className={`relative w-16 h-16 rounded-full flex items-center justify-center ${
                  inputMode === "voice"
                    ? "bg-gradient-to-br from-trust-500 to-teal-500 text-white"
                    : "bg-trust-500/15 text-trust-300 border border-trust-500/30"
                }`}>
                  <Mic className="w-8 h-8" />
                  {inputMode === "voice" && (
                    <span className="absolute inset-0 rounded-full border-2 border-trust-400 animate-data-pulse" />
                  )}
                </div>
                <div className="relative">
                  <span className="data-figure text-[10px] tracking-widest text-muted-foreground block mb-1">
                    HANDS-FREE
                  </span>
                  <h3 className="font-bold text-lg tracking-tight-x">Voice</h3>
                  <p className="text-sm text-muted-foreground mt-1">Speak your answers naturally</p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setInputMode("touch")}
                className={`p-6 rounded-xl border transition-all flex flex-col items-center justify-center gap-4 text-center relative overflow-hidden ${
                  inputMode === "touch"
                    ? "border-teal-500/60 bg-teal-500/10 glow-accent"
                    : "border-trust-500/20 bg-bio-base/40 hover:border-teal-400/40 hover:bg-bio-elevated/60"
                }`}
              >
                {inputMode === "touch" && (
                  <span className="absolute inset-0 bg-gradient-to-br from-teal-500/15 via-transparent to-transparent animate-data-pulse pointer-events-none" />
                )}
                <div className={`relative w-16 h-16 rounded-full flex items-center justify-center ${
                  inputMode === "touch"
                    ? "bg-gradient-to-br from-teal-500 to-mint-500 text-bio-base"
                    : "bg-teal-500/15 text-teal-400 border border-teal-500/30"
                }`}>
                  <Touchpad className="w-8 h-8" />
                  {inputMode === "touch" && (
                    <span className="absolute inset-0 rounded-full border-2 border-teal-400 animate-data-pulse" />
                  )}
                </div>
                <div className="relative">
                  <span className="data-figure text-[10px] tracking-widest text-muted-foreground block mb-1">
                    PRECISION
                  </span>
                  <h3 className="font-bold text-lg tracking-tight-x">Touch</h3>
                  <p className="text-sm text-muted-foreground mt-1">Tap to select options and type</p>
                </div>
              </motion.button>
            </div>

            <div className="flex items-center justify-between mt-8 pt-8 border-t border-trust-500/15">
              <Button variant="ghost" onClick={() => navigate(-1)} className="hover:bg-trust-500/10">
                <ArrowLeft className="mr-2 w-4 h-4" />
                <span className="data-figure tracking-wider">BACK</span>
              </Button>
              <Button
                className="bg-gradient-to-r from-trust-500 to-teal-500 hover:from-trust-400 hover:to-teal-400 text-white border-0 min-w-[140px] glow-primary"
                onClick={handleContinue}
                disabled={!inputMode || isSaving}
              >
                Continue
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
