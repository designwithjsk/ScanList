import React from "react";
import { CheckCircle2, RotateCcw, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface ToastState {
  id: string;
  message: string;
  type?: "info" | "success" | "deleted";
  onUndo?: () => void;
}

interface ToastProps {
  toast: ToastState | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg border border-gray-800 text-sm font-medium"
        >
          {toast.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          <span>{toast.message}</span>

          {toast.onUndo && (
            <button
              onClick={() => {
                toast.onUndo?.();
                onClose();
              }}
              className="flex items-center gap-1.5 ml-2 bg-gray-800 hover:bg-gray-700 text-blue-300 hover:text-blue-200 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Undo
            </button>
          )}

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer ml-1"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
