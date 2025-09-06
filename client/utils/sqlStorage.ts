// Client-side SQL storage using sql.js (SQLite compiled to WASM)
// Falls back to IndexedDB-based clientStorage if sql.js isn't available

import { clientStorage } from "./clientStorage";

export interface Transaction {
  id: string;
  type: "income" | "expense" | "investment";
  mainCategory: string;
  subCategory: string;
  amount: number;
  date: string; // YYYY-MM-DD
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

class SqlJsStorage {
  private SQL: any = null;
  private db: any = null;
  private initialized = false;
  private readonly storageKey = "sqljs-db-v1";

  // Initialize sql.js and load DB from IndexedDB (if exists)
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // Dynamically import the sql.js ESM build and the wasm file URL.
      // Vite handles the `?url` import for wasm; fall back to default path if that fails.
      const initModule = await import("sql.js/dist/sql-wasm.js");
      const initSqlJs = initModule && (initModule.default || initModule);
      let wasmUrl: string | undefined;
      try {
        // @ts-ignore - vite provides ?url imports
        wasmUrl = (await import("sql.js/dist/sql-wasm.wasm?url")).default;
      } catch (e) {
        // Fallback to the package's wasm path; dev server may handle this differently
        wasmUrl = "/sql-wasm.wasm";
      }

      this.SQL = await initSqlJs({ locateFile: () => wasmUrl });

      // Try to load stored DB binary from IndexedDB
      const stored = await this.loadBinaryFromIndexedDB();

      if (stored) {
        // Create DB from stored bytes
        this.db = new this.SQL.Database(new Uint8Array(stored));
      } else {
        // Create new DB and schema
        this.db = new this.SQL.Database();
        this.createSchema();
        await this.saveToIndexedDB();
      }

