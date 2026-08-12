import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { ScanArea } from "./components/ScanArea";
import { CameraModal } from "./components/CameraModal";
import { ImagePreview, OcrEngine } from "./components/ImagePreview";
import { ScanProgress } from "./components/ScanProgress";
import { ExtractedTaskList } from "./components/ExtractedTaskList";
import { SavedTaskLists } from "./components/SavedTaskLists";
import { AddListModal } from "./components/AddListModal";
import { Toast, ToastState } from "./components/Toast";
import { Task, TaskList, ActiveView } from "./types";
import { loadSavedLists, saveSavedLists } from "./utils/storage";
import { getSampleChecklistImage } from "./utils/sampleImages";
import { runTesseractOcr } from "./utils/tesseractOcr";
import { auth, signInWithGoogle, logoutFirebase } from "./firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import {
  subscribeToUserTaskLists,
  saveUserTaskList,
  deleteUserTaskList
} from "./services/firestoreService";
import { AlertCircle, RefreshCw, Upload, Image as ImageIcon, Cpu } from "lucide-react";

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
  const [ocrEngine, setOcrEngine] = useState<OcrEngine>("auto");
  const [scanProgressMessage, setScanProgressMessage] = useState<string>("");

  // Modals & Overlay state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAddListModalOpen, setIsAddListModalOpen] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<ToastState | null>(null);

  // Firebase Auth & Cloud Sync state
  const [user, setUser] = useState<FirebaseUser | null>(null);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Synchronize task lists with Firebase Firestore when logged in
  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToUserTaskLists(user.uid, (cloudLists) => {
        setSavedLists(cloudLists);
      });
      return () => unsubscribe();
    } else {
      const loaded = loadSavedLists();
      setSavedLists(loaded);
    }
  }, [user]);

  // Save to storage (Firestore if logged in, local storage if guest)
  const updateSavedLists = (newLists: TaskList[]) => {
    setSavedLists(newLists);
    if (!user) {
      saveSavedLists(newLists);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const loggedInUser = await signInWithGoogle();
      if (loggedInUser) {
        showToast(`Welcome, ${loggedInUser.displayName || "back"}!`, "success");
      }
    } catch (error: any) {
      console.error("Google Login error:", error);
      showToast("Google Sign In failed. Please try again.", "info");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutFirebase();
      showToast("Signed out", "info");
    } catch (error) {
      console.error("Logout error:", error);
    }
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

  // Perform OCR vision scanning (Hybrid Gemini + Open-Source Tesseract.js)
  const handlePerformScan = async (forcedEngine?: OcrEngine) => {
    if (!selectedImage) return;

    const engineToUse = forcedEngine || ocrEngine;
    setScanStatus("scanning");
    setScanErrorMessage("");

    // Helper to run client-side open source Tesseract OCR
    const runTesseractFallback = async () => {
      setScanProgressMessage("Running open-source Tesseract OCR reading...");
      const result = await runTesseractOcr(selectedImage, (statusMsg) => {
        setScanProgressMessage(statusMsg);
      });

      if (!result.tasks || result.tasks.length === 0) {
        throw new Error(
          "Open-source OCR couldn't detect clear text lines. Try taking a closer, well-lit photo of your checklist."
        );
      }

      const tasks: Task[] = result.tasks.map((t, idx) => ({
        id: `scanned-tess-${Date.now()}-${idx}`,
        text: t.text,
        completed: Boolean(t.completed),
        createdAt: Date.now(),
      }));

      setScannedTasks(tasks);
      setScanStatus("scanned");
      showToast("Scanned using open-source Tesseract OCR!", "info");
    };

    if (engineToUse === "tesseract") {
      try {
        await runTesseractFallback();
      } catch (err: any) {
        console.error("Tesseract scan error:", err);
        setScanErrorMessage(err.message || "Open-source OCR failed to read the image.");
        setScanStatus("error");
      }
      return;
    }

    // Try Gemini API first (for "auto" or "gemini")
    setScanProgressMessage("Analyzing image with cloud vision...");
    try {
      const response = await fetch("/api/scan-checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType: imageMimeType,
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        // Non-JSON response (e.g., HTML 404 page when deployed on static SPA host like Vercel)
        if (engineToUse === "auto") {
          console.warn("Backend API endpoint returned non-JSON. Switching automatically to local open-source Tesseract OCR...");
          await runTesseractFallback();
          return;
        } else {
          throw new Error("Cloud API route unavailable. Please use the Open-Source Tesseract OCR engine option.");
        }
      }

      const data = await response.json();

      if (!response.ok || data.error) {
        // If Gemini API fails and engine is "auto", fallback to Tesseract open-source engine
        if (engineToUse === "auto") {
          console.warn("Gemini API error, automatically falling back to open-source Tesseract OCR:", data.error);
          await runTesseractFallback();
          return;
        }
        throw new Error(data.error || "Failed to process checklist image");
      }

      if (!data.tasks || data.tasks.length === 0) {
        if (engineToUse === "auto") {
          console.warn("Gemini returned no tasks, attempting open-source Tesseract fallback...");
          await runTesseractFallback();
          return;
        }
        setScanErrorMessage("No checklist items were found in this image. Try taking a closer, clearer photo.");
        setScanStatus("error");
        return;
      }

      const tasks: Task[] = data.tasks.map((t: any, idx: number) => ({
        id: `scanned-${Date.now()}-${idx}`,
        text: t.text,
        completed: Boolean(t.completed),
        createdAt: Date.now(),
      }));

      setScannedTasks(tasks);
      setScanStatus("scanned");
    } catch (err: any) {
      console.error("Primary scanning error:", err);
      // Attempt open-source fallback on network/API failure in auto mode
      if (engineToUse === "auto") {
        try {
          console.warn("API call failed, attempting open-source Tesseract OCR fallback...");
          await runTesseractFallback();
          return;
        } catch (tessErr: any) {
          console.error("Fallback Tesseract scan also failed:", tessErr);
          setScanErrorMessage(
            tessErr.message || "Couldn't read text from this photo. Please ensure the image is bright and clearly readable."
          );
          setScanStatus("error");
          return;
        }
      }

      setScanErrorMessage(
        err.message || "Couldn't read the checklist. Try using the open-source Tesseract engine below or upload another image."
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
        user={user}
        onLogin={handleGoogleLogin}
        onLogout={handleLogout}
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
          user={user}
          onLogin={handleGoogleLogin}
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
                onScan={() => handlePerformScan()}
                onReplace={handleScanAgain}
                ocrEngine={ocrEngine}
                onEngineChange={setOcrEngine}
              />
            </div>
          )}

          {scanStatus === "scanning" && (
            <div className="py-12">
              <ScanProgress engine={ocrEngine} statusText={scanProgressMessage} />
            </div>
          )}

          {scanStatus === "error" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-md mx-auto shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Couldn’t read the checklist
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                {scanErrorMessage || "Try a clearer, brighter photo or upload another image."}
              </p>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => handlePerformScan("tesseract")}
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-colors cursor-pointer"
                >
                  <Cpu className="w-4 h-4 text-slate-300" />
                  <span>Scan with Open-Source Tesseract OCR</span>
                </button>

                <div className="flex items-center justify-center gap-3 mt-1">
                  <button
                    onClick={() => handlePerformScan("auto")}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Try Auto Scan</span>
                  </button>

                  <button
                    onClick={handleScanAgain}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-600" />
                    <span>Upload Another</span>
                  </button>
                </div>
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
                  user={user}
                  onLogin={handleGoogleLogin}
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
