import React, { useState, useRef, useEffect } from "react";
import { Square, CheckSquare, Pencil, Trash2, Check, X } from "lucide-react";
import { Task } from "../types";

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onEdit: (taskId: string, newText: string) => void;
  onDelete: (taskId: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = editText.trim();
    if (trimmed) {
      onEdit(task.id, trimmed);
    } else {
      setEditText(task.text);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditText(task.text);
      setIsEditing(false);
    }
  };

  return (
    <div className="group flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200/60 transition-all">
      {/* LEFT: Checkbox & Text */}
      <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
        <button
          onClick={() => onToggle(task.id)}
          className="text-gray-400 hover:text-blue-600 focus:outline-hidden transition-colors cursor-pointer shrink-0"
          aria-label={task.completed ? "Mark task incomplete" : "Mark task complete"}
        >
          {task.completed ? (
            <CheckSquare className="w-5 h-5 text-blue-600" />
          ) : (
            <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          )}
        </button>

        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              ref={inputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-3 py-1.5 text-sm bg-white border border-blue-400 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              onClick={handleSave}
              className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
              title="Save changes"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setEditText(task.text);
                setIsEditing(false);
              }}
              className="p-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors cursor-pointer"
              title="Cancel editing"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <span
            onClick={() => onToggle(task.id)}
            className={`text-sm font-medium transition-all cursor-pointer select-none truncate ${
              task.completed
                ? "line-through text-gray-400"
                : "text-gray-800 hover:text-gray-900"
            }`}
          >
            {task.text}
          </span>
        )}
      </div>

      {/* RIGHT: Edit & Delete Icons */}
      {!isEditing && (
        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="Edit task text"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
