// Pure client-side storage using IndexedDB for better persistence than localStorage
export interface Transaction {
  id: string;
  type: "income" | "expense" | "investment";
  mainCategory: string;
  subCategory: string;
  amount: number;
  date: string; // YYYY-MM-DD format
  time: string;
  timestamp: number;
}

export interface Summary {
  totalIncome: number;
  totalExpense: number;
  totalInvestment: number;
  balance: number;
  transactionCount: number;
}

class ClientStorageManager {
  private dbName = "ClearFinanceDB";
  private version = 1;
  private db: IDBDatabase | null = null;

  // Initialize IndexedDB
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create transactions store
        if (!db.objectStoreNames.contains("transactions")) {
          const store = db.createObjectStore("transactions", { keyPath: "id" });
          store.createIndex("date", "date", { unique: false });
          store.createIndex("type", "type", { unique: false });
          store.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
    });
  }

  // Ensure DB is initialized
  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  // Add transaction
  async addTransaction(
    transaction: Omit<Transaction, "id" | "timestamp">,
  ): Promise<Transaction> {
    const db = await this.ensureDB();

    const newTransaction: Transaction = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      ...transaction,
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(["transactions"], "readwrite");
      const store = tx.objectStore("transactions");
      const request = store.add(newTransaction);

      request.onsuccess = () => resolve(newTransaction);
      request.onerror = () => reject(request.error);
    });
  }

  // Get all transactions
  async getAllTransactions(): Promise<Transaction[]> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(["transactions"], "readonly");
      const store = tx.objectStore("transactions");
      const request = store.getAll();

      request.onsuccess = () => {
        const transactions = request.result || [];
        // Sort by timestamp (newest first)
        transactions.sort((a, b) => b.timestamp - a.timestamp);
        resolve(transactions);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Get recent transactions
  async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    const allTransactions = await this.getAllTransactions();
    return allTransactions.slice(0, limit);
  }

  // Get current month transactions
  async getCurrentMonthTransactions(): Promise<Transaction[]> {
    const now = new Date();
    const currentMonthKey = now.toISOString().slice(0, 7); // YYYY-MM

    const allTransactions = await this.getAllTransactions();
    return allTransactions.filter((t) => t.date.startsWith(currentMonthKey));
  }

  // Get monthly transactions
  async getMonthlyTransactions(
    year: number,
    month: number,
  ): Promise<Transaction[]> {
    const monthKey = `${year}-${month.toString().padStart(2, "0")}`;

    const allTransactions = await this.getAllTransactions();
    return allTransactions.filter((t) => t.date.startsWith(monthKey));
  }

  // Calculate summary from transactions
  private calculateSummary(transactions: Transaction[]): Summary {
    return transactions.reduce(
      (summary, transaction) => {
        switch (transaction.type) {
          case "income":
            summary.totalIncome += transaction.amount;
            break;
          case "expense":
            summary.totalExpense += transaction.amount;
            break;
          case "investment":
            summary.totalInvestment += transaction.amount;
            break;
        }
        summary.transactionCount++;
        return summary;
      },
      {
        totalIncome: 0,
        totalExpense: 0,
        totalInvestment: 0,
        balance: 0,
        transactionCount: 0,
      },
    );
  }

  // Get current month summary
  async getCurrentMonthlySummary(): Promise<Summary> {
    const transactions = await this.getCurrentMonthTransactions();
    const summary = this.calculateSummary(transactions);
    summary.balance =
      summary.totalIncome - summary.totalExpense - summary.totalInvestment;
    return summary;
  }

  // Get monthly summary
  async getMonthlySummary(year: number, month: number): Promise<Summary> {
    const transactions = await this.getMonthlyTransactions(year, month);
    const summary = this.calculateSummary(transactions);
    summary.balance =
      summary.totalIncome - summary.totalExpense - summary.totalInvestment;
    return summary;
  }

  // Delete transaction
  async deleteTransaction(transactionId: string): Promise<boolean> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(["transactions"], "readwrite");
      const store = tx.objectStore("transactions");
      const request = store.delete(transactionId);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  // Export data (for backup)
  async exportData(): Promise<string> {
    const transactions = await this.getAllTransactions();
    return JSON.stringify(
      {
        exportDate: new Date().toISOString(),
        transactions,
      },
      null,
      2,
    );
  }

  // Import data (from backup)
  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    const transactions = data.transactions || [];

    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(["transactions"], "readwrite");
      const store = tx.objectStore("transactions");

      // Clear existing data
      store.clear();

      // Add all transactions
      transactions.forEach((transaction: Transaction) => {
        store.add(transaction);
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // Migrate from localStorage (one-time migration)
  async migrateFromLocalStorage(): Promise<void> {
    try {
      const currentMonthKey = new Date().toISOString().slice(0, 7);
      const storedMonthly = localStorage.getItem(
        `transactions-${currentMonthKey}`,
      );
      const storedAll = localStorage.getItem("tracker-transactions");

      let transactions: any[] = [];

      if (storedMonthly) {
        transactions = JSON.parse(storedMonthly);
      } else if (storedAll) {
        transactions = JSON.parse(storedAll);
      }

      // Add timestamp if missing
      transactions = transactions.map((t) => ({
        ...t,
        timestamp: t.timestamp || Date.now(),
      }));

      if (transactions.length > 0) {
        const db = await this.ensureDB();

        return new Promise((resolve, reject) => {
          const tx = db.transaction(["transactions"], "readwrite");
          const store = tx.objectStore("transactions");

          transactions.forEach((transaction) => {
            store.add(transaction);
          });

          tx.oncomplete = () => {
            console.log(
              `Migrated ${transactions.length} transactions from localStorage`,
            );
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        });
      }
    } catch (error) {
      console.warn("Migration from localStorage failed:", error);
    }
  }
}

// Export singleton instance
export const clientStorage = new ClientStorageManager();

// Enhanced localStorage fallback for older browsers
export class LocalStorageManager {
  private storageKey = "clearfinance-transactions";

  // Add transaction
  addTransaction(
    transaction: Omit<Transaction, "id" | "timestamp">,
  ): Transaction {
    const newTransaction: Transaction = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      ...transaction,
    };

    const transactions = this.getAllTransactions();
    transactions.unshift(newTransaction);

    localStorage.setItem(this.storageKey, JSON.stringify(transactions));
    return newTransaction;
  }

  // Get all transactions
  getAllTransactions(): Transaction[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return [];
    }
  }

  // Get recent transactions
  getRecentTransactions(limit: number = 10): Transaction[] {
    return this.getAllTransactions().slice(0, limit);
  }

  // Get current month transactions
  getCurrentMonthTransactions(): Transaction[] {
    const now = new Date();
    const currentMonthKey = now.toISOString().slice(0, 7);

    return this.getAllTransactions().filter((t) =>
      t.date.startsWith(currentMonthKey),
    );
  }

  // Get monthly transactions
  getMonthlyTransactions(year: number, month: number): Transaction[] {
    const monthKey = `${year}-${month.toString().padStart(2, "0")}`;

    return this.getAllTransactions().filter((t) => t.date.startsWith(monthKey));
  }

  // Calculate summary
  getCurrentMonthlySummary(): Summary {
    const transactions = this.getCurrentMonthTransactions();

    const summary = transactions.reduce(
      (sum, transaction) => {
        switch (transaction.type) {
          case "income":
            sum.totalIncome += transaction.amount;
            break;
          case "expense":
            sum.totalExpense += transaction.amount;
            break;
          case "investment":
            sum.totalInvestment += transaction.amount;
            break;
        }
        sum.transactionCount++;
        return sum;
      },
      {
        totalIncome: 0,
        totalExpense: 0,
        totalInvestment: 0,
        balance: 0,
        transactionCount: 0,
      },
    );

    summary.balance =
      summary.totalIncome - summary.totalExpense - summary.totalInvestment;
    return summary;
  }

  // Delete transaction
  deleteTransaction(transactionId: string): boolean {
    const transactions = this.getAllTransactions();
    const filteredTransactions = transactions.filter(
      (t) => t.id !== transactionId,
    );

    if (filteredTransactions.length < transactions.length) {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(filteredTransactions),
      );
      return true;
    }
    return false;
  }
}