      this.initialized = true;
    } catch (error) {
      console.warn("sql.js not available or failed to initialize:", error);
      throw error;
    }
  }

  private createSchema() {
    const createTable = `CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT,
      mainCategory TEXT,
      subCategory TEXT,
      amount REAL,
      date TEXT,
      time TEXT,
      timestamp INTEGER
    );`;
    this.db.run(createTable);
    this.db.run(
      "CREATE INDEX IF NOT EXISTS idx_timestamp ON transactions(timestamp);",
    );
    this.db.run("CREATE INDEX IF NOT EXISTS idx_date ON transactions(date);");
  }

  private async saveToIndexedDB(): Promise<void> {
    const bytes = this.db.export();
    await this.storeBinaryInIndexedDB(bytes);
  }

  private openIDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("ClearFinanceSQLJS", 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("files")) {
          db.createObjectStore("files");
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async storeBinaryInIndexedDB(bytes: Uint8Array): Promise<void> {
    const db = await this.openIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(["files"], "readwrite");
      const store = tx.objectStore("files");
      const request = store.put(bytes, this.storageKey);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async loadBinaryFromIndexedDB(): Promise<Uint8Array | null> {
    const db = await this.openIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(["files"], "readonly");
      const store = tx.objectStore("files");
      const request = store.get(this.storageKey);
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          // result might already be a Uint8Array
          resolve(
            result instanceof Uint8Array ? result : new Uint8Array(result),
          );
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Add transaction
  async addTransaction(
    transaction: Omit<Transaction, "id" | "timestamp">,
  ): Promise<Transaction> {
    await this.ensureInit();
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const timestamp = Date.now();
    const stmt = this.db.prepare(
      `INSERT INTO transactions (id, type, mainCategory, subCategory, amount, date, time, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    );
    stmt.run([
      id,
      transaction.type,
      transaction.mainCategory,
      transaction.subCategory || "",
      transaction.amount,
      transaction.date,
      transaction.time,
      timestamp,
    ]);
    stmt.free();
    await this.saveToIndexedDB();
    return { id, timestamp, ...transaction } as Transaction;
  }

  async getAllTransactions(): Promise<Transaction[]> {
    await this.ensureInit();
    const res = this.db.exec(
      "SELECT * FROM transactions ORDER BY timestamp DESC;",
    );
    if (!res || res.length === 0) return [];
    const values = res[0];
    const cols = values.columns;
    return values.values.map((row: any[]) => {
      const obj: any = {};
      cols.forEach((c: string, i: number) => (obj[c] = row[i]));
      // convert amount and timestamp types
      obj.amount = Number(obj.amount);
      obj.timestamp = Number(obj.timestamp);
      return obj as Transaction;
    });
  }

  async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    await this.ensureInit();
    const res = this.db.exec(
      `SELECT * FROM transactions ORDER BY timestamp DESC LIMIT ${limit};`,
    );
    if (!res || res.length === 0) return [];
    const values = res[0];
    const cols = values.columns;
    return values.values.map((row: any[]) => {
      const obj: any = {};
      cols.forEach((c: string, i: number) => (obj[c] = row[i]));
      obj.amount = Number(obj.amount);
      obj.timestamp = Number(obj.timestamp);
      return obj as Transaction;
    });
  }

  async getCurrentMonthTransactions(): Promise<Transaction[]> {
    const now = new Date();
    const key = now.toISOString().slice(0, 7);
    return await this.getTransactionsByMonthFromKey(key);
  }

  private async getTransactionsByMonthFromKey(
    monthKey: string,
  ): Promise<Transaction[]> {
    await this.ensureInit();
    const res = this.db.exec(
      `SELECT * FROM transactions WHERE date LIKE '${monthKey}%' ORDER BY timestamp DESC;`,
    );
    if (!res || res.length === 0) return [];
    const values = res[0];
    const cols = values.columns;
    return values.values.map((row: any[]) => {
      const obj: any = {};
      cols.forEach((c: string, i: number) => (obj[c] = row[i]));
      obj.amount = Number(obj.amount);
      obj.timestamp = Number(obj.timestamp);
      return obj as Transaction;
    });
  }

  async getMonthlyTransactions(
    year: number,
    month: number,
  ): Promise<Transaction[]> {
    const monthKey = `${year}-${month.toString().padStart(2, "0")}`;
    return await this.getTransactionsByMonthFromKey(monthKey);
  }

  private calculateSummary(transactions: Transaction[]): Summary {
    return transactions.reduce(
      (summary: Summary, transaction: Transaction) => {
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

  async getCurrentMonthlySummary(): Promise<Summary> {
    const transactions = await this.getCurrentMonthTransactions();
    const summary = this.calculateSummary(transactions);
    summary.balance =
      summary.totalIncome - summary.totalExpense - summary.totalInvestment;
    return summary;
  }

  async getMonthlySummary(year: number, month: number): Promise<Summary> {
    const transactions = await this.getMonthlyTransactions(year, month);
    const summary = this.calculateSummary(transactions);
    summary.balance =
      summary.totalIncome - summary.totalExpense - summary.totalInvestment;
    return summary;
  }

  async deleteTransaction(transactionId: string): Promise<boolean> {
    await this.ensureInit();
    const stmt = this.db.prepare(`DELETE FROM transactions WHERE id = ?;`);
    stmt.run([transactionId]);
    stmt.free();
    await this.saveToIndexedDB();
    return true;
  }

  async exportData(): Promise<string> {
    const transactions = await this.getAllTransactions();
    return JSON.stringify(
      { exportDate: new Date().toISOString(), transactions },
      null,
      2,
    );
  }

  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    const transactions = data.transactions || [];
    await this.ensureInit();

    const tx = this.db.prepare("BEGIN TRANSACTION;");
    tx.step();
    tx.free();

    // Clear and insert
    this.db.run("DELETE FROM transactions;");
    const insert = this.db.prepare(
      `INSERT INTO transactions (id, type, mainCategory, subCategory, amount, date, time, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    );
    for (const t of transactions) {
      insert.run([
        t.id,
        t.type,
        t.mainCategory,
        t.subCategory || "",
        t.amount,
        t.date,
        t.time,
        t.timestamp,
      ]);
    }
    insert.free();

    const commit = this.db.prepare("COMMIT;");
    commit.step();
    commit.free();

    await this.saveToIndexedDB();
  }

  // One-time migration from localStorage (existing app behavior)
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

      transactions = transactions.map((t) => ({
        ...t,
        timestamp: t.timestamp || Date.now(),
      }));

      if (transactions.length > 0) {
        this.db.run("BEGIN TRANSACTION;");
        const insert = this.db.prepare(
          `INSERT OR REPLACE INTO transactions (id, type, mainCategory, subCategory, amount, date, time, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        );
        for (const t of transactions) {
          insert.run([
            t.id,
            t.type,
            t.mainCategory || "",
            t.subCategory || "",
            t.amount,
            t.date,
            t.time || "",
            t.timestamp,
          ]);
        }
        insert.free();
        this.db.run("COMMIT;");
        await this.saveToIndexedDB();
        console.log(
          `Migrated ${transactions.length} transactions from localStorage to sql.js`,
        );
      }
    } catch (error) {
      console.warn("Migration from localStorage to sql.js failed:", error);
    }
  }

  private async ensureInit() {
    if (!this.initialized) {
      await this.init();
    }
  }
}

export const sqlStorage = new SqlJsStorage();
