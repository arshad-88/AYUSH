import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/shared/Header";
import { opdStats } from "@/data/demoData";
import {
  Users,
  Mic,
  Brain,
  Leaf,
  FileText,
  Clock,
  AlertTriangle,
  ClipboardList,
  Stethoscope,
  Link2,
  ArrowRight,
  Activity,
  Shield,
  HeartPulse,
  Cpu,
  Atom,
  Sparkles,
  Zap,
  Eye,
  Lock,
  Globe,
} from "lucide-react";
import {
  BiomarkerBar,
  EkgWave,
  HeroCanvas,
  StatusBar,
  BarChart,
  AreaSparkline,
  RingProgress,
  RadialGauge,
  ParticleField,
  ScanText,
} from "@/components/scientific";

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const workflowSteps = [
  { number: 1, title: "Identity", subtitle: "Patient Auth", icon: Users, color: "blue" as const },
  { number: 2, title: "Interface", subtitle: "Voice / Touch", icon: Mic, color: "blue" as const },
  { number: 3, title: "Interview", subtitle: "Adaptive SOCRATES", icon: Brain, color: "teal" as const },
  { number: 4, title: "AYUSH", subtitle: "Dashavidha", icon: Leaf, color: "violet" as const },
  { number: 5, title: "OCR", subtitle: "Document Read", icon: FileText, color: "teal" as const },
  { number: 6, title: "Timeline", subtitle: "History Map", icon: Clock, color: "blue" as const },
  { number: 7, title: "Triage", subtitle: "Priority AI", icon: AlertTriangle, color: "red" as const },
  { number: 8, title: "Case Sheet", subtitle: "Structured", icon: ClipboardList, color: "teal" as const },
  { number: 9, title: "Verify", subtitle: "Doctor Sign-off", icon: Stethoscope, color: "green" as const },
  { number: 10, title: "FHIR", subtitle: "ABDM Sync", icon: Link2, color: "gold" as const },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <ParticleField density="medium" opacity={0.35} className="opacity-60" />
        <div className="absolute inset-0 surface-grid opacity-30 pointer-events-none" />
        <div className="scan-overlay" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 sm:pt-20 sm:pb-28">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            {/* LEFT: copy */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="relative"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full panel-glass border-trust-500/30 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-mint-500 animate-data-pulse" />
                <span className="data-figure text-[10px] tracking-widest text-trust-300">
                  CLINICAL OS · v1.0
                </span>
                <span className="text-muted-foreground/30">·</span>
                <span className="data-figure text-[10px] tracking-widest text-teal-400">
                  FDA-ALIGNED
                </span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight-x"
              >
                Precision
                <br />
                <span className="bg-gradient-to-r from-trust-300 via-trust-400 to-teal-400 bg-clip-text text-transparent">
                  Intelligence
                </span>
                <br />
                for the OPD.
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed"
              >
                An AI-augmented pre-consultation platform that captures patient history,
                AYUSH assessment, and records — then hands the doctor a structured,
                verified case sheet.
              </motion.p>

              <motion.div variants={fadeInUp} className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="text-base px-7 py-6 bg-gradient-to-r from-trust-500 to-teal-500 hover:from-trust-400 hover:to-teal-400 text-white border-0 rounded-xl glow-primary"
                  onClick={() => navigate("/patient/login")}
                >
                  Begin Assessment
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-7 py-6 rounded-xl border-trust-500/30 hover:bg-trust-500/10 hover:border-trust-500/50"
                  onClick={() => navigate("/doctor/login")}
                >
                  <Stethoscope className="mr-2 w-5 h-5" />
                  Doctor Console
                </Button>
              </motion.div>

              <motion.div variants={fadeInUp} className="mt-8 flex items-center gap-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5 text-teal-400" />
                  <span className="data-figure tracking-wider">AI ASSISTS · DOCTOR DECIDES</span>
                </div>
                <div className="h-3 w-px bg-bio-border" />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="w-3.5 h-3.5 text-trust-400" />
                  <span className="data-figure tracking-wider">END-TO-END ENCRYPTED</span>
                </div>
              </motion.div>
            </motion.div>

            {/* RIGHT: 3D hero with floating panels */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-square max-w-[560px] mx-auto w-full"
            >
              {/* Glow halo */}
              <div className="absolute inset-0 bg-gradient-radial from-trust-500/20 via-transparent to-transparent blur-3xl" />
              <HeroCanvas className="absolute inset-0" variant="dna" />

              {/* Floating data panels */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="absolute -left-4 sm:left-2 top-6 lab-card lab-card-accent p-3 w-44"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="eyebrow text-[9px]">THROUGHPUT</span>
                  <Activity className="w-3 h-3 text-trust-400" />
                </div>
                <div className="data-figure text-2xl font-bold text-trust-300">
                  {opdStats.todaysOPD}<span className="text-xs text-muted-foreground ml-1">/day</span>
                </div>
                <AreaSparkline values={[12, 18, 14, 22, 28, 24, 32, 30, 38, 42]} height={28} variant="primary" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="absolute -right-2 sm:right-2 top-1/3 lab-card lab-card-accent p-3 w-44"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="eyebrow text-[9px]">RISK INDEX</span>
                  <AlertTriangle className="w-3 h-3 text-red-critical" />
                </div>
                <RadialGauge value={opdStats.highRisk * 12} size={70} thickness={6} variant="critical" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.8 }}
                className="absolute -right-2 sm:right-4 bottom-8 lab-card lab-card-accent p-3 w-52"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="eyebrow text-[9px]">EKG · STREAM</span>
                  <span className="data-figure text-[9px] text-teal-400">LIVE</span>
                </div>
                <EkgWave height={40} showAxis={false} variant="accent" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="absolute -bottom-2 left-6 lab-card lab-card-accent p-3 w-52"
              >
                <BiomarkerBar
                  value={86}
                  label="MODEL CONFIDENCE"
                  unit="%"
                  variant="accent"
                  size="sm"
                  pulse
                />
                <div className="mt-2 flex items-center justify-between data-figure text-[9px] text-muted-foreground">
                  <span>OCR · NER · SOCRATES</span>
                  <span className="text-teal-400">▲ 2.4</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* KPI strip */}
        <div className="relative border-y border-trust-500/15 bg-bio-base/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <KpiCell label="TODAY'S OPD" value={opdStats.todaysOPD} suffix="cases" trend="+12%" />
              <KpiCell label="HIGH RISK" value={opdStats.highRisk} suffix="flagged" trend="real-time" variant="critical" />
              <KpiCell label="PRIORITY" value={opdStats.priority} suffix="pending" trend="queue" variant="warning" />
              <KpiCell label="ROUTINE" value={opdStats.routine} suffix="stable" trend="steady" variant="stable" />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 sm:py-28 relative">
        <div className="absolute inset-0 surface-grid opacity-20 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="WORKFLOW"
            title="End-to-End Clinical Pipeline"
            subtitle="From patient arrival to ABHA-ready case sheet — every stage instrumented and observable."
          />

          {/* Pipeline diagram */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="mt-12 lab-card lab-card-accent p-6 sm:p-10 relative overflow-hidden"
          >
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-1">
              {workflowSteps.map((step) => (
                <motion.div key={step.number} variants={fadeInUp} className="flex flex-col items-center gap-2">
                  <WorkflowMini number={step.number} icon={step.icon} color={step.color} />
                  <span className="text-[10px] font-bold text-foreground text-center leading-tight tracking-tight-x">
                    {step.title}
                  </span>
                  <span className="data-figure text-[9px] text-muted-foreground text-center leading-tight hidden sm:block tracking-wider">
                    {step.subtitle}
                  </span>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-bio-border/50 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                  AVG. CYCLE TIME
                </span>
                <span className="data-figure text-2xl font-bold text-trust-300">
                  6:42<span className="text-sm text-muted-foreground ml-1">min</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                  DATA FIDELITY
                </span>
                <span className="data-figure text-2xl font-bold text-teal-400">
                  98.4<span className="text-sm text-muted-foreground ml-1">%</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                  REDUCTION IN OPD TIME
                </span>
                <span className="data-figure text-2xl font-bold text-mint-400">
                  ~38<span className="text-sm text-muted-foreground ml-1">%</span>
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOR PATIENTS */}
      <section id="for-patients" className="py-20 sm:py-28 relative">
        <div className="absolute inset-0 surface-grid opacity-15 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="PATIENT EXPERIENCE"
            title="A Companion, Not a Form"
            subtitle="Designed for every literacy level and language — voice, touch, or text. The interface adapts to the patient, not the other way around."
          />

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12"
          >
            {[
              {
                icon: Mic,
                title: "Voice & Touch Interaction",
                description:
                  "Speak in your preferred language. The system understands 26 Indian languages through simulated Bhashini ASR integration.",
                metric: "26",
                metricUnit: "languages",
              },
              {
                icon: Brain,
                title: "Adaptive Clinical Interview",
                description:
                  "SOCRATES-driven questioning that adapts to your specific symptoms. Multi-fact answers are decomposed automatically.",
                metric: "12+",
                metricUnit: "branches",
              },
              {
                icon: Leaf,
                title: "AYUSH Assessment",
                description:
                  "Complete Dashavidha Pariksha assessment covering 10 traditional Ayurvedic parameters — explained in plain language.",
                metric: "10",
                metricUnit: "params",
              },
              {
                icon: FileText,
                title: "Document Digitization",
                description:
                  "Upload prescriptions, lab reports, and discharge summaries. Tesseract OCR extracts structured facts automatically.",
                metric: "94%",
                metricUnit: "accuracy",
              },
              {
                icon: Clock,
                title: "Medical Timeline",
                description:
                  "Your complete medical history organized chronologically — clear context for the consulting physician.",
                metric: "<3s",
                metricUnit: "render",
              },
              {
                icon: ClipboardList,
                title: "Structured Case Sheet",
                description:
                  "Receive a physician-ready case sheet capturing everything — SOCRATES, AYUSH, medications, allergies, red flags.",
                metric: "100%",
                metricUnit: "traceable",
              },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                className="lab-card lab-card-accent p-6 hover-lift group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-trust-500/20 to-teal-500/20 border border-trust-500/30 flex items-center justify-center group-hover:glow-primary transition-shadow">
                    <feature.icon className="w-5 h-5 text-trust-300" strokeWidth={1.6} />
                  </div>
                  <div className="text-right">
                    <div className="data-figure text-xl font-bold text-teal-400">{feature.metric}</div>
                    <div className="eyebrow text-[9px]">{feature.metricUnit}</div>
                  </div>
                </div>
                <h3 className="font-bold text-foreground mb-2 tracking-tight-x">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FOR DOCTORS */}
      <section id="for-doctors" className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 surface-grid opacity-20 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="CLINICIAN WORKSPACE"
            title="Walk into Every Consultation Prepared"
            subtitle="A complete, organized patient history — generated by AI, verified by you. The doctor's clinical judgment remains final."
          />

          {/* Featured panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-12 grid lg:grid-cols-2 gap-6"
          >
            <div className="lab-card lab-card-accent p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-trust-400" />
                  <span className="eyebrow">QUEUE INTELLIGENCE</span>
                </div>
                <span className="data-figure text-[10px] tracking-widest text-teal-400">
                  ● LIVE
                </span>
              </div>
              <BarChart
                title="OPD LOAD · LAST 12 HOURS"
                unit="patients / hr"
                data={[
                  { label: "08", value: 12 },
                  { label: "09", value: 24 },
                  { label: "10", value: 31 },
                  { label: "11", value: 28 },
                  { label: "12", value: 18 },
                  { label: "13", value: 22, highlight: true },
                  { label: "14", value: 26 },
                  { label: "15", value: 19 },
                ]}
              />
              <div className="mt-6 grid grid-cols-3 gap-3">
                <MetricPill label="URGENT" value="3" variant="critical" />
                <MetricPill label="PRIORITY" value="7" variant="warning" />
                <MetricPill label="ROUTINE" value="22" variant="stable" />
              </div>
            </div>

            <div className="lab-card lab-card-accent p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-red-critical" />
                  <span className="eyebrow">CLINICAL SIGNALS</span>
                </div>
                <span className="data-figure text-[10px] tracking-widest text-muted-foreground">
                  PT-2418 · RED FLAGS
                </span>
              </div>
              <BiomarkerBar value={82} label="CHEST PAIN SEVERITY" unit="/10" variant="critical" pulse />
              <div className="mt-4">
                <BiomarkerBar value={68} label="ASSOCIATED SYMPTOMS" unit="%" variant="warning" />
              </div>
              <div className="mt-4">
                <BiomarkerBar value={94} label="CONFIDENCE · RED FLAGS" unit="%" variant="accent" />
              </div>
              <div className="mt-6 pt-4 border-t border-bio-border/40">
                <div className="flex items-center justify-between mb-3">
                  <span className="eyebrow">COMPOSITE RISK</span>
                  <span className="data-figure text-[10px] text-red-critical tracking-widest">URGENT</span>
                </div>
                <RadialGauge value={82} size={120} label="RISK SCORE" unit="/100" variant="critical" thickness={9} />
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"
          >
            {[
              {
                icon: ClipboardList,
                title: "Smart Case Sheet",
                description:
                  "Structured summary: SOCRATES, AYUSH, medications, allergies, red flags — ready before you walk in.",
              },
              {
                icon: AlertTriangle,
                title: "Priority-Aware Queue",
                description:
                  "OPD queue sorted by clinical priority. Urgent cases highlighted. Rule-based triage with explainable reasoning.",
              },
              {
                icon: Brain,
                title: "Explainable AI",
                description:
                  "See why the AI recommended a particular priority. Transparent factors: severity, duration, history, vitals.",
              },
              {
                icon: Shield,
                title: "Doctor as Final Authority",
                description:
                  "Confirm, edit, or override any AI recommendation. Your clinical judgment always takes precedence. All overrides logged.",
              },
              {
                icon: Link2,
                title: "FHIR / ABDM Ready",
                description:
                  "HL7 FHIR R4 compatible case sheets. Ready for ABDM integration. Push to hospital HIS/EMR systems.",
              },
              {
                icon: Eye,
                title: "Provenance Tracking",
                description:
                  "Every fact tagged with source: PATIENT · DOCUMENT · DOCTOR · SYSTEM. Audit trail preserved.",
              },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                className="lab-card lab-card-accent p-6 hover-lift"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500/20 to-trust-500/20 border border-teal-500/30 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-teal-400" strokeWidth={1.6} />
                </div>
                <h3 className="font-bold text-foreground mb-2 tracking-tight-x">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 surface-grid opacity-15 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="CAPABILITIES"
            title="An Intelligent Layer Over the OPD"
            subtitle="Clinical-grade AI, deterministic safety rails, and ABDM-native interoperability — engineered for Indian public health."
          />

          <div className="mt-12 grid lg:grid-cols-3 gap-6">
            {[
              {
                icon: Atom,
                title: "Multilingual ASR",
                description:
                  "Voice capture in 26 Indian languages via Bhashini abstraction. Falls back to touch and text input seamlessly.",
                points: ["Auto language detect", "Noise-robust", "Bhashini-ready"],
              },
              {
                icon: Brain,
                title: "Question Planner",
                description:
                  "Branching interview logic driven by clinical rules. Local AI + Groq fallback. Never invents values outside the plan.",
                points: ["Complaint-specific trees", "Multi-fact aware", "Contradiction aware"],
              },
              {
                icon: Zap,
                title: "Rule-Based Triage",
                description:
                  "Deterministic priority detection with explainable factors. The doctor can always override with reason logged.",
                points: ["Urgent / Priority / Routine", "Audit log", "One-tap override"],
              },
              {
                icon: FileText,
                title: "Document OCR",
                description:
                  "Tesseract.js powered extraction from prescriptions, lab reports, discharge summaries. Provenance-tagged facts.",
                points: ["Fact extraction", "Confidence scoring", "DOCUMENT provenance"],
              },
              {
                icon: Globe,
                title: "ABDM Integration",
                description:
                  "FHIR R4 compatible case sheets. Link ABHA identity, push to HIE-CM, share with consented providers.",
                points: ["FHIR R4", "Consent-driven", "Audit-ready"],
              },
              {
                icon: Lock,
                title: "Privacy & Safety",
                description:
                  "AI assists — doctor decides. No autonomous diagnosis. All actions logged. End-to-end encrypted in transit.",
                points: ["Doctor-in-the-loop", "Provenance", "Encryption"],
              },
            ].map((c) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="lab-card lab-card-accent p-6 hover-lift"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-trust-500/10 border border-trust-500/30 flex items-center justify-center">
                    <c.icon className="w-5 h-5 text-trust-300" strokeWidth={1.6} />
                  </div>
                  <h3 className="font-bold text-foreground tracking-tight-x">{c.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {c.description}
                </p>
                <ul className="space-y-1.5">
                  {c.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 data-figure text-[11px] text-muted-foreground">
                      <span className="w-1 h-1 rounded-full bg-teal-400" />
                      {p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lab-card lab-card-accent p-10 sm:p-14 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 surface-grid-fine opacity-40 pointer-events-none" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full tag-info mb-6">
                <Sparkles className="w-3 h-3" />
                <span className="data-figure text-[10px] tracking-widest">READY TO PILOT</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight-x">
                The OPD, Reimagined.
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
                Try the complete pre-consultation journey — patient, AI interview,
                AYUSH assessment, OCR, triage, and clinical verification.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  size="lg"
                  className="text-base px-7 py-6 bg-gradient-to-r from-trust-500 to-teal-500 hover:from-trust-400 hover:to-teal-400 text-white border-0 rounded-xl glow-primary"
                  onClick={() => navigate("/patient/login")}
                >
                  Start Patient Flow
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-7 py-6 rounded-xl border-trust-500/30 hover:bg-trust-500/10"
                  onClick={() => navigate("/doctor/login")}
                >
                  <Stethoscope className="mr-2 w-5 h-5" />
                  Doctor Console
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-trust-500/15 bg-bio-base/60 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-trust-500 to-teal-500 flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" strokeWidth={2.4} />
              </div>
              <div className="text-left">
                <div className="font-bold text-sm tracking-tight-x">
                  MediKiosk<span className="text-trust-400">.</span>AI
                </div>
                <div className="data-figure text-[10px] text-muted-foreground tracking-widest">
                  SMART INDIA HACKATHON 2026
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 data-figure text-[10px] text-muted-foreground tracking-widest">
              <span>MINISTRY OF AYUSH</span>
              <span className="text-trust-500/40">·</span>
              <span>AIIA</span>
              <span className="text-trust-500/40">·</span>
              <span>ABDM-COMPLIANT</span>
            </div>
            <StatusBar latency="42ms" sessionId="MK-2026" />
          </div>
        </div>
      </footer>
    </div>
  );
}

/* --------- helper components --------- */

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto">
      <div className="inline-flex items-center gap-2 mb-4">
        <span className="w-6 h-px bg-trust-500/50" />
        <span className="eyebrow">{eyebrow}</span>
        <span className="w-6 h-px bg-trust-500/50" />
      </div>
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight-x">
        {title}
      </h2>
      <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
        {subtitle}
      </p>
    </motion.div>
  );
}

function KpiCell({
  label,
  value,
  suffix,
  trend,
  variant = "primary",
}: {
  label: string;
  value: number;
  suffix: string;
  trend: string;
  variant?: "primary" | "critical" | "warning" | "stable";
}) {
  const colors = {
    primary: { bar: "from-trust-500 to-teal-500", text: "text-trust-300" },
    critical: { bar: "from-red-urgent to-red-critical", text: "text-red-critical" },
    warning: { bar: "from-amber-warn to-orange-500", text: "text-amber-warn" },
    stable: { bar: "from-mint-500 to-teal-500", text: "text-mint-400" },
  };
  return (
    <div className="flex items-center gap-4">
      <div className={`w-1 h-12 rounded-full bg-gradient-to-b ${colors[variant].bar}`} />
      <div>
        <div className="eyebrow text-[10px]">{label}</div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className={`data-figure text-3xl font-bold ${colors[variant].text}`}>{value}</span>
          <span className="data-figure text-xs text-muted-foreground tracking-wider">{suffix}</span>
        </div>
        <div className="data-figure text-[10px] text-muted-foreground tracking-widest mt-0.5">
          {trend}
        </div>
      </div>
    </div>
  );
}

function MetricPill({ label, value, variant }: { label: string; value: string; variant: "critical" | "warning" | "stable" }) {
  const map = {
    critical: "tag-critical",
    warning: "tag-urgent",
    stable: "tag-stable",
  };
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-md border ${map[variant]}`}>
      <span className="data-figure text-[10px] tracking-widest">{label}</span>
      <span className="data-figure text-lg font-bold">{value}</span>
    </div>
  );
}

function WorkflowMini({ number, icon: Icon, color }: { number: number; icon: typeof Mic; color: string }) {
  const map: Record<string, string> = {
    blue: "bg-trust-500/15 text-trust-300 border-trust-500/30",
    teal: "bg-teal-500/15 text-teal-400 border-teal-500/30",
    red: "bg-red-urgent/15 text-red-critical border-red-urgent/30",
    green: "bg-mint-500/15 text-mint-400 border-mint-500/30",
    violet: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    gold: "bg-amber-warn/15 text-amber-warn border-amber-warn/30",
  };
  return (
    <div className="relative">
      <div
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center border hover-lift ${map[color]}`}
      >
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.6} />
      </div>
      <span className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-md bg-bio-surface border border-trust-500/40 flex items-center justify-center text-[9px] font-bold data-figure text-trust-300">
        {number.toString().padStart(2, "0")}
      </span>
    </div>
  );
}