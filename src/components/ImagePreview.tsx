import React from "react";
import { RefreshCw, Image as ImageIcon, Cpu, Sparkles, CheckCircle2 } from "lucide-react";

export type OcrEngine = "auto" | "tesseract" | "gemini";

interface ImagePreviewProps {
  imageUrl: string;
  onScan: () => void;
  onReplace: () => void;
  isScanning?: boolean;
  ocrEngine: OcrEngine;
  onEngineChange: (engine: OcrEngine) => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl,
  onScan,
  onReplace,
  isScanning = false,
  ocrEngine,
  onEngineChange,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-slate-500" />
          <h3 className="font-bold text-sm text-slate-900">Original Checklist Image</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold flex items-center gap-1">
            <Cpu className="w-3 h-3 text-slate-700" />
            {ocrEngine === "tesseract"
              ? "Open-Source Tesseract OCR"
              : ocrEngine === "gemini"
              ? "Gemini AI Vision"
              : "Auto OCR (Gemini + Tesseract Fallback)"}
          </span>
        </div>
      </div>

      {/* OCR Engine Choice Selector */}
      <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
          Select OCR Engine:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <button
            type="button"
            onClick={() => onEngineChange("auto")}
            className={`p-2 rounded-lg font-medium text-left transition-colors cursor-pointer border ${
              ocrEngine === "auto"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <div className="font-bold">Auto Mode</div>
            <div className="text-[10px] opacity-80">Gemini AI with Open-Source Tesseract Fallback</div>
          </button>

          <button
            type="button"
            onClick={() => onEngineChange("tesseract")}
            className={`p-2 rounded-lg font-medium text-left transition-colors cursor-pointer border ${
              ocrEngine === "tesseract"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <div className="font-bold">Open-Source Tesseract</div>
            <div className="text-[10px] opacity-80">100% Local WebAssembly (No API Key Required)</div>
          </button>

          <button
            type="button"
            onClick={() => onEngineChange("gemini")}
            className={`p-2 rounded-lg font-medium text-left transition-colors cursor-pointer border ${
              ocrEngine === "gemini"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <div className="font-bold">Gemini AI Vision</div>
            <div className="text-[10px] opacity-80">Cloud AI Image Analysis</div>
          </button>
        </div>
      </div>

      {/* Image Display Frame */}
      <div className="relative rounded-xl overflow-hidden bg-slate-50 border border-slate-200 max-h-[380px] flex items-center justify-center mb-5 p-2">
        <img
          src={imageUrl}
          alt="Uploaded checklist photo ready for OCR scan"
          className="max-h-[360px] w-auto object-contain rounded-lg shadow-xs"
        />
      </div>

      {/* Control Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onScan}
          disabled={isScanning}
          className="flex-1 min-w-[160px] flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {ocrEngine === "tesseract"
              ? "Scan with Open-Source OCR"
              : "Scan Checklist"}
          </span>
        </button>

        <button
          onClick={onReplace}
          disabled={isScanning}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm border border-slate-300 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          <span>Replace Image</span>
        </button>
      </div>
    </div>
  );
};

