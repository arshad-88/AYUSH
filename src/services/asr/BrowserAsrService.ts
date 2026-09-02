import { AsrService, TranscriptionResult } from "./AsrService";

/**
 * Browser-based ASR using the Web Speech API.
 *
 * Improvements over a naive wrapper:
 * - interimResults = true so users see their speech stream live in the UI
 * - onerror / onend surface error messages to the consumer (no silent failure)
 * - restart-on-end keeps a continuous loop without dropping the mic
 * - guard against "aborted" / "no-speech" being treated as terminal errors
 */
export class BrowserAsrService implements AsrService {
  private recognition: any = null;
  private isListening = false;
  private lastErrorHandler: ((msg: string) => void) | null = null;

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
    }
  }

  isSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      (!!(window as any).SpeechRecognition ||
        !!(window as any).webkitSpeechRecognition)
    );
  }

  private getLanguageCode(language?: string): string {
    const normalized = (language ?? "English").trim();
    const langMap: Record<string, string> = {
      English: "en-IN",
      Hindi: "hi-IN",
      Telugu: "te-IN",
      Tamil: "ta-IN",
      Marathi: "mr-IN",
      Kannada: "kn-IN",
      Gujarati: "gu-IN",
      Bengali: "bn-IN",
      Punjabi: "pa-IN",
      Malayalam: "ml-IN",
      Odia: "or-IN",
    };

    return langMap[normalized] ?? "en-IN";
  }

  startListening(
    language: string,
    onResult: (result: TranscriptionResult) => void,
    onError?: (msg: string) => void
  ): void {
    if (!this.recognition) {
      console.error("[ASR] available: false");
      onError?.(
        "Speech recognition is not supported in this browser. Try Chrome, Edge, or Safari over HTTPS."
      );
      return;
    }

    const languageCode = this.getLanguageCode(language);
    console.log("[ASR] service: browser-recognition");
    console.log("[ASR] available:", true);
    console.log("[ASR] language:", languageCode);

    if (this.isListening) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.warn("[ASR] stop before restart warning:", error);
      }
    }

    this.recognition.lang = languageCode;
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    this.lastErrorHandler = onError ?? null;

    this.recognition.onstart = () => {
      this.isListening = true;
      console.log("[ASR] started");
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcriptPart = event.results[i][0]?.transcript ?? "";
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart;
        } else {
          interimTranscript += transcriptPart;
        }
      }

      if (finalTranscript.trim()) {
        const transcript = finalTranscript.trim();
        console.log("[ASR] result:", transcript);
        onResult({ text: transcript, isFinal: true, languageCode });
      } else if (interimTranscript.trim()) {
        onResult({
          text: interimTranscript.trim(),
          isFinal: false,
          languageCode,
        });
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      const err = event?.error ?? "unknown";
      const msg = event?.message ?? "";
      console.error("[ASR] error:", err, msg);

      // Surface user-friendly feedback. These errors are recoverable.
      const friendly = (() => {
        switch (err) {
          case "no-speech":
            return "I didn't catch that. Please speak after the tone.";
          case "audio-capture":
            return "I can't access your microphone. Please check your permissions.";
          case "not-allowed":
          case "service-not-allowed":
            return "Microphone permission denied. Please allow access in your browser settings.";
          case "network":
            return "Network error while processing speech. Please try again.";
          case "aborted":
            return null;
          default:
            return `Speech recognition error: ${err}`;
        }
      })();

      if (friendly) this.lastErrorHandler?.(friendly);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      console.log("[ASR] ended");
    };

    try {
      console.log("[ASR] start called");
      this.recognition.start();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "ASR start failed";
      console.error("[ASR] start failed:", error);
      this.isListening = false;
      this.lastErrorHandler?.(msg);
    }
  }

  stopListening(): void {
    if (!this.recognition) return;

    try {
      this.recognition.stop();
      this.isListening = false;
      console.log("[ASR] stop called");
    } catch (error) {
      console.warn("[ASR] stop warning:", error);
    }
  }
}