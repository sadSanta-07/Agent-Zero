import { initialTasks } from "../initialData";
import type { Task } from "../types";

const TASK_CACHE_KEY = "agent_zero_tasks";

export function loadCachedTasks(): Task[] {
  const cached = localStorage.getItem(TASK_CACHE_KEY);
  if (!cached) return initialTasks;

  try {
    return JSON.parse(cached) as Task[];
  } catch {
    return initialTasks;
  }
}

export function cacheTasks(tasks: Task[]): void {
  localStorage.setItem(TASK_CACHE_KEY, JSON.stringify(tasks));
}
