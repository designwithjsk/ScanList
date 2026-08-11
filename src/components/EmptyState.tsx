import React from "react";
import { Scan, Plus, CheckSquare } from "lucide-react";

interface EmptyStateProps {
  onScanClick: () => void;
  onAddTaskClick: () => void;
  title?: string;
  subtitle?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onScanClick,
  onAddTaskClick,
  title = "No tasks yet",
  subtitle = "Scan a checklist or add your first task.",
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-xs max-w-md mx-auto">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
        <CheckSquare className="w-6 h-6" />
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-6 font-normal">{subtitle}</p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onScanClick}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer"
        >
          <Scan className="w-4 h-4" />
          <span>Scan Checklist</span>
        </button>

        <button
          onClick={onAddTaskClick}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-semibold text-sm border border-gray-300 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 text-gray-600" />
          <span>Add Task</span>
        </button>
      </div>
    </div>
  );
};
