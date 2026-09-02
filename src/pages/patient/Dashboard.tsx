import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { usePatientStore } from "@/store/patientStore";
import { Header } from "@/components/shared/Header";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { getAuthService } from "@/services/auth";
import {
  Plus,
  LogOut,
  Calendar,
  FileText,
  Leaf,
  Shield,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Activity,
  Loader2,
  Activity as Pulse,
  User,
  Dna,
} from "lucide-react";
import {
  BiomarkerBar,
  EkgWave,
  RingProgress,
  StatusBar,
} from "@/components/scientific";

type DashboardView = "overview" | "consultation-detail";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const currentPatient = usePatientStore((state) => state.currentPatient);
  const name = usePatientStore((state) => state.name);
  const abhaId = usePatientStore((state) => state.abhaId);
  const clinicalState = usePatientStore((state) => state.clinicalState);
  const ayush = usePatientStore((state) => state.ayush);
  const documents = usePatientStore((state) => state.documents);
  const timeline = usePatientStore((state) => state.timeline);
  const triage = usePatientStore((state) => state.triage);
  const consultationHistory = usePatientStore((state) => state.consultationHistory);
  const logoutPatient = usePatientStore((state) => state.logoutPatient ?? state.reset);
  const startNewAssessment = usePatientStore((state) => state.startNewAssessment);

  const authService = getAuthService();
  const [view, setView] = useState<DashboardView>("overview");
  const [selectedConsultation, setSelectedConsultation] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await authService.logout();
    logoutPatient();
    setTimeout(() => navigate("/patient/login"), 600);
  };

  const handleStartAssessment = () => {
    startNewAssessment();
    navigate("/patient/consent");
  };

  const demoConsultations = [
    {
      id: "cons-001",
      date: "15 Aug 2026",
      chiefComplaint: "[DEMO] Mild joint pain in knee",
      priority: "routine" as const,
      status: "Completed",
      casesheetAvailable: true,
    },
    {
      id: "cons-002",
      date: "08 Aug 2026",
      chiefComplaint: "[DEMO] Abdominal discomfort",
      priority: "priority" as const,
      status: "Completed",
      casesheetAvailable: true,
    },
  ];

  const previousConsultations = [
    ...consultationHistory.map((consultation) => ({
      id: consultation.id,
      date: new Date(consultation.completedAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      chiefComplaint: consultation.clinicalState.chiefComplaint || "Clinical assessment",
      priority: "routine" as const,
      status: "Completed",
      casesheetAvailable: true,
    })),
    ...demoConsultations,
  ];

  if (view === "consultation-detail" && selectedConsultation) {
    const consultation = previousConsultations.find((c) => c.id === selectedConsultation);
    if (!consultation) return null;

    return (
      <div className="min-h-screen relative">
        <div className="absolute inset-0 surface-grid opacity-15 pointer-events-none" />
        <Header />
        <div className="relative max-w-3xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="lab-card lab-card-accent mb-6 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight-x">Consultation Details</h2>
                  <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                    {consultation.date}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setView("overview");
                    setSelectedConsultation(null);
                  }}
                  className="hover:bg-trust-500/10"
                >
                  ← Back to Dashboard
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-md bg-trust-500/8 border border-trust-500/25">
                  <span className="data-figure text-[10px] tracking-widest text-trust-300">CHIEF COMPLAINT</span>
                  <p className="text-sm font-semibold mt-1">{consultation.chiefComplaint}</p>
                </div>
                <div className="p-3 rounded-md bg-bio-base/50 border border-trust-500/20">
                  <span className="data-figure text-[10px] tracking-widest text-muted-foreground">PRIORITY</span>
                  <div className="mt-1">
                    <PriorityBadge priority={consultation.priority} size="sm" />
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-md tag-stable">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="data-figure text-xs tracking-widest">CONSULTATION STATUS · {consultation.status.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 surface-grid opacity-15 pointer-events-none" />
      <Header />
      <div className="relative max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Hero identity card */}
          <div className="lab-card lab-card-accent p-6 sm:p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <StatusBar latency="42ms" sessionId="PT-VIEW" />
            </div>
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-trust-500/30 to-teal-500/30 border border-trust-500/40 flex items-center justify-center">
                  <User className="w-7 h-7 text-trust-300" strokeWidth={1.6} />
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-mint-500 ring-2 ring-bio-base animate-data-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="data-figure text-[10px] tracking-widest text-mint-400">● AUTHENTICATED</span>
                    <span className="text-trust-500/30">·</span>
                    <span className="data-figure text-[10px] tracking-widest text-muted-foreground">PATIENT VIEW</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight-x">
                    Welcome, {name || "Patient"}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Pulse className="w-3 h-3 text-trust-400" />
                      <span className="data-figure tracking-wider">ID · {currentPatient?.patientId || "—"}</span>
                    </span>
                    <span className="text-trust-500/30">·</span>
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-3 h-3 text-teal-400" />
                      <span className="data-figure tracking-wider">ABHA · {abhaId ? `${abhaId.substring(0, 8)}…` : "NOT LINKED"}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleStartAssessment}
                  className="h-12 px-6 bg-gradient-to-r from-trust-500 to-teal-500 hover:from-trust-400 hover:to-teal-400 text-white border-0 glow-primary"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Start New Assessment
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="h-12 px-6 border-trust-500/30 hover:bg-trust-500/10"
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-trust-500/15">
              <EkgWave height={32} showAxis={false} variant="primary" />
            </div>
          </div>

          {/* Previous consultations */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-trust-400" />
              <h2 className="text-lg font-bold tracking-tight-x">Previous Consultations</h2>
              <span className="ml-auto data-figure text-[10px] text-muted-foreground tracking-widest">
                {previousConsultations.length} ON FILE
              </span>
            </div>
            {previousConsultations.length > 0 ? (
              <div className="space-y-2">
                {previousConsultations.map((consultation) => (
                  <motion.button
                    key={consultation.id}
                    whileHover={{ x: 4 }}
                    onClick={() => {
                      setSelectedConsultation(consultation.id);
                      setView("consultation-detail");
                    }}
                    className="w-full p-4 rounded-md border border-trust-500/15 bg-bio-surface/40 hover:bg-bio-elevated/60 hover:border-trust-500/30 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="text-sm font-semibold truncate">{consultation.chiefComplaint}</p>
                          <PriorityBadge priority={consultation.priority} size="sm" />
                        </div>
                        <div className="flex items-center gap-3 data-figure text-[10px] text-muted-foreground tracking-widest">
                          <span>{consultation.date}</span>
                          <span className="text-trust-500/30">·</span>
                          <span>{consultation.status.toUpperCase()}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-trust-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="lab-card lab-card-accent p-6 text-center text-muted-foreground">
                <p className="text-sm">No previous consultations found.</p>
              </div>
            )}
          </div>

          {/* Two-column quick view */}
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div className="lab-card lab-card-accent p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-trust-500/15 border border-trust-500/30 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-trust-300" strokeWidth={1.6} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold tracking-tight-x">Clinical History</h3>
                  <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                    ACTIVE RECORD
                  </span>
                </div>
              </div>
              {clinicalState?.chiefComplaint ? (
                <div className="p-3 rounded-md bg-trust-500/8 border border-trust-500/25">
                  <span className="data-figure text-[10px] tracking-widest text-trust-300">
                    CHIEF COMPLAINT
                  </span>
                  <p className="text-sm font-semibold mt-1">{clinicalState.chiefComplaint}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No active clinical history.</p>
              )}
            </div>

            <div className="lab-card lab-card-accent p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-teal-400" strokeWidth={1.6} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold tracking-tight-x">AYUSH Profile</h3>
                  <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                    {ayush && (ayush.prakriti || ayush.vikriti) ? "COMPLETED" : "PENDING"}
                  </span>
                </div>
                {ayush && (ayush.prakriti || ayush.vikriti) && (
                  <RingProgress
                    value={Object.values(ayush).filter((v) => v && v.trim()).length * 10}
                    size={36}
                    thickness={3}
                    variant="accent"
                    showValue={false}
                  />
                )}
              </div>
              {ayush && (ayush.prakriti || ayush.vikriti) ? (
                <div className="grid grid-cols-2 gap-2">
                  {ayush.prakriti && (
                    <div className="p-2.5 rounded-md bg-teal-500/8 border border-teal-500/20">
                      <span className="data-figure text-[10px] tracking-widest text-teal-400">PRAKRITI</span>
                      <p className="text-sm font-semibold mt-0.5">{ayush.prakriti}</p>
                    </div>
                  )}
                  {ayush.vikriti && (
                    <div className="p-2.5 rounded-md bg-teal-500/8 border border-teal-500/20">
                      <span className="data-figure text-[10px] tracking-widest text-teal-400">VIKRITI</span>
                      <p className="text-sm font-semibold mt-0.5">{ayush.vikriti}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">AYUSH assessment not completed.</p>
              )}
            </div>

            <div className="lab-card lab-card-accent p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-amber-warn/15 border border-amber-warn/30 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-amber-warn" strokeWidth={1.6} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold tracking-tight-x">Documents</h3>
                  <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                    OCR · EXTRACTED
                  </span>
                </div>
              </div>
              {documents && documents.length > 0 ? (
                <BiomarkerBar
                  value={documents.length}
                  max={10}
                  label="ON FILE"
                  unit="docs"
                  variant="warning"
                  showValue
                />
              ) : (
                <p className="text-sm text-muted-foreground">No documents uploaded.</p>
              )}
            </div>

            {triage && (
              <div className={`lab-card lab-card-accent p-5 ${
                triage.priority === "urgent"
                  ? "border-red-urgent/40"
                  : triage.priority === "priority"
                    ? "border-amber-warn/40"
                    : "border-mint-500/40"
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                    triage.priority === "urgent"
                      ? "bg-red-urgent/15 border-red-urgent/30"
                      : triage.priority === "priority"
                        ? "bg-amber-warn/15 border-amber-warn/30"
                        : "bg-mint-500/15 border-mint-500/30"
                  }`}>
                    <AlertTriangle className={`w-4 h-4 ${
                      triage.priority === "urgent"
                        ? "text-red-critical"
                        : triage.priority === "priority"
                          ? "text-amber-warn"
                          : "text-mint-400"
                    }`} strokeWidth={1.6} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold tracking-tight-x">Triage Result</h3>
                    <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                      AI-ASSISTED
                    </span>
                  </div>
                  <PriorityBadge priority={triage.priority} size="sm" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Will be confirmed by the consulting physician.
                </p>
              </div>
            )}
          </div>

          {/* Timeline */}
          {timeline && timeline.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Dna className="w-4 h-4 text-trust-400" />
                <h2 className="text-lg font-bold tracking-tight-x">Clinical Timeline</h2>
              </div>
              <div className="lab-card lab-card-accent p-5 space-y-3 max-h-72 overflow-y-auto">
                {timeline.map((event: any, i: number) => (
                  <div key={i} className="flex gap-3 pb-3 border-b border-trust-500/10 last:border-0">
                    <div className="w-2 h-2 rounded-full bg-trust-400 mt-1.5 flex-shrink-0 ring-4 ring-trust-400/15" />
                    <div className="flex-1">
                      <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                        {event.date}
                      </span>
                      <p className="text-sm font-semibold tracking-tight-x mt-0.5">{event.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center data-figure text-[10px] text-muted-foreground tracking-widest py-4">
            MEDIKIOSK PATIENT PORTAL · DEMO MODE · SESSION-ONLY
          </div>
        </motion.div>
      </div>
    </div>
  );
}