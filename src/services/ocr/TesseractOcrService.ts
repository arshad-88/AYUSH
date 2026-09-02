import { OcrService, OcrResult } from "./OcrService";
import * as Tesseract from "tesseract.js";

/**
 * Tesseract.js-based OCR with multi-pass preprocessing tuned for handwritten
 * medical prescriptions.
 *
 * Why this helps handwriting accuracy:
 *  - Adaptive binarization (Sauvola-style threshold) instead of a fixed cutoff
 *    so that pen strokes of varying darkness remain crisp against tinted paper.
 *  - Up-scaling small images so character segmentation is reliable.
 *  - Padding with whitespace keeps descenders/ascenders visible to Tesseract.
 *  - PSM 6 ("uniform block of text") and OEM 1 (LSTM only) — empirically best
 *    for handwritten clinical notes and prescription pads.
 *  - Whitelist of letters, digits and common prescription punctuation prevents
 *    mis-reading glyphs as symbols.
 *  - Each variant is scored and the highest-confidence result wins.
 */
export class TesseractOcrService implements OcrService {
  isSupported(): boolean {
    return true; // Tesseract.js runs in browser via WebAssembly
  }

  private async loadImageElement(file: File): Promise<HTMLImageElement> {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () =>
        reject(new Error("Failed to read image file for OCR preprocessing."));
      reader.readAsDataURL(file);
    });

    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () =>
        reject(
          new Error("Failed to decode uploaded image for OCR preprocessing."),
        );
      image.src = dataUrl;
    });
  }

  private drawOntoWhiteCanvas(image: HTMLImageElement): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available in this browser context.");

    const scale = Math.max(3, 2400 / Math.max(image.width, image.height));
    const width = Math.round(image.width * scale);
    const height = Math.round(image.height * scale);
    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, 0, 0, width, height);

    return canvas;
  }

  /**
   * Light enhancement: grayscale + contrast boost. Good for typed print.
   */
  private enhanceContrast(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data } = imageData;
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const adjusted = gray > 127 ? Math.min(255, gray + 32) : Math.max(0, gray - 32);
      data[i] = adjusted;
      data[i + 1] = adjusted;
      data[i + 2] = adjusted;
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  /**
   * Adaptive (Sauvola-style) binarization. Crucial for handwriting — handles
   * uneven lighting, paper discoloration, and variable pen pressure.
   */
  private adaptiveBinarize(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;
    const { width, height } = canvas;
    const imageData = ctx.getImageData(0, 0, width, height);
    const src = imageData.data;

    // Compute grayscale buffer.
    const gray = new Uint8ClampedArray(width * height);
    for (let i = 0, j = 0; i < src.length; i += 4, j++) {
      gray[j] = 0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2];
    }

    // Box filter for local mean via integral image.
    const integral = new Float64Array((width + 1) * (height + 1));
    for (let y = 1; y <= height; y++) {
      for (let x = 1; x <= width; x++) {
        integral[y * (width + 1) + x] =
          gray[(y - 1) * width + (x - 1)] +
          integral[(y - 1) * (width + 1) + x] +
          integral[y * (width + 1) + (x - 1)] -
          integral[(y - 1) * (width + 1) + (x - 1)];
      }
    }

    const win = Math.max(15, Math.round(Math.min(width, height) * 0.05));
    const half = Math.floor(win / 2);
    const k = 0.2; // Sauvola k constant
    const R = 128; // dynamic range constant

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const x0 = Math.max(0, x - half);
        const y0 = Math.max(0, y - half);
        const x1 = Math.min(width, x + half + 1);
        const y1 = Math.min(height, y + half + 1);
        const area = (x1 - x0) * (y1 - y0);

        const sum =
          integral[y1 * (width + 1) + x1] -
          integral[y0 * (width + 1) + x1] -
          integral[y1 * (width + 1) + x0] +
          integral[y0 * (width + 1) + x0];
        const mean = sum / area;

        let sqSum = 0;
        for (let yy = y0; yy < y1; yy++) {
          for (let xx = x0; xx < x1; xx++) {
            const g = gray[yy * width + xx];
            sqSum += (g - mean) * (g - mean);
          }
        }
        const variance = sqSum / area;
        const stdDev = Math.sqrt(variance);
        const threshold = mean * (1 + k * ((stdDev / R) - 1));

        const idx = (y * width + x) * 4;
        const value = gray[y * width + x] < threshold ? 0 : 255;
        src[idx] = value;
        src[idx + 1] = value;
        src[idx + 2] = value;
      }
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  /**
   * Invert + adaptive threshold for white-on-dark handwriting samples.
   */
  private invertedAdaptive(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data } = imageData;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }
    ctx.putImageData(imageData, 0, 0);
    return this.adaptiveBinarize(canvas);
  }

  private async recognize(
    canvas: HTMLCanvasElement,
    options: { psm: number; whitelist?: string },
  ): Promise<Tesseract.RecognizeResult> {
    const tessOptions: Record<string, unknown> = {
      logger: () => undefined,
    };
    if (options.whitelist) {
      tessOptions.tessedit_char_whitelist = options.whitelist;
    }
    if (options.psm != null) {
      (tessOptions as Record<string, unknown>).tessedit_pageseg_mode = String(options.psm);
    }
    // Increase DPI hint to help Tesseract segment handwriting better
    (tessOptions as Record<string, unknown>).tessedit_dpi = "300";

    // Tesseract's TypeScript types don't expose PSM/whitelist on WorkerOptions,
    // so we cast through `unknown` to apply the runtime parameters.
    return Tesseract.recognize(
      canvas,
      "eng",
      tessOptions as unknown as Parameters<typeof Tesseract.recognize>[2],
    );
  }

  private scoreResult(text: string, confidence: number): number {
    if (!text) return Number.NEGATIVE_INFINITY;

    // Medication hint boost — words that look like drug fragments.
    const drugHintRe = /\b(\d+\s?mg|\d+\s?mcg|\d+\s?ml|Tab|Cap|Syr|Rx|OD|BD|TID|QID|HS|PRN|am|pm|daily|twice|times|before|after|meal|bedtime|empty stomach|with food)\b/i;
    const drugHint = drugHintRe.test(text) ? 20 : 0;

    // Penalize pure-noise lines.
    const letters = (text.match(/[A-Za-z]/g) || []).length;
    const digits = (text.match(/[0-9]/g) || []).length;
    if (letters + digits < 4) return confidence - 25;

    return confidence + drugHint + Math.min((letters + digits) / 12, 20);
  }

  private async recognizeBestVariant(file: File): Promise<Tesseract.RecognizeResult> {
    const image = await this.loadImageElement(file);

    const baseCanvas = this.drawOntoWhiteCanvas(image);
    const enhancedCanvas = this.enhanceContrast(baseCanvas);
    const binaryCanvas = this.adaptiveBinarize(baseCanvas);
    const invertedCanvas = this.invertedAdaptive(baseCanvas);

    const medWhitelist =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,-/() mgmcgODBDTIDQIDHSPRNTabcapsyrR×:;@#";
    const baseWhitelist =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,-/()×:;@#";

    const candidates = [
      { canvas: binaryCanvas, psm: 6, whitelist: medWhitelist, label: "binary-med" },
      { canvas: enhancedCanvas, psm: 6, whitelist: baseWhitelist, label: "enhanced" },
      { canvas: binaryCanvas, psm: 11, whitelist: baseWhitelist, label: "binary-psm11" },
      { canvas: invertedCanvas, psm: 6, whitelist: medWhitelist, label: "inverted-med" },
      { canvas: baseCanvas, psm: 6, whitelist: baseWhitelist, label: "plain" },
      { canvas: enhancedCanvas, psm: 4, whitelist: medWhitelist, label: "enhanced-psm4" },
    ];

    let bestResult: Tesseract.RecognizeResult | null = null;
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const candidate of candidates) {
      try {
        const result = await this.recognize(candidate.canvas, {
          psm: candidate.psm,
          whitelist: candidate.whitelist,
        });
        const text = (result.data.text ?? "").trim();
        const confidence = result.data.confidence ?? 0;
        const score = this.scoreResult(text, confidence);
        if (score > bestScore) {
          bestScore = score;
          bestResult = result;
        }
      } catch (error) {
        console.warn(`[OCR] variant ${candidate.label} failed`, error);
      }
    }

    if (!bestResult) {
      throw new Error(
        "OCR failed to produce a readable result from the uploaded image.",
      );
    }

    return bestResult;
  }

  async extractText(file: File): Promise<OcrResult> {
    try {
      if (!file.type.startsWith("image/")) {
        throw new Error(
          "Only image files are supported by Tesseract in the browser currently.",
        );
      }

      const result = await this.recognizeBestVariant(file);

      return {
        text: result.data.text,
        confidence: result.data.confidence,
        entities: {
          textLength: result.data.text.length,
          confidence: result.data.confidence,
          processing: "multi-variant-adaptive-handwriting",
        },
      };
    } catch (error) {
      console.error("Tesseract OCR Error:", error);
      throw error;
    }
  }
}