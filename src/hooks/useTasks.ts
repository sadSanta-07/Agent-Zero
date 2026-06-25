import { useCallback, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { auth, isFirestoreEnabled } from "../firebase";
import { initialTasks } from "../initialData";
import type { Task } from "../types";
import {
  deleteTaskDocument,
  OperationType,
  subscribeToUserTasks,
  type FirestoreErrorInfo,
} from "../services/firestoreService";
import { cacheTasks, loadCachedTasks } from "../services/taskService";
import type { AddSystemLog } from "./useSystemLogs";

interface UseTasksOptions {
  user: User | null;
  loadingAuth: boolean;
  addSystemLog: AddSystemLog;
  showToast: (message: string) => void;
}

export function useTasks({ user, loadingAuth, addSystemLog, showToast }: UseTasksOptions) {
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleFirestoreError = useCallback((
    error: unknown,
    operationType: OperationType,
    path: string | null,
  ) => {
    const errorDetails: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      operationType,
      path,
      authInfo: {
        userId: auth.currentUser?.uid || "Anonymous Guest",
        email: auth.currentUser?.email || null,
        emailVerified: auth.currentUser?.emailVerified || false,
      },
    };
    
    console.error("Database Synchronization Error:", JSON.stringify(errorDetails));

    const normalizedError = errorDetails.error.toLowerCase();
    const permissionDenied = ["permission", "denied", "403", "insufficient"]
      .some((value) => normalizedError.includes(value));
      
    addSystemLog("System", `Database Sync Error: Operation [${operationType.toUpperCase()}] failed on path "${path}".`, "warning");
    
    addSystemLog(
      "System",
      permissionDenied
        ? "Authorization Error (403): User lacks required permissions for this operation."
        : `Error details: ${errorDetails.error}`,
      "warning",
    );
    
    addSystemLog("System", "System Fallback: Defaulting to local storage environment.", "info");
    showToast(permissionDenied ? "Access Denied: Insufficient permissions." : "Database error. Falling back to local storage.");
  }, [addSystemLog, showToast]);

  useEffect(() => {
    if (loadingAuth) return;
    
    if (!user || !isFirestoreEnabled) {
      setTasks(loadCachedTasks());
      return;
    }

    return subscribeToUserTasks(
      user.uid, 
      (loadedTasks) => {
        setTasks(loadedTasks);
        addSystemLog("System", `Database Sync: Retrieved ${loadedTasks.length} workflows from cloud storage.`, "success");
      }, 
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "tasks");
        setTasks(loadCachedTasks());
      }
    );
  }, [addSystemLog, handleFirestoreError, loadingAuth, user]);

  useEffect(() => {
    if (!loadingAuth && tasks.length > 0) {
      cacheTasks(tasks);
    }
  }, [loadingAuth, tasks]);

  const deleteTask = useCallback(async (taskId: string) => {
    if (user && isFirestoreEnabled) {
      try {
        await deleteTaskDocument(taskId);
        addSystemLog("System", `Database Sync: Task ID ${taskId} successfully removed from cloud storage.`, "success");
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `tasks/${taskId}`);
        addSystemLog("System", "System Fallback: Task removed from local storage due to sync error.", "warning");
        setTasks((previous) => previous.filter((task) => task.id !== taskId));
      }
    } else {
      setTasks((previous) => previous.filter((task) => task.id !== taskId));
      addSystemLog("System", "Task removed from local storage.", "info");
    }
    showToast("Task removed successfully.");
  }, [addSystemLog, handleFirestoreError, showToast, user]);

  const resetTasks = useCallback(() => setTasks(initialTasks), []);

  return { tasks, setTasks, deleteTask, resetTasks, handleFirestoreError };
}

const sanitizeForFirestore = (obj: any): any => {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = sanitizeForFirestore(value);
    }
  }
  return cleaned;
};