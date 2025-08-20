import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { universalStorage, Transaction } from "../utils/clientStorage";

type ViewMode = "Weekly" | "Monthly" | "Annually" | "Period";

// Transaction interface imported from clientStorage

// Category colors for pie chart - More distinct and aesthetically pleasing
const COLORS = [
  "#FF6B6B", // Vibrant Red-Pink
  "#4ECDC4", // Teal
  "#45B7D1", // Sky Blue
  "#96CEB4", // Mint Green
  "#FFEAA7", // Soft Yellow
  "#DDA0DD", // Plum
  "#FF8A65", // Coral
  "#81C784", // Light Green
  "#9C27B0", // Purple
  "#FF7043", // Deep Orange
  "#42A5F5", // Blue
  "#26A69A", // Teal Green
  "#FFA726", // Orange
  "#EF5350", // Red
  "#AB47BC"  // Violet
];

// Main categories for analysis
const mainCategories = [
  { name: "Income Sources", icon: "💰", type: "income" },
  { name: "Fixed Household Expenses", icon: "🏠", type: "expense" },
  { name: "Family & Personal Living", icon: "👨‍👩‍👧‍👦", type: "expense" },
  { name: "Insurance", icon: "🛡️", type: "expense" },
  { name: "Investments", icon: "📈", type: "investment" },
  { name: "Loans & EMI Payments", icon: "💳", type: "expense" },
  { name: "Lifestyle & Discretionary", icon: "🎪", type: "expense" },
  { name: "Savings & Emergency Funds", icon: "🏦", type: "expense" },
  { name: "Miscellaneous / One-Time", icon: "📦", type: "expense" },
];

