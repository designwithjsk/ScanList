import { TaskList } from "../types";
import { INITIAL_TASK_LISTS } from "./sampleData";

const STORAGE_KEY = "scanlist_saved_lists";

export function loadSavedLists(): TaskList[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveSavedLists(INITIAL_TASK_LISTS);
      return INITIAL_TASK_LISTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load saved task lists from storage", e);
    return INITIAL_TASK_LISTS;
  }
}

export function saveSavedLists(lists: TaskList[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  } catch (e) {
    console.error("Failed to save task lists to storage", e);
  }
}
