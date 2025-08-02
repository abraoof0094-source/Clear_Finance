// Firebase Realtime Database sync - easier than Google Drive OAuth
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue } from "firebase/database";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

// Your Firebase config (you'll need to set these up)
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "clear-finance-sync.firebaseapp.com",
  databaseURL: "https://clear-finance-sync-default-rtdb.firebaseio.com",
  projectId: "clear-finance-sync",
  storageBucket: "clear-finance-sync.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
};

interface ClearFinanceData {
  transactions: any[];
  budgets: Record<string, Record<string, number>>;
  categories: any[];
  lastUpdated: string;
  version: string;
}

class FirebaseSync {
  private app: any;
  private database: any;
  private auth: any;
  private userId: string | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeFirebase();
  }

  private async initializeFirebase() {
    try {
      this.app = initializeApp(firebaseConfig);
      this.database = getDatabase(this.app);
      this.auth = getAuth(this.app);

      // Sign in anonymously (no OAuth needed!)
      await signInAnonymously(this.auth);

      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          this.userId = user.uid;
          this.isInitialized = true;
          console.log("Firebase sync ready!");
        }
      });
    } catch (error) {
      console.error("Firebase initialization failed:", error);
    }
  }

  isReady(): boolean {
    return this.isInitialized && !!this.userId;
  }

  private getCurrentData(): ClearFinanceData {
    const transactions = JSON.parse(
      localStorage.getItem("tracker-transactions") || "[]",
    );
    const budgets = JSON.parse(localStorage.getItem("budgets") || "{}");
    const categories = JSON.parse(localStorage.getItem("categories") || "[]");

    return {
      transactions,
      budgets,
      categories,
      lastUpdated: new Date().toISOString(),
      version: "1.0",
    };
  }

  private saveCurrentData(data: ClearFinanceData): void {
    localStorage.setItem(
      "tracker-transactions",
      JSON.stringify(data.transactions),
    );
    localStorage.setItem("budgets", JSON.stringify(data.budgets));
    localStorage.setItem("categories", JSON.stringify(data.categories));
    localStorage.setItem("last-sync", data.lastUpdated);
  }

  // Generate a unique sync code for sharing between devices
  async createSyncCode(): Promise<string | null> {
    if (!this.isReady()) return null;

    try {
      // Generate 6-digit sync code
      const syncCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const data = this.getCurrentData();

      // Store data with sync code (expires in 24 hours)
      const syncRef = ref(this.database, `sync-codes/${syncCode}`);
      await set(syncRef, {
        ...data,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        createdBy: this.userId,
      });

      return syncCode;
    } catch (error) {
      console.error("Failed to create sync code:", error);
      return null;
    }
  }

  // Use sync code to get data from another device
  async useSyncCode(syncCode: string): Promise<ClearFinanceData | null> {
    if (!this.isReady()) return null;

    try {
      const syncRef = ref(
        this.database,
        `sync-codes/${syncCode.toUpperCase()}`,
      );
      const snapshot = await get(syncRef);

      if (!snapshot.exists()) {
        throw new Error("Invalid sync code");
      }

      const data = snapshot.val();

      // Check if expired
      if (Date.now() > data.expiresAt) {
        throw new Error("Sync code has expired");
      }

      return data as ClearFinanceData;
    } catch (error) {
      console.error("Failed to use sync code:", error);
      return null;
    }
  }

  // Auto-sync with user's personal database
  async autoSync(): Promise<boolean> {
    if (!this.isReady()) return false;

    try {
      const data = this.getCurrentData();
      const userRef = ref(this.database, `users/${this.userId}/data`);
      await set(userRef, data);

      localStorage.setItem("last-auto-sync", new Date().toISOString());
      return true;
    } catch (error) {
      console.error("Auto-sync failed:", error);
      return false;
    }
  }

  // Restore from user's personal database
  async restoreAutoSync(): Promise<ClearFinanceData | null> {
    if (!this.isReady()) return null;

    try {
      const userRef = ref(this.database, `users/${this.userId}/data`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        return snapshot.val() as ClearFinanceData;
      }
      return null;
    } catch (error) {
      console.error("Restore failed:", error);
      return null;
    }
  }

  // Listen for real-time updates
  listenForUpdates(callback: (data: ClearFinanceData) => void): () => void {
    if (!this.isReady()) return () => {};

    const userRef = ref(this.database, `users/${this.userId}/data`);
    return onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      }
    });
  }
}

export const firebaseSync = new FirebaseSync();
