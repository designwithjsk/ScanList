import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { ScanArea } from "./components/ScanArea";
import { CameraModal } from "./components/CameraModal";
import { ImagePreview } from "./components/ImagePreview";
import { ScanProgress } from "./components/ScanProgress";
import { ExtractedTaskList } from "./components/ExtractedTaskList";
import { SavedTaskLists } from "./components/SavedTaskLists";
import { AddListModal } from "./components/AddListModal";
import { EmptyState } from "./components/EmptyState";
import { Toast, ToastState } from "./components/Toast";
import { Task, TaskList, ActiveView } from "./types";
import { loadSavedLists, saveSavedLists } from "./utils/storage";
import { getSampleChecklistImage } from "./utils/sampleImages";
import { AlertCircle, RefreshCw, Upload, Image as ImageIcon } from "lucide-react";

export default function App() {
  // State for user saved task lists
  const [savedLists, setSavedLists] = useState<TaskList[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>("all");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Scan workflow state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");
  const [scanStatus, setScanStatus] = useState<"idle" | "preview" | "scanning" | "scanned" | "error">("idle");
  const [scannedTasks, setScannedTasks] = useState<Task[]>([]);
  const [scanErrorMessage, setScanErrorMessage] = useState<string>("");

  // Modals & Overlay state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAddListModalOpen, setIsAddListModalOpen] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<ToastState | null>(null);

  // Load saved lists on mount
  useEffect(() => {
    const loaded = loadSavedLists();
    setSavedLists(loaded);
  }, []);

  // Save to storage whenever savedLists updates
  const updateSavedLists = (newLists: TaskList[]) => {
    setSavedLists(newLists);
    saveSavedLists(newLists);
  };

  // Toast handler
  const showToast = (message: string, type: "info" | "success" | "deleted" = "info", onUndo?: () => void) => {
    setToast({
      id: String(Date.now()),
      message,
      type,
      onUndo,
    });
  };

  // Handle selecting or uploading an image
  const handleImageSelected = (base64Data: string, mimeType: string) => {
    setSelectedImage(base64Data);
    setImageMimeType(mimeType);
    setScanStatus("preview");
    setScanErrorMessage("");
  };

  // Load sample checklist image
  const handleLoadSample = (sampleType: "handwritten" | "printed") => {
    const sampleDataUrl = getSampleChecklistImage(sampleType);
    if (sampleDataUrl) {
      handleImageSelected(sampleDataUrl, "image/jpeg");
    }
  };

  // Perform AI vision scanning via backend endpoint
  const handlePerformScan = async () => {
    if (!selectedImage) return;

    setScanStatus("scanning");
    setScanErrorMessage("");

    try {
      const response = await fetch("/api/scan-checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType: imageMimeType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process checklist image");
      }

      if (!data.tasks || data.tasks.length === 0) {
        setScanErrorMessage("No checklist items were found in this image. Try taking a closer, clearer photo.");
        setScanStatus("error");
        return;
      }

      // Convert scanned raw tasks to Task models with unique IDs
      const tasks: Task[] = data.tasks.map((t: any, idx: number) => ({
        id: `scanned-${Date.now()}-${idx}`,
        text: t.text,
        completed: Boolean(t.completed),
        createdAt: Date.now(),
      }));

      setScannedTasks(tasks);
      setScanStatus("scanned");
    } catch (err: any) {
      console.error("Scanning error:", err);
      setScanErrorMessage(
        err.message || "Couldn't read the checklist. Try a clearer, brighter photo or upload another image."
      );
      setScanStatus("error");
    }
  };

  // Reset scan workflow to scan another image
  const handleScanAgain = () => {
    setSelectedImage(null);
    setScannedTasks([]);
    setScanStatus("idle");
    setScanErrorMessage("");
  };

  // Save current scanned tasks as a new list
  const handleSaveScannedToLists = (title: string, tasksToSave: Task[]) => {
    const newList: TaskList = {
      id: `list-${Date.now()}`,
      title: title.trim() || "Scanned Checklist",
      createdAt: Date.now(),
      tasks: tasksToSave,
    };

    const updated = [newList, ...savedLists];
    updateSavedLists(updated);
    showToast("Added to your task list!", "success");
  };

  // Create a new empty list from sidebar/modal
  const handleCreateNewList = (title: string) => {
    const newList: TaskList = {
      id: `list-${Date.now()}`,
      title: title.trim(),
      createdAt: Date.now(),
      tasks: [],
    };

    const updated = [newList, ...savedLists];
    updateSavedLists(updated);
    setActiveView(newList.id);
    showToast(`Created "${title}" list`, "success");
  };

  // Delete an entire task list
  const handleDeleteList = (listId: string) => {
    const listToDelete = savedLists.find((l) => l.id === listId);
    const updated = savedLists.filter((l) => l.id !== listId);
    updateSavedLists(updated);

    if (activeView === listId) {
      setActiveView("all");
    }

    if (listToDelete) {
      showToast(`Deleted list "${listToDelete.title}"`, "deleted", () => {
        updateSavedLists([listToDelete, ...updated]);
      });
    }
  };

  // Quick Add Task to current active view or all tasks
  const handleQuickAddTask = () => {
    const text = prompt("Add a new task...");
    if (!text || !text.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      text: text.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    if (activeView !== "all" && activeView !== "today" && activeView !== "completed") {
      // Add to current selected saved list
      const updated = savedLists.map((list) => {
        if (list.id === activeView) {
          return { ...list, tasks: [...list.tasks, newTask] };
        }
        return list;
      });
      updateSavedLists(updated);
    } else {
      // Add to first saved list or create a default "General" list
      if (savedLists.length > 0) {
        const first = savedLists[0];
        const updated = savedLists.map((l, i) =>
          i === 0 ? { ...l, tasks: [...l.tasks, newTask] } : l
        );
        updateSavedLists(updated);
      } else {
        const defaultList: TaskList = {
          id: `list-${Date.now()}`,
          title: "My Tasks",
          createdAt: Date.now(),
          tasks: [newTask],
        };
        updateSavedLists([defaultList]);
      }
    }

    showToast("Task added", "success");
  };

  // Update tasks inside a specific saved list
  const handleUpdateSavedListTasks = (listId: string, updatedTasks: Task[]) => {
    const updated = savedLists.map((l) =>
      l.id === listId ? { ...l, tasks: updatedTasks } : l
    );
    updateSavedLists(updated);
  };

  // Get active tasks depending on selected view filter
  const getDisplayTasksForView = () => {
    if (activeView === "all") {
      return savedLists.flatMap((l) => l.tasks);
    }
    if (activeView === "completed") {
      return savedLists.flatMap((l) => l.tasks).filter((t) => t.completed);
    }
    if (activeView === "today") {
      return savedLists.flatMap((l) => l.tasks).filter((t) => !t.completed);
    }
    // Specific list view
    const found = savedLists.find((l) => l.id === activeView);
    return found ? found.tasks : [];
  };

  const currentViewTitle = () => {
    if (activeView === "all") return "All Tasks";
    if (activeView === "today") return "Today's Tasks";
    if (activeView === "completed") return "Completed Tasks";
    const found = savedLists.find((l) => l.id === activeView);
    return found ? found.title : "Task List";
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans text-gray-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation Header */}
      <Header
        onQuickAddTask={handleQuickAddTask}
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar Navigation */}
        <Sidebar
          activeView={activeView}
          onSelectView={(view) => {
            setActiveView(view);
            // If user selects a view while scanning, reset scan status to view tasks
            if (scanStatus === "scanned") setScanStatus("idle");
          }}
          savedLists={savedLists}
          onOpenAddListModal={() => setIsAddListModalOpen(true)}
          onDeleteList={handleDeleteList}
          onNewScan={handleScanAgain}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {/* SCAN WORKFLOW RENDERING */}
          {scanStatus === "idle" && (
            <div className="space-y-8 max-w-4xl mx-auto">
              {/* Scan Drop Zone */}
              <ScanArea
                onImageSelected={handleImageSelected}
                onOpenCamera={() => setIsCameraOpen(true)}
                onLoadSample={handleLoadSample}
              />

              {/* Saved Task Lists Grid below scan area */}
              <SavedTaskLists
                lists={savedLists}
                onSelectList={(id) => setActiveView(id)}
                onOpenAddListModal={() => setIsAddListModalOpen(true)}
                onDeleteList={handleDeleteList}
              />
            </div>
          )}

          {scanStatus === "preview" && selectedImage && (
            <div className="max-w-2xl mx-auto">
              <ImagePreview
                imageUrl={selectedImage}
                onScan={handlePerformScan}
                onReplace={handleScanAgain}
              />
            </div>
          )}

          {scanStatus === "scanning" && (
            <div className="py-12">
              <ScanProgress />
            </div>
          )}

          {scanStatus === "error" && (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center max-w-md mx-auto shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Couldn’t read the checklist
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {scanErrorMessage || "Try a clearer, brighter photo or upload another image."}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handlePerformScan}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>

                <button
                  onClick={handleScanAgain}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-semibold text-sm border border-gray-300 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-gray-600" />
                  <span>Upload Another Image</span>
                </button>
              </div>
            </div>
          )}

          {scanStatus === "scanned" && selectedImage && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto">
              {/* LEFT COLUMN: Original Uploaded Image Preview */}
              <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-4 shadow-xs self-start">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    Original image
                  </span>
                  <button
                    onClick={handleScanAgain}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                  >
                    Change photo
                  </button>
                </div>

                <div className="rounded-xl overflow-hidden bg-gray-100 border border-gray-200 max-h-[480px] flex items-center justify-center">
                  <img
                    src={selectedImage}
                    alt="Original scanned checklist photo"
                    className="max-h-[460px] w-auto object-contain"
                  />
                </div>
              </div>

              {/* RIGHT COLUMN: Extracted Scanned Tasks List */}
              <div className="lg:col-span-7">
                <ExtractedTaskList
                  tasks={scannedTasks}
                  listTitle="Scanned Tasks"
                  onUpdateTasks={(updated) => setScannedTasks(updated)}
                  onSaveToLists={handleSaveScannedToLists}
                  onScanAgain={handleScanAgain}
                  onShowDeleteToast={(deletedTask, index) => {
                    showToast("Task deleted", "deleted", () => {
                      const restored = [...scannedTasks];
                      restored.splice(index, 0, deletedTask);
                      setScannedTasks(restored);
                    });
                  }}
                />
              </div>
            </div>
          )}

          {/* VIEWING SAVED LIST OR FILTERED LIST MODE */}
          {scanStatus === "idle" && activeView !== "all" && activeView !== "today" && activeView !== "completed" && (
            <div className="max-w-3xl mx-auto mt-2">
              {(() => {
                const currentList = savedLists.find((l) => l.id === activeView);
                if (!currentList) return null;

                return (
                  <ExtractedTaskList
                    tasks={currentList.tasks}
                    listTitle={currentList.title}
                    onUpdateTasks={(updated) => handleUpdateSavedListTasks(currentList.id, updated)}
                    onSaveToLists={(title) => {
                      const updated = savedLists.map((l) =>
                        l.id === currentList.id ? { ...l, title } : l
                      );
                      updateSavedLists(updated);
                      showToast("List updated", "success");
                    }}
                    onScanAgain={handleScanAgain}
                    onShowDeleteToast={(deletedTask, index) => {
                      showToast("Task deleted", "deleted", () => {
                        const restored = [...currentList.tasks];
                        restored.splice(index, 0, deletedTask);
                        handleUpdateSavedListTasks(currentList.id, restored);
                      });
                    }}
                  />
                );
              })()}
            </div>
          )}
        </main>
      </div>

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleImageSelected}
      />

      {/* Add Task List Modal */}
      <AddListModal
        isOpen={isAddListModalOpen}
        onClose={() => setIsAddListModalOpen(false)}
        onCreateList={handleCreateNewList}
      />

      {/* Undo Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
