import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getAiProviderStatus } from "@/services/ai/GroqAiInterviewService";
import {
  Activity,
  ArrowRight,
  Bell,
  FileText,
  LayoutDashboard,
  LogOut,
  Stethoscope,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router";
import {
  AnimatedNumber,
  HeroCanvas,
  ParticleField,
  StatusBar,
  EmptyState,
} from "@/components/scientific";

const overviewCards = [
  {
    label: "Today's OPD",
    value: "38",
    detail: "+6 from yesterday",
    icon: Users,
    accent: "trust",
  },
  {
    label: "Urgent flag",
    value: "5",
    detail: "2 need immediate review",
    icon: Bell,
    accent: "critical",
  },
  {
    label: "Case sheets",
    value: "24",
    detail: "12 awaiting review",
    icon: FileText,
    accent: "teal",
  },
  {
    label: "AI triage",
    value: "92%",
    detail: "confidence snapshot",
    icon: Activity,
    accent: "mint",
  },
];

const queueItems = [
  { name: "Ravi Kumar", complaint: "Abdominal discomfort", priority: "Urgent", time: "08 min" },
  { name: "Asha Nair", complaint: "Fever with chills", priority: "Priority", time: "12 min" },
  { name: "Suresh Rao", complaint: "Knee pain", priority: "Routine", time: "19 min" },
];

const accentMap: Record<string, string> = {
  trust: "from-trust-500/20 to-trust-500/5 border-trust-500/30 text-trust-300",
  critical: "from-red-urgent/20 to-red-urgent/5 border-red-urgent/30 text-red-critical",
  teal: "from-teal-500/20 to-teal-500/5 border-teal-500/30 text-teal-400",
  mint: "from-mint-500/20 to-mint-500/5 border-mint-500/30 text-mint-400",
};

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const providerStatus = getAiProviderStatus();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const hasQueue = queueItems.length > 0;

  return (
    <main className="min-h-screen relative overflow-hidden bg-background text-foreground">
      <ParticleField density="low" opacity={0.18} className="opacity-60" />
      <div className="absolute inset-0 surface-grid opacity-20 pointer-events-none" />

      {/* Soft 3D vignette — molecular cluster anchored top-right */}
      <div className="absolute -top-32 -right-32 w-[420px] h-[420px] pointer-events-none opacity-40 hidden lg:block">
        <HeroCanvas className="w-full h-full" variant="molecule" cameraDistance={5} />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="lab-card-floating p-6 sm:p-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative overflow-hidden"
        >
          <div className="absolute inset-0 surface-grid-fine opacity-30 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-mint-500 animate-data-pulse" />
              <span className="data-figure text-[10px] tracking-widest text-mint-400">
                AUTHENTICATED WORKSPACE
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight-x sm:text-4xl">
              Welcome{user?.name ? `, ${user.name}` : " back"}
            </h1>
            <p className="data-figure text-[10px] text-muted-foreground tracking-widest mt-1.5">
              CLINICAL OS · OPD MODE
            </p>
          </div>

          <div className="relative flex items-center gap-3 flex-wrap">
            <div className="hidden items-center gap-2 rounded-md border border-trust-500/30 bg-trust-500/10 px-3 py-1.5 text-xs text-trust-300 sm:flex">
              <Stethoscope className="w-4 h-4" />
              OPD Mode Active
            </div>
            <div className="rounded-md border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-400">
              AI · {providerStatus}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleSignOut}
              className="border-trust-500/30 hover:bg-trust-500/10 cursor-magnetic press-shrink"
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </motion.header>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map(({ label, value, detail, icon: Icon, accent }, idx) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="lab-card lab-card-accent p-6 hover-elevate card-sheen cursor-magnetic group"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">{label}</p>
                  <p className="data-figure-lg text-4xl font-bold tracking-tight-x mt-2">
                    {/^\d+(\.\d+)?%?$/.test(value) ? (
                      <AnimatedNumber
                        value={parseFloat(value)}
                        decimals={value.includes(".") ? 1 : 0}
                        suffix={value.endsWith("%") ? "%" : ""}
                      />
                    ) : (
                      value
                    )}
                  </p>
                  <p className="data-figure text-[10px] text-muted-foreground tracking-widest mt-1.5">
                    {detail}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${accentMap[accent]} border flex items-center justify-center transition-transform duration-500 group-hover:scale-105`}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.6} />
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="lab-card lab-card-elevated lab-card-accent p-8 relative overflow-hidden"
          >
            <div className="absolute top-3 right-3">
              <StatusBar latency="42ms" sessionId="QUEUE-LIVE" />
            </div>
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-trust-500/15 border border-trust-500/30 flex items-center justify-center">
                  <LayoutDashboard className="w-4 h-4 text-trust-300" strokeWidth={1.6} />
                </div>
                <div>
                  <h2 className="font-bold tracking-tight-x">Patient queue</h2>
                  <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                    PRIORITY-AWARE · LIVE
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-xs hover:bg-trust-500/10 cursor-magnetic press-shrink"
              >
                Review all
                <ArrowRight className="size-3.5 icon-nudge-hover" />
              </Button>
            </div>

            <div className="space-y-3">
              {hasQueue ? (
                queueItems.map((item) => {
                  const variant =
                    item.priority === "Urgent"
                      ? "tag-critical"
                      : item.priority === "Priority"
                        ? "tag-urgent"
                        : "tag-stable";
                  return (
                    <div
                      key={item.name}
                      className="lab-card-floating p-4 flex items-center justify-between hover-elevate cursor-magnetic press-shrink"
                    >
                      <div>
                        <p className="font-semibold tracking-tight-x">{item.name}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {item.complaint}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest border ${variant}`}
                        >
                          {item.priority}
                        </span>
                        <span className="data-figure text-xs text-muted-foreground tracking-widest">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState
                  variant="queue"
                  title="No patients in the queue"
                  description="The OPD queue is empty. New patients entering the kiosk will appear here automatically."
                  primaryAction={{
                    label: "Add New Patient",
                    onClick: () => navigate("/patient/login"),
                    icon: <Users className="w-4 h-4" />,
                  }}
                  secondaryAction={{
                    label: "Open Tutorial",
                    onClick: () => navigate("/"),
                    icon: <Stethoscope className="w-4 h-4" />,
                    variant: "outline",
                  }}
                />
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="lab-card lab-card-elevated lab-card-accent p-8 relative overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
                <Activity className="w-4 h-4 text-teal-400" strokeWidth={1.6} />
              </div>
              <div>
                <h2 className="font-bold tracking-tight-x">Clinical summary</h2>
                <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                  TODAY · KEY SIGNALS
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="lab-card-floating p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="eyebrow">PRIORITY</p>
                  <span className="data-figure text-[10px] text-red-critical tracking-widest">
                    ▲ URGENT
                  </span>
                </div>
                <p className="data-figure-lg text-3xl font-bold text-red-critical">
                  2
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Cases flagged with red-flag symptoms or elevated risk.
                </p>
              </div>
              <div className="lab-card-floating p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="eyebrow">AI ASSISTANT</p>
                  <span className="w-1.5 h-1.5 rounded-full bg-mint-500 animate-data-pulse" />
                </div>
                <p className="font-semibold tracking-tight-x mt-1">
                  Pre-consultation intelligence is active.
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Document OCR, AYUSH assessment, and triage guidance are available
                  end-to-end.
                </p>
              </div>
              <div className="lab-card-floating p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="eyebrow">DATA INTEGRITY</p>
                  <span className="data-figure text-[10px] text-teal-400 tracking-widest">
                    98.4%
                  </span>
                </div>
                <p className="font-semibold tracking-tight-x mt-1">
                  Provenance-tagged, doctor-verified.
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Every fact carries source attribution · audit-ready.
                </p>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}