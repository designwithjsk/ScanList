import React, { useState } from "react";
import { X } from "lucide-react";

interface AddListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateList: (title: string) => void;
}

export const AddListModal: React.FC<AddListModalProps> = ({
  isOpen,
  onClose,
  onCreateList,
}) => {
  const [listName, setListName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = listName.trim();
    if (trimmed) {
      onCreateList(trimmed);
      setListName("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-200">
        <div className="flex items-center justify-between pb-3 mb-4">
          <h3 className="text-lg font-bold text-gray-900">Add Task List</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
              List name
            </label>
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="e.g. Shopping, Home, Work..."
              autoFocus
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={!listName.trim()}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            Create List
          </button>
        </form>
      </div>
    </div>
  );
};
