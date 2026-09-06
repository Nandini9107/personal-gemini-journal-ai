import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { db, auth } from "./config";
import { handleFirestoreError, OperationType } from "./errors";
import { JournalEntry, AIAnalysis } from "../types";

export interface CreateEntryInput {
  title: string;
  content: string;
  analysis?: AIAnalysis;
}

export interface UpdateEntryInput {
  title?: string;
  content?: string;
  analysis?: AIAnalysis;
  favorite?: boolean;
}

export const journalService = {
  // Real-time subscribe to user's private entries
  subscribeEntries(
    userId: string,
    onSuccess: (entries: JournalEntry[]) => void,
    onError: (error: Error) => void
  ): Unsubscribe {
    const entriesPath = `users/${userId}/entries`;
    try {
      const q = query(
        collection(db, "users", userId, "entries"),
        orderBy("createdAt", "desc")
      );

      return onSnapshot(
        q,
        (snapshot) => {
          const entries: JournalEntry[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              userId: data.userId || userId,
              title: data.title || "Untitled",
              content: data.content || "",
              mood: data.mood || "Unspecified",
              moodEmoji: data.moodEmoji || "📝",
              sentimentScore: data.sentimentScore ?? 5,
              themes: Array.isArray(data.themes) ? data.themes : [],
              reflectionQuestions: Array.isArray(data.reflectionQuestions)
                ? data.reflectionQuestions
                : [],
              aiSummary: data.aiSummary || "",
              keyInsights: Array.isArray(data.keyInsights) ? data.keyInsights : [],
              wordCount:
                data.wordCount ?? (data.content ? data.content.trim().split(/\s+/).length : 0),
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString(),
              favorite: Boolean(data.favorite),
            };
          });
          onSuccess(entries);
        },
        (error) => {
          onError(error);
          handleFirestoreError(error, OperationType.LIST, entriesPath, auth);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, entriesPath, auth);
    }
  },

  // Create a new private journal entry
  async createEntry(userId: string, input: CreateEntryInput): Promise<JournalEntry> {
    const entriesPath = `users/${userId}/entries`;
    try {
      const newDocRef = doc(collection(db, "users", userId, "entries"));
      const now = new Date().toISOString();
      const wordCount = input.content.trim() ? input.content.trim().split(/\s+/).length : 0;

      const newEntry: JournalEntry = {
        id: newDocRef.id,
        userId,
        title: input.title.trim() || "Untitled Entry",
        content: input.content,
        mood: input.analysis?.mood || "Reflective",
        moodEmoji: input.analysis?.moodEmoji || "✨",
        sentimentScore: input.analysis?.sentimentScore ?? 5,
        themes: input.analysis?.themes || [],
        reflectionQuestions: input.analysis?.reflectionQuestions || [],
        aiSummary: input.analysis?.aiSummary || "",
        keyInsights: input.analysis?.keyInsights || [],
        wordCount,
        createdAt: now,
        updatedAt: now,
        favorite: false,
      };

      await setDoc(newDocRef, newEntry);
      return newEntry;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, entriesPath, auth);
    }
  },

  // Update existing entry
  async updateEntry(
    userId: string,
    entryId: string,
    input: UpdateEntryInput
  ): Promise<void> {
    const docPath = `users/${userId}/entries/${entryId}`;
    try {
      const docRef = doc(db, "users", userId, "entries", entryId);
      const now = new Date().toISOString();

      const updateData: Record<string, any> = {
        updatedAt: now,
      };

      if (input.title !== undefined) updateData.title = input.title.trim() || "Untitled Entry";
      if (input.content !== undefined) {
        updateData.content = input.content;
        updateData.wordCount = input.content.trim()
          ? input.content.trim().split(/\s+/).length
          : 0;
      }
      if (input.favorite !== undefined) updateData.favorite = input.favorite;

      if (input.analysis) {
        updateData.mood = input.analysis.mood;
        updateData.moodEmoji = input.analysis.moodEmoji;
        updateData.sentimentScore = input.analysis.sentimentScore;
        updateData.themes = input.analysis.themes;
        updateData.reflectionQuestions = input.analysis.reflectionQuestions;
        updateData.aiSummary = input.analysis.aiSummary;
        updateData.keyInsights = input.analysis.keyInsights;
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath, auth);
    }
  },

  // Delete entry
  async deleteEntry(userId: string, entryId: string): Promise<void> {
    const docPath = `users/${userId}/entries/${entryId}`;
    try {
      const docRef = doc(db, "users", userId, "entries", entryId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath, auth);
    }
  },

  // Get single entry
  async getEntry(userId: string, entryId: string): Promise<JournalEntry | null> {
    const docPath = `users/${userId}/entries/${entryId}`;
    try {
      const docRef = doc(db, "users", userId, "entries", entryId);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
      return snapshot.data() as JournalEntry;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, docPath, auth);
    }
  },

  // Upsert user profile record
  async upsertUserProfile(user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  }): Promise<void> {
    const userDocPath = `users/${user.uid}`;
    try {
      const userRef = doc(db, "users", user.uid);
      const now = new Date().toISOString();
      await setDoc(
        userRef,
        {
          uid: user.uid,
          email: user.email || "",
          displayName: user.displayName || "Journaler",
          photoURL: user.photoURL || "",
          lastLoginAt: now,
          updatedAt: now,
        },
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, userDocPath, auth);
    }
  },
};
