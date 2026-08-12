import React, { useEffect, useState } from "react";
import { Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "motion/react";

interface ScanProgressProps {
  engine?: "auto" | "tesseract" | "gemini";
  statusText?: string;
}

export const ScanProgress: React.FC<ScanProgressProps> = ({ engine = "auto", statusText }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps = [
    { title: "Reading image & text", desc: "Analyzing lines, strokes, and printed characters" },
    { title: "Detecting checklist items", desc: "Identifying bullets, numbers, and checkbox states" },
    { title: "Organizing task list", desc: "Structuring items line-by-line" }
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 800);
    const timer2 = setTimeout(() => setCurrentStep(2), 1600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs max-w-lg mx-auto">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-6 h-6 animate-pulse" />
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-1">
        Scanning checklist...
      </h3>
      <p className="text-xs text-slate-500 mb-6 font-normal">
        {statusText || (engine === "tesseract"
          ? "Using Open-Source Tesseract OCR engine (100% local, no API required)"
          : "Processing image with OCR scanning engine")}
      </p>

      {/* Progress Steps List */}
      <div className="space-y-4 text-left max-w-sm mx-auto">
        {steps.map((step, idx) => {
          const isDone = currentStep > idx;
          const isCurrent = currentStep === idx;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.15 }}
              className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                isCurrent
                  ? "bg-blue-50/70 border border-blue-100"
                  : isDone
                  ? "bg-gray-50 border border-transparent"
                  : "opacity-40"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                )}
              </div>
              <div>
                <p
                  className={`text-sm font-semibold ${
                    isCurrent ? "text-blue-900" : isDone ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
