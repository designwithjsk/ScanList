import Tesseract from "tesseract.js";

export interface OcrTask {
  text: string;
  completed: boolean;
}

export interface OcrResult {
  tasks: OcrTask[];
  rawText: string;
}

/**
 * Preprocesses an image onto an HTML Canvas with downscaling and contrast normalization
 * for fast, reliable Tesseract OCR processing on all mobile/desktop browsers.
 */
async function preprocessImageToCanvas(dataUrl: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Calculate scaled dimensions (max 1600px for speed & stability)
      const maxDim = 1600;
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(canvas);
        return;
      }

      // Draw image
      ctx.drawImage(img, 0, 0, width, height);

      // Apply light contrast / grayscale enhancement
      try {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          // Luminance calculation
          const avg = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          // Contrast factor
          const factor = 1.25;
          let val = factor * (avg - 128) + 128;
          val = Math.min(255, Math.max(0, val));

          data[i] = val;     // Red
          data[i + 1] = val; // Green
          data[i + 2] = val; // Blue
        }
        ctx.putImageData(imageData, 0, 0);
      } catch (e) {
        console.warn("Canvas image enhancement skipped:", e);
      }

      resolve(canvas);
    };
    img.onerror = (err) => reject(new Error("Failed to load photo into canvas for OCR"));
    img.src = dataUrl;
  });
}

/**
 * Parses raw OCR text lines into structured tasks with completion status
 */
export function parseOcrTextToTasks(rawText: string): OcrTask[] {
  if (!rawText) return [];

  const rawLines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const tasks: OcrTask[] = [];

  for (const line of rawLines) {
    // Skip date strings or empty noise
    if (/^\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}$/.test(line)) continue;

    let text = line;
    let completed = false;

    // Check for completed checkbox markers like [x], [X], (x), (X), [v], [✓]
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

    // Clean leading punctuation noise from OCR
    text = text.replace(/^[\|!~`"':;,\.\-_\s]+/, "").trim();

    if (text.length >= 2) {
      tasks.push({ text, completed });
    }
  }

  // Fallback: If strict formatting extracted no items, preserve raw lines
  if (tasks.length === 0 && rawLines.length > 0) {
    for (const raw of rawLines) {
      const clean = raw.replace(/^[\|!~`"':;,\.\-_\s]+/, "").trim();
      if (clean.length >= 2) {
        tasks.push({ text: clean, completed: false });
      }
    }
  }

  return tasks;
}

/**
 * Runs open-source Tesseract OCR on a base64 image
 */
export async function runTesseractOcr(
  imageBase64: string,
  onProgress?: (status: string, progress: number) => void
): Promise<OcrResult> {
  if (onProgress) {
    onProgress("Preparing image for local open-source OCR...", 0.1);
  }

  let canvasOrUrl: HTMLCanvasElement | string = imageBase64;
  try {
    canvasOrUrl = await preprocessImageToCanvas(imageBase64);
  } catch (e) {
    console.warn("Canvas preprocessing fallback to raw base64:", e);
  }

  if (onProgress) {
    onProgress("Reading text with open-source Tesseract OCR...", 0.3);
  }

  try {
    const result = await Tesseract.recognize(canvasOrUrl, "eng", {
      logger: (m) => {
        if (m && m.status && onProgress) {
          const pct = Math.round((m.progress || 0) * 100);
          const statusText =
            m.status === "recognizing text"
              ? `Reading text lines (${pct}%)...`
              : `${m.status}...`;
          onProgress(statusText, m.progress || 0.5);
        }
      },
    });

    const rawText = result?.data?.text || "";
    const tasks = parseOcrTextToTasks(rawText);

    return {
      tasks,
      rawText,
    };
  } catch (error: any) {
    console.error("Tesseract OCR Execution Error:", error);
    throw new Error(
      error?.message || "Open-source OCR could not read text from this image. Please ensure the photo has clear, visible text."
    );
  }
}
