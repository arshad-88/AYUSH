/**
 * TouchModeInterview.tsx - Text/Touch Interview Interface
 * 
 * Provides a traditional text-based interview experience with optional
 * microphone input and speaker buttons for question readback.
 * Designed for accessibility on touch and non-touch devices.
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePatientStore } from "@/store/patientStore";
import { Header } from "@/components/shared/Header";
import { StepProgress } from "@/components/shared/StepProgress";
import { SpeakerButton } from "@/components/voice/SpeakerButton";
import { getAsrService, getTtsService, getAiService } from "@/services/serviceRegistry";
import { ClinicalState, defaultClinicalState, SOCRATESResponse } from "@/types";
import {
  interviewGreeting,
  placeholderText,
  clarificationMessage,
  getFieldLabel,
  fieldDescription,
} from "@/services/ai/interviewI18n";
import {
  Mic,
  MicOff,
  Send,
  ArrowRight,
  ArrowLeft,
  Bot,
  User,
  Loader2,
  FileText,
  Activity,
  Brain,
  CheckCircle,
} from "lucide-react";
import {
  BiomarkerBar,
  EkgWave,
  RingProgress,
  StatusBar,
  DNASpinner,
} from "@/components/scientific";

// Constants
const socratesOrder = [
  "site",
  "onset",
  "character",
  "radiation",
  "associatedSymptoms",
  "timing",
  "exacerbatingFactors",
  "relievingFactors",
  "severity",
];

interface ChatMessage {
  id: string;
  role: "ai" | "patient";
  content: string;
  timestamp: string;
}

/**
 * Convert ClinicalState to legacy SOCRATES format
 */
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
  duration: state.duration ?? "",
});

/**
 * TouchModeInterview Component
 * 
 * Features:
 * - Text input for patient responses
 * - Optional microphone input for voice transcription
 * - Speaker buttons on AI messages for question readback
 * - Real-time SOCRATES field completion tracking
 * - Clinical state management and progression
 */
