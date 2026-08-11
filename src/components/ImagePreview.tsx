import React from "react";
import { Sparkles, RefreshCw, Image as ImageIcon, CheckCircle2 } from "lucide-react";

interface ImagePreviewProps {
  imageUrl: string;
  onScan: () => void;
  onReplace: () => void;
  isScanning?: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl,
  onScan,
  onReplace,
  isScanning = false,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-sm text-gray-800">Original Checklist Image</h3>
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md">
          Ready for AI Scan
        </span>
      </div>

      {/* Image Display Frame */}
      <div className="relative rounded-xl overflow-hidden bg-gray-900/5 border border-gray-200 max-h-[380px] flex items-center justify-center mb-5">
        <img
          src={imageUrl}
          alt="Uploaded checklist photo ready for OCR scan"
          className="max-h-[360px] w-auto object-contain rounded-lg shadow-sm"
        />
      </div>

      {/* Control Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onScan}
          disabled={isScanning}
          className="flex-1 min-w-[160px] flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>Scan Checklist</span>
        </button>

        <button
          onClick={onReplace}
          disabled={isScanning}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm border border-gray-300 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
          <span>Replace Image</span>
        </button>
      </div>
    </div>
  );
};
