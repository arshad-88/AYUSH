import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Checkbox } from "@/components/ui/checkbox";
import { usePatientStore } from "@/store/patientStore";
import { Header } from "@/components/shared/Header";
import { getAuthService } from "@/services/auth";
import {
  Phone,
  FileText,
  IdCard,
  ArrowRight,
  Loader2,
  Shield,
  AlertCircle,
  CheckCircle,
  Dna,
  Cpu,
  Lock,
} from "lucide-react";
import { StatusBar, ParticleField, EkgWave } from "@/components/scientific";

type AuthMethod = "select" | "aadhaar" | "abha" | "mobile";
type AuthStep = "method" | "request" | "verify" | "success";

export default function PatientLogin() {
  const navigate = useNavigate();
  const { loginPatient } = usePatientStore();
  const authService = getAuthService();

  const [method, setMethod] = useState<AuthMethod>("select");
  const [step, setStep] = useState<AuthStep>("method");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [aadhaarConsent, setAadhaarConsent] = useState(false);
  const [aadhaarOtp, setAadhaarOtp] = useState("");
  const [abhaNumber, setAbhaNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");

  const handleAadhaarRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aadhaarNumber || aadhaarNumber.length < 4 || !aadhaarConsent) {
      setError("Please enter Aadhaar number and consent");
      return;
    }
    setIsLoading(true);
    setError("");
    const result = await authService.requestAadhaarOtp({
      aadhaarNumber,
      consentGiven: aadhaarConsent,
    });
    setIsLoading(false);
    if (result.success) {
      setOtpSent(true);
      setStep("verify");
    } else {
      setError(result.error || "Failed to request OTP");
    }
  };

  const handleAadhaarVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (aadhaarOtp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }
    setIsLoading(true);
    setError("");
    const result = await authService.verifyAadhaarOtp({
      aadhaarNumber,
      otp: aadhaarOtp,
    });
    setIsLoading(false);
    if (result.success && result.identity) {
      loginPatient(result.identity, { isAuthenticated: true });
      setStep("success");
      setTimeout(() => navigate("/patient/dashboard"), 1200);
    } else {
      setError(result.error || "Aadhaar verification failed");
    }
  };

  const handleAbhaRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!abhaNumber || abhaNumber.length < 4) {
      setError("Please enter a valid ABHA number");
      return;
    }
    setIsLoading(true);
    setError("");
    // In demo mode, ABHA verification is immediate (no separate OTP step)
    const result = await authService.loginWithAbha({ abhaNumber });
    setIsLoading(false);
    if (result.success && result.identity) {
      loginPatient(result.identity, { isAuthenticated: true });
      setStep("success");
      setTimeout(() => navigate("/patient/dashboard"), 1200);
    } else {
      setError(result.error || "ABHA verification failed");
    }
  };

  const handleAbhaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    // ABHA flow goes directly to success via handleAbhaRequest
  };

  const handleMobileRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    setIsLoading(true);
    setError("");
    const result = await authService.requestMobileOtp({ mobileNumber });
    setIsLoading(false);
    if (result.success) {
      setOtpSent(true);
      setStep("verify");
    } else {
      setError(result.error || "Failed to request OTP");
    }
  };

  const handleMobileVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileOtp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }
    setIsLoading(true);
    setError("");
    const result = await authService.verifyMobileOtp({
      mobileNumber,
      otp: mobileOtp,
    });
    setIsLoading(false);
    if (result.success && result.identity) {
      loginPatient(result.identity, { isAuthenticated: true });
      setStep("success");
      setTimeout(() => navigate("/patient/dashboard"), 1200);
    } else {
      setError(result.error || "OTP verification failed");
    }
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
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          {/* METHOD SELECTION */}
          {step === "method" && (
            <div className="lab-card lab-card-accent p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <StatusBar latency="42ms" sessionId="PT-AUTH" />
              </div>
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 rounded-xl bg-gradient-to-br from-trust-500 to-teal-500 flex items-center justify-center mb-4 glow-primary">
                  <Dna className="w-8 h-8 text-white" strokeWidth={1.6} />
                  <span className="absolute -inset-0.5 rounded-xl border-2 border-trust-400/40 animate-data-pulse" />
                </div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Shield className="w-3 h-3 text-trust-400" />
                  <span className="data-figure text-[10px] tracking-widest text-mint-400">● IDENTITY VERIFICATION</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight-x">Patient Login</h1>
                <span className="data-figure text-[10px] text-muted-foreground tracking-widest block mt-1">
                  CHOOSE VERIFICATION METHOD
                </span>
              </div>

              <div className="space-y-2">
                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => {
                    setMethod("aadhaar");
                    setStep("request");
                    setError("");
                  }}
                  className="w-full p-4 rounded-md border border-trust-500/20 bg-trust-500/5 hover:bg-trust-500/10 hover:border-trust-500/40 transition-all group text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-trust-500/15 border border-trust-500/30 flex items-center justify-center group-hover:border-trust-400">
                      <IdCard className="w-5 h-5 text-trust-300" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-bold tracking-tight-x">Continue with Aadhaar</p>
                      <p className="data-figure text-[10px] text-muted-foreground tracking-widest mt-0.5">
                        UIDAI · VERIFIED IDENTITY · OTP TO REGISTERED NUMBER
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-trust-400 group-hover:translate-x-1 transition-all mt-1" />
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => {
                    setMethod("abha");
                    setStep("request");
                    setError("");
                  }}
                  className="w-full p-4 rounded-md border border-teal-500/20 bg-teal-500/5 hover:bg-teal-500/10 hover:border-teal-500/40 transition-all group text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center group-hover:border-teal-400">
                      <Shield className="w-5 h-5 text-teal-400" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-bold tracking-tight-x">Continue with ABHA</p>
                      <p className="data-figure text-[10px] text-muted-foreground tracking-widest mt-0.5">
                        NATIONAL HEALTH ID · ABDM
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-teal-400 group-hover:translate-x-1 transition-all mt-1" />
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => {
                    setMethod("mobile");
                    setStep("request");
                    setError("");
                  }}
                  className="w-full p-4 rounded-md border border-amber-warn/20 bg-amber-warn/5 hover:bg-amber-warn/10 hover:border-amber-warn/40 transition-all group text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-warn/15 border border-amber-warn/30 flex items-center justify-center group-hover:border-amber-warn/60">
                      <Phone className="w-5 h-5 text-amber-warn" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-bold tracking-tight-x">Continue with Mobile OTP</p>
                      <p className="data-figure text-[10px] text-muted-foreground tracking-widest mt-0.5">
                        SMS · QUICK VERIFICATION
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-amber-warn group-hover:translate-x-1 transition-all mt-1" />
                  </div>
                </motion.button>
              </div>

              <div className="mt-6 tag-urgent p-3 rounded-md flex items-start gap-3">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="data-figure text-[10px] font-bold tracking-widest">DEMO MODE · SIMULATED</p>
                  <p className="text-xs mt-0.5 opacity-85 leading-relaxed">
                    Demo mode: use OTP <span className="data-figure font-bold">123456</span>. In production, OTP is sent to your registered mobile number.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* AADHAAR FLOW */}
          {method === "aadhaar" && step === "request" && (
            <div className="lab-card lab-card-accent p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <StatusBar latency="42ms" sessionId="AADHAAR-AUTH" />
              </div>
              <div className="text-center mb-6">
                <div className="mx-auto w-14 h-14 rounded-xl bg-trust-500/20 border border-trust-500/40 flex items-center justify-center mb-4 glow-primary">
                  <IdCard className="w-7 h-7 text-trust-300" strokeWidth={1.6} />
                </div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="data-figure text-[10px] tracking-widest text-mint-400">● UIDAI SECURE</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight-x">Aadhaar Verification</h2>
                <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                  LAST 4 DIGITS NOT STORED
                </span>
              </div>
              <form onSubmit={handleAadhaarRequest} className="space-y-4">
                <div>
                  <label className="data-figure text-[10px] tracking-widest text-muted-foreground block mb-2">
                    AADHAAR NUMBER · 12-DIGIT
                  </label>
                  <Input
                    placeholder="XXXX-XXXX-1234"
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ""))}
                    maxLength={12}
                    className="bg-bio-base/50 border-trust-500/30 focus:border-trust-400 data-figure text-base h-12"
                  />
                </div>
                <div className="flex items-start gap-2 p-3 rounded-md bg-trust-500/8 border border-trust-500/25">
                  <Checkbox
                    id="aadhaar-consent"
                    checked={aadhaarConsent}
                    onCheckedChange={(c) => setAadhaarConsent(c === true)}
                  />
                  <label htmlFor="aadhaar-consent" className="text-xs leading-relaxed cursor-pointer">
                    I consent to share my Aadhaar identity for healthcare authentication (ABDM-compliant).
                  </label>
                </div>
                {error && <p className="text-sm text-red-critical">{error}</p>}
                <Button type="submit" className="w-full h-12 bg-gradient-to-r from-trust-500 to-teal-500 text-white border-0 glow-primary" disabled={isLoading}>
                  {isLoading ? <span className="data-figure tracking-widest">REQUESTING…</span> : <>Send OTP <ArrowRight className="ml-2 w-4 h-4" /></>}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setStep("method")} className="w-full hover:bg-trust-500/10">
                  <span className="data-figure tracking-wider">BACK</span>
                </Button>
              </form>
            </div>
          )}              {method === "aadhaar" && step === "verify" && (
            <div className="lab-card lab-card-accent p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <StatusBar latency="42ms" sessionId="OTP-VERIFY" />
              </div>
              <div className="text-center mb-6">
                <div className="mx-auto w-14 h-14 rounded-xl bg-trust-500/20 border border-trust-500/40 flex items-center justify-center mb-4 glow-primary">
                  <Lock className="w-7 h-7 text-trust-300" />
                </div>
                <h2 className="text-xl font-bold tracking-tight-x">Enter Verification Code</h2>
                {otpSent && (
                  <div className="mt-2 p-2 rounded-md bg-mint-500/10 border border-mint-500/30">
                    <p className="data-figure text-[10px] tracking-widest text-mint-400">
                      OTP SENT TO YOUR REGISTERED MOBILE NUMBER
                    </p>
                  </div>
                )}
                <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                  6-DIGIT OTP · AADhaar
                </span>
              </div>
              <form onSubmit={handleAadhaarVerify} className="space-y-4">
                <InputOTP
                  maxLength={6}
                  value={aadhaarOtp}
                  onChange={setAadhaarOtp}
                  className="justify-center"
                >
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <InputOTPSlot key={i} index={i} className="bg-bio-base/60 border-trust-500/30 data-figure text-xl" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                {error && <p className="text-sm text-red-critical text-center">{error}</p>}
                <p className="data-figure text-[10px] text-muted-foreground text-center tracking-widest">
                  DEMO OTP · <span className="font-bold text-trust-300">123456</span>
                </p>
                <Button type="submit" className="w-full h-12 bg-gradient-to-r from-trust-500 to-teal-500 text-white border-0 glow-primary" disabled={isLoading || aadhaarOtp.length !== 6}>
                  {isLoading ? "Verifying…" : <>Verify <ArrowRight className="ml-2 w-4 h-4" /></>}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setStep("request")} className="w-full hover:bg-trust-500/10">
                  <span className="data-figure tracking-wider">RESEND · CHANGE NUMBER</span>
                </Button>
              </form>
            </div>
          )}

          {/* ABHA FLOW */}
          {method === "abha" && step === "request" && (
            <div className="lab-card lab-card-accent p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <StatusBar latency="42ms" sessionId="ABHA-AUTH" />
              </div>
              <div className="text-center mb-6">
                <div className="mx-auto w-14 h-14 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center mb-4 glow-accent">
                  <Shield className="w-7 h-7 text-teal-400" />
                </div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="data-figure text-[10px] tracking-widest text-mint-400">● ABDM COMPLIANT</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight-x">ABHA Verification</h2>
                <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                  14-DIGIT HEALTH ID
                </span>
              </div>
              <form onSubmit={handleAbhaRequest} className="space-y-4">
                <div>
                  <label className="data-figure text-[10px] tracking-widest text-muted-foreground block mb-2">
                    ABHA NUMBER
                  </label>
                  <Input
                    placeholder="XX-XXXX-XXXX-XXXX"
                    value={abhaNumber}
                    onChange={(e) => setAbhaNumber(e.target.value.replace(/\D/g, ""))}
                    maxLength={14}
                    className="bg-bio-base/50 border-teal-500/30 focus:border-teal-400 data-figure text-base h-12"
                  />
                </div>
                {error && <p className="text-sm text-red-critical">{error}</p>}
                <Button type="submit" className="w-full h-12 bg-gradient-to-r from-trust-500 to-teal-500 text-white border-0 glow-primary" disabled={isLoading}>
                  {isLoading ? "Requesting…" : <>Send OTP <ArrowRight className="ml-2 w-4 h-4" /></>}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setStep("method")} className="w-full hover:bg-trust-500/10">
                  <span className="data-figure tracking-wider">BACK</span>
                </Button>
              </form>
            </div>
          )}

          {method === "abha" && step === "verify" && (
            <div className="lab-card lab-card-accent p-6 sm:p-8 relative overflow-hidden">
              <div className="text-center mb-6">
                <div className="mx-auto w-14 h-14 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center mb-4">
                  <Lock className="w-7 h-7 text-teal-400" />
                </div>
                <h2 className="text-xl font-bold tracking-tight-x">Enter ABHA OTP</h2>
                <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                  6-DIGIT · DEMO 123456
                </span>
              </div>
              <form onSubmit={handleAbhaVerify} className="space-y-4">
                <InputOTP
                  maxLength={6}
                  value={aadhaarOtp}
                  onChange={setAadhaarOtp}
                  className="justify-center"
                >
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <InputOTPSlot key={i} index={i} className="bg-bio-base/60 border-teal-500/30 data-figure text-xl" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                {error && <p className="text-sm text-red-critical text-center">{error}</p>}
                <Button type="submit" className="w-full h-12 bg-gradient-to-r from-trust-500 to-teal-500 text-white border-0 glow-primary" disabled={isLoading || aadhaarOtp.length !== 6}>
                  {isLoading ? "Verifying…" : <>Verify <ArrowRight className="ml-2 w-4 h-4" /></>}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setStep("request")} className="w-full hover:bg-trust-500/10">
                  <span className="data-figure tracking-wider">BACK</span>
                </Button>
              </form>
            </div>
          )}

          {/* MOBILE FLOW */}
          {method === "mobile" && step === "request" && (
            <div className="lab-card lab-card-accent p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <StatusBar latency="42ms" sessionId="SMS-AUTH" />
              </div>
              <div className="text-center mb-6">
                <div className="mx-auto w-14 h-14 rounded-xl bg-amber-warn/20 border border-amber-warn/40 flex items-center justify-center mb-4">
                  <Phone className="w-7 h-7 text-amber-warn" />
                </div>
                <h2 className="text-xl font-bold tracking-tight-x">Mobile Verification</h2>
                <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                  10-DIGIT NUMBER · SMS OTP
                </span>
              </div>
              <form onSubmit={handleMobileRequest} className="space-y-4">
                <div>
                  <label className="data-figure text-[10px] tracking-widest text-muted-foreground block mb-2">
                    MOBILE NUMBER
                  </label>
                  <Input
                    placeholder="+91 XXXXX XXXXX"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                    maxLength={10}
                    className="bg-bio-base/50 border-amber-warn/30 focus:border-amber-warn data-figure text-base h-12"
                  />
                </div>
                {error && <p className="text-sm text-red-critical">{error}</p>}
                <Button type="submit" className="w-full h-12 bg-gradient-to-r from-trust-500 to-teal-500 text-white border-0 glow-primary" disabled={isLoading}>
                  {isLoading ? "Sending…" : <>Send OTP <ArrowRight className="ml-2 w-4 h-4" /></>}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setStep("method")} className="w-full hover:bg-trust-500/10">
                  <span className="data-figure tracking-wider">BACK</span>
                </Button>
              </form>
            </div>
          )}              {method === "mobile" && step === "verify" && (
            <div className="lab-card lab-card-accent p-6 sm:p-8 relative overflow-hidden">
              <div className="text-center mb-6">
                <div className="mx-auto w-14 h-14 rounded-xl bg-amber-warn/20 border border-amber-warn/40 flex items-center justify-center mb-4">
                  <Lock className="w-7 h-7 text-amber-warn" />
                </div>
                <h2 className="text-xl font-bold tracking-tight-x">Enter Mobile OTP</h2>
                {otpSent && (
                  <div className="mt-2 p-2 rounded-md bg-mint-500/10 border border-mint-500/30">
                    <p className="data-figure text-[10px] tracking-widest text-mint-400">
                      OTP SENT TO +91 {mobileNumber.slice(0, 5)}XXXXX
                    </p>
                  </div>
                )}
                <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                  6-DIGIT · DEMO 123456
                </span>
              </div>
              <form onSubmit={handleMobileVerify} className="space-y-4">
                <InputOTP
                  maxLength={6}
                  value={mobileOtp}
                  onChange={setMobileOtp}
                  className="justify-center"
                >
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <InputOTPSlot key={i} index={i} className="bg-bio-base/60 border-amber-warn/30 data-figure text-xl" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                {error && <p className="text-sm text-red-critical text-center">{error}</p>}
                <Button type="submit" className="w-full h-12 bg-gradient-to-r from-trust-500 to-teal-500 text-white border-0 glow-primary" disabled={isLoading || mobileOtp.length !== 6}>
                  {isLoading ? "Verifying…" : <>Verify <ArrowRight className="ml-2 w-4 h-4" /></>}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setStep("request")} className="w-full hover:bg-trust-500/10">
                  <span className="data-figure tracking-wider">BACK</span>
                </Button>
              </form>
            </div>
          )}

          {/* SUCCESS */}
          {step === "success" && (
            <div className="lab-card lab-card-accent p-8 text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-mint-500/20 border-2 border-mint-500/40 flex items-center justify-center mb-4 glow-accent">
                <CheckCircle className="w-10 h-10 text-mint-400" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight-x mb-1">Verified</h2>
              <span className="data-figure text-[10px] tracking-widest text-mint-400">
                ● IDENTITY CONFIRMED · ROUTING
              </span>
              <div className="mt-6">
                <EkgWave height={32} showAxis={false} variant="accent" />
              </div>
              <p className="data-figure text-[10px] text-muted-foreground tracking-widest mt-4">
                SECURE SESSION INITIALIZED
              </p>
            </div>
          )}

          {step !== "success" && step !== "method" && (
            <div className="mt-4 flex justify-center">
              <Button variant="ghost" onClick={() => setStep("method")} className="hover:bg-trust-500/10">
                <span className="data-figure tracking-wider">← CHANGE METHOD</span>
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}