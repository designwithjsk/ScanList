import React from "react";
import { Folder, CheckCircle2, ChevronRight, Plus, Trash2 } from "lucide-react";
import { TaskList } from "../types";

interface SavedTaskListsProps {
  lists: TaskList[];
  onSelectList: (listId: string) => void;
  onOpenAddListModal: () => void;
  onDeleteList: (listId: string) => void;
}

export const SavedTaskLists: React.FC<SavedTaskListsProps> = ({
  lists,
  onSelectList,
  onOpenAddListModal,
  onDeleteList,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs mt-8">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 tracking-wider uppercase">
            My Task Lists
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Saved checklists ready to review & check off
          </p>
        </div>

        <button
          onClick={onOpenAddListModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New List</span>
        </button>
      </div>

      {lists.length === 0 ? (
        <div className="py-6 text-center text-gray-400 text-sm">
          No saved task lists yet. Scan a checklist image above!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {lists.map((list) => {
            const total = list.tasks.length;
            const completedCount = list.tasks.filter((t) => t.completed).length;
            const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

            return (
              <div
                key={list.id}
                onClick={() => onSelectList(list.id)}
                className="group relative p-4 rounded-xl border border-gray-200/90 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer bg-gray-50/40 hover:bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <Folder className="w-4 h-4 text-blue-600 shrink-0" />
                      <h4 className="font-semibold text-sm text-gray-900 truncate">
                        {list.title}
                      </h4>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteList(list.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all cursor-pointer"
                      title="Delete list"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 font-normal">
                    {total} {total === 1 ? "task" : "tasks"} · {completedCount} completed
                  </p>
                </div>

                {/* Progress bar */}
                <div className="mt-3 pt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
