import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { ChevronLeft, ChevronRight, Menu, Check, TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";

type ViewMode = "MONTHLY" | "3_MONTHS" | "6_MONTHS" | "YEARLY";

// Transaction interface (matching Tracker)
interface Transaction {
  id: string;
  type: "income" | "expense";
  mainCategory: string;
  subCategory: string;
  amount: number;
  notes: string;
  date: string;
  time: string;
}

// Main categories for analysis
const mainCategories = [
  { name: "Income Sources", icon: "💰", type: "income" },
  { name: "Fixed Household Expenses", icon: "🏠", type: "expense" },
  { name: "Family & Personal Living", icon: "👨‍👩‍👧‍👦", type: "expense" },
  { name: "Insurance", icon: "🛡️", type: "expense" },
  { name: "Investments", icon: "📈", type: "expense" },
  { name: "Loans & EMI Payments", icon: "💳", type: "expense" },
  { name: "Lifestyle & Discretionary", icon: "🎪", type: "expense" },
  { name: "Savings & Emergency Funds", icon: "🏦", type: "expense" },
  { name: "Miscellaneous / One-Time", icon: "📦", type: "expense" },
];

export function Analysis() {
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Current month
  const [showDisplayOptions, setShowDisplayOptions] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("MONTHLY");
  const [carryOver, setCarryOver] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Record<string, Record<string, number>>>({});

  // Load stored data on component mount
  useEffect(() => {
    const storedTransactions = localStorage.getItem('tracker-transactions');
    const storedBudgets = localStorage.getItem('budgets');

    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }

    if (storedBudgets) {
      setBudgets(JSON.parse(storedBudgets));
    }
  }, []);

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
    );
  };

  // Format month display
  const formatMonth = (date: Date) => {
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  // Get date range based on view mode
  const getDateRange = () => {
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    let startDate: Date;

    switch (viewMode) {
      case "3_MONTHS":
        startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 2, 1);
        break;
      case "6_MONTHS":
        startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 5, 1);
        break;
      case "YEARLY":
        startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 11, 1);
        break;
      default: // MONTHLY
        startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    }

    return { startDate, endDate };
  };

  // Filter transactions for selected period
  const getPeriodTransactions = () => {
    const { startDate, endDate } = getDateRange();

    return transactions.filter((t) => {
      const transactionDate = new Date(t.date.split('/').reverse().join('-')); // Convert DD/MMM/YYYY to YYYY-MMM-DD
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  };

  const periodTransactions = getPeriodTransactions();

  // Calculate totals
  const totalIncome = periodTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = periodTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const surplus = totalIncome - totalExpense;

  // Calculate category-wise spending
  const getCategoryAnalysis = () => {
    const categoryData = mainCategories.map(category => {
      const categoryTransactions = periodTransactions.filter(
        t => t.mainCategory === category.name
      );

      const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      const percentage = totalIncome > 0 ? Math.round((total / totalIncome) * 100) : 0;

      return {
        ...category,
        total,
        percentage,
        transactions: categoryTransactions.length
      };
    });

    return categoryData.filter(cat => cat.total > 0).sort((a, b) => b.total - a.total);
  };

  const categoryAnalysis = getCategoryAnalysis();

  // Get period title
  const getPeriodTitle = () => {
    const { startDate, endDate } = getDateRange();

    switch (viewMode) {
      case "3_MONTHS":
        return `${formatMonth(startDate)} - ${formatMonth(currentMonth)}`;
      case "6_MONTHS":
        return `${formatMonth(startDate)} - ${formatMonth(currentMonth)}`;
      case "YEARLY":
        return `${formatMonth(startDate)} - ${formatMonth(currentMonth)}`;
      default:
        return formatMonth(currentMonth);
    }
  };

  // Calculate average monthly values for multi-month views
  const getAverageMonthly = (amount: number) => {
    const months = {
      "MONTHLY": 1,
      "3_MONTHS": 3,
      "6_MONTHS": 6,
      "YEARLY": 12
    }[viewMode];

    return amount / months;
  };

  // Calendar data for current month
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const startDay = new Date(year, month, 1).getDay(); // First day of month (0=Sunday, 1=Monday, etc.)

  return (
    <Layout>
      <div className="space-y-6 py-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">{getPeriodTitle()}</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDisplayOptions(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>



        {/* Financial Overview */}
        <Card className="p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground">INCOME</div>
              <div className="text-xl font-bold text-green-400">
                ₹{totalIncome.toLocaleString()}
              </div>
              {viewMode !== "MONTHLY" && (
                <div className="text-xs text-muted-foreground">
                  Avg: ₹{Math.round(getAverageMonthly(totalIncome)).toLocaleString()}/mo
                </div>
              )}
            </div>
            <div>
              <div className="text-sm text-muted-foreground">EXPENSE</div>
              <div className="text-xl font-bold text-red-400">
                ₹{totalExpense.toLocaleString()}
              </div>
              {viewMode !== "MONTHLY" && (
                <div className="text-xs text-muted-foreground">
                  Avg: ₹{Math.round(getAverageMonthly(totalExpense)).toLocaleString()}/mo
                </div>
              )}
            </div>
            <div>
              <div className="text-sm text-muted-foreground">SURPLUS</div>
              <div className={`text-xl font-bold ${
                surplus >= 0 ? "text-green-400" : "text-red-400"
              }`}>
                ₹{surplus.toLocaleString()}
              </div>
              {viewMode !== "MONTHLY" && (
                <div className="text-xs text-muted-foreground">
                  Avg: ₹{Math.round(getAverageMonthly(surplus)).toLocaleString()}/mo
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Key Insights */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
              <h4 className="font-semibold">Savings Rate</h4>
            </div>
            <div className="text-2xl font-bold">
              {totalIncome > 0 ? Math.round((surplus / totalIncome) * 100) : 0}%
            </div>
            <div className="text-sm text-muted-foreground">
              {surplus >= 0 ? "You're saving well!" : "Spending exceeds income"}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="h-5 w-5 text-purple-500" />
              <h4 className="font-semibold">Categories</h4>
            </div>
            <div className="text-2xl font-bold">
              {categoryAnalysis.length}
            </div>
            <div className="text-sm text-muted-foreground">
              Active spending categories
            </div>
          </Card>
        </div>

        {/* Category Analysis */}
        {periodTransactions.length > 0 ? (
          <div>
            <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
            <div className="space-y-3">
              {categoryAnalysis.map((category) => (
                <Card key={category.name} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-lg">
                        {category.icon}
                      </div>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {category.transactions} transaction{category.transactions !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold text-lg ${
                        category.type === "income" ? "text-green-400" : "text-red-400"
                      }`}>
                        ₹{category.total.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {category.percentage}% of income
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        category.type === "income" ? "bg-green-400" : "bg-red-400"
                      }`}
                      style={{ width: `${Math.min(category.percentage, 100)}%` }}
                    ></div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card className="p-6 text-center text-muted-foreground">
            <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="font-medium mb-2">No Data Available</h3>
            <p className="text-sm">
              No transactions found for {getPeriodTitle()}.
              <br />
              Add transactions in the Tracker to see analytics here.
            </p>
          </Card>
        )}
      </div>

      {/* Display Options Dialog */}
      <Dialog open={showDisplayOptions} onOpenChange={setShowDisplayOptions}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Display options</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* View Mode */}
            <div className="space-y-3">
              <div className="text-sm font-medium text-muted-foreground">
                View mode:
              </div>
              <div className="space-y-2">
                {[
                  { key: "MONTHLY", label: "MONTHLY" },
                  { key: "3_MONTHS", label: "3 MONTHS" },
                  { key: "6_MONTHS", label: "6 MONTHS" },
                  { key: "YEARLY", label: "YEARLY" },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setViewMode(option.key as ViewMode)}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <span className="text-sm font-medium text-muted-foreground">
                      {option.label}
                    </span>
                    {viewMode === option.key && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Carry Over */}
            <div className="space-y-3">
              <div className="text-sm font-medium text-muted-foreground">
                Carry over:
              </div>
              <div className="space-y-2">
                {[
                  { key: true, label: "ON" },
                  { key: false, label: "OFF" },
                ].map((option) => (
                  <button
                    key={option.label}
                    onClick={() => setCarryOver(option.key)}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <span className="text-sm font-medium text-muted-foreground">
                      {option.label}
                    </span>
                    {carryOver === option.key && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>

              {/* Carry Over Explanation */}
              {carryOver && (
                <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                  <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-xs font-bold text-blue-600">i</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    With Carry over enabled, monthly surplus will be added to the next month.
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
