import fs from "fs";
import path from "path";

// Transaction interface
export interface Transaction {
  id: string;
  type: "income" | "expense" | "investment";
  mainCategory: string;
  subCategory: string;
  amount: number;
  date: string; // YYYY-MM-DD format
  time: string;
  timestamp: number; // Unix timestamp for sorting
}

// Monthly data structure
export interface MonthlyData {
  year: number;
  month: number;
  transactions: Transaction[];
  summary: {
    totalIncome: number;
    totalExpense: number;
    totalInvestment: number;
    balance: number;
    transactionCount: number;
  };
  categories: {
    [categoryName: string]: {
      [subCategoryName: string]: {
        income: number;
        expense: number;
        investment: number;
        count: number;
      };
    };
  };
}

class DataStorage {
  private dataDir: string;

  constructor() {
    this.dataDir = path.join(process.cwd(), "server", "data", "transactions");
    this.ensureDataDirectory();
  }

  // Ensure data directory exists
  private ensureDataDirectory(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  // Ensure year directory exists
  private ensureYearDirectory(year: number): void {
    const yearDir = path.join(this.dataDir, year.toString());
    if (!fs.existsSync(yearDir)) {
      fs.mkdirSync(yearDir, { recursive: true });
    }
  }

  // Get file path for specific month
  private getMonthFilePath(year: number, month: number): string {
    this.ensureYearDirectory(year);
    const monthStr = month.toString().padStart(2, "0");
    return path.join(this.dataDir, year.toString(), `${monthStr}.json`);
  }

  // Load monthly data
  public loadMonthlyData(year: number, month: number): MonthlyData {
    const filePath = this.getMonthFilePath(year, month);

    if (!fs.existsSync(filePath)) {
      // Return empty monthly data if file doesn't exist
      return this.createEmptyMonthlyData(year, month);
    }

    try {
      const data = fs.readFileSync(filePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error loading monthly data for ${year}-${month}:`, error);
      return this.createEmptyMonthlyData(year, month);
    }
  }

  // Create empty monthly data structure
  private createEmptyMonthlyData(year: number, month: number): MonthlyData {
    return {
      year,
      month,
      transactions: [],
      summary: {
        totalIncome: 0,
        totalExpense: 0,
        totalInvestment: 0,
        balance: 0,
        transactionCount: 0,
      },
      categories: {},
    };
  }

  // Calculate summary and categories from transactions
  private calculateSummaryAndCategories(transactions: Transaction[]): {
    summary: MonthlyData["summary"];
    categories: MonthlyData["categories"];
  } {
    const summary = {
      totalIncome: 0,
      totalExpense: 0,
      totalInvestment: 0,
      balance: 0,
      transactionCount: transactions.length,
    };

    const categories: MonthlyData["categories"] = {};

    transactions.forEach((transaction) => {
      // Update summary
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

      // Update categories
      if (!categories[transaction.mainCategory]) {
        categories[transaction.mainCategory] = {};
      }
      if (!categories[transaction.mainCategory][transaction.subCategory]) {
        categories[transaction.mainCategory][transaction.subCategory] = {
          income: 0,
          expense: 0,
          investment: 0,
          count: 0,
        };
      }

      const categoryData =
        categories[transaction.mainCategory][transaction.subCategory];
      categoryData[transaction.type] += transaction.amount;
      categoryData.count += 1;
    });

    summary.balance =
      summary.totalIncome - summary.totalExpense - summary.totalInvestment;

    return { summary, categories };
  }

  // Save monthly data
  public saveMonthlyData(monthlyData: MonthlyData): void {
    const filePath = this.getMonthFilePath(monthlyData.year, monthlyData.month);

    // Recalculate summary and categories
    const { summary, categories } = this.calculateSummaryAndCategories(
      monthlyData.transactions,
    );
    monthlyData.summary = summary;
    monthlyData.categories = categories;

    try {
      fs.writeFileSync(filePath, JSON.stringify(monthlyData, null, 2), "utf8");
    } catch (error) {
      console.error(
        `Error saving monthly data for ${monthlyData.year}-${monthlyData.month}:`,
        error,
      );
      throw error;
    }
  }

  // Add transaction
  public addTransaction(transaction: Transaction): void {
    const date = new Date(transaction.date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() returns 0-11

    const monthlyData = this.loadMonthlyData(year, month);
    monthlyData.transactions.push(transaction);

    // Sort transactions by timestamp (newest first)
    monthlyData.transactions.sort((a, b) => b.timestamp - a.timestamp);

    this.saveMonthlyData(monthlyData);
  }

  // Get transactions for specific month
  public getMonthlyTransactions(year: number, month: number): Transaction[] {
    const monthlyData = this.loadMonthlyData(year, month);
    return monthlyData.transactions;
  }

  // Get transactions for current month
  public getCurrentMonthTransactions(): Transaction[] {
    const now = new Date();
    return this.getMonthlyTransactions(now.getFullYear(), now.getMonth() + 1);
  }

  // Get recent transactions across multiple months
  public getRecentTransactions(limit: number = 10): Transaction[] {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    let allTransactions: Transaction[] = [];

    // Get transactions from current month and previous months until we have enough
    for (
      let monthOffset = 0;
      monthOffset < 12 && allTransactions.length < limit;
      monthOffset++
    ) {
      const targetDate = new Date(
        currentYear,
        currentMonth - 1 - monthOffset,
        1,
      );
      const targetYear = targetDate.getFullYear();
      const targetMonth = targetDate.getMonth() + 1;

      const monthTransactions = this.getMonthlyTransactions(
        targetYear,
        targetMonth,
      );
      allTransactions = [...allTransactions, ...monthTransactions];
    }

    // Sort by timestamp and limit
    allTransactions.sort((a, b) => b.timestamp - a.timestamp);
    return allTransactions.slice(0, limit);
  }

  // Get monthly summary
  public getMonthlySummary(
    year: number,
    month: number,
  ): MonthlyData["summary"] {
    const monthlyData = this.loadMonthlyData(year, month);
    return monthlyData.summary;
  }

  // Get current month summary
  public getCurrentMonthlySummary(): MonthlyData["summary"] {
    const now = new Date();
    return this.getMonthlySummary(now.getFullYear(), now.getMonth() + 1);
  }

  // Get category breakdown for a month
  public getMonthlyCategoryBreakdown(
    year: number,
    month: number,
  ): MonthlyData["categories"] {
    const monthlyData = this.loadMonthlyData(year, month);
    return monthlyData.categories;
  }

  // Get yearly summary
  public getYearlySummary(year: number) {
    const summary = {
      totalIncome: 0,
      totalExpense: 0,
      totalInvestment: 0,
      balance: 0,
      transactionCount: 0,
      monthlyBreakdown: [] as Array<{
        month: number;
        summary: MonthlyData["summary"];
      }>,
    };

    for (let month = 1; month <= 12; month++) {
      const monthlyData = this.loadMonthlyData(year, month);
      summary.totalIncome += monthlyData.summary.totalIncome;
      summary.totalExpense += monthlyData.summary.totalExpense;
      summary.totalInvestment += monthlyData.summary.totalInvestment;
      summary.transactionCount += monthlyData.summary.transactionCount;

      summary.monthlyBreakdown.push({
        month,
        summary: monthlyData.summary,
      });
    }

    summary.balance =
      summary.totalIncome - summary.totalExpense - summary.totalInvestment;
    return summary;
  }

  // Delete transaction
  public deleteTransaction(transactionId: string, date: string): boolean {
    const transactionDate = new Date(date);
    const year = transactionDate.getFullYear();
    const month = transactionDate.getMonth() + 1;

    const monthlyData = this.loadMonthlyData(year, month);
    const initialLength = monthlyData.transactions.length;

    monthlyData.transactions = monthlyData.transactions.filter(
      (transaction) => transaction.id !== transactionId,
    );

    if (monthlyData.transactions.length < initialLength) {
      this.saveMonthlyData(monthlyData);
      return true;
    }

    return false;
  }

  // Get all available years
  public getAvailableYears(): number[] {
    try {
      const years = fs
        .readdirSync(this.dataDir)
        .filter((item) => {
          const yearPath = path.join(this.dataDir, item);
          return fs.statSync(yearPath).isDirectory() && /^\d{4}$/.test(item);
        })
        .map((year) => parseInt(year))
        .sort((a, b) => b - a); // Newest first

      return years;
    } catch (error) {
      return [];
    }
  }

  // Get available months for a year
  public getAvailableMonths(year: number): number[] {
    try {
      const yearDir = path.join(this.dataDir, year.toString());
      if (!fs.existsSync(yearDir)) {
        return [];
      }

      const months = fs
        .readdirSync(yearDir)
        .filter((file) => /^\d{2}\.json$/.test(file))
        .map((file) => parseInt(file.split(".")[0]))
        .sort((a, b) => b - a); // Newest first

      return months;
    } catch (error) {
      return [];
    }
  }
}

// Export singleton instance
export const dataStorage = new DataStorage();
