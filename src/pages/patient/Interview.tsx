import { lazy, Suspense } from "react";
import { useNavigate } from "react-router";
import { usePatientStore } from "@/store/patientStore";
import { DNASpinner } from "@/components/scientific";

// Lazy load both mode interfaces
const VoiceModeInterface = lazy(() => import("@/components/voice/VoiceModeInterface"));
const TouchModeInterview = lazy(() => import("@/pages/patient/TouchModeInterview"));

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <DNASpinner size="lg" />
        <div className="flex flex-col items-center gap-1">
          <span className="data-figure text-[10px] tracking-widest text-muted-foreground">
            INITIALIZING CLINICAL ENGINE
          </span>
          <span className="data-figure text-[10px] tracking-widest text-trust-400 animate-blink-soft">
            LOADING
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Interview Router Component
 *
 * Selects the appropriate interview interface based on inputMode:
 * - "voice" → VoiceModeInterface (hands-free conversation)
 * - "touch" → TouchModeInterview (text/touch interface)
 * - null → Navigate back (user hasn't selected a mode)
 */
export default function Interview() {
  const navigate = useNavigate();
  const { inputMode } = usePatientStore();

  if (!inputMode) {
    navigate("/patient/input-mode", { replace: true });
    return null;
  }

  const Component = inputMode === "voice" ? VoiceModeInterface : TouchModeInterview;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Component />
    </Suspense>
  );
}
