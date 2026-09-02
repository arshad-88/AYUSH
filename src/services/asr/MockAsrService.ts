import { AsrService, TranscriptionResult } from "./AsrService";

export class MockAsrService implements AsrService {
  private timer: NodeJS.Timeout | null = null;

  isSupported(): boolean {
    return true; // Mock is always supported
  }

  startListening(
    language: string,
    onResult: (result: TranscriptionResult) => void,
    _onError?: (msg: string) => void
  ): void {
    // Stream a few interim chunks then a final result so the UI shows life.
    const chunks = [
      "I've been having",
      "I've been having chest pain since",
      "I've been having chest pain since yesterday evening",
    ];
    chunks.forEach((text, i) => {
      setTimeout(() => {
        onResult({
          text,
          isFinal: i === chunks.length - 1,
          languageCode: language,
        });
      }, 700 + i * 700);
    });
  }

  stopListening(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
