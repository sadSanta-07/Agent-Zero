import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
  type DocumentData,
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

export function createTaskDocument(data: DocumentData) {
  return addDoc(collection(db, "tasks"), data);
}

export function updateTaskDocument(taskId: string, data: DocumentData) {
  return updateDoc(doc(db, "tasks", taskId), data);
}

export function deleteTaskDocument(taskId: string) {
  return deleteDoc(doc(db, "tasks", taskId));
}
