import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase";
import type { Task } from "../types";

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

// THE FIX: This recursively strips out any 'undefined' values before they hit Firebase
const sanitizeForFirestore = (obj: any): any => {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);

  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = sanitizeForFirestore(value);
    }
  }
  return cleaned;
};

export function subscribeToUserTasks(
  userId: string,
  onTasks: (tasks: Task[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const tasksQuery = query(collection(db, "tasks"), where("userId", "==", userId));
  
  return onSnapshot(tasksQuery, (snapshot) => {
    const tasks = snapshot.docs
      .map((taskDocument) => ({ id: taskDocument.id, ...taskDocument.data() }) as Task)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
      
    onTasks(tasks);
  }, onError);
}

export function createTaskDocument(data: Omit<Task, 'id'>) {
  return addDoc(collection(db, "tasks"), sanitizeForFirestore(data));
}

export function updateTaskDocument(taskId: string, data: Partial<Task>) {
  return updateDoc(doc(db, "tasks", taskId), sanitizeForFirestore(data));
}

export function deleteTaskDocument(taskId: string) {
  return deleteDoc(doc(db, "tasks", taskId));
}