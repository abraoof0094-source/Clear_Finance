// Phone Storage Utility for Clear Finance
// Handles all data persistence to phone's local storage

export interface Transaction {
  id: string;
  type: "income" | "expense";
  mainCategory: string;
  subCategory: string;
  amount: number;
  notes: string;
  date: string;
  time: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface Budget {
  [monthKey: string]: {
    [subcategory: string]: number;
  };
}

class PhoneStorageManager {
  private storageKeys = {
    transactions: "tracker-transactions",
    budgets: "budgets",
    categories: "categories",
    lastBackup: "last-backup-date",
    storageInfo: "storage-info",
  };

  // Check if storage is available
  isStorageAvailable(): boolean {
    try {
      const test = "__storage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.error("Phone storage not available:", e);
      return false;
    }
  }

  // Get storage usage info
  getStorageInfo() {
    let totalSize = 0;
    let itemCount = 0;

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length;
        itemCount++;
      }
    }

    return {
      totalSize: Math.round(totalSize / 1024), // KB
      itemCount,
      available: this.isStorageAvailable(),
      lastBackup: localStorage.getItem(this.storageKeys.lastBackup) || "Never",
    };
  }

  // Save transactions to phone storage
  saveTransactions(transactions: Transaction[]): boolean {
    try {
      localStorage.setItem(
        this.storageKeys.transactions,
        JSON.stringify(transactions),
      );
      console.log(
        `💾 Saved ${transactions.length} transactions to phone storage`,
      );
      return true;
    } catch (error) {
      console.error("Failed to save transactions to phone storage:", error);
      return false;
    }
  }

  // Load transactions from phone storage
  loadTransactions(): Transaction[] {
    try {
      const stored = localStorage.getItem(this.storageKeys.transactions);
      if (stored) {
        const transactions = JSON.parse(stored);
        console.log(
          `📱 Loaded ${transactions.length} transactions from phone storage`,
        );
        return transactions;
      }
      return [];
    } catch (error) {
      console.error("Failed to load transactions from phone storage:", error);
      return [];
    }
  }

  // Save budgets to phone storage
  saveBudgets(budgets: Budget): boolean {
    try {
      localStorage.setItem(this.storageKeys.budgets, JSON.stringify(budgets));
      console.log("💾 Saved budgets to phone storage");
      return true;
    } catch (error) {
      console.error("Failed to save budgets to phone storage:", error);
      return false;
    }
  }

  // Load budgets from phone storage
  loadBudgets(): Budget {
    try {
      const stored = localStorage.getItem(this.storageKeys.budgets);
      if (stored) {
        const budgets = JSON.parse(stored);
        console.log("📱 Loaded budgets from phone storage");
        return budgets;
      }
      return {};
    } catch (error) {
      console.error("Failed to load budgets from phone storage:", error);
      return {};
    }
  }

  // Add a single transaction
  addTransaction(transaction: Transaction): boolean {
    const transactions = this.loadTransactions();
    transactions.push(transaction);
    return this.saveTransactions(transactions);
  }

  // Remove a transaction by ID
  removeTransaction(transactionId: string): boolean {
    const transactions = this.loadTransactions();
    const filtered = transactions.filter((t) => t.id !== transactionId);
    return this.saveTransactions(filtered);
  }

  // Clear all data (with confirmation)
  clearAllData(): boolean {
    try {
      localStorage.removeItem(this.storageKeys.transactions);
      localStorage.removeItem(this.storageKeys.budgets);
      localStorage.removeItem(this.storageKeys.categories);
      console.log("🗑️ Cleared all data from phone storage");
      return true;
    } catch (error) {
      console.error("Failed to clear data:", error);
      return false;
    }
  }

  // Create backup of all data
  createBackup() {
    const data = {
      transactions: this.loadTransactions(),
      budgets: this.loadBudgets(),
      categories: JSON.parse(
        localStorage.getItem(this.storageKeys.categories) || "[]",
      ),
      backupDate: new Date().toISOString(),
      version: "1.0",
    };

    localStorage.setItem(this.storageKeys.lastBackup, data.backupDate);
    return data;
  }

  // Restore from backup
  restoreFromBackup(backupData: any): boolean {
    try {
      if (backupData.transactions) {
        this.saveTransactions(backupData.transactions);
      }
      if (backupData.budgets) {
        this.saveBudgets(backupData.budgets);
      }
      if (backupData.categories) {
        localStorage.setItem(
          this.storageKeys.categories,
          JSON.stringify(backupData.categories),
        );
      }
      localStorage.setItem(
        this.storageKeys.lastBackup,
        new Date().toISOString(),
      );
      console.log("📥 Restored data from backup");
      return true;
    } catch (error) {
      console.error("Failed to restore from backup:", error);
      return false;
    }
  }
}

// Create singleton instance
export const phoneStorage = new PhoneStorageManager();

// Helper function to get current data stats
export const getDataStats = () => {
  const transactions = phoneStorage.loadTransactions();
  const budgets = phoneStorage.loadBudgets();
  const storageInfo = phoneStorage.getStorageInfo();

  return {
    transactions: transactions.length,
    budgets: Object.keys(budgets).length,
    storage: storageInfo,
  };
};