// Universal storage manager that works everywhere
import { sqlStorage } from "./sqlStorage";

export class UniversalStorage {
  private useSql = false;
  private useIndexedDB = false;
  private localStorageManager = new LocalStorageManager();

  async init(): Promise<void> {
    // Prefer sql.js (SQLite in browser) when available
    try {
      await sqlStorage.init();
      this.useSql = true;
      // migrate from localStorage if needed
      await sqlStorage.migrateFromLocalStorage();
      console.log("Using sql.js client storage");
      return;
    } catch (err) {
      console.warn("sql.js not available or failed, falling back to IndexedDB/localStorage:", err);
    }

    try {
      // Try to use IndexedDB
      await clientStorage.init();
      this.useIndexedDB = true;

      // Migrate from localStorage if needed
      await clientStorage.migrateFromLocalStorage();
      console.log("Using IndexedDB client storage");
    } catch (error) {
      console.warn("IndexedDB not available, using localStorage:", error);
      this.useIndexedDB = false;
    }
  }

  async addTransaction(
    transaction: Omit<Transaction, "id" | "timestamp">,
  ): Promise<Transaction> {
    if (this.useSql) {
      return await sqlStorage.addTransaction(transaction as any);
    }
    if (this.useIndexedDB) {
      return await clientStorage.addTransaction(transaction);
    } else {
      return this.localStorageManager.addTransaction(transaction as any);
    }
  }

  async getCurrentMonthTransactions(): Promise<Transaction[]> {
    if (this.useSql) return await sqlStorage.getCurrentMonthTransactions();
    if (this.useIndexedDB) {
      return await clientStorage.getCurrentMonthTransactions();
    } else {
      return this.localStorageManager.getCurrentMonthTransactions();
    }
  }

  async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    if (this.useSql) return await sqlStorage.getRecentTransactions(limit);
    if (this.useIndexedDB) {
      return await clientStorage.getRecentTransactions(limit);
    } else {
      return this.localStorageManager.getRecentTransactions(limit);
    }
  }

  async getCurrentMonthlySummary(): Promise<Summary> {
    if (this.useSql) return await sqlStorage.getCurrentMonthlySummary();
    if (this.useIndexedDB) {
      return await clientStorage.getCurrentMonthlySummary();
    } else {
      return this.localStorageManager.getCurrentMonthlySummary();
    }
  }

  async deleteTransaction(transactionId: string): Promise<boolean> {
    if (this.useSql) return await sqlStorage.deleteTransaction(transactionId as any);
    if (this.useIndexedDB) {
      return await clientStorage.deleteTransaction(transactionId);
    } else {
      return this.localStorageManager.deleteTransaction(transactionId);
    }
  }

  async getTransactionsByMonth(
    year: number,
    month: number,
  ): Promise<Transaction[]> {
    if (this.useSql) return await sqlStorage.getMonthlyTransactions(year, month);
    if (this.useIndexedDB) {
      return await clientStorage.getMonthlyTransactions(year, month);
    } else {
      return this.localStorageManager.getMonthlyTransactions(year, month);
    }
  }
}

// Export the universal storage instance
export const universalStorage = new UniversalStorage();
