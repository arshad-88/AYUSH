import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.svg";
import { ArrowRight, Loader2, Mail, UserX, Shield, Activity } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  DNASpinner,
  EkgWave,
  ParticleField,
  StatusBar,
} from "@/components/scientific";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);
  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      const email = formData.get("email") as string;
      // Demo: advance to OTP step (no real email sent)
      setStep({ email });
      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError("Failed to send verification code. Please try again.");
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    // Demo OTP: any 6-digit code works (spec says 123456)
    if (otp.length === 6) {
      const email = typeof step === "object" ? step.email : "demo@medikiosk.in";
      await signIn({ email });
      navigate(redirect);
    } else {
      setError("The verification code you entered is incorrect.");
      setIsLoading(false);
      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    await signIn({ email: "guest@medikiosk.in" });
    navigate(redirect);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <ParticleField density="low" opacity={0.18} />
      <div className="absolute inset-0 surface-grid opacity-15 pointer-events-none" />

      <div className="flex-1 flex items-center justify-center px-4 py-12 relative">
        <div className="flex items-center justify-center h-full flex-col w-full max-w-md">
          <div className="lab-card lab-card-accent p-6 sm:p-8 relative overflow-hidden w-full">
            <div className="absolute top-3 right-3">
              <StatusBar latency="42ms" sessionId="AUTH" />
            </div>

            {step === "signIn" ? (
              <>
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4 relative">
                    <img
                      src={logo}
                      alt="MediKiosk"
                      width={64}
                      height={64}
                      className="rounded-xl cursor-pointer glow-primary"
                      onClick={() => navigate("/")}
                    />
                    <span className="absolute inset-0 rounded-xl border-2 border-trust-400/40 animate-data-pulse pointer-events-none" style={{ width: 64, height: 64 }} />
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Shield className="w-3 h-3 text-trust-400" />
                    <span className="data-figure text-[10px] tracking-widest text-mint-400">● SECURE SIGN-IN</span>
                  </div>
                  <h1 className="text-xl font-bold tracking-tight-x">Get Started</h1>
                  <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                    ENTER EMAIL · OTP-VERIFIED
                  </span>
                </div>
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-trust-300" />
                      <Input
                        name="email"
                        placeholder="name@example.com"
                        type="email"
                        className="pl-9 bg-bio-base/50 border-trust-500/30 focus:border-trust-400 data-figure"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      size="icon"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-trust-500 to-teal-500 text-white border-0 hover:from-trust-400 hover:to-teal-400"
                    >
                      {isLoading ? (
                        <DNASpinner size="sm" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {error && (
                    <p className="text-sm text-red-critical data-figure">{error}</p>
                  )}

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
                    onClick={handleGuestLogin}
                    disabled={isLoading}
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    <span className="data-figure tracking-wider">CONTINUE AS GUEST</span>
                  </Button>
                </form>
                <div className="mt-6 pt-6 border-t border-trust-500/15">
                  <EkgWave height={20} showAxis={false} variant="accent" />
                  <div className="mt-3 flex items-center justify-center gap-2 data-figure text-[10px] tracking-widest text-muted-foreground">
                    <Activity className="w-3 h-3" />
                    <span>SECURE · ENCRYPTED · AUDIT-LOGGED</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="mx-auto w-14 h-14 rounded-xl bg-trust-500/20 border border-trust-500/40 flex items-center justify-center mb-4 glow-primary">
                    <Mail className="w-7 h-7 text-trust-300" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight-x">Check your email</h2>
                  <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                    OTP SENT · {step.email}
                  </span>
                </div>
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <input type="hidden" name="email" value={step.email} />
                  <input type="hidden" name="code" value={otp} />

                  <div className="flex justify-center">
                    <InputOTP
                      value={otp}
                      onChange={setOtp}
                      maxLength={6}
                      disabled={isLoading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                          const form = (e.target as HTMLElement).closest("form");
                          if (form) form.requestSubmit();
                        }
                      }}
                    >
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, index) => (
                          <InputOTPSlot key={index} index={index} className="bg-bio-base/60 border-trust-500/30 data-figure text-lg" />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {error && (
                    <p className="text-sm text-red-critical text-center data-figure">
                      {error}
                    </p>
                  )}
                  <p className="data-figure text-[10px] text-muted-foreground text-center tracking-widest">
                    DEMO OTP · <span className="font-bold text-trust-300">123456</span>
                  </p>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-trust-500 to-teal-500 hover:from-trust-400 hover:to-teal-400 text-white border-0 glow-primary"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <DNASpinner size="sm" />
                        <span className="ml-2 data-figure tracking-wider">VERIFYING…</span>
                      </>
                    ) : (
                      <>
                        <span className="data-figure tracking-wider">VERIFY CODE</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep("signIn")}
                    disabled={isLoading}
                    className="w-full hover:bg-trust-500/10"
                  >
                    <span className="data-figure tracking-wider">USE DIFFERENT EMAIL</span>
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
