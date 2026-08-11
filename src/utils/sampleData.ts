import { TaskList } from "../types";

export const INITIAL_TASK_LISTS: TaskList[] = [
  {
    id: "list-grocery",
    title: "Grocery List",
    createdAt: Date.now() - 86400000 * 2,
    tasks: [
      { id: "t-1", text: "Buy fresh milk", completed: true, createdAt: Date.now() - 86400000 * 2 },
      { id: "t-2", text: "Call school for updates", completed: false, createdAt: Date.now() - 86400000 * 2 },
      { id: "t-3", text: "Pay electricity bill", completed: false, createdAt: Date.now() - 86400000 * 2 },
      { id: "t-4", text: "Pick up medicine from pharmacy", completed: true, createdAt: Date.now() - 86400000 * 2 },
      { id: "t-5", text: "Send tax documents to accountant", completed: false, createdAt: Date.now() - 86400000 * 2 },
    ]
  },
  {
    id: "list-home",
    title: "Home Maintenance",
    createdAt: Date.now() - 86400000 * 5,
    tasks: [
      { id: "t-6", text: "Clean kitchen filter", completed: true, createdAt: Date.now() - 86400000 * 5 },
      { id: "t-7", text: "Fix leaky sink pipe", completed: false, createdAt: Date.now() - 86400000 * 5 },
      { id: "t-8", text: "Replace smoke alarm batteries", completed: false, createdAt: Date.now() - 86400000 * 5 },
      { id: "t-9", text: "Organize garage tool rack", completed: false, createdAt: Date.now() - 86400000 * 5 },
    ]
  },
  {
    id: "list-work",
    title: "Weekly Work Plan",
    createdAt: Date.now() - 86400000 * 1,
    tasks: [
      { id: "t-10", text: "Review client pitch presentation", completed: true, createdAt: Date.now() - 86400000 * 1 },
      { id: "t-11", text: "Schedule quarterly sync meeting", completed: false, createdAt: Date.now() - 86400000 * 1 },
      { id: "t-12", text: "Update product roadmap deck", completed: false, createdAt: Date.now() - 86400000 * 1 },
    ]
  }
];
