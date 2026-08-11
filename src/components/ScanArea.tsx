import React, { useRef, useState } from "react";
import { Camera, Upload, Image as ImageIcon, Sparkles, FileText } from "lucide-react";

interface ScanAreaProps {
  onImageSelected: (base64Data: string, mimeType: string) => void;
  onOpenCamera: () => void;
  onLoadSample: (sampleType: "handwritten" | "printed") => void;
}

export const ScanArea: React.FC<ScanAreaProps> = ({
  onImageSelected,
  onOpenCamera,
  onLoadSample,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (JPG, PNG, WEBP)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onImageSelected(result, file.type || "image/jpeg");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  return (
    <div className="w-full">
      {/* Title Header */}
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Scan a checklist
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Upload or capture a checklist to convert it into a digital task list.
        </p>
      </div>

      {/* Upload & Drag/Drop Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all bg-white shadow-xs ${
          isDragging
            ? "border-blue-500 bg-blue-50/50 scale-[1.005]"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Icons Header */}
        <div className="flex items-center justify-center gap-3 mb-4 text-gray-400">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
            <Camera className="w-5 h-5" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
            <Upload className="w-5 h-5" />
          </div>
        </div>

        <p className="text-sm font-medium text-gray-700 mb-6">
          Drop an image here or select an option below
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 max-w-sm mx-auto">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Image</span>
          </button>

          <button
            onClick={onOpenCamera}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-semibold text-sm border border-gray-300 shadow-xs transition-colors cursor-pointer"
          >
            <Camera className="w-4 h-4 text-gray-600" />
            <span>Scan with Camera</span>
          </button>
        </div>

        {/* Helper Note */}
        <p className="text-xs text-gray-400 mt-6 font-normal">
          Best results: clear, well-lit checklist photos. Supports JPG, PNG, WEBP.
        </p>

        {/* Try Sample Checklists */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">
            Or try a sample photo:
          </span>
          <button
            onClick={() => onLoadSample("handwritten")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Handwritten Grocery List</span>
          </button>
          <button
            onClick={() => onLoadSample("printed")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span>Printed Task Notes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
