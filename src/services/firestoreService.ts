import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";
import { db } from "../firebase";
import { TaskList } from "../types";

export function subscribeToUserTaskLists(
  userId: string,
  onUpdate: (lists: TaskList[]) => void
) {
  const userListsRef = collection(db, "users", userId, "taskLists");
  const q = query(userListsRef, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const lists: TaskList[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title || "Untitled List",
          createdAt: data.createdAt || Date.now(),
          tasks: data.tasks || [],
        };
      });
      onUpdate(lists);
    },
    (error) => {
      console.error("Error listening to user task lists from Firestore:", error);
    }
  );
}

export async function saveUserTaskList(userId: string, list: TaskList): Promise<void> {
  try {
    const listDocRef = doc(db, "users", userId, "taskLists", list.id);
    await setDoc(listDocRef, {
      title: list.title,
      createdAt: list.createdAt || Date.now(),
      updatedAt: Date.now(),
      tasks: list.tasks,
    });
  } catch (error) {
    console.error("Failed to save task list to Firestore:", error);
    throw error;
  }
}

export async function deleteUserTaskList(userId: string, listId: string): Promise<void> {
  try {
    const listDocRef = doc(db, "users", userId, "taskLists", listId);
    await deleteDoc(listDocRef);
  } catch (error) {
    console.error("Failed to delete task list from Firestore:", error);
    throw error;
  }
}
