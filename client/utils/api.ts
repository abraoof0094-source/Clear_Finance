// Transaction interface (matches server)
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

// Summary interface
export interface Summary {
  totalIncome: number;
  totalExpense: number;
  totalInvestment: number;
  balance: number;
  transactionCount: number;
}

// API base URL - adjust based on your setup
const API_BASE =
  process.env.NODE_ENV === "production" ? "/api" : "http://localhost:3001/api";

class TransactionAPI {
  // Add a new transaction
  async addTransaction(
    transaction: Omit<Transaction, "id" | "timestamp">,
  ): Promise<Transaction> {
    const response = await fetch(`${API_BASE}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transaction),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to add transaction");
    }

    const result = await response.json();
    return result.transaction;
  }

  // Get recent transactions
  async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    const response = await fetch(
      `${API_BASE}/transactions/recent?limit=${limit}`,
    );

    if (!response.ok) {
      throw new Error("Failed to get recent transactions");
    }

    return response.json();
  }

  // Get current month transactions
  async getCurrentMonthTransactions(): Promise<Transaction[]> {
    const response = await fetch(`${API_BASE}/transactions/current-month`);

    if (!response.ok) {
      throw new Error("Failed to get current month transactions");
    }

    return response.json();
  }

  // Get transactions for specific month
  async getMonthlyTransactions(
    year: number,
    month: number,
  ): Promise<Transaction[]> {
    const response = await fetch(`${API_BASE}/transactions/${year}/${month}`);

    if (!response.ok) {
      throw new Error("Failed to get monthly transactions");
    }

    return response.json();
  }

  // Get current month summary
  async getCurrentMonthlySummary(): Promise<Summary> {
    const response = await fetch(`${API_BASE}/summary/current-month`);

    if (!response.ok) {
      throw new Error("Failed to get current month summary");
    }

    return response.json();
  }

  // Get monthly summary
  async getMonthlySummary(year: number, month: number): Promise<Summary> {
    const response = await fetch(`${API_BASE}/summary/${year}/${month}`);

    if (!response.ok) {
      throw new Error("Failed to get monthly summary");
    }

    return response.json();
  }

  // Get yearly summary
  async getYearlySummary(year: number): Promise<any> {
    const response = await fetch(`${API_BASE}/summary/year/${year}`);

    if (!response.ok) {
      throw new Error("Failed to get yearly summary");
    }

    return response.json();
  }

  // Get category breakdown for a month
  async getMonthlyCategoryBreakdown(year: number, month: number): Promise<any> {
    const response = await fetch(`${API_BASE}/categories/${year}/${month}`);

    if (!response.ok) {
      throw new Error("Failed to get category breakdown");
    }

    return response.json();
  }

  // Delete a transaction
  async deleteTransaction(transactionId: string, date: string): Promise<void> {
    const response = await fetch(
      `${API_BASE}/transactions/${transactionId}?date=${encodeURIComponent(date)}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete transaction");
    }
  }

  // Get available years
  async getAvailableYears(): Promise<number[]> {
    const response = await fetch(`${API_BASE}/years`);

    if (!response.ok) {
      throw new Error("Failed to get available years");
    }

    return response.json();
  }

  // Get available months for a year
  async getAvailableMonths(year: number): Promise<number[]> {
    const response = await fetch(`${API_BASE}/months/${year}`);

    if (!response.ok) {
      throw new Error("Failed to get available months");
    }

    return response.json();
  }
}

// Export singleton instance
export const transactionAPI = new TransactionAPI();

// Utility functions for local storage fallback and sync
export class DataSync {
  // Sync localStorage data to server (for migration)
  static async syncLocalStorageToServer(): Promise<void> {
    try {
      // Get data from localStorage
      const currentMonthKey = new Date().toISOString().slice(0, 7);
      const storedMonthly = localStorage.getItem(
        `transactions-${currentMonthKey}`,
      );
      const storedAll = localStorage.getItem("tracker-transactions");

      let transactions: Transaction[] = [];

      if (storedMonthly) {
        transactions = JSON.parse(storedMonthly);
      } else if (storedAll) {
        transactions = JSON.parse(storedAll);
      }

      // Upload each transaction to server
      for (const transaction of transactions) {
        try {
          await transactionAPI.addTransaction({
            type: transaction.type,
            mainCategory: transaction.mainCategory,
            subCategory: transaction.subCategory,
            amount: transaction.amount,
            date: transaction.date,
            time: transaction.time,
          });
        } catch (error) {
          console.warn("Failed to sync transaction:", error);
        }
      }

      console.log(`Synced ${transactions.length} transactions to server`);
    } catch (error) {
      console.error("Failed to sync localStorage to server:", error);
    }
  }

  // Load data from server with localStorage fallback
  static async loadTransactionsWithFallback(): Promise<Transaction[]> {
    try {
      // Try to get from server first
      return await transactionAPI.getCurrentMonthTransactions();
    } catch (error) {
      console.warn(
        "Failed to load from server, using localStorage fallback:",
        error,
      );

      // Fallback to localStorage
      const currentMonthKey = new Date().toISOString().slice(0, 7);
      const storedMonthly = localStorage.getItem(
        `transactions-${currentMonthKey}`,
      );
      const storedAll = localStorage.getItem("tracker-transactions");

      if (storedMonthly) {
        return JSON.parse(storedMonthly);
      } else if (storedAll) {
        const allTransactions = JSON.parse(storedAll);
        return allTransactions.filter((t: Transaction) =>
          t.date.includes(currentMonthKey),
        );
      }

      return [];
    }
  }

  // Save transaction with server sync and localStorage backup
  static async saveTransactionWithSync(
    transaction: Omit<Transaction, "id" | "timestamp">,
  ): Promise<Transaction> {
    try {
      // Save to server first
      const savedTransaction = await transactionAPI.addTransaction(transaction);

      // Also save to localStorage as backup
      const currentMonthKey = new Date().toISOString().slice(0, 7);
      const currentTransactions = await DataSync.loadTransactionsWithFallback();
      const updatedTransactions = [savedTransaction, ...currentTransactions];

      localStorage.setItem(
        `transactions-${currentMonthKey}`,
        JSON.stringify(updatedTransactions),
      );

      return savedTransaction;
    } catch (error) {
      console.error(
        "Failed to save to server, using localStorage only:",
        error,
      );

      // Fallback: save only to localStorage
      const newTransaction: Transaction = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        ...transaction,
      };

      const currentMonthKey = new Date().toISOString().slice(0, 7);
      const currentTransactions = await DataSync.loadTransactionsWithFallback();
      const updatedTransactions = [newTransaction, ...currentTransactions];

      localStorage.setItem(
        `transactions-${currentMonthKey}`,
        JSON.stringify(updatedTransactions),
      );

      return newTransaction;
    }
  }
}
