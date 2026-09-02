import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { usePatientStore } from "@/store/patientStore";
import { useConvexPatient } from "@/hooks/useConvexPatient";
import { Header } from "@/components/shared/Header";
import { StepProgress } from "@/components/shared/StepProgress";
import { ShieldAlert, ArrowRight, ShieldCheck, FileText, Lock, Sparkles } from "lucide-react";
import { useState } from "react";
import { StatusBar, ParticleField } from "@/components/scientific";

export default function Consent() {
  const navigate = useNavigate();
  const { setConsent, setStep } = usePatientStore();
  const { persistPatientUpdate } = useConvexPatient();
  const [isSaving, setIsSaving] = useState(false);

  const { consentGiven } = usePatientStore();

  const handleConsent = async () => {
    setIsSaving(true);
    try {
      await persistPatientUpdate({ consentGiven: true });
      setConsent(true);
      setStep("language");
      navigate("/patient/language");
    } catch (error) {
      console.error("Failed to save consent:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (consentGiven) {
    navigate("/patient/language", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <ParticleField density="low" opacity={0.18} />
      <div className="absolute inset-0 surface-grid opacity-15 pointer-events-none" />
      <Header />
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 py-8 relative">
        <div className="mb-6">
          <StepProgress currentStep="consent" completedSteps={["login"]} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col"
        >
          <div className="lab-card lab-card-accent p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <StatusBar latency="42ms" sessionId="CONSENT-FLOW" />
            </div>
            <div className="text-center mb-6">
              <div className="mx-auto relative w-16 h-16 rounded-xl bg-gradient-to-br from-trust-500/20 to-teal-500/20 border border-trust-500/30 flex items-center justify-center mb-4 glow-primary">
                <ShieldAlert className="w-8 h-8 text-trust-300" strokeWidth={1.6} />
                <span className="absolute inset-0 rounded-xl border-2 border-trust-400/40 animate-data-pulse" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="data-figure text-[10px] tracking-widest text-mint-400">● INFORMED CONSENT</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight-x">
                Patient Consent
              </h2>
              <p className="data-figure text-[10px] text-muted-foreground tracking-widest mt-1">
                DATA HANDLING · CLINICAL GOVERNANCE
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-md bg-teal-500/8 border border-teal-500/25">
                <div className="mt-0.5 bg-teal-500/15 p-2 rounded-lg text-teal-400 border border-teal-500/30">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="data-figure text-[10px] font-bold tracking-widest text-teal-400">DATA COLLECTION</span>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    We collect your clinical history, symptoms, and uploaded medical documents to create a structured pre-consultation summary.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-trust-500/8 border border-trust-500/25">
                <div className="mt-0.5 bg-trust-500/15 p-2 rounded-lg text-trust-300 border border-trust-500/30">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="data-figure text-[10px] font-bold tracking-widest text-trust-300">DOCTOR VERIFICATION REQUIRED</span>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    This AI system does <strong>not</strong> provide medical diagnoses. All information collected will be reviewed and verified by your consulting doctor.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-amber-warn/8 border border-amber-warn/25">
                <div className="mt-0.5 bg-amber-warn/15 p-2 rounded-lg text-amber-warn border border-amber-warn/30">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="data-figure text-[10px] font-bold tracking-widest text-amber-warn">DATA PRIVACY (DEMO)</span>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    For this prototype demonstration, your data is stored locally on this device and is not shared with external health registries.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <Button
                className="w-full h-12 text-base bg-gradient-to-r from-trust-500 to-teal-500 hover:from-trust-400 hover:to-teal-400 text-white border-0 glow-primary"
                onClick={handleConsent}
                disabled={isSaving}
              >
                <Sparkles className="mr-2 w-4 h-4" />
                {isSaving ? "Saving…" : "I Understand & Agree"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                className="w-full text-sm text-muted-foreground hover:bg-trust-500/10"
                onClick={() => navigate("/")}
              >
                Decline & Exit
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
