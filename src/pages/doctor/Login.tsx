import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/shared/Header";
import { usePatientStore } from "@/store/patientStore";
import { Stethoscope, ArrowRight, Loader2, Mail, UserX, ShieldCheck, Cpu, Activity } from "lucide-react";
import { DNASpinner, StatusBar, ParticleField, EkgWave } from "@/components/scientific";

export default function DoctorLogin() {
  const navigate = useNavigate();
  const { setPatient } = usePatientStore();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsLoading(false);
    setStep("otp");
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== "123456") {
      setError("Invalid OTP. Use 123456 for demo.");
      setOtp("");
      return;
    }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setPatient({
      isDoctor: true,
      isAuthenticated: true,
    });
    setIsLoading(false);
    navigate("/doctor/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <ParticleField density="low" opacity={0.18} />
      <div className="absolute inset-0 surface-grid opacity-15 pointer-events-none" />
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lab-card lab-card-accent p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <StatusBar latency="42ms" sessionId="DOC-AUTH" />
            </div>
            <div className="text-center mb-6">
              <div className="mx-auto relative w-16 h-16 rounded-xl bg-gradient-to-br from-trust-500 to-teal-500 flex items-center justify-center mb-4 glow-primary">
                <Stethoscope className="w-8 h-8 text-white" strokeWidth={1.8} />
                <span className="absolute inset-0 rounded-xl border-2 border-trust-400/50 animate-data-pulse" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Cpu className="w-3 h-3 text-trust-400" />
                <span className="data-figure text-[10px] tracking-widest text-mint-400">● DOCTOR PORTAL</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight-x">
                Doctor Login
              </h1>
              <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                {step === "email" ? "ENTER REGISTERED EMAIL" : `OTP SENT · ${email}`}
              </span>
            </div>

            {step === "email" ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-trust-300" />
                  <Input
                    type="email"
                    placeholder="doctor@hospital.gov.in"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    className="pl-10 text-base h-12 bg-bio-base/50 border-trust-500/30 focus:border-trust-400"
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-critical data-figure">{error}</p>
                )}
                <Button
                  type="submit"
                  className="w-full h-12 text-base bg-gradient-to-r from-trust-500 to-teal-500 hover:from-trust-400 hover:to-teal-400 text-white border-0 glow-primary"
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <DNASpinner size="sm" />
                  ) : (
                    <>
                      <span className="data-figure tracking-wider mr-2">SEND OTP</span>
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-trust-500/15" />
                  </div>
                  <div className="relative flex justify-center text-[10px] tracking-widest">
                    <span className="bg-bio-surface px-2 text-muted-foreground data-figure">
                      OR
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-trust-500/30 hover:bg-trust-500/10"
                  onClick={async () => {
                    setIsLoading(true);
                    await new Promise((r) => setTimeout(r, 500));
                    setPatient({ isDoctor: true, isAuthenticated: true });
                    setIsLoading(false);
                    navigate("/doctor/dashboard");
                  }}
                >
                  <UserX className="mr-2 h-4 w-4" />
                  <span className="data-figure tracking-wider">QUICK DEMO LOGIN</span>
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="flex justify-center">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                      setError("");
                    }}
                    placeholder="000000"
                    className="w-full text-center data-figure text-3xl tracking-[0.4em] py-4 px-4 border border-trust-500/30 rounded-md bg-bio-base/60 focus:border-trust-400 focus:outline-none"
                    maxLength={6}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && otp.length === 6) {
                        handleOtpSubmit(e as React.FormEvent);
                      }
                    }}
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-critical data-figure text-center">{error}</p>
                )}
                <p className="data-figure text-[10px] text-muted-foreground text-center tracking-widest">
                  DEMO OTP · <span className="font-bold text-trust-300">123456</span>
                </p>
                <Button
                  type="submit"
                  className="w-full h-12 text-base bg-gradient-to-r from-trust-500 to-teal-500 hover:from-trust-400 hover:to-teal-400 text-white border-0 glow-primary"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <DNASpinner size="sm" />
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 w-4 h-4" />
                      <span className="data-figure tracking-wider">VERIFY · ENTER DASHBOARD</span>
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-sm hover:bg-trust-500/10"
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                    setError("");
                  }}
                >
                  Use different email
                </Button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-trust-500/15">
              <EkgWave height={20} showAxis={false} variant="accent" />
              <div className="mt-3 flex items-center justify-center gap-3 data-figure text-[10px] tracking-widest text-muted-foreground">
                <Activity className="w-3 h-3" />
                <span>SECURE · ENCRYPTED · AUDIT-LOGGED</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}