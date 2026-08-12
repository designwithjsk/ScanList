import React from "react";
import {
  ListTodo,
  Calendar,
  CheckCircle,
  Plus,
  Folder,
  Cloud,
  CloudOff,
  Trash2,
  Scan,
  LogIn
} from "lucide-react";
import { TaskList, ActiveView } from "../types";
import { User as FirebaseUser } from "firebase/auth";

interface SidebarProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  savedLists: TaskList[];
  onOpenAddListModal: () => void;
  onDeleteList: (listId: string) => void;
  onNewScan: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  user?: FirebaseUser | null;
  onLogin?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  savedLists,
  onOpenAddListModal,
  onDeleteList,
  onNewScan,
  isOpenMobile,
  onCloseMobile,
  user,
  onLogin,
}) => {
  const content = (
    <div className="flex flex-col h-full bg-gray-50/60 border-r border-gray-200/80 w-64 p-4 text-sm font-medium text-gray-700 select-none">
      {/* Primary Action Button */}
      <button
        onClick={() => {
          onNewScan();
          onCloseMobile?.();
        }}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl font-semibold shadow-xs transition-colors mb-4 cursor-pointer"
      >
        <Scan className="w-4 h-4" />
        <span>Scan Checklist</span>
      </button>

      <button
        onClick={() => {
          onOpenAddListModal();
          onCloseMobile?.();
        }}
        className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-blue-600 border border-blue-200 py-2 px-4 rounded-xl font-medium transition-colors mb-5 cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Add Task List</span>
      </button>

      {/* Main Navigation */}
      <div className="space-y-1 mb-6">
        <button
          onClick={() => {
            onSelectView("all");
            onCloseMobile?.();
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors cursor-pointer ${
            activeView === "all"
              ? "bg-blue-50 text-blue-700 font-semibold"
              : "hover:bg-gray-200/60 text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <ListTodo className="w-4 h-4 text-blue-600" />
            <span>All Tasks</span>
          </div>
        </button>

        <button
          onClick={() => {
            onSelectView("today");
            onCloseMobile?.();
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors cursor-pointer ${
            activeView === "today"
              ? "bg-blue-50 text-blue-700 font-semibold"
              : "hover:bg-gray-200/60 text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>Today</span>
          </div>
        </button>

        <button
          onClick={() => {
            onSelectView("completed");
            onCloseMobile?.();
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors cursor-pointer ${
            activeView === "completed"
              ? "bg-blue-50 text-blue-700 font-semibold"
              : "hover:bg-gray-200/60 text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Completed</span>
          </div>
        </button>
      </div>

      {/* Saved Task Lists Section */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="flex items-center justify-between text-xs font-bold text-gray-400 tracking-wider uppercase px-3 mb-2">
          <span>My Task Lists</span>
          <span className="text-gray-400 font-normal">{savedLists.length}</span>
        </div>

        {savedLists.length === 0 ? (
          <div className="px-3 py-4 text-xs text-gray-400 text-center italic">
            No saved lists yet
          </div>
        ) : (
          <div className="space-y-1">
            {savedLists.map((list) => {
              const total = list.tasks.length;
              const completedCount = list.tasks.filter((t) => t.completed).length;
              const isSelected = activeView === list.id;

              return (
                <div
                  key={list.id}
                  className={`group relative flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
                    isSelected
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "hover:bg-gray-200/60 text-gray-700"
                  }`}
                >
                  <button
                    onClick={() => {
                      onSelectView(list.id);
                      onCloseMobile?.();
                    }}
                    className="flex-1 flex items-center justify-between min-w-0 pr-2 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Folder className="w-4 h-4 text-gray-400 group-hover:text-blue-600 shrink-0" />
                      <span className="truncate">{list.title}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-normal shrink-0 ml-1">
                      {completedCount}/{total}
                    </span>
                  </button>

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
              );
            })}
          </div>
        )}
      </div>

      {/* User Profile / Google Login Footer */}
      <div className="pt-4 mt-auto border-t border-slate-200 px-1">
        {user ? (
          <div className="flex items-center gap-3">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "User"}
                className="w-8 h-8 rounded-full border border-slate-200 object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                {(user.displayName || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">
                {user.displayName || "Signed In"}
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                Saved in Google Cloud
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[11px] text-slate-500 font-medium text-center">
              Want to save & sync your task lists?
            </p>
            <button
              onClick={onLogin}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-900 hover:bg-slate-800 rounded-full text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Google Sign In</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block shrink-0 h-[calc(100vh-57px)] sticky top-[57px]">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-50 bg-white h-full shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
