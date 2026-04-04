// Task store — sessionStorage-backed, event-driven, works across page navigations

import { initialTasks } from "./mockData";

export type Task = {
  id: number;
  category: string;
  description: string;
  priority: string;
  status: string;
  assigned_to: number | null;
  created_at: string;
  resolved_at?: string;
};

export const TASKS_UPDATED_EVENT = "kuriftu-tasks-updated";
const STORAGE_KEY = "kuriftu_ops_tasks";

function loadTasks(): Task[] {
  if (typeof window === "undefined") return [...initialTasks];
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as Task[];
  } catch {}
  return [...initialTasks];
}

function persist(tasks: Task[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    window.dispatchEvent(new CustomEvent(TASKS_UPDATED_EVENT));
  } catch {}
}

export function getTasks(): Task[] {
  return loadTasks();
}

export function addTask(partial: Omit<Task, "id" | "created_at">): Task {
  const tasks = loadTasks();
  const newTask: Task = {
    ...partial,
    id: Math.max(0, ...tasks.map((t) => t.id)) + 1,
    created_at: new Date().toISOString(),
  };
  persist([newTask, ...tasks]);
  return newTask;
}

export function updateTaskStatus(taskId: number, status: string): void {
  const tasks = loadTasks();
  persist(
    tasks.map((t) =>
      t.id === taskId
        ? { ...t, status, resolved_at: status === "completed" ? new Date().toISOString() : t.resolved_at }
        : t
    )
  );
}

export function assignTask(taskId: number, staffId: number): void {
  const tasks = loadTasks();
  persist(tasks.map((t) => (t.id === taskId ? { ...t, assigned_to: staffId } : t)));
}

// Detect if a guest message is a service request and return a new task if so
export function detectServiceRequest(message: string): Omit<Task, "id" | "created_at"> | null {
  const lower = message.toLowerCase();

  if (/towel|linen|bed sheet|pillow/.test(lower)) {
    return { category: "Housekeeping", description: `Guest request: ${message.slice(0, 80)}`, priority: "high", status: "new", assigned_to: null };
  }
  if (/room service|food|breakfast|lunch|dinner|drink|coffee|tea|water/.test(lower)) {
    return { category: "F&B", description: `Room service request: ${message.slice(0, 80)}`, priority: "normal", status: "new", assigned_to: null };
  }
  if (/fix|broken|repair|maintenance|ac|air con|heater|light|faucet|plumb/.test(lower)) {
    return { category: "Maintenance", description: `Maintenance request: ${message.slice(0, 80)}`, priority: "urgent", status: "new", assigned_to: null };
  }
  if (/spa|massage|treatment|wellness/.test(lower)) {
    return { category: "Spa", description: `Spa booking request: ${message.slice(0, 80)}`, priority: "normal", status: "new", assigned_to: null };
  }
  if (/transport|taxi|pickup|car|driver|airport/.test(lower)) {
    return { category: "Concierge", description: `Transport request: ${message.slice(0, 80)}`, priority: "normal", status: "new", assigned_to: null };
  }
  if (/clean|vacuum|housekeep|tidy/.test(lower)) {
    return { category: "Housekeeping", description: `Cleaning request: ${message.slice(0, 80)}`, priority: "normal", status: "new", assigned_to: null };
  }
  return null;
}
