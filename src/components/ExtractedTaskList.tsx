import React, { useState } from "react";
import { Plus, FolderPlus, Scan, CheckCircle2, ListTodo, Sparkles } from "lucide-react";
import { Task } from "../types";
import { TaskItem } from "./TaskItem";

interface ExtractedTaskListProps {
  tasks: Task[];
  listTitle: string;
  onUpdateTasks: (tasks: Task[]) => void;
  onSaveToLists: (title: string, tasks: Task[]) => void;
  onScanAgain: () => void;
  onShowDeleteToast: (deletedTask: Task, restoreIndex: number) => void;
}

export const ExtractedTaskList: React.FC<ExtractedTaskListProps> = ({
  tasks,
  listTitle,
  onUpdateTasks,
  onSaveToLists,
  onScanAgain,
  onShowDeleteToast,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    onUpdateTasks(updated);
  };

  const handleEditTask = (taskId: string, newText: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, text: newText } : t
    );
    onUpdateTasks(updated);
  };

  const handleDeleteTask = (taskId: string) => {
    const index = tasks.findIndex((t) => t.id === taskId);
    const taskToDelete = tasks[index];

    if (taskToDelete) {
      const updated = tasks.filter((t) => t.id !== taskId);
      onUpdateTasks(updated);
      onShowDeleteToast(taskToDelete, index);
    }
  };

  const handleAddTask = () => {
    const trimmed = newTaskText.trim();
    if (!trimmed) return;

    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      text: trimmed,
      completed: false,
      createdAt: Date.now(),
    };

    onUpdateTasks([...tasks, newTask]);
    setNewTaskText("");
    setIsAdding(false);
  };

  const handleKeyDownAdd = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTask();
    } else if (e.key === "Escape") {
      setIsAdding(false);
      setNewTaskText("");
    }
  };

  const handleSaveToCollection = () => {
    onSaveToLists(listTitle || "Scanned Checklist", tasks);
    setIsSaved(true);
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs">
      {/* List Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">
              {listTitle || "Your Task List"}
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"} detected • {completedCount} completed
          </p>
        </div>

        <button
          onClick={onScanAgain}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <Scan className="w-3.5 h-3.5" />
          <span>Scan Another</span>
        </button>
      </div>

      {/* Task Item Rows */}
      {tasks.length === 0 ? (
        <div className="py-8 text-center text-gray-400">
          <p className="text-sm font-medium">No tasks in this list.</p>
          <p className="text-xs mt-1">Add a task below or scan another checklist photo.</p>
        </div>
      ) : (
        <div className="space-y-0.5 mb-4">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggleTask}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}

      {/* Add Task Input Inline */}
      {isAdding ? (
        <div className="flex items-center gap-2 pt-2 mb-6">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={handleKeyDownAdd}
            placeholder="Add a new task..."
            autoFocus
            className="flex-1 px-3.5 py-2 text-sm bg-gray-50 border border-blue-400 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            onClick={handleAddTask}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Add
          </button>
          <button
            onClick={() => {
              setIsAdding(false);
              setNewTaskText("");
            }}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium text-xs rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-600 font-semibold text-xs transition-colors mb-6 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-blue-600" />
          <span>Add Task</span>
        </button>
      )}

      {/* Bottom Save Action */}
      <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
        {isSaved ? (
          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200 w-full justify-center sm:w-auto">
            <CheckCircle2 className="w-4 h-4" />
            <span>Added to your task list!</span>
          </div>
        ) : (
          <button
            onClick={handleSaveToCollection}
            className="flex-1 min-w-[180px] flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Add to Task List</span>
          </button>
        )}

        <button
          onClick={onScanAgain}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm border border-gray-300 transition-colors cursor-pointer"
        >
          <Scan className="w-4 h-4 text-gray-500" />
          <span>Scan Again</span>
        </button>
      </div>
    </div>
  );
};
