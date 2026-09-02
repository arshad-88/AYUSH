import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { usePatientStore } from "@/store/patientStore";
import { Header } from "@/components/shared/Header";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { getFhirService, getAbdmService } from "@/services/serviceRegistry";
import { type FHIRBundle } from "@/types";
import {
  ArrowLeft,
  ArrowRight,
  Link2,
  Database,
  Server,
  CheckCircle,
  Loader2,
  FileText,
  Shield,
  Activity,
  ArrowDown,
} from "lucide-react";
import { DNASpinner, ParticleField, StatusBar } from "@/components/scientific";

export default function Integration() {
  const navigate = useNavigate();
  const store = usePatientStore();
  const [fhirBundle, setFhirBundle] = useState<FHIRBundle | null>(null);
  const [abdmResult, setAbdmResult] = useState<string | null>(null);
  const [hisResult, setHisResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateFHIR = async () => {
    setIsGenerating(true);
    const fhirService = getFhirService();
    const bundle = await fhirService.generateBundle({
      patient: {
        id: store.id || "demo-patient",
        name: store.name || "Demo Patient",
        age: store.age || 40,
        gender: store.gender || "Male",
        abhaId: store.abhaId || "ABHA-DEMO-123456",
        mobileNumber: store.mobileNumber,
      },
      chiefComplaint: store.chiefComplaint || "Demo complaint",
      socrates: store.socrates,
      ayush: store.ayush,
      triage: store.triage || { priority: "routine", reasons: [] },
      documents: store.documents.map((d: { extractedData: Record<string, string> }) => ({ extractedData: d.extractedData })),
    });
    setFhirBundle(bundle);
    setIsGenerating(false);
  };

  const handleABDMPush = async () => {
    if (!fhirBundle) return;
    setIsGenerating(true);
    const abdmService = getAbdmService();
    const result = await abdmService.pushHealthRecord(fhirBundle);
    setAbdmResult(result.message);
    setIsGenerating(false);
  };

  const handleHISPush = async () => {
    if (!fhirBundle) return;
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 500));
    setHisResult("Simulated HIS push successful");
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleField density="low" opacity={0.16} />
      <div className="absolute inset-0 surface-grid opacity-15 pointer-events-none" />
      <Header />

      <div className="relative max-w-5xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="hover:bg-trust-500/10"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            <span className="data-figure tracking-wider">BACK</span>
          </Button>

          {/* Header */}
          <div className="lab-card lab-card-accent p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <StatusBar latency="42ms" sessionId="FHIR-PUSH" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-trust-500 flex items-center justify-center glow-accent">
                <Link2 className="w-7 h-7 text-white" strokeWidth={1.6} />
                <span className="absolute -inset-0.5 rounded-xl border-2 border-teal-400/40 animate-data-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="data-figure text-[10px] tracking-widest text-mint-400">● INTEROPERABILITY</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight-x">
                  FHIR / ABDM Integration
                </h1>
                <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                  HL7 FHIR R4 · ABDM · ABDM-COMPLIANT
                </span>
              </div>
            </div>
          </div>

          <DisclaimerBanner
            type="simulated"
            message="All FHIR and ABDM integrations shown here are simulated. In production, these would connect to real FHIR servers and ABDM APIs."
          />

          {/* Integration Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "FHIR R4 Server", icon: Server, status: "ONLINE", variant: "tag-stable" },
              { label: "ABDM Integration", icon: Shield, status: "SIMULATED", variant: "tag-urgent" },
              { label: "HIS/EMR Push", icon: Database, status: "READY", variant: "tag-info" },
            ].map((item) => (
              <div key={item.label} className="lab-card lab-card-accent p-4 hover-lift">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-trust-500/15 border border-trust-500/30 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-trust-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium tracking-tight-x">{item.label}</p>
                    <span className={`data-figure text-[10px] px-2 py-0.5 rounded-md border ${item.variant} tracking-widest inline-block mt-1`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Generate FHIR Bundle */}
          <div className="lab-card lab-card-accent p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-trust-500/15 border border-trust-500/30 flex items-center justify-center">
                <FileText className="w-4 h-4 text-trust-300" strokeWidth={1.6} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold tracking-tight-x">FHIR R4 Bundle</h3>
                <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                  PATIENT · ENCOUNTER · CONDITION · OBSERVATION · COMPOSITION
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Generate an HL7 FHIR R4 Bundle containing Patient, Encounter, Condition, Observation, and Composition resources.
            </p>
            <Button
              className="bg-gradient-to-r from-trust-500 to-teal-500 hover:from-trust-400 hover:to-teal-400 text-white border-0 glow-primary"
              onClick={handleGenerateFHIR}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <DNASpinner size="sm" />
                  <span className="ml-2 data-figure tracking-widest">GENERATING…</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  <span className="data-figure tracking-wider">GENERATE FHIR BUNDLE</span>
                </>
              )}
            </Button>

            {fhirBundle && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <div className="p-4 rounded-md bg-bio-base/60 border border-trust-500/20">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-mint-400" strokeWidth={2.2} />
                      <p className="text-sm font-bold">
                          Bundle Generated
                        </p>
                    </div>
                    <span className="data-figure text-[10px] tracking-widest text-trust-300 px-2 py-0.5 rounded-md bg-trust-500/15 border border-trust-500/30">
                      {fhirBundle.entry.length} RESOURCES
                    </span>
                  </div>
                  <pre className="data-figure text-[10px] text-muted-foreground overflow-auto max-h-60 bg-bio-surface/60 p-3 rounded-md border border-trust-500/20">
                    {JSON.stringify(fhirBundle, null, 2)}
                  </pre>
                </div>

                {/* Resource List */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {fhirBundle.entry.map((entry: any, i) => {
                    const resource = entry.resource;
                    return (
                      <div
                        key={i}
                        className="p-2.5 rounded-md bg-teal-500/8 border border-teal-500/25"
                      >
                        <p className="data-figure text-xs font-bold text-teal-400 tracking-widest">
                          {String(resource.resourceType)}
                        </p>
                        <p className="data-figure text-[10px] text-muted-foreground tracking-wider mt-0.5">
                          ID · {String(resource.id)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>

          {/* ABDM Push */}
          <div className="lab-card lab-card-accent p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
                <Shield className="w-4 h-4 text-teal-400" strokeWidth={1.6} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold tracking-tight-x">ABDM / ABHA Integration</h3>
                <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                  CONSENT-DRIVEN · PATIENT-CONTROLLED
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Push the FHIR bundle to the patient&apos;s ABHA (Ayushman Bharat Health Account) health record.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={handleABDMPush}
                disabled={!fhirBundle || isGenerating}
                className="border-teal-500/40 text-teal-400 hover:bg-teal-500/10"
              >
                {isGenerating ? (
                  <>
                    <DNASpinner size="sm" />
                    <span className="ml-1 data-figure tracking-widest">PUSHING…</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 mr-2" />
                    <span className="data-figure tracking-wider">PUSH TO ABHA PHR</span>
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleHISPush}
                disabled={!fhirBundle || isGenerating}
                className="border-amber-warn/40 text-amber-warn hover:bg-amber-warn/10"
              >
                {isGenerating ? (
                  <>
                    <DNASpinner size="sm" />
                    <span className="ml-1 data-figure tracking-widest">PUSHING…</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    <span className="data-figure tracking-wider">PUSH TO HIS/EMR</span>
                  </>
                )}
              </Button>
            </div>

            {abdmResult && (
              <div className="mt-3 p-3 rounded-md tag-stable flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5" />
                <p className="text-sm">{abdmResult}</p>
              </div>
            )}

            {hisResult && (
              <div className="mt-3 p-3 rounded-md tag-info flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5" />
                <p className="text-sm">{hisResult}</p>
              </div>
            )}
          </div>

          {/* Architecture Preview */}
          <div className="lab-card lab-card-accent p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg bg-trust-500/15 border border-trust-500/30 flex items-center justify-center">
                <Activity className="w-4 h-4 text-trust-300" strokeWidth={1.6} />
              </div>
              <div>
                <h3 className="font-bold tracking-tight-x">Integration Architecture</h3>
                <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                  BIDIRECTIONAL · CONSENT-GATED
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-full max-w-md p-3 rounded-md bg-trust-500/10 border border-trust-500/30 glow-primary">
                <div className="flex items-center justify-center gap-2">
                  <span className="data-figure text-[10px] tracking-widest text-trust-300">MEDIKIOSK.AI</span>
                </div>
                <p className="text-sm font-bold text-center mt-1">FHIR R4 Bundle Generation</p>
              </div>
              <ArrowDown className="w-4 h-4 text-trust-500/60" />
              <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                <div className="p-3 rounded-md bg-teal-500/10 border border-teal-500/30">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Shield className="w-3.5 h-3.5 text-teal-400" />
                    <span className="data-figure text-[10px] tracking-widest text-teal-400">ABDM</span>
                  </div>
                  <p className="text-xs font-bold text-center">ABHA PHR Push</p>
                </div>
                <div className="p-3 rounded-md bg-amber-warn/10 border border-amber-warn/30">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Database className="w-3.5 h-3.5 text-amber-warn" />
                    <span className="data-figure text-[10px] tracking-widest text-amber-warn">HIS/EMR</span>
                  </div>
                  <p className="text-xs font-bold text-center">Hospital Systems</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center pb-8">
            <Button
              variant="outline"
              onClick={() => navigate("/technology")}
              className="border-trust-500/30 hover:bg-trust-500/10"
            >
              <span className="data-figure tracking-wider mr-2">VIEW FULL ARCHITECTURE</span>
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}