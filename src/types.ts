export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface TaskList {
  id: string;
  title: string;
  createdAt: number;
  tasks: Task[];
}

export type ScanStep = "idle" | "reading" | "detecting" | "organizing" | "completed" | "error";

export interface ScanResult {
  tasks: Task[];
  imageUrl?: string;
}

export type ActiveView = "all" | "today" | "completed" | string; // string can be a listId
