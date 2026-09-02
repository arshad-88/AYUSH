import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/shared/Header";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import {
  ArrowLeft,
  Activity,
  Users,
  Brain,
  Database,
  Server,
  Shield,
  Globe,
  Mic,
  FileText,
  Link2,
  Code,
  CheckCircle,
  Cpu,
  Layers,
  Workflow,
  ArrowRight,
} from "lucide-react";
import {
  AreaSparkline,
  BiomarkerBar,
  HeroCanvas,
  ParticleField,
  RadialGauge,
  RingProgress,
  StatusBar,
} from "@/components/scientific";

const techStack = [
  { name: "React / Vite", category: "Frontend", status: "implemented" as const },
  { name: "TypeScript", category: "Frontend", status: "implemented" as const },
  { name: "Tailwind CSS", category: "Frontend", status: "implemented" as const },
  { name: "shadcn/ui", category: "Frontend", status: "implemented" as const },
  { name: "Framer Motion", category: "Frontend", status: "implemented" as const },
  { name: "Zustand", category: "State", status: "implemented" as const },
  { name: "Bhashini / AI4Bharat", category: "AI/ML", status: "simulated" as const },
  { name: "Llama-3 / OpenHathi", category: "AI/ML", status: "simulated" as const },
  { name: "Tesseract OCR", category: "OCR", status: "simulated" as const },
  { name: "Rule-based Triage", category: "AI/ML", status: "implemented" as const },
  { name: "HL7 FHIR R4", category: "Interoperability", status: "simulated" as const },
  { name: "ABDM Integration", category: "Interoperability", status: "simulated" as const },
  { name: "Convex", category: "Backend", status: "implemented" as const },
  { name: "Bun", category: "Runtime", status: "implemented" as const },
];

const statusConfig = {
  implemented: { label: "LIVE", variant: "tag-stable" },
  simulated: { label: "SIMULATED", variant: "tag-urgent" },
  planned: { label: "PLANNED", variant: "tag-neutral" },
};

const layers = [
  {
    code: "01",
    title: "Patient Interaction Layer",
    subtitle: "Kiosk · Mobile · Web",
    color: "trust",
    icon: Users,
    items: [
      "Patient Check-in",
      "Language Selection",
      "Voice/Touch Mode",
      "SOCRATES Interview",
      "AYUSH Assessment",
      "Document Upload",
      "OCR Extraction",
      "Medical Timeline",
      "AI Triage",
      "Case Sheet",
    ],
  },
  {
    code: "02",
    title: "AI Processing Engine",
    subtitle: "Speech · NLP · Vision",
    color: "teal",
    icon: Brain,
    items: [
      "Speech Processing (Bhashini)",
      "NLP & Understanding (LLM)",
      "Clinical Extraction",
      "Priority Scoring Engine",
    ],
  },
];