export default function TouchModeInterview() {
  const navigate = useNavigate();
  const {
    chiefComplaint,
    socrates,
    setSOCRATES,
    setChiefComplaint,
    setStep,
    interviewComplete,
    setInterviewComplete,
    clinicalState,
    updateClinicalState,
    language,
    activeInterviewQuestion,
    activeInterviewTargetField,
    interviewMessages,
    setInterviewProgress,
    setInterviewMessages,
  } = usePatientStore();

  // State management
  const [messages, setMessages] = useState<ChatMessage[]>(interviewMessages);
  const [completionHandled, setCompletionHandled] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(
    activeInterviewQuestion
  );
  const [currentTargetField, setCurrentTargetField] = useState<
    string | undefined
  >(
    activeInterviewTargetField ??
      (interviewComplete ? undefined : "chiefComplaint")
  );
  const [phase, setPhase] = useState<"complaint" | "interview" | "complete">(
    interviewComplete
      ? "complete"
      : clinicalState.chiefComplaint
        ? "interview"
        : "complaint"
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with greeting if empty
  useEffect(() => {
    if (messages.length === 0) {
      const greeting: ChatMessage = {
        id: "greeting",
        role: "ai",
        content: interviewGreeting(language),
        timestamp: new Date().toISOString(),
      };
      setMessages([greeting]);
      setInterviewMessages([greeting]);
      if (!interviewComplete) setInterviewProgress("", "chiefComplaint");
    }
  }, [language, interviewComplete]);

  /**
   * Add a message to the conversation
   */
  const addMessage = (role: "ai" | "patient", content: string) => {
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
  };

  /**
   * Mark interview as complete and add final message
   */
  const markInterviewComplete = (messageText: string) => {
    if (completionHandled || phase === "complete") return;
    setCompletionHandled(true);
    setInterviewComplete(true);
    setInterviewProgress("", null);
    setPhase("complete");
    addMessage("ai", messageText);
  };

  /**
   * Handle voice input (microphone transcription)
   */
  const handleVoiceInput = async () => {
    const asrService = getAsrService();

    if (!asrService.isSupported()) {
      addMessage("ai", "Speech recognition is not supported in this browser. Please use Chrome/Edge or Touch input.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      asrService.stopListening();
      return;
    }

    setIsListening(true);

    const asrLanguage = language || "English";

    asrService.startListening(asrLanguage, (result) => {
      if (result.isFinal) {
        setIsListening(false);
        setInputValue(result.text);
      }
    });
  };

  /**
   * Handle text form submission
   */
  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;

    const value = inputValue.trim();
    addMessage("patient", value);
    setInputValue("");

    setIsProcessing(true);
    try {
      await processAnswer(
        value,
        phase === "complaint" ? "chiefComplaint" : undefined
      );
    } catch (error) {
      addMessage(
        "ai",
        error instanceof Error
          ? error.message
          : clarificationMessage(language)
      );
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Process patient answer through clinical engine
   */
  const processAnswer = async (
    answer: string,
    targetFieldOverride?: string
  ) => {
    setIsProcessing(true);

    const currentStore = usePatientStore.getState();
    const baseState = {
      ...currentStore.clinicalState,
      chiefComplaint:
        currentStore.clinicalState.chiefComplaint ||
        currentStore.chiefComplaint ||
        chiefComplaint ||
        "",
    };

    const aiService = getAiService();
    const result = await aiService.processAnswer?.(
      answer,
      currentQuestion,
      baseState,
      {
        language: language || "English",
        targetField: targetFieldOverride ?? currentTargetField,
      }
    ) ?? {
      updatedState: baseState,
      nextQuestion: null,
      providerStatus: "LOCAL" as const,
    };

    const nextState = result.updatedState;
    updateClinicalState(nextState);
    setSOCRATES(toLegacySocrates(nextState));
    setChiefComplaint(
      nextState.chiefComplaint ?? chiefComplaint ?? ""
    );

    // Check for completion
    if (
      result.nextQuestion?.targetField === "complete" ||
      !result.nextQuestion
    ) {
      const completionMessage =
        result.nextQuestion?.question ||
        "Thank you. I have gathered the information needed for your doctor. Please proceed to the next step.";
      markInterviewComplete(completionMessage);
      setCurrentQuestion("");
      setCurrentTargetField(undefined);
      setIsProcessing(false);
      return;
    }

    // Move to next question
    const nextTargetField = result.nextQuestion.targetField;
    setCurrentQuestion(result.nextQuestion.question);
    setCurrentTargetField(nextTargetField);
    setInterviewProgress(
      result.nextQuestion.question,
      nextTargetField
    );
    setPhase(nextTargetField === "chiefComplaint" ? "complaint" : "interview");
    addMessage("ai", result.nextQuestion.question);

    setIsProcessing(false);
  };

  const answeredCount = socratesOrder.filter(
    (field) => socrates[field as keyof typeof socrates]
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
            completedSteps={["login", "consent", "language"]}
          />
        </div>

        {/* Two-panel layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-0">
          {/* Left: AI Conversation */}
          <div className="lg:col-span-3 flex flex-col">
            <div className="lab-card lab-card-accent flex-1 flex flex-col min-h-[500px]">
              <div className="p-5 pb-3 border-b border-trust-500/15 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-trust-500/15 border border-trust-500/30 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-trust-300" strokeWidth={1.6} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-tight-x">
                      Clinical Interview
                    </h3>
                    <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                      TOUCH MODE · ADAPTIVE SOCRATES
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBar latency="42ms" />
                  <span className="data-figure text-sm font-semibold text-trust-300">
                    {answeredCount}/9
                  </span>
                </div>
              </div>

              {/* Messages with Speaker Buttons */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${
                        msg.role === "ai" ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-3 border ${
                          msg.role === "ai"
                            ? "bg-trust-500/8 border-trust-500/25 text-foreground"
                            : "bg-teal-500/10 border-teal-500/30 text-foreground"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {msg.role === "ai" ? (
                            <Bot className="w-4 h-4 text-trust-300 mt-0.5 flex-shrink-0" strokeWidth={1.6} />
                          ) : (
                            <User className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" strokeWidth={1.6} />
                          )}
                          <div className="flex-1">
                            <p className="text-sm leading-relaxed">
                              {msg.content}
                            </p>
                            {msg.role === "ai" && msg.content && (
                              <div className="mt-2">
                                <SpeakerButton
                                  text={msg.content}
                                  language={language}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-trust-500/15">
                <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={isListening ? "default" : "outline"}
                    size="icon"
                    className={`flex-shrink-0 ${
                      isListening
                        ? "bg-red-urgent hover:bg-red-urgent/90 border-0"
                        : "border-trust-500/30 hover:bg-trust-500/10"
                    }`}
                    onClick={handleVoiceInput}
                    disabled={isProcessing}
                    title={isListening ? "Stop listening" : "Start listening"}
                  >
                    {isListening ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </Button>
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={placeholderText(
                      phase === "complete" ? "interview" : phase,
                      language
                    )}
                    disabled={isProcessing}
                    className="flex-1 bg-bio-base/50 border-trust-500/30 focus:border-trust-400"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="flex-shrink-0 bg-gradient-to-r from-trust-500 to-teal-500 hover:from-trust-400 hover:to-teal-400 text-white border-0"
                    disabled={!inputValue.trim() || isProcessing}
                  >
                    {isProcessing ? (
                      <DNASpinner size="sm" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </form>

                {isListening && (
                  <div className="mt-3 flex items-center justify-center gap-1">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <div
                        key={i}
                        className="w-1 bg-trust-400 rounded-full waveform-bar"
                        style={{ animationDelay: `${i * 0.12}s`, height: 4 + (i % 3) * 4 }}
                      />
                    ))}
                    <span className="data-figure text-[10px] text-trust-300 ml-2 tracking-widest">
                      LISTENING · ASR ACTIVE
                    </span>
                  </div>
                )}

                <div className="mt-3">
                  <EkgWave height={20} showAxis={false} variant="primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Case Information Panel */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="lab-card lab-card-accent flex-1 flex flex-col">
              <div className="p-5 pb-3 border-b border-trust-500/15 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-teal-400" strokeWidth={1.6} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold tracking-tight-x">
                    Live Case Stream
                  </h3>
                  <span className="data-figure text-[10px] text-muted-foreground tracking-widest">
                    EXTRACTED · REAL-TIME
                  </span>
                </div>
                <RingProgress value={Math.round((answeredCount / 9) * 100)} size={36} thickness={3} variant="accent" showValue={false} />
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
                  const value =
                    socrates[field as keyof typeof socrates];
                  const isActive = !value && phase === "interview";
                  return (
                    <div
                      key={field}
                      className={`p-3 rounded-md border transition-all ${
                        value
                          ? "bg-teal-500/8 border-teal-500/25"
                          : isActive
                            ? "bg-amber-warn/10 border-amber-warn/40"
                            : "bg-bio-base/40 border-bio-border/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="data-figure text-[10px] tracking-widest text-muted-foreground">
                          {getFieldLabel(field, language)}
                        </span>
                        {value && <CheckCircle className="w-3 h-3 text-mint-400" />}
                        {isActive && <span className="w-2 h-2 rounded-full bg-amber-warn animate-data-pulse" />}
                      </div>
                      {value ? (
                        <p className="text-sm text-foreground">{value}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground/60 italic">
                          {isActive
                            ? language === "Hindi"
                              ? "उत्तर की प्रतीक्षा है..."
                              : language === "Telugu"
                                ? "సమాధానం కోసం వేచి ఉంది..."
                                : "Awaiting response..."
                            : fieldDescription(field, language)}
                        </p>
                      )}
                    </div>
                  );
                })}

                <div className="p-3 rounded-md bg-bio-base/60 border border-trust-500/15">
                  <div className="flex items-center justify-between mb-2">
                    <span className="eyebrow">SOCRATES COMPLETENESS</span>
                    <span className="data-figure text-sm font-bold text-trust-300">
                      {answeredCount}/9
                    </span>
                  </div>
                  <BiomarkerBar
                    value={answeredCount}
                    max={9}
                    variant="accent"
                    size="sm"
                    showValue={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate("/patient/dashboard")}
            className="border-trust-500/30 hover:bg-trust-500/10"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            <span className="data-figure tracking-wider">BACK</span>
          </Button>

          {phase === "complete" && (
            <Button
              className="bg-gradient-to-r from-trust-500 to-teal-500 hover:from-trust-400 hover:to-teal-400 text-white border-0 glow-primary"
              onClick={() => {
                setStep("ayush");
                navigate("/patient/assessment");
              }}
            >
              Continue to AYUSH Assessment
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
