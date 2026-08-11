import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for base64 image uploads
app.use(express.json({ limit: "25mb" }));

// Initialize Gemini AI client if API key is present
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API Route: Scan Checklist Image using Gemini Vision
app.post("/api/scan-checklist", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "No image provided" });
    }

    // Strip base64 prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const ai = getGeminiClient();

    if (!ai) {
      console.log("No GEMINI_API_KEY set. Returning fallback extracted tasks for preview.");
      // Provide a realistic fallback for demo/development when no API key is set
      return res.json({
        tasks: [
          { text: "Buy fresh vegetables", completed: false },
          { text: "Call the electrician", completed: false },
          { text: "Pick up medicine", completed: true },
          { text: "Pay electricity bill", completed: false },
          { text: "Clean kitchen counter", completed: false },
          { text: "Send quarterly reports", completed: false }
        ]
      });
    }

    const prompt = `You are a checklist extraction engine.

Analyze the provided image and extract ONLY actionable checklist/task items.

Return ONLY valid JSON according to the schema.

Rules:
- Read the checklist from top to bottom.
- Return one task per item.
- Preserve the original task wording.
- Fix only obvious OCR/spelling errors.
- Do not invent missing information.
- Do not summarize.
- Do not combine separate tasks.
- Do not split one task unnecessarily.
- Ignore titles, headings, dates, names, decorative text and unrelated content.
- Detect whether each checkbox or item is already completed/checked/struck-through.
- Preserve the original order.`;

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: cleanBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: {
        parts: [
          imagePart,
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              description: "Extracted list of checklist items from the image",
              items: {
                type: Type.OBJECT,
                properties: {
                  text: {
                    type: Type.STRING,
                    description: "The extracted task text"
                  },
                  completed: {
                    type: Type.BOOLEAN,
                    description: "Whether the task was already checked or completed in the image"
                  }
                },
                required: ["text", "completed"]
              }
            }
          },
          required: ["tasks"]
        }
      }
    });

    const responseText = response.text || "{}";
    let parsedJson;
    try {
      parsedJson = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse JSON response from Gemini:", responseText);
      return res.status(500).json({
        error: "Couldn't parse scanning results. Please try a clearer photo."
      });
    }

    if (!parsedJson.tasks || !Array.isArray(parsedJson.tasks)) {
      return res.json({ tasks: [] });
    }

    // Filter out empty or whitespace tasks
    const cleanTasks = parsedJson.tasks
      .filter((t: any) => t && typeof t.text === "string" && t.text.trim().length > 0)
      .map((t: any) => ({
        text: t.text.trim(),
        completed: Boolean(t.completed)
      }));

    return res.json({ tasks: cleanTasks });
  } catch (error: any) {
    console.error("Error in /api/scan-checklist:", error);
    return res.status(500).json({
      error: error.message || "Failed to scan checklist image"
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ScanList server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