export default function Technology() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleField density="low" opacity={0.16} />
      <div className="absolute inset-0 surface-grid opacity-15 pointer-events-none" />
      <Header />

      <div className="relative max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="hover:bg-trust-500/10"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            <span className="data-figure tracking-wider">BACK</span>
          </Button>

          <div className="text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="w-6 h-px bg-trust-500/50" />
              <span className="eyebrow">ARCHITECTURE</span>
              <span className="w-6 h-px bg-trust-500/50" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight-x">
              MediKiosk.AI
            </h1>
            <p className="data-figure text-[10px] text-muted-foreground tracking-widest mt-2">
              CAPTURE · STRUCTURE · PRIORITIZE · VERIFY · INTEGRATE
            </p>
          </div>

          <DisclaimerBanner
            type="simulated"
            message="This page clearly separates ACTUAL PROTOTYPE IMPLEMENTATION from INTENDED PRODUCTION INTEGRATION."
          />

          {/* System Status */}
          <div className="lab-card lab-card-accent p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-trust-500/15 border border-trust-500/30 flex items-center justify-center">
                <Shield className="w-4 h-4 text-trust-300" strokeWidth={1.6} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold tracking-tight-x">System Status</h3>
                <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                  COMPONENT HEALTH · REAL-TIME
                </span>
              </div>
              <StatusBar latency="42ms" sessionId="SYS-STATUS" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              {[
                { name: "AI Interview", status: "LOCAL / DEMO", variant: "tag-info" as const },
                { name: "Voice ASR", status: "BROWSER", variant: "tag-info" as const },
                { name: "Voice TTS", status: "BROWSER", variant: "tag-info" as const },
                { name: "OCR Engine", status: "TESSERACT.JS", variant: "tag-stable" as const },
                { name: "Triage", status: "LOCAL RULE ENGINE", variant: "tag-stable" as const },
                { name: "FHIR", status: "FHIR R4 GENERATED", variant: "tag-info" as const },
                { name: "ABDM", status: "SIMULATED", variant: "tag-urgent" as const },
                { name: "HIS / EMR", status: "INTEGRATION-READY", variant: "tag-info" as const },
              ].map((sys) => (
                <div
                  key={sys.name}
                  className="flex justify-between items-center py-1.5 border-b border-trust-500/10 last:border-0"
                >
                  <span className="text-sm font-medium">{sys.name}</span>
                  <span
                    className={`data-figure text-[10px] font-bold px-2 py-0.5 rounded-md border ${sys.variant} tracking-widest`}
                  >
                    {sys.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Architecture Diagram */}
          <div className="lab-card lab-card-accent p-6 sm:p-8 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg bg-trust-500/15 border border-trust-500/30 flex items-center justify-center">
                <Layers className="w-4 h-4 text-trust-300" strokeWidth={1.6} />
              </div>
              <div>
                <h3 className="font-bold tracking-tight-x">System Architecture</h3>
                <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                  SIX-LAYER FLOW
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Layer 1 */}
              <div className="p-4 rounded-md border border-trust-500/30 bg-trust-500/5 relative overflow-hidden">
                <div className="absolute inset-0 surface-grid-fine opacity-30 pointer-events-none" />
                <div className="relative flex items-center gap-2 mb-3">
                  <span className="data-figure text-[10px] tracking-widest text-trust-300 px-2 py-0.5 rounded-md bg-trust-500/15 border border-trust-500/30">
                    L01
                  </span>
                  <Users className="w-4 h-4 text-trust-300" />
                  <h3 className="text-sm font-bold text-trust-300 tracking-tight-x">
                    Patient Interaction (Kiosk / Mobile)
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    "Patient Check-in",
                    "Language Selection",
                    "Voice/Touch Mode",
                    "SOCRATES Interview",
                    "AYUSH Assessment",
                  ].map((item) => (
                    <div
                      key={item}
                      className="p-2 rounded-md bg-bio-surface/60 border border-trust-500/20 text-center"
                    >
                      <p className="data-figure text-[10px] tracking-wider">{item}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2">
                  {[
                    "Document Upload",
                    "OCR Extraction",
                    "Medical Timeline",
                    "AI Triage",
                    "Case Sheet",
                  ].map((item) => (
                    <div
                      key={item}
                      className="p-2 rounded-md bg-bio-surface/60 border border-trust-500/20 text-center"
                    >
                      <p className="data-figure text-[10px] tracking-wider">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connector */}
              <div className="flex justify-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="w-px h-6 bg-trust-500/40" />
                  <ArrowRight className="w-3 h-3 text-trust-500/60 rotate-90" />
                </div>
              </div>

              {/* Layer 2 */}
              <div className="p-4 rounded-md border border-teal-500/30 bg-teal-500/5">
                <div className="relative flex items-center gap-2 mb-3">
                  <span className="data-figure text-[10px] tracking-widest text-teal-400 px-2 py-0.5 rounded-md bg-teal-500/15 border border-teal-500/30">
                    L02
                  </span>
                  <Brain className="w-4 h-4 text-teal-400" />
                  <h3 className="text-sm font-bold text-teal-400 tracking-tight-x">
                    AI Processing Engine
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    "Speech Processing (Bhashini)",
                    "NLP & Understanding (LLM)",
                    "Clinical Extraction",
                    "Priority Scoring Engine",
                  ].map((item) => (
                    <div
                      key={item}
                      className="p-2 rounded-md bg-bio-surface/60 border border-teal-500/20 text-center"
                    >
                      <p className="data-figure text-[10px] tracking-wider">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center">
                <span className="w-px h-6 bg-trust-500/40" />
              </div>

              {/* Layer 3-5: three-column */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-md border border-amber-warn/30 bg-amber-warn/5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="data-figure text-[10px] tracking-widest text-amber-warn px-1.5 py-0.5 rounded-md bg-amber-warn/15 border border-amber-warn/30">
                      L03
                    </span>
                    <Database className="w-4 h-4 text-amber-warn" />
                    <h3 className="text-xs font-bold text-amber-warn tracking-tight-x">DATA LAYER</h3>
                  </div>
                  <div className="space-y-1.5">
                    {["Patient Profile", "Clinical Data", "Documents", "Timeline", "Audit Logs"].map((item) => (
                      <div
                        key={item}
                        className="p-1.5 rounded-md bg-bio-surface/60 border border-amber-warn/20"
                      >
                        <p className="data-figure text-[10px] tracking-wider">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-md border border-teal-500/30 bg-teal-500/5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="data-figure text-[10px] tracking-widest text-teal-400 px-1.5 py-0.5 rounded-md bg-teal-500/15 border border-teal-500/30">
                      L04
                    </span>
                    <Link2 className="w-4 h-4 text-teal-400" />
                    <h3 className="text-xs font-bold text-teal-400 tracking-tight-x">INTEGRATION</h3>
                  </div>
                  <div className="space-y-1.5">
                    {["FHIR R4 Server", "ABDM (ABHA, Health ID)", "HIS / EMR Push", "Notification Service"].map((item) => (
                      <div
                        key={item}
                        className="p-1.5 rounded-md bg-bio-surface/60 border border-teal-500/20"
                      >
                        <p className="data-figure text-[10px] tracking-wider">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-md border border-trust-500/30 bg-trust-500/5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="data-figure text-[10px] tracking-widest text-trust-300 px-1.5 py-0.5 rounded-md bg-trust-500/15 border border-trust-500/30">
                      L05
                    </span>
                    <Workflow className="w-4 h-4 text-trust-300" />
                    <h3 className="text-xs font-bold text-trust-300 tracking-tight-x">DOCTOR WORKFLOW</h3>
                  </div>
                  <div className="space-y-1.5">
                    {["OPD Queue Dashboard", "Patient Case View", "Explainable AI", "Confirm/Edit/Override"].map((item) => (
                      <div
                        key={item}
                        className="p-1.5 rounded-md bg-bio-surface/60 border border-trust-500/20"
                      >
                        <p className="data-figure text-[10px] tracking-wider">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <span className="w-px h-6 bg-trust-500/40" />
              </div>

              {/* Layer 6 */}
              <div className="p-4 rounded-md border border-bio-border bg-bio-base/40">
                <div className="flex items-center gap-2 mb-3">
                  <span className="data-figure text-[10px] tracking-widest text-muted-foreground px-1.5 py-0.5 rounded-md bg-bio-base border border-bio-border">
                    L06
                  </span>
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-xs font-bold text-muted-foreground tracking-tight-x">EXTERNAL SYSTEMS (PRODUCTION)</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { name: "Bhashini Platform", icon: Mic },
                    { name: "AI4Bharat LLMs", icon: Cpu },
                    { name: "OCR Engine", icon: FileText },
                    { name: "Hospital HIS/EMR", icon: Server },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="p-2 rounded-md bg-bio-surface/40 border border-bio-border/40 text-center"
                    >
                      <item.icon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                      <p className="data-figure text-[10px] tracking-wider">{item.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contextual 3D Models */}
          <div className="grid lg:grid-cols-2 gap-10 mt-4">
            <div className="lab-card lab-card-elevated lab-card-accent p-8 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-trust-500/15 border border-trust-500/30 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-trust-300" strokeWidth={1.6} />
                </div>
                <div>
                  <h3 className="font-bold tracking-tight-x">Neural Pathway Engine</h3>
                  <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                    INTERVIEW QUESTION TREE · SOCRATES
                  </span>
                </div>
              </div>
              <div className="aspect-square max-h-[360px] mx-auto w-full rounded-2xl overflow-hidden inner-glow-bl">
                <HeroCanvas className="w-full h-full" variant="neural" cameraDistance={4.5} />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mt-5">
                Branching synaptic tree mirrors the adaptive SOCRATES interview. Each
                dendritic fork represents a question path, with stronger signals
                surfacing symptoms earlier in the workflow.
              </p>
            </div>

            <div className="lab-card lab-card-elevated lab-card-accent p-8 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-teal-400" strokeWidth={1.6} />
                </div>
                <div>
                  <h3 className="font-bold tracking-tight-x">Drug-Target Binding</h3>
                  <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                    PHARMACOLOGY · INTERACTION GRAPH
                  </span>
                </div>
              </div>
              <div className="aspect-square max-h-[360px] mx-auto w-full rounded-2xl overflow-hidden inner-glow-tr">
                <HeroCanvas className="w-full h-full" variant="drugtarget" cameraDistance={5.5} />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mt-5">
                A target protein (left) and an oscillating drug molecule (right)
                connected by an energy field. Real-time affinity scoring is what
                powers our medication-interaction warnings.
              </p>
            </div>
          </div>

          {/* Metrics row */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="lab-card lab-card-accent p-5">
              <RadialGauge
                value={92}
                size={120}
                thickness={9}
                label="UPTIME"
                unit="%"
                variant="stable"
              />
              <p className="data-figure text-[10px] text-center text-muted-foreground tracking-widest mt-2">
                PRODUCTION READINESS
              </p>
            </div>
            <div className="lab-card lab-card-accent p-5">
              <div className="space-y-3">
                <BiomarkerBar value={42} label="OCR LATENCY" unit="ms" variant="primary" size="sm" />
                <BiomarkerBar value={98} label="OCR ACCURACY" unit="%" variant="accent" size="sm" />
                <BiomarkerBar value={88} label="FIELD EXTRACTION" unit="%" variant="stable" size="sm" />
              </div>
              <p className="data-figure text-[10px] text-center text-muted-foreground tracking-widest mt-3">
                OCR ENGINE METRICS
              </p>
            </div>
            <div className="lab-card lab-card-accent p-5">
              <p className="eyebrow mb-2">INTAKE · LAST 7 DAYS</p>
              <AreaSparkline
                values={[120, 145, 162, 198, 175, 220, 248]}
                height={60}
                variant="primary"
                max={300}
              />
              <p className="data-figure text-[10px] text-center text-muted-foreground tracking-widest mt-2">
                PATIENT THROUGHPUT
              </p>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="lab-card lab-card-accent p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-trust-500/15 border border-trust-500/30 flex items-center justify-center">
                <Code className="w-4 h-4 text-trust-300" strokeWidth={1.6} />
              </div>
              <div>
                <h3 className="font-bold tracking-tight-x">Technology Stack</h3>
                <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                  FRONTEND · BACKEND · AI · INTEROP
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {techStack.map((tech) => {
                const status = statusConfig[tech.status];
                return (
                  <div
                    key={tech.name}
                    className="flex items-center justify-between p-3 rounded-md bg-bio-base/50 border border-trust-500/15 hover:border-trust-500/30 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium tracking-tight-x">{tech.name}</p>
                      <p className="data-figure text-[10px] text-muted-foreground tracking-widest">{tech.category}</p>
                    </div>
                    <span
                      className={`data-figure text-[10px] font-bold px-2 py-0.5 rounded-md border ${status.variant} tracking-widest`}
                    >
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Protein Fold — context-rich biomarker visualization */}
          <div className="lab-card lab-card-elevated lab-card-accent p-8 relative overflow-hidden">
            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-teal-400" strokeWidth={1.6} />
                  </div>
                  <div>
                    <h3 className="font-bold tracking-tight-x">Protein Fold Visualization</h3>
                    <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                      BIOMARKER CHAIN · 80 RESIDUES
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Each sphere represents a residue in the patient's biomarker chain.
                  Color coding indicates state — green for stable, amber for elevated,
                  red for critical — and helix rotation reveals progression across the
                  clinical timeline.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="lab-card-floating p-3">
                    <span className="eyebrow text-[9px]">RESIDUES</span>
                    <p className="data-figure-lg text-2xl font-bold text-trust-300 mt-1">
                      <RingProgress value={80} size={32} thickness={3} variant="primary" showValue={false} />
                    </p>
                    <p className="data-figure text-[10px] text-muted-foreground mt-1">80 / 80</p>
                  </div>
                  <div className="lab-card-floating p-3">
                    <span className="eyebrow text-[9px]">STABLE</span>
                    <p className="data-figure-lg text-2xl font-bold text-mint-400 mt-1">72</p>
                    <p className="data-figure text-[10px] text-muted-foreground mt-1">WITHIN RANGE</p>
                  </div>
                  <div className="lab-card-floating p-3">
                    <span className="eyebrow text-[9px]">FLAGS</span>
                    <p className="data-figure-lg text-2xl font-bold text-amber-warn mt-1">8</p>
                    <p className="data-figure text-[10px] text-muted-foreground mt-1">REVIEW REQ.</p>
                  </div>
                </div>
              </div>
              <div className="aspect-square max-h-[360px] mx-auto w-full rounded-2xl overflow-hidden inner-glow-bl">
                <HeroCanvas className="w-full h-full" variant="protein" cameraDistance={5.5} />
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="lab-card lab-card-accent p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-mint-500/15 border border-mint-500/30 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-mint-400" strokeWidth={1.6} />
              </div>
              <div>
                <h3 className="font-bold tracking-tight-x">Key Benefits</h3>
                <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                  CLINICAL · OPERATIONAL · STRATEGIC
                </span>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                "Pre-consultation reduces doctor workload",
                "Structured, priority-aware case sheets",
                "AYUSH + Modern medicine integration",
                "Multilingual, inclusive & accessible",
                "ABDM/FHIR ready for future integration",
                "Explainable AI with doctor override capability",
              ].map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-start gap-2 p-3 rounded-md bg-mint-500/8 border border-mint-500/25"
                >
                  <CheckCircle className="w-4 h-4 text-mint-400 mt-0.5 flex-shrink-0" strokeWidth={2.2} />
                  <p className="text-sm">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          <DisclaimerBanner type="warning" className="mb-8" />
        </motion.div>
      </div>
    </div>
  );
}