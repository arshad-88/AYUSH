import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePatientStore } from "@/store/patientStore";
import { useConvexAYUSH } from "@/hooks/useConvexAYUSH";
import { Id } from "@/convex/_generated/dataModel";
import { Header } from "@/components/shared/Header";
import { StepProgress } from "@/components/shared/StepProgress";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { ayushService } from "@/services/ayushService";
import {
  ArrowRight,
  ArrowLeft,
  Leaf,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Atom,
} from "lucide-react";
import {
  BiomarkerBar,
  RingProgress,
  StatusBar,
  ParticleField,
} from "@/components/scientific";

export default function Assessment() {
  const navigate = useNavigate();
  const { ayush, setAYUSH, aharaVihara, setAharaVihara, language, setStep, consultationId } = usePatientStore();
  const { existingAssessment, saveAYUSH } = useConvexAYUSH(consultationId ? (consultationId as Id<"consultations">) : null);
  const [isSaving, setIsSaving] = useState(false);
  const parameters = ayushService.getParameterOptions();
  const [expandedParam, setExpandedParam] = useState<string | null>(
    parameters.find((p) => !ayush[p.id as keyof typeof ayush])?.id || null
  );
  const [showAhara, setShowAhara] = useState(false);

  const validation = useMemo(() => ayushService.validateAssessment(ayush), [ayush]);
  const aharaFields = ["diet", "sleep", "bowelHabits", "dailyRoutine", "substances"] as const;
  const aharaComplete = aharaFields.every((field) => Boolean(aharaVihara[field]?.trim()));

  useEffect(() => {
    if (existingAssessment) {
      const { responses, aharaVihara: savedAhara } = existingAssessment;
      const currentAyush = usePatientStore.getState().ayush;
      const hasValues = Object.values(currentAyush).some(v => v && v.trim());
      if (!hasValues && responses) {
        setAYUSH(responses);
      }
      if (savedAhara) {
        const currentAhara = usePatientStore.getState().aharaVihara;
        const hasAhara = Object.values(currentAhara).some(v => v && v.trim());
        if (!hasAhara) {
          setAharaVihara(savedAhara);
        }
      }
    }
  }, [existingAssessment, setAYUSH, setAharaVihara]);

  const localizedOptionLabel = (label: string) => {
    if (language === "English") return label;
    const dictionary = language === "Telugu"
      ? { Air: "గాలి", Space: "ఆకాశం", Fire: "అగ్ని", Water: "నీరు", Earth: "భూమి", Dual: "ద్వంద్వ", Balanced: "సమతుల్య", Predominant: "ప్రధాన", Imbalance: "అసమతుల్యత", Reduced: "తగ్గిన", Medium: "మధ్యస్థ", Strong: "బలమైన", Small: "చిన్న", Large: "పెద్ద", Full: "పూర్తి", Poor: "తక్కువ", Partial: "పాక్షిక", Dense: "దృఢమైన", Fine: "సూక్ష్మ", Lax: "వదులైన" }
      : { Air: "वायु", Space: "आकाश", Fire: "अग्नि", Water: "जल", Earth: "पृथ्वी", Dual: "द्वि", Balanced: "संतुलित", Predominant: "प्रमुख", Imbalance: "असंतुलन", Reduced: "कम", Medium: "मध्यम", Strong: "मज़बूत", Small: "छोटा", Large: "बड़ा", Full: "पूर्ण", Poor: "कम", Partial: "आंशिक", Dense: "घना", Fine: "सूक्ष्म", Lax: "ढीला" };
    const translated = Object.entries(dictionary).reduce((value, [english, regional]) => value.replace(new RegExp(`\\b${english}\\b`, "g"), regional), label);
    return `${label} (${translated})`;
  };

  const handleSelect = (paramId: string, value: string) => {
    setAYUSH({ [paramId]: value });
    const currentIndex = parameters.findIndex((p) => p.id === paramId);
    const nextUnanswered = parameters
      .slice(currentIndex + 1)
      .find((p) => !ayush[p.id as keyof typeof ayush]);
    if (nextUnanswered) {
      setExpandedParam(nextUnanswered.id);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleField density="low" opacity={0.25} />
      <div className="absolute inset-0 surface-grid opacity-15 pointer-events-none" />
      <Header />
      <div className="relative max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <StepProgress
            currentStep="ayush"
            completedSteps={["login", "consent", "interview"]}
          />
        </div>

        {/* Header card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="lab-card lab-card-accent p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <StatusBar latency="42ms" sessionId="AYUSH-A1" />
            </div>
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500/20 to-amber-warn/20 border border-teal-500/30 flex items-center justify-center glow-accent">
                    <Leaf className="w-6 h-6 text-teal-400" strokeWidth={1.6} />
                  </div>
                  <span className="absolute inset-0 rounded-xl border-2 border-teal-400/40 animate-data-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="data-figure text-[10px] tracking-widest text-teal-400">● ASSESSMENT MODE</span>
                    <span className="text-trust-500/30">·</span>
                    <span className="data-figure text-[10px] tracking-widest text-muted-foreground">PATIENT-INPUT</span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight-x">
                    AYUSH Assessment
                  </h1>
                  <p className="data-figure text-[10px] text-muted-foreground tracking-widest">
                    DASHVIDHA PARIKSHA · 10-FOLD EXAMINATION
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <RingProgress
                  value={validation.completionPercentage}
                  size={88}
                  thickness={6}
                  variant="accent"
                  label="DONE"
                  unit="%"
                />
                <div>
                  <div className="data-figure text-[10px] tracking-widest text-muted-foreground">PARAMETERS</div>
                  <div className="data-figure text-4xl font-bold text-teal-400">
                    {validation.completedCount}<span className="text-lg text-muted-foreground">/{validation.totalCount}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <BiomarkerBar
                value={validation.completionPercentage}
                variant="accent"
                size="sm"
                label="ASSESSMENT COMPLETENESS"
                unit="%"
                showValue
              />
            </div>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <div className="mb-6">
          <div className="rounded-md border tag-info px-4 py-3 flex items-start gap-3 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="data-figure text-[10px] font-bold uppercase tracking-widest">
                PATIENT-INPUT · PHYSICIAN VERIFIED
              </p>
              <p className="text-xs mt-0.5 opacity-85 leading-relaxed">
                These values reflect your own assessment of your constitution.
                The consulting physician will verify all values during consultation.
              </p>
            </div>
          </div>
        </div>

        {/* Parameter Cards */}
        <div className="space-y-3">
          {parameters.map((param, index) => {
            const value = ayush[param.id as keyof typeof ayush];
            const isExpanded = expandedParam === param.id;
            const isComplete = !!value;

            return (
              <motion.div
                key={param.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`lab-card lab-card-accent transition-all ${
                  isComplete
                    ? "border-mint-500/30"
                    : isExpanded
                      ? "border-amber-warn/40 glow-primary"
                      : ""
                }`}
              >
                <button
                  className="w-full text-left"
                  onClick={() =>
                    setExpandedParam(isExpanded ? null : param.id)
                  }
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`relative w-9 h-9 rounded-md flex items-center justify-center text-xs font-bold data-figure ${
                            isComplete
                              ? "bg-gradient-to-br from-mint-500 to-teal-500 text-bio-base"
                              : "bg-amber-warn/15 text-amber-warn border border-amber-warn/30"
                          }`}
                        >
                          {isComplete ? (
                            <Check className="w-4 h-4" strokeWidth={3} />
                          ) : (
                            <span>{(index + 1).toString().padStart(2, "0")}</span>
                          )}
                          {!isComplete && isExpanded && (
                            <span className="absolute inset-0 rounded-md border-2 border-amber-warn animate-data-pulse" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold tracking-tight-x">
                            {param.name}
                            {language !== "English" && (
                              <span className="text-muted-foreground ml-2 text-xs font-normal">
                                {param.id === "prakriti" ? (language === "Telugu" ? "ప్రకృతి" : "प्रकृति") :
                                  param.id === "vikriti" ? (language === "Telugu" ? "వికృతి" : "विकृति") :
                                  param.id === "sara" ? (language === "Telugu" ? "సారం" : "सार") :
                                  param.id === "samhanana" ? (language === "Telugu" ? "సంహననం" : "संहनन") :
                                  param.id === "pramana" ? (language === "Telugu" ? "ప్రమాణం" : "प्रमाण") :
                                  param.id === "satmya" ? (language === "Telugu" ? "సాత్మ్యం" : "सात्म्य") :
                                  param.id === "satva" ? (language === "Telugu" ? "సత్త్వం" : "सत्त्व") :
                                  param.id === "aharaShakti" ? (language === "Telugu" ? "ఆహార శక్తి" : "आहार शक्ति") :
                                  param.id === "vyayamaShakti" ? (language === "Telugu" ? "వ్యాయామ శక్తి" : "व्यायाम शक्ति") :
                                  (language === "Telugu" ? "వయస్సు" : "वय")}
                              </span>
                            )}
                          </h3>
                          <p className="data-figure text-[10px] text-muted-foreground tracking-widest mt-0.5">
                            {param.description}
                          </p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-amber-warn" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-trust-500/15"
                  >
                    <div className="p-4 sm:p-5 pt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {param.options.map((option) => (
                          <button
                            key={option.value}
                            className={`p-3 rounded-md border text-left text-sm transition-all ${
                              value === option.value
                                ? "bg-teal-500/15 border-teal-500/50 text-foreground font-semibold glow-accent"
                                : "bg-bio-base/50 border-bio-border/40 hover:border-amber-warn/40 text-muted-foreground hover:text-foreground hover:bg-bio-elevated/60"
                            }`}
                            onClick={() => handleSelect(param.id, option.value)}
                          >
                            <div className="flex items-center gap-2.5">
                              {value === option.value ? (
                                <div className="w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                                  <Check className="w-2.5 h-2.5 text-bio-base" strokeWidth={3} />
                                </div>
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-bio-border flex-shrink-0" />
                              )}
                              <span>{localizedOptionLabel(option.label)}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {showAhara && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lab-card lab-card-accent mt-6 p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-amber-warn/15 border border-amber-warn/30 flex items-center justify-center">
                <Atom className="w-4 h-4 text-amber-warn" strokeWidth={1.6} />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight-x">
                  Ahara-Vihara
                  {language === "Telugu" ? " ఆహార-విహార" : language === "Hindi" ? " आहार-विहार" : ""}
                </h3>
                <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                  DIET & LIFESTYLE HISTORY
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              {language === "Telugu"
                ? "మీ ఆహారం మరియు రోజువారీ అలవాట్లను నమోదు చేయండి."
                : language === "Hindi"
                  ? "अपने भोजन और दैनिक आदतों के बारे में बताइए।"
                  : "Record your diet and daily habits."}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {aharaFields.map((field) => {
                const labels = {
                  diet: { English: "Diet / Ahara", Hindi: "आहार", Telugu: "ఆహారం" },
                  sleep: { English: "Sleep", Hindi: "नींद", Telugu: "నిద్ర" },
                  bowelHabits: { English: "Bowel habits", Hindi: "मल त्याग की आदतें", Telugu: "మల విసర్జన అలవాట్లు" },
                  dailyRoutine: { English: "Daily routine", Hindi: "दैनिक दिनचर्या", Telugu: "రోజువారీ దినచర్య" },
                  substances: { English: "Substances / lifestyle", Hindi: "नशीले पदार्थ / जीवनशैली", Telugu: "పదార్థాలు / జీవనశైలి" },
                };
                return (
                  <label
                    key={field}
                    className="text-xs font-medium text-foreground"
                  >
                    {labels[field][language as "English" | "Hindi" | "Telugu"] || labels[field].English}
                    <Input
                      className="mt-1.5 bg-bio-base/50 border-trust-500/30 focus:border-trust-400"
                      value={aharaVihara[field] || ""}
                      onChange={(e) => setAharaVihara({ [field]: e.target.value })}
                    />
                  </label>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Safety Note */}
        <div className="mt-6">
          <DisclaimerBanner
            type="simulated"
            message="AYUSH parameters are for clinical documentation. This system does not generate diagnoses from these assessments."
          />
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between pb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/patient/interview")}
            className="border-trust-500/30 hover:bg-trust-500/10"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            <span className="data-figure tracking-wider">BACK</span>
          </Button>

          <Button
            className="bg-gradient-to-r from-trust-500 to-teal-500 hover:from-trust-400 hover:to-teal-400 text-white border-0 glow-primary"
            disabled={!validation.isComplete || (showAhara && !aharaComplete) || isSaving}
            onClick={async () => {
              if (!showAhara) {
                setShowAhara(true);
                return;
              }
              if (validation.isComplete && aharaComplete) {
                setIsSaving(true);
                try {
                  await saveAYUSH(ayush, aharaVihara as Record<string, string>);
                  setStep("documents");
                  navigate("/patient/document");
                } catch (error) {
                  console.error("Failed to save AYUSH:", error);
                } finally {
                  setIsSaving(false);
                }
              }
            }}
          >
            {isSaving
              ? "Saving…"
              : !showAhara
                ? language === "Telugu"
                  ? "ఆహార-విహారానికి కొనసాగండి"
                  : language === "Hindi"
                    ? "आहार-विहार पर जाएँ"
                    : "Continue to Ahara-Vihara"
                : language === "Telugu"
                  ? "పత్రాలకు కొనసాగండి"
                  : language === "Hindi"
                    ? "दस्तावेज़ों पर जाएँ"
                    : "Continue to Documents"}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}