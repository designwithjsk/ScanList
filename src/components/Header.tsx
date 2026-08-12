import React from "react";
import { CheckSquare, Plus, Menu, LogIn, LogOut } from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";

interface HeaderProps {
  onQuickAddTask: () => void;
  onToggleSidebar?: () => void;
  user?: FirebaseUser | null;
  onLogin?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onQuickAddTask,
  onToggleSidebar,
  user,
  onLogin,
  onLogout,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 lg:hidden cursor-pointer"
            aria-label="Toggle Navigation Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                ScanList
              </h1>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block font-normal">
              Turn any checklist photo into interactive tasks
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        <button
          onClick={onQuickAddTask}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Task</span>
        </button>

        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "User"}
                className="w-8 h-8 rounded-full border border-slate-200 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                {(user.displayName || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <button
              onClick={onLogout}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-900 text-xs font-semibold py-1.5 px-2.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            title="Sign in with Google to save your lists"
          >
            <LogIn className="w-3.5 h-3.5 text-slate-700" />
            <span>Google Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
