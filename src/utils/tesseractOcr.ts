import { createWorker } from "tesseract.js";

export interface OcrTask {
  text: string;
  completed: boolean;
}

export interface OcrResult {
  tasks: OcrTask[];
  rawText: string;
}

/**
 * Parses raw OCR text lines into structured tasks with completion status
 */
export function parseOcrTextToTasks(rawText: string): OcrTask[] {
  if (!rawText) return [];

  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 1);

  const tasks: OcrTask[] = [];

  for (const line of lines) {
    // Skip single characters, dates or timestamps that are unlikely to be tasks
    if (/^\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}$/.test(line)) continue;

    let text = line;
    let completed = false;

    // Check for completed checkbox markers like [x], [X], (x), (X), [v], (v), [✓]
    if (/^[\[\(][xXvV✓\*\+\-][\]\)]\s*/.test(text)) {
      completed = true;
      text = text.replace(/^[\[\(][xXvV✓\*\+\-][\]\)]\s*/, "");
    }
    // Check for empty checkbox markers like [ ], ( ), [_]
    else if (/^[\[\(][\s_]*[\]\)]\s*/.test(text)) {
      completed = false;
      text = text.replace(/^[\[\(][\s_]*[\]\)]\s*/, "");
    }
    // Check for bullet markers like -, *, •, >, o
    else if (/^[\-\*•>o]\s*/.test(text)) {
      text = text.replace(/^[\-\*•>o]\s*/, "");
    }
    // Check for numbered lists like 1., 2), 3 -
    else if (/^\d+[\.\)\-]\s*/.test(text)) {
      text = text.replace(/^\d+[\.\)\-]\s*/, "");
    }

    // Clean leading or trailing noise
    text = text.trim();

    if (text.length >= 2) {
      tasks.push({ text, completed });
    }
  }

  return tasks;
}

/**
 * Runs client-side open-source Tesseract OCR on a base64 image
 */
export async function runTesseractOcr(
  imageBase64: string,
  onProgress?: (status: string, progress: number) => void
): Promise<OcrResult> {
  const worker = await createWorker("eng");

  try {
    if (onProgress) {
      onProgress("Initializing open-source Tesseract OCR worker...", 0.2);
    }

    const ret = await worker.recognize(imageBase64);
    const rawText = ret.data.text || "";

    if (onProgress) {
      onProgress("Extracting checklist items...", 0.9);
    }

    const tasks = parseOcrTextToTasks(rawText);

    return {
      tasks,
      rawText,
    };
  } catch (error) {
    console.error("Tesseract OCR Error:", error);
    throw new Error("Open-source OCR processing failed. Please ensure the image is clear and readable.");
  } finally {
    await worker.terminate();
  }
}
