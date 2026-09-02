/**
 * VoiceMode Interface
 * 
 * Complete hands-free voice conversation experience.
 * - Large central microphone orb
 * - Automatic TTS → ASR → Processing loop
 * - Live transcript and SOCRATES display
 * - Error recovery
 * - Exit/mode switch buttons
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { usePatientStore } from "@/store/patientStore";
import { Header } from "@/components/shared/Header";
import { StepProgress } from "@/components/shared/StepProgress";
import { VoiceOrb } from "./VoiceOrb";
import { VoiceInteractionController } from "@/services/voice/VoiceInteractionController";
import { VoiceState } from "@/services/voice/VoiceStateMachine";
import { getAsrService, getTtsService, getAiService } from "@/services/serviceRegistry";
import { ClinicalState, defaultClinicalState, SOCRATESResponse } from "@/types";
import {
  FileText,
  Touchpad,
  AlertCircle,
  ArrowLeft,
  Activity,
  Mic,
  Brain,
  CheckCircle,
} from "lucide-react";
import {
  BiomarkerBar,
  EkgWave,
  RingProgress,
  StatusBar,
} from "@/components/scientific";

interface ChatMessage {
  id: string;
  role: "ai" | "patient";
  content: string;
  timestamp: string;
}

const socratesLabels: Record<string, string> = {
  site: "Where",
  onset: "When",
  character: "Quality",
  radiation: "Radiation",
  associatedSymptoms: "Symptoms",
  timing: "Pattern",
  aggravatingFactors: "Worse with",
  relievingFactors: "Better with",
  severity: "Severity",
};

const socratesOrder = [
  "site",
  "onset",
  "character",
  "radiation",
  "associatedSymptoms",
  "timing",
  "aggravatingFactors",
  "relievingFactors",
  "severity",
];

const toLegacySocrates = (state: Partial<ClinicalState>): SOCRATESResponse => ({
  site: state.site ?? "",
  onset: state.onset ?? "",
  character: state.character ?? "",
  radiation: state.radiation ?? "",
  associatedSymptoms: state.associatedSymptoms?.join(", ") ?? "",
  timing: state.timing ?? "",
  exacerbatingFactors: state.aggravatingFactors ?? "",
  relievingFactors: state.relievingFactors ?? "",
  severity: state.severity != null ? String(state.severity) : "",
});

export default function VoiceModeInterface() {
  const navigate = useNavigate();
  const {
    chiefComplaint,
    clinicalState,
    updateClinicalState,
    setChiefComplaint,
    setSOCRATES,
    language,
    setInputMode,
    interviewMessages,
    setInterviewMessages,
    setInterviewComplete,
    setInterviewProgress,
    activeInterviewQuestion,
    activeInterviewTargetField,
  } = usePatientStore();

  // Voice state management
  const [voiceState, setVoiceState] = useState<VoiceState>("IDLE");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(interviewMessages);
  const [currentQuestion, setCurrentQuestion] = useState(activeInterviewQuestion);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [completionHandled, setCompletionHandled] = useState(false);

  const voiceControllerRef = useRef<VoiceInteractionController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const isProcessingRef = useRef(false);
  const lastFinalTranscriptRef = useRef<string>("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add message to chat
  const addMessage = useCallback(
    (role: "ai" | "patient", content: string) => {
      const newMsg: ChatMessage = {
        id: `${Date.now()}-${Math.random()}`,
        role,
        content,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => {
        const next = [...prev, newMsg];
        setInterviewMessages(next);
        return next;
      });
    },
    [setInterviewMessages]
  );

  // Process patient response through clinical engine
  const processPatientResponse = useCallback(
    async (transcript: string) => {
      const normalizedTranscript = transcript.trim();
      if (!normalizedTranscript) return;
      if (isProcessingRef.current) {
        console.warn("[VOICE] duplicate answer submission blocked:", normalizedTranscript);
        return;
      }
      if (lastFinalTranscriptRef.current === normalizedTranscript) {
        console.warn("[VOICE] repeated final transcript suppressed:", normalizedTranscript);
        return;
      }
      const isLikelyQuestionEcho = currentQuestion && normalizedTranscript.toLowerCase() === currentQuestion.toLowerCase();
      if (isLikelyQuestionEcho) {
        console.warn("[VOICE] transcript matched the spoken question; ignoring probable echo:", normalizedTranscript);
        return;
      }
      lastFinalTranscriptRef.current = normalizedTranscript;
      isProcessingRef.current = true;
      setIsProcessing(true);

      try {
        console.log("[VOICE] ANSWER_SUBMIT", { transcript: normalizedTranscript, question: currentQuestion });
        const aiService = getAiService();
        const result = await aiService.processAnswer?.(
          transcript,
          currentQuestion,
          clinicalState,
          {
            language,
            targetField: activeInterviewTargetField || undefined,
          }
        ) ?? {
          updatedState: clinicalState,
          nextQuestion: null,
          providerStatus: "LOCAL" as const,
        };

        // Update clinical state
        updateClinicalState(result.updatedState);
        setSOCRATES(toLegacySocrates(result.updatedState));
        setChiefComplaint(result.updatedState.chiefComplaint || chiefComplaint);

        // Check if interview is complete
        if (!result.nextQuestion || result.nextQuestion.targetField === "complete") {
          const completionMsg =
            result.nextQuestion?.question ||
            "Thank you. Your medical history is complete.";
          addMessage("ai", completionMsg);
          setInterviewComplete(true);
          if (voiceControllerRef.current) {
            voiceControllerRef.current.markCompleted();
          }
          setCompletionHandled(true);
          return;
        }

        // Move to next question
        setCurrentQuestion(result.nextQuestion.question);
        setInterviewProgress(result.nextQuestion.question, result.nextQuestion.targetField);
        addMessage("ai", result.nextQuestion.question);

        // Signal controller to handle next question
        if (voiceControllerRef.current) {
          await voiceControllerRef.current.markProcessingComplete();
          await voiceControllerRef.current.handleNextQuestion(
            result.nextQuestion.question
          );
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Failed to process response";
        addMessage("ai", `Sorry, there was an error: ${errorMsg}`);
        setErrorMessage(errorMsg);

        // Recover by going back to question ready
        if (voiceControllerRef.current) {
          await voiceControllerRef.current.markProcessingComplete();
        }
      } finally {
        lastFinalTranscriptRef.current = "";
        isProcessingRef.current = false;
        setIsProcessing(false);
      }
    },
    [
      currentQuestion,
      clinicalState,
      language,
      activeInterviewTargetField,
      updateClinicalState,
      setChiefComplaint,
      chiefComplaint,
      addMessage,
      setInterviewComplete,
      setInterviewProgress,
      setSOCRATES,
    ]
  );

  // Initialize voice mode
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initializeVoiceMode = async () => {
      const asrService = getAsrService();
      const ttsService = getTtsService();

      const controller = new VoiceInteractionController(asrService, ttsService, {
        language,
        onStateChange: setVoiceState,
        onTranscript: (text, isFinal) => {
          setInterimTranscript(text);
          if (isFinal) {
            const normalized = text.trim();
            if (!normalized) return;
            if (lastFinalTranscriptRef.current === normalized || isProcessingRef.current) {
              console.warn("[VOICE] final transcript ignored as duplicate:", normalized);
              return;
            }
            lastFinalTranscriptRef.current = normalized;
            addMessage("patient", normalized);
            void processPatientResponse(normalized);
          }
        },
        onError: (error) => {
          setErrorMessage(error);
          addMessage("ai", error);
        },
      });

      voiceControllerRef.current = controller;

      // Start with first question if available
      const startQuestion = currentQuestion || "What brings you in today?";
      lastFinalTranscriptRef.current = "";
      if (!messages.length) {
        addMessage("ai", startQuestion);
      }

      // Start voice interaction
      await controller.startVoice(startQuestion);
    };

    initializeVoiceMode();

    return () => {
      initialized.current = false;
      if (voiceControllerRef.current) {
        voiceControllerRef.current.cleanup();
      }
    };
  }, []);

  // Switch to Touch mode
  const switchToTouchMode = () => {
    if (voiceControllerRef.current) {
      voiceControllerRef.current.stopVoice();
      voiceControllerRef.current.cleanup();
    }
    setInputMode("touch");
    // Interview component will handle re-rendering with touch mode
  };

  // Exit voice
  const handleExit = () => {
    if (voiceControllerRef.current) {
      voiceControllerRef.current.cleanup();
    }
    navigate(-1);
  };

  const answeredCount = socratesOrder.filter(
    (field) => clinicalState[field as keyof ClinicalState]
  ).length;

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="absolute inset-0 surface-grid opacity-15 pointer-events-none" />
      <Header />
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 py-4 relative">
        {/* Progress */}
        <div className="mb-4">
          <StepProgress
            currentStep="interview"
            completedSteps={["login", "consent", "language", "inputMode"]}
          />
        </div>

        {/* Two-panel layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-0">
          {/* Left: Voice Interaction */}
          <div className="lg:col-span-3 flex flex-col">
            <div className="lab-card lab-card-accent flex-1 flex flex-col min-h-[600px]">
              <div className="p-5 pb-3 border-b border-trust-500/15 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-trust-500/15 border border-trust-500/30 flex items-center justify-center">
                    <Mic className="w-4 h-4 text-trust-300" strokeWidth={1.6} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-tight-x">
                      Voice Interview
                    </h3>
                    <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                      HANDS-FREE · ASR + TTS
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBar latency="38ms" />
                  <span className="data-figure text-sm font-semibold text-trust-300">
                    {answeredCount}/9
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 flex flex-col">
                {/* Voice Orb - Main Interface */}
                <div className="flex-1 flex items-center justify-center relative">
                  <VoiceOrb
                    state={voiceState}
                    isActive={voiceState !== "IDLE" && voiceState !== "COMPLETED"}
                    interimTranscript={interimTranscript}
                  />
                </div>

                {/* Live transcript */}
                {interimTranscript && (
                  <div className="text-center">
                    <span className="data-figure text-[10px] text-muted-foreground tracking-widest mr-2">
                      PARTIAL
                    </span>
                    <span className="text-sm text-trust-300 italic">{interimTranscript}…</span>
                  </div>
                )}

                {/* Messages */}
                <div className="max-h-[200px] overflow-y-auto space-y-2">
                  {messages.slice(-5).map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-sm px-3 py-2 rounded-md border ${
                        msg.role === "ai"
                          ? "bg-trust-500/8 border-trust-500/20 text-foreground"
                          : "bg-teal-500/10 border-teal-500/25 text-foreground text-right"
                      }`}
                    >
                      {msg.content}
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* EKG pulse */}
                <EkgWave height={24} showAxis={false} variant="accent" />

                {/* Error Display */}
                <AnimatePresence>
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="tag-critical rounded-md px-4 py-3 flex items-start gap-3"
                    >
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">
                          {errorMessage}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setErrorMessage("")}
                          className="mt-2"
                        >
                          Dismiss
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Controls */}
                <div className="flex gap-2 pt-4 border-t border-trust-500/15">
                  <Button
                    variant="outline"
                    onClick={switchToTouchMode}
                    className="flex-1 border-trust-500/30 hover:bg-trust-500/10"
                  >
                    <Touchpad className="w-4 h-4 mr-2" />
                    Switch to Touch
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleExit}
                    className="hover:bg-trust-500/10"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Exit
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: SOCRATES Panel */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="lab-card lab-card-accent flex-1 flex flex-col">
              <div className="p-5 pb-3 border-b border-trust-500/15 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-teal-400" strokeWidth={1.6} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold tracking-tight-x">
                    Live SOCRATES
                  </h3>
                  <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                    REAL-TIME EXTRACTION
                  </span>
                </div>
                <RingProgress
                  value={Math.round((answeredCount / 9) * 100)}
                  size={36}
                  thickness={3}
                  variant="primary"
                  showValue={false}
                />
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
                {chiefComplaint && (
                  <div className="p-3 rounded-md bg-trust-500/10 border border-trust-500/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="data-figure text-[10px] tracking-widest text-trust-300">
                        CHIEF COMPLAINT
                      </span>
                      <CheckCircle className="w-3 h-3 text-mint-400" />
                    </div>
                    <p className="text-sm text-foreground">{chiefComplaint}</p>
                  </div>
                )}

                {socratesOrder.map((field) => {
                  const value = clinicalState[field as keyof ClinicalState];
                  if (!value) return null;

                  return (
                    <div key={field} className="p-2.5 rounded-md bg-teal-500/8 border border-teal-500/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="data-figure text-[10px] tracking-widest text-muted-foreground">
                          {socratesLabels[field] || field}
                        </span>
                        <CheckCircle className="w-3 h-3 text-mint-400" />
                      </div>
                      <p className="text-sm text-foreground">
                        {Array.isArray(value) ? value.join(", ") : String(value)}
                      </p>
                    </div>
                  );
                })}

                {answeredCount === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-4">
                    Responses will appear here…
                  </div>
                )}

                <div className="p-3 rounded-md bg-bio-base/60 border border-trust-500/15 mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="eyebrow">SOCRATES COMPLETENESS</span>
                    <span className="data-figure text-sm font-bold text-trust-300">
                      {answeredCount}/9
                    </span>
                  </div>
                  <BiomarkerBar
                    value={answeredCount}
                    max={9}
                    variant="primary"
                    size="sm"
                    showValue={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
