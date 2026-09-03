/**
 * VoiceOrb - Central microphone visualization for Voice Mode
 * 
 * Displays a large, interactive orb that:
 * - Shows current voice state (listening, speaking, processing, etc.)
 * - Provides visual feedback to the patient
 * - Works on touchscreen devices (large enough to tap)
 */

import { motion, AnimatePresence } from "framer-motion";
import { Mic, Volume2, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { VoiceState } from "@/services/voice/VoiceStateMachine";
import "./VoiceOrb.css";

interface VoiceOrbProps {
  state: VoiceState;
  isActive: boolean;
  interimTranscript?: string;
  onMicClick?: () => void;
  disabled?: boolean;
}

export function VoiceOrb({
  state,
  isActive,
  interimTranscript = "",
  onMicClick,
  disabled = false,
}: VoiceOrbProps) {
  // Determine orb color and icon based on state
  const getOrbConfig = () => {
    switch (state) {
      case "IDLE":
        return {
          bgColor: "bg-trust-500/10",
          borderColor: "border-trust-500/30",
          innerColor: "bg-trust-500/30",
          textColor: "text-trust-300",
          icon: Mic,
          pulsing: false,
          label: "Ready to begin",
        };
      case "QUESTION_READY":
        return {
          bgColor: "bg-trust-500/15",
          borderColor: "border-trust-400/50",
          innerColor: "bg-trust-500",
          textColor: "text-trust-300",
          icon: Mic,
          pulsing: true,
          label: "I'm listening carefully",
        };
      case "SPEAKING":
        return {
          bgColor: "bg-teal-500/15",
          borderColor: "border-teal-400/50",
          innerColor: "bg-teal-500",
          textColor: "text-teal-400",
          icon: Volume2,
          pulsing: true,
          label: "Speaking with you",
        };
      case "LISTENING":
        return {
          bgColor: "bg-mint-500/15",
          borderColor: "border-mint-400/50",
          innerColor: "bg-mint-500",
          textColor: "text-mint-400",
          icon: Mic,
          pulsing: true,
          label: "Go ahead, I'm listening",
        };
      case "PROCESSING":
        return {
          bgColor: "bg-violet-500/15",
          borderColor: "border-violet-400/50",
          innerColor: "bg-violet-500",
          textColor: "text-violet-300",
          icon: Loader2,
          pulsing: false,
          label: "Let me think about that...",
        };
      case "ERROR":
        return {
          bgColor: "bg-red-critical/15",
          borderColor: "border-red-critical/50",
          innerColor: "bg-red-critical",
          textColor: "text-red-critical",
          icon: AlertCircle,
          pulsing: false,
          label: "Something went wrong",
        };
      case "COMPLETED":
        return {
          bgColor: "bg-mint-500/15",
          borderColor: "border-mint-400/50",
          innerColor: "bg-mint-500",
          textColor: "text-mint-400",
          icon: CheckCircle2,
          pulsing: false,
          label: "All done — thank you",
        };
      case "NO_SPEECH":
        return {
          bgColor: "bg-amber-warn/15",
          borderColor: "border-amber-warn/50",
          innerColor: "bg-amber-warn",
          textColor: "text-amber-warn",
          icon: AlertCircle,
          pulsing: true,
          label: "I didn't catch that",
        };
      default:
        return {
          bgColor: "bg-trust-500/10",
          borderColor: "border-trust-500/30",
          innerColor: "bg-trust-500/30",
          textColor: "text-trust-300",
          icon: Mic,
          pulsing: false,
          label: "Ready",
        };
    }
  };

  const config = getOrbConfig();
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-8">
      {/* Outer container with pulsing background if needed */}
      <motion.div
        className={`relative w-48 h-48 rounded-full ${config.bgColor} border-4 ${config.borderColor} shadow-xl flex items-center justify-center transition-all ${
          disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-2xl cursor-pointer"
        }`}
        onClick={!disabled ? onMicClick : undefined}
        whileHover={!disabled ? { scale: 1.05 } : undefined}
        whileTap={!disabled ? { scale: 0.95 } : undefined}
        animate={
          config.pulsing
            ? {
                boxShadow: [
                  "0 0 20px rgba(0,0,0,0.1)",
                  "0 0 40px rgba(0,0,0,0.2)",
                  "0 0 20px rgba(0,0,0,0.1)",
                ],
              }
            : {}
        }
        transition={
          config.pulsing
            ? { duration: 1.5, repeat: Infinity }
            : undefined
        }
      >
        {/* Inner circle with icon */}
        <motion.div
          className={`w-32 h-32 rounded-full ${config.innerColor} flex items-center justify-center shadow-lg`}
          animate={
            state === "LISTENING"
              ? { scale: [0.95, 1, 0.95] }
              : state === "SPEAKING"
              ? { scale: [1, 1.1, 1] }
              : state === "PROCESSING"
              ? { rotate: 360 }
              : {}
          }
          transition={
            state === "LISTENING" || state === "SPEAKING"
              ? { duration: 0.8, repeat: Infinity }
              : state === "PROCESSING"
              ? { duration: 1, repeat: Infinity, ease: "linear" }
              : {}
          }
        >
          <Icon className="w-16 h-16 text-white" />
        </motion.div>

        {/* Waveform visualization for LISTENING and SPEAKING states */}
        {(state === "LISTENING" || state === "SPEAKING") && (
          <div className="absolute inset-0 rounded-full pointer-events-none">
            {[1, 2, 3].map((ring) => (
              <motion.div
                key={ring}
                className={`absolute inset-0 rounded-full border-2 ${config.borderColor}`}
                animate={{ scale: [1, 1.4], opacity: [1, 0] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: ring * 0.2,
                }}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* State label */}
      <motion.div
        className={`text-center ${config.textColor} font-bold text-lg`}
        animate={{ opacity: [0.8, 1] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
      >
        {config.label}
      </motion.div>

      {/* Interim transcript display */}
      <AnimatePresence>
        {interimTranscript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center text-sm text-muted-foreground max-w-xs px-4 py-2 bg-muted rounded-lg"
          >
            "{interimTranscript}"
          </motion.div>
        )}
      </AnimatePresence>

      {/* Doctor-like status messages */}
      <div className="text-center text-sm text-muted-foreground mt-4">
        {state === "IDLE" && <p className="italic">"Hello, I'm here to help you before you see your doctor."</p>}
        {state === "QUESTION_READY" && <p className="italic">"I understand. Please go on..."</p>}
        {state === "SPEAKING" && <p className="italic">"Let me ask you something..."</p>}
        {state === "LISTENING" && <p className="italic">"I'm listening carefully to what you're saying."</p>}
        {state === "NO_SPEECH" && <p className="italic">"I didn't quite catch that — please take your time."</p>}
        {state === "PROCESSING" && <p className="italic">"Thank you, let me note that down..."</p>}
        {state === "ERROR" && <p>Something went wrong. Please try again.</p>}
        {state === "COMPLETED" && <p className="italic">"I have everything your doctor needs. Thank you for being so thorough."</p>}
      </div>
    </div>
  );
}