export function Analysis() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("Monthly");
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load stored data on component mount
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        // Initialize storage and load all transactions
        await universalStorage.init();
        const allTransactions = await universalStorage.getCurrentMonthTransactions();
        setTransactions(allTransactions);
        console.log(`Analysis: Loaded ${allTransactions.length} transactions`);
      } catch (error) {
        console.error('Failed to load transactions for analysis:', error);
        setTransactions([]);
      }
    };

    loadTransactions();
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
    return date.toLocaleString("default", { month: "short", year: "numeric" });
  };

  // Get date range based on view mode
  const getDateRange = () => {
    const endDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
    );
    let startDate: Date;

    switch (viewMode) {
      case "Weekly":
        // Get current week
        const today = new Date();
        const dayOfWeek = today.getDay();
        startDate = new Date(today);
        startDate.setDate(today.getDate() - dayOfWeek);
        break;
      case "Annually":
        startDate = new Date(currentMonth.getFullYear(), 0, 1);
        break;
      case "Period":
        // Last 3 months
        startDate = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() - 2,
          1,
        );
        break;
      default: // Monthly
        startDate = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth(),
          1,
        );
    }

    return { startDate, endDate };
  };

  // Filter transactions for selected period
  const getPeriodTransactions = () => {
    const { startDate, endDate } = getDateRange();

    return transactions.filter((t) => {
      // Handle both date formats: YYYY-MM-DD (new) and DD/MM/YYYY (old)
      let transactionDate: Date;
      if (t.date.includes('/')) {
        // Old format: DD/MM/YYYY
        transactionDate = new Date(t.date.split("/").reverse().join("-"));
      } else {
        // New format: YYYY-MM-DD
        transactionDate = new Date(t.date);
      }
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

  const totalInvestment = periodTransactions
    .filter((t) => t.type === "investment")
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate category-wise spending
  const getCategoryAnalysis = () => {
    const categoryData = mainCategories.map((category) => {
      const categoryTransactions = periodTransactions.filter(
        (t) => t.mainCategory === category.name && t.type === category.type
      );

      const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);

      // Calculate percentage relative to total income (how much of income is spent on each category)
      let percentage = 0;
      if (totalIncome > 0) {
        percentage = Math.round((total / totalIncome) * 100);
      }

      return {
        ...category,
        total,
        percentage,
        transactions: categoryTransactions.length,
      };
    });

    return categoryData
      .filter((cat) => cat.total > 0)
      .sort((a, b) => b.total - a.total);
  };

  const categoryAnalysis = getCategoryAnalysis();

  // Prepare pie chart data
  const pieChartData = categoryAnalysis.map((category, index) => ({
    name: category.name,
    value: category.total,
    percentage: category.percentage,
    icon: category.icon,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <Layout>
      <div className="space-y-6 py-4 pb-20">
        {/* Header with Month Navigation and Period Dropdown */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-semibold">{formatMonth(currentMonth)}</h2>
            <Button variant="ghost" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Period Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              className="gap-2"
            >
              {viewMode}
              <ChevronDown className="h-4 w-4" />
            </Button>
            
            {showPeriodDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-[9998]" 
                  onClick={() => setShowPeriodDropdown(false)}
                ></div>
                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-md shadow-xl z-[9999] py-1 min-w-[120px]">
                  {["Weekly", "Monthly", "Annually", "Period"].map((mode) => (
                    <button
                      key={mode}
                      className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                      onClick={() => {
                        setViewMode(mode as ViewMode);
                        setShowPeriodDropdown(false);
                      }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-muted-foreground text-sm mb-1">Income</div>
            <div className="text-xl font-bold text-green-600">₹ {totalIncome.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground text-sm mb-1">Expense</div>
            <div className="text-xl font-bold text-red-600">₹ {totalExpense.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground text-sm mb-1">Investment</div>
            <div className="text-xl font-bold text-blue-600">₹ {totalInvestment.toLocaleString()}</div>
          </div>
        </div>

        {/* Pie Chart and Category Breakdown */}
        {(totalIncome > 0 || totalExpense > 0 || totalInvestment > 0) ? (
          <div className="space-y-6">
            {/* Pie Chart */}
            <div className="h-96 relative bg-gradient-to-br from-background/50 to-muted/30 rounded-2xl p-6 shadow-xl">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={50}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              {/* Floating Labels */}
              {pieChartData.slice(0, 3).map((category, index) => (
                <div
                  key={category.name}
                  className="absolute bg-card border border-border rounded-lg p-2 text-sm shadow-lg"
                  style={{
                    left: `${20 + index * 25}%`,
                    top: `${30 + index * 20}%`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    <div>
                      <div className="font-medium text-xs">
                        {category.name.length > 15 
                          ? category.name.substring(0, 15) + "..." 
                          : category.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {category.percentage}%
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-medium mt-1">
                    ₹ {category.value.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Category List */}
            <div className="space-y-3">
              {categoryAnalysis.map((category, index) => (
                <div
                  key={category.name}
                  className="relative overflow-hidden rounded-lg bg-gradient-to-r from-white/50 to-white/30 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS[index % COLORS.length]}15 0%, ${COLORS[index % COLORS.length]}05 100%)`
                  }}
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-full text-white text-sm font-bold flex items-center justify-center shadow-lg"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                          boxShadow: `0 4px 15px ${COLORS[index % COLORS.length]}40`
                        }}
                      >
                        {category.percentage}%
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <div className="font-semibold text-sm text-foreground">{category.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {category.transactions} transaction{category.transactions !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">₹ {category.total.toLocaleString()}</div>
                      <div
                        className="text-xs font-medium"
                        style={{ color: COLORS[index % COLORS.length] }}
                      >
                        {category.type.charAt(0).toUpperCase() + category.type.slice(1)}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 h-1 transition-all duration-500"
                    style={{
                      backgroundColor: COLORS[index % COLORS.length],
                      width: `${category.percentage}%`
                    }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Card className="p-8 text-center text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-medium mb-2">No Expense Data</h3>
            <p className="text-sm">
              Add expense transactions in the Tracker to see the analysis.
            </p>
          </Card>
        )}
      </div>
    </Layout>
  );
}
