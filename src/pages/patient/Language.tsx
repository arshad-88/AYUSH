import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { usePatientStore } from "@/store/patientStore";
import { useConvexConsultation } from "@/hooks/useConvexConsultation";
import { Header } from "@/components/shared/Header";
import { StepProgress } from "@/components/shared/StepProgress";
import { Languages, ArrowRight, Check, Globe } from "lucide-react";
import { demoLanguages } from "@/data/demoData";
import { useState } from "react";
import { StatusBar, ParticleField } from "@/components/scientific";

export default function Language() {
  const navigate = useNavigate();
  const { language, setLanguage, setStep } = usePatientStore();
  const { persistConsultationUpdate } = useConvexConsultation();
  const [isSaving, setIsSaving] = useState(false);

  const handleContinue = async () => {
    if (!language) return;
    setIsSaving(true);
    try {
      await persistConsultationUpdate({ language });
      setStep("inputMode");
      navigate("/patient/input-mode");
    } catch (error) {
      console.error("Failed to save language:", error);
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
          <StepProgress currentStep="language" completedSteps={["login", "consent"]} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col"
        >
          <div className="lab-card lab-card-accent p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <StatusBar latency="42ms" sessionId="LANG-SELECT" />
            </div>
            <div className="text-center mb-6">
              <div className="mx-auto relative w-16 h-16 rounded-xl bg-gradient-to-br from-teal-500/20 to-amber-warn/20 border border-teal-500/30 flex items-center justify-center mb-4 glow-accent">
                <Languages className="w-8 h-8 text-teal-400" strokeWidth={1.6} />
                <span className="absolute inset-0 rounded-xl border-2 border-teal-400/40 animate-data-pulse" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Globe className="w-3 h-3 text-teal-400" />
                <span className="data-figure text-[10px] tracking-widest text-mint-400">● 26 LANGUAGES · BHASHINI</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight-x">
                Select Language
              </h2>
              <p className="data-figure text-[10px] text-muted-foreground tracking-widest mt-1">
                ASR · TTS · INTERVIEW · AYUSH
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {demoLanguages.map((lang) => {
                const isSelected = language === lang.name;
                return (
                  <motion.button
                    key={lang.code}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setLanguage(lang.name)}
                    className={`relative p-4 rounded-md border transition-all flex flex-col items-center justify-center gap-2 min-h-[100px] ${
                      isSelected
                        ? "border-teal-500/60 bg-teal-500/15 glow-accent"
                        : "border-trust-500/20 bg-bio-base/40 hover:border-trust-400/40 hover:bg-bio-elevated/60"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-bio-base" strokeWidth={3} />
                      </div>
                    )}
                    <span className="data-figure text-2xl font-bold tracking-tight">
                      {lang.nativeName}
                    </span>
                    <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                      {lang.name.toUpperCase()}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                className="h-12 px-8 text-base bg-gradient-to-r from-trust-500 to-teal-500 hover:from-trust-400 hover:to-teal-400 text-white border-0 glow-primary"
                onClick={handleContinue}
                disabled={!language || isSaving}
              >
                Continue
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
