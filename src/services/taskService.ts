import { initialTasks } from "../initialData";
import type { Task } from "../types";

const TASK_CACHE_KEY = "agent_zero_tasks";
export function loadCachedTasks(): Task[] {
  try {
    const cached = localStorage.getItem(TASK_CACHE_KEY);
    if (!cached) return initialTasks;

    return JSON.parse(cached) as Task[];
  } catch (error) {
    console.error("Local Storage Error: Task cache corrupted or unreadable. Reverting to default system state.", error);
    localStorage.removeItem(TASK_CACHE_KEY);
    return initialTasks;
  }
}


export function cacheTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASK_CACHE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Local Storage Error: Failed to commit workflow ledger. Storage quota may be exceeded or access denied.", error);
  }
}