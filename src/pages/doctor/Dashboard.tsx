import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { usePatientStore, PatientState } from "@/store/patientStore";
import { useDoctorStore, QueuePatient } from "@/store/doctorStore";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/shared/Header";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { opdStats } from "@/data/demoData";
import {
  Stethoscope,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowRight,
  Activity,
  SortAsc,
  RefreshCw,
  Inbox,
  Cpu,
  Radio,
} from "lucide-react";
import {
  AreaSparkline,
  BarChart,
  BiomarkerBar,
  RingProgress,
  StatusBar,
  DNASpinner,
} from "@/components/scientific";

type SortBy = "priority" | "waitTime" | "token";
const priorityOrder: Record<string, number> = { urgent: 0, priority: 1, routine: 2 };

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { setPatient } = usePatientStore();
  const { queue: zustandQueue, clearQueue } = useDoctorStore();
  const [sortBy, setSortBy] = useState<SortBy>("priority");

  const convexQueue = useQuery(api.doctorQueue.getEnrichedQueue, {});
  const updateQueueStatus = useMutation(api.doctorQueue.updateQueueStatus);

  useEffect(() => {
    if (convexQueue !== undefined && convexQueue.length > 0) {
      const queuePatients: QueuePatient[] = convexQueue.map((item: any) => ({
        id: item._id,
        name: item.patientName,
        age: item.patientAge,
        gender: item.patientGender,
        chiefComplaint: item.chiefComplaint,
        priority: item.priority,
        timestamp: new Date(item.queuedAt).toISOString(),
        status: item.status,
        patientStateSnapshot: {
          name: item.patientName,
          age: item.patientAge,
          gender: item.patientGender,
          chiefComplaint: item.chiefComplaint,
        } as PatientState,
      }));
      useDoctorStore.setState({ queue: queuePatients });
    }
  }, [convexQueue]);

  const waitingPatients = convexQueue ? convexQueue : [];

  const sortedPatients = [...waitingPatients].sort((a, b) => {
    if (sortBy === "priority") return priorityOrder[a.priority] - priorityOrder[b.priority];
    if (sortBy === "waitTime") return b.queuedAt - a.queuedAt;
    return a.queuedAt - b.queuedAt;
  });

  const urgentCount = waitingPatients.filter((p) => p.priority === "urgent").length;
  const priorityCount = waitingPatients.filter((p) => p.priority === "priority").length;
  const routineCount = waitingPatients.filter((p) => p.priority === "routine").length;

  const handlePatientClick = async (queueItem: any) => {
    const zustandPatient = zustandQueue.find((p: any) => p.id === queueItem._id);
    if (zustandPatient) {
      setPatient({ ...zustandPatient.patientStateSnapshot });
    } else {
      setPatient({
        name: queueItem.patientName,
        age: queueItem.patientAge,
        gender: queueItem.patientGender,
        chiefComplaint: queueItem.chiefComplaint,
      });
    }
    try {
      await updateQueueStatus({
        queueId: queueItem._id,
        status: "in-consultation",
      });
      useDoctorStore.getState().updatePatientStatus(queueItem._id, "in-consultation");
    } catch (error) {
      console.error("Failed to update queue status:", error);
    }
    navigate("/doctor/patient");
  };

  const [waitTimes, setWaitTimes] = useState<Record<string, number>>({});
  useEffect(() => {
    if (convexQueue && convexQueue.length > 0) {
      const now = Date.now();
      const newWaitTimes: Record<string, number> = {};
      convexQueue.forEach((item: any) => {
        newWaitTimes[item._id] = Math.round((now - item.queuedAt) / 60000);
      });
      setWaitTimes(newWaitTimes);
    }
  }, [convexQueue]);
  const formatWaitTime = (itemId: string) => {
    const minutes = waitTimes[itemId];
    return minutes !== undefined ? minutes + 'm' : '--';
  };

  const aiThroughput = [12, 18, 24, 22, 28, 26, 34, 38, 42, 36, 44, 40];

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 surface-grid opacity-15 pointer-events-none" />
      <Header />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header row */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-trust-500 to-teal-500 flex items-center justify-center glow-primary">
                  <Stethoscope className="w-6 h-6 text-white" strokeWidth={1.8} />
                </div>
                <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-mint-500 ring-2 ring-bio-base animate-data-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="data-figure text-[10px] tracking-widest text-mint-400">● LIVE CONSOLE</span>
                  <span className="text-trust-500/40">·</span>
                  <span className="data-figure text-[10px] tracking-widest text-muted-foreground">DOCTOR VIEW</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight-x">
                  Clinical Console<span className="text-trust-400">.</span>
                </h1>
                <p className="text-xs text-muted-foreground">
                  Real-time OPD queue · rule-based triage · AI-assisted, doctor-verified
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DisclaimerBanner type="demo" className="hidden lg:block max-w-xs" />
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-trust-500/30 hover:bg-trust-500/10"
                onClick={() => clearQueue()}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
            </div>
          </div>

          {/* KPI band */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <KpiCell
              label="TODAY"
              value={opdStats.todaysOPD}
              suffix="cases"
              icon={Users}
              variant="primary"
            />
            <KpiCell
              label="URGENT"
              value={urgentCount}
              suffix="flagged"
              icon={AlertTriangle}
              variant="critical"
            />
            <KpiCell
              label="PRIORITY"
              value={priorityCount}
              suffix="queue"
              icon={Clock}
              variant="warning"
            />
            <KpiCell
              label="ROUTINE"
              value={routineCount}
              suffix="stable"
              icon={CheckCircle}
              variant="stable"
            />
            <div className="lab-card lab-card-accent p-4 flex items-center gap-3 col-span-2 lg:col-span-1">
              <RingProgress value={76} size={56} thickness={5} variant="primary" showValue={false} />
              <div className="flex-1 min-w-0">
                <div className="data-figure text-[10px] tracking-widest text-muted-foreground">AI LOAD</div>
                <div className="data-figure text-xl font-bold text-trust-300">76<span className="text-xs text-muted-foreground">%</span></div>
                <div className="data-figure text-[9px] text-mint-400 tracking-widest">▲ NOMINAL</div>
              </div>
            </div>
          </div>

          {/* Throughput chart */}
          <div className="grid lg:grid-cols-[1fr_360px] gap-4">
            <div className="lab-card lab-card-accent p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-trust-400" />
                  <span className="eyebrow">INTAKE THROUGHPUT · 12H</span>
                </div>
                <span className="data-figure text-[10px] text-teal-400 tracking-widest">● STREAMING</span>
              </div>
              <AreaSparkline values={aiThroughput} variant="primary" height={120} max={50} />
              <div className="mt-4 grid grid-cols-3 gap-3">
                <BiomarkerBar value={86} label="AVG. CYCLE" unit="%" variant="accent" size="sm" />
                <BiomarkerBar value={42} label="URGENT SHARE" unit="%" variant="warning" size="sm" />
                <BiomarkerBar value={98} label="DATA FIDELITY" unit="%" variant="primary" size="sm" />
              </div>
            </div>

            <div className="lab-card lab-card-accent p-6">
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="w-4 h-4 text-teal-400" />
                <span className="eyebrow">MODEL TELEMETRY</span>
              </div>
              <div className="space-y-4">
                <BarChart
                  title="OCR CONFIDENCE"
                  data={[
                    { label: "RX", value: 94 },
                    { label: "LAB", value: 88 },
                    { label: "DC", value: 76 },
                    { label: "NOTE", value: 82 },
                  ]}
                />
              </div>
              <div className="mt-4 pt-4 border-t border-bio-border/50">
                <StatusBar latency="38ms" sessionId="MODEL-GROQ-LL" />
              </div>
            </div>
          </div>

          {/* Sort controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <SortAsc className="w-4 h-4" />
              <span className="data-figure tracking-widest">SORT BY</span>
            </div>
            {[
              { key: "priority" as SortBy, label: "Priority", icon: AlertTriangle },
              { key: "waitTime" as SortBy, label: "Wait Time", icon: Clock },
              { key: "token" as SortBy, label: "Queue Order", icon: Radio },
            ].map((option) => (
              <Button
                key={option.key}
                variant={sortBy === option.key ? "default" : "outline"}
                size="sm"
                className={`text-xs h-8 ${
                  sortBy === option.key
                    ? "bg-gradient-to-r from-trust-500 to-teal-500 text-white border-0"
                    : "border-trust-500/30 hover:bg-trust-500/10"
                }`}
                onClick={() => setSortBy(option.key)}
              >
                <option.icon className="w-3 h-3 mr-1.5" />
                {option.label}
              </Button>
            ))}
            <span className="ml-auto data-figure text-[10px] text-muted-foreground tracking-widest">
              {waitingPatients.length} PATIENTS · QUEUE
            </span>
          </div>

          {/* Patient queue */}
          <div className="lab-card lab-card-accent overflow-hidden">
            <div className="px-6 py-4 border-b border-trust-500/15 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-trust-400" />
                <span className="eyebrow">OPD QUEUE</span>
              </div>
              <DNASpinner size="sm" label="Syncing" />
            </div>
            <div className="p-3 sm:p-4">
              {sortedPatients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Inbox className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm font-medium">Queue is empty</p>
                  <p className="text-xs mt-1">Complete a patient assessment to populate the queue</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedPatients.map((patient, i) => (
                    <QueueRow
                      key={patient._id}
                      index={i}
                      patient={patient}
                      waitTime={formatWaitTime(patient._id)}
                      onClick={() => handlePatientClick(patient)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function KpiCell({ label, value, suffix, icon: Icon, variant }: {
  label: string;
  value: number;
  suffix: string;
  icon: typeof Users;
  variant: "primary" | "critical" | "warning" | "stable";
}) {
  const colors = {
    primary: { text: "text-trust-300", bar: "from-trust-500 to-teal-500", icon: "text-trust-300", glow: "glow-primary" },
    critical: { text: "text-red-critical", bar: "from-red-urgent to-red-critical", icon: "text-red-critical", glow: "" },
    warning: { text: "text-amber-warn", bar: "from-amber-warn to-orange-500", icon: "text-amber-warn", glow: "" },
    stable: { text: "text-mint-400", bar: "from-mint-500 to-teal-500", icon: "text-mint-400", glow: "" },
  };
  const c = colors[variant];
  return (
    <div className="lab-card lab-card-accent p-4 relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${c.bar}`} />
      <div className="flex items-start justify-between mb-2">
        <span className="eyebrow">{label}</span>
        <Icon className={`w-4 h-4 ${c.icon}`} strokeWidth={1.6} />
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={`data-figure text-3xl font-bold ${c.text}`}>{value}</span>
        <span className="data-figure text-[10px] text-muted-foreground tracking-widest">{suffix}</span>
      </div>
    </div>
  );
}

function QueueRow({ patient, index, waitTime, onClick }: {
  patient: any;
  index: number;
  waitTime: string;
  onClick: () => void;
}) {
  const isUrgent = patient.priority === "urgent";
  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ x: 4 }}
      onClick={onClick}
      className={`w-full p-3 sm:p-4 rounded-lg border text-left transition-all relative overflow-hidden group ${
        isUrgent
          ? "border-red-urgent/40 bg-red-urgent/5 hover:bg-red-urgent/10"
          : "border-trust-500/15 bg-bio-surface/40 hover:bg-bio-elevated/60 hover:border-trust-500/30"
      }`}
    >
      {isUrgent && (
        <span className="absolute inset-0 bg-gradient-to-r from-red-urgent/10 via-transparent to-transparent animate-data-pulse pointer-events-none" />
      )}
      <div className="relative flex items-center gap-3 sm:gap-4">
        {/* Priority indicator */}
        <div className={`w-10 h-10 rounded-md flex items-center justify-center font-bold flex-shrink-0 data-figure text-sm ${
          isUrgent
            ? "bg-red-urgent/20 text-red-critical border border-red-urgent/40"
            : patient.priority === "priority"
              ? "bg-amber-warn/20 text-amber-warn border border-amber-warn/40"
              : "bg-mint-500/15 text-mint-400 border border-mint-500/30"
        }`}>
          {isUrgent ? "!" : (index + 1).toString().padStart(2, "0")}
        </div>

        {/* Patient info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-bold tracking-tight-x truncate">{patient.patientName}</p>
            <span className="data-figure text-[10px] text-muted-foreground tracking-wider whitespace-nowrap">
              {patient.patientAge}y · {patient.patientGender}
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            <span className="data-figure text-[10px] text-trust-400 mr-2 tracking-widest">CC</span>
            {patient.chiefComplaint}
          </p>
        </div>

        {/* Wait time */}
        <div className="hidden sm:block text-right">
          <div className="data-figure text-sm font-semibold">{waitTime}</div>
          <div className="data-figure text-[9px] text-muted-foreground tracking-widest">WAIT</div>
        </div>

        <PriorityBadge priority={patient.priority as any} size="sm" />

        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-trust-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
      </div>
    </motion.button>
  );
}