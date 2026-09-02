import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Globe,
  SortAsc,
  RefreshCw,
  Inbox,
} from "lucide-react";

type SortBy = "priority" | "waitTime" | "token";
const priorityOrder: Record<string, number> = { urgent: 0, priority: 1, routine: 2 };

  // Demo seeding removed; queue comes from Convex.

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { setPatient } = usePatientStore();
  const { queue: zustandQueue, clearQueue } = useDoctorStore();
  const [sortBy, setSortBy] = useState<SortBy>("priority");

  // Load queue from Convex
  const convexQueue = useQuery(api.doctorQueue.getEnrichedQueue, {});
  const updateQueueStatus = useMutation(api.doctorQueue.updateQueueStatus);

  // Hydrate Zustand queue from Convex when data arrives
  useEffect(() => {
    if (convexQueue !== undefined && convexQueue.length > 0) {
      // Convert to QueuePatient format for Zustand (for backward compat)
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
          // Minimal snapshot; will be filled when clicking
          name: item.patientName,
          age: item.patientAge,
          gender: item.patientGender,
          chiefComplaint: item.chiefComplaint,
          // other fields default
        } as PatientState,
      }));
      // Replace Zustand queue
      useDoctorStore.setState({ queue: queuePatients });
    }
  }, [convexQueue]);

  const waitingPatients = convexQueue ? convexQueue : [];

  const sortedPatients = [...waitingPatients].sort((a, b) => {
    if (sortBy === "priority") return priorityOrder[a.priority] - priorityOrder[b.priority];
    if (sortBy === "waitTime") {
      // Use queuedAt timestamps for sorting; no Date.now in render
      return b.queuedAt - a.queuedAt; // longer wait first (older)
    }
    return a.queuedAt - b.queuedAt; // FIFO
  });

  const urgentCount = waitingPatients.filter((p) => p.priority === "urgent").length;
  const priorityCount = waitingPatients.filter((p) => p.priority === "priority").length;
  const routineCount = waitingPatients.filter((p) => p.priority === "routine").length;

  const handlePatientClick = async (queueItem: any) => {
    // Load the patient's full state snapshot into the patient store
    // For now, we use the Zustand snapshot if available, or create a minimal one
    const zustandPatient = zustandQueue.find((p: any) => p.id === queueItem._id);
    if (zustandPatient) {
      setPatient({
        ...zustandPatient.patientStateSnapshot,
      });
    } else {
      // Fallback: create minimal snapshot from queue data
      setPatient({
        name: queueItem.patientName,
        age: queueItem.patientAge,
        gender: queueItem.patientGender,
        chiefComplaint: queueItem.chiefComplaint,
        // Other fields will be empty; doctor detail page will show what's available
      });
    }
    // Update status in Convex and Zustand
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

  // Compute wait minutes in an effect to avoid impure Date.now during render
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

  return (
    <div className="min-h-screen vintage-texture">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-vintage-blue to-vintage-teal flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
                  Doctor Dashboard
                </h1>
                <p className="text-xs text-muted-foreground">
                  Smart OPD Queue — Real-time View
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DisclaimerBanner type="demo" className="flex-1 max-w-xs" />
          <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => {
            // Clear queue in Zustand only; Convex queue persists.
            clearQueue();
          }}>
            <RefreshCw className="w-3 h-3 mr-1" />
            Clear Local Queue
          </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Today's OPD", value: opdStats.todaysOPD, icon: Users, color: "text-vintage-blue", bg: "bg-vintage-blue/10" },
              { label: "Urgent", value: urgentCount, icon: AlertTriangle, color: "text-urgent-red", bg: "bg-urgent-red/10" },
              { label: "Priority", value: priorityCount, icon: Clock, color: "text-priority-amber", bg: "bg-priority-amber/10" },
              { label: "Routine", value: routineCount, icon: CheckCircle, color: "text-routine-green", bg: "bg-routine-green/10" },
            ].map((stat) => (
              <Card key={stat.label} className="vintage-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
                        {stat.value}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <SortAsc className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Sort by:</span>
            {[
              { key: "priority" as SortBy, label: "Priority" },
              { key: "waitTime" as SortBy, label: "Wait Time" },
              { key: "token" as SortBy, label: "Queue Order" },
            ].map((option) => (
              <Button
                key={option.key}
                variant={sortBy === option.key ? "default" : "outline"}
                size="sm"
                className={`text-xs h-7 ${
                  sortBy === option.key ? "bg-vintage-blue text-white" : ""
                }`}
                onClick={() => setSortBy(option.key)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {/* Patient Queue */}
          <Card className="vintage-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-vintage-blue" />
                  <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                    Smart OPD Queue
                  </CardTitle>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {waitingPatients.length} patients waiting
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {sortedPatients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Inbox className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm font-medium">Queue is empty</p>
                  <p className="text-xs mt-1">Complete a patient assessment to populate the queue</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedPatients.map((patient, i) => (
                    <motion.div
                      key={patient._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <button
                        className={`w-full p-4 rounded-xl border text-left transition-all hover:shadow-md ${
                          patient.priority === "urgent"
                            ? "border-urgent-red/30 bg-urgent-red/5 hover:bg-urgent-red/10"
                            : "border-border bg-white hover:bg-parchment"
                        }`}
                        onClick={() => handlePatientClick(patient)}
                      >
                        <div className="flex items-center gap-4">
                          {/* Priority Indicator */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            patient.priority === "urgent"
                              ? "bg-urgent-red text-white"
                              : patient.priority === "priority"
                                ? "bg-priority-amber text-white"
                                : "bg-routine-green text-white"
                          }`}>
                            {patient.priority === "urgent" ? "!" : i + 1}
                          </div>

                          {/* Patient Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-bold text-foreground">{patient.patientName}</p>
                              <span className="text-xs text-muted-foreground">
                                {patient.patientAge}y, {patient.patientGender}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {patient.chiefComplaint}
                            </p>
                          </div>

                          {/* Wait Time */}
                          <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                            <Globe className="w-3 h-3" />
                            {patient.patientName ? patient.patientName : "—"}
                          </div>

                          <div className="text-right flex-shrink-0">
                            <p className="text-xs font-bold text-foreground">{formatWaitTime(patient._id)}</p>
                            <p className="text-[10px] text-muted-foreground">wait</p>
                          </div>

                          {/* Priority Badge */}
                          <PriorityBadge priority={patient.priority as any} size="sm" />

                          <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
