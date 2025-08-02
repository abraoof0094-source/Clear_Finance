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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { phoneStorage } from "../utils/phoneStorage";
import { themeManager } from "../utils/themeColors";

// All Categories (from Categories page)
const allCategories = [
  {
    id: 1,
    name: "Income Sources",
    icon: "💰",
    type: "income" as const,
    subcategories: [
      { name: "Fixed Salary", icon: "💵" },
      { name: "Variable Pay", icon: "📈" },
      { name: "Reimbursements", icon: "��" },
      { name: "Freelance/Side Income", icon: "💻" },
      { name: "Passive Income", icon: "📊" },
      { name: "Others", icon: "🎯" },
    ],
  },
  {
    id: 2,
    name: "Fixed Household Expenses",
    icon: "🏠",
    type: "expense" as const,
    subcategories: [
      { name: "Rent / Home Loan EMI", icon: "🏡" },
      { name: "Maintenance / Society Charges", icon: "🏢" },
      { name: "Utilities", icon: "⚡" },
      { name: "Internet / Broadband", icon: "����" },
      { name: "Mobile Bills", icon: "���" },
      { name: "DTH / OTT Subscriptions", icon: "📺" },
      { name: "Groceries & Daily Essentials", icon: "🛒" },
      { name: "House Help / Cook / Maid", icon: "👩‍🍳" },
      { name: "Child Care / Nanny", icon: "👶" },
    ],
  },
  {
    id: 3,
    name: "Family & Personal Living",
    icon: "👨‍👩‍👧‍👦",
    type: "expense" as const,
    subcategories: [
      { name: "Food & Dining", icon: "🍽️" },
      { name: "Weekend Chills / Drinks", icon: "🍻" },
      { name: "Travel & Commute", icon: "🚗" },
      { name: "Medical / Healthcare", icon: "⚕️" },
      { name: "Fitness / Gym / Swimming", icon: "💪" },
      { name: "Indoor Play / Recreation", icon: "🎳" },
      { name: "Shopping & Clothing", icon: "👕" },
      { name: "Electronics & Gadgets", icon: "📱" },
      { name: "Education / Courses", icon: "📚" },
      { name: "Kids' Education", icon: "🎓" },
      { name: "Pets", icon: "🐕" },
    ],
  },
  {
    id: 4,
    name: "Insurance",
    icon: "🛡️",
    type: "expense" as const,
    subcategories: [
      { name: "Term Insurance", icon: "📋" },
      { name: "Health Insurance", icon: "❤️" },
      { name: "Vehicle Insurance", icon: "🚗" },
      { name: "Gadget Insurance", icon: "📱" },
      { name: "Accidental / Disability Cover", icon: "🏥" },
    ],
  },
  {
    id: 5,
    name: "Investments",
    icon: "📈",
    type: "expense" as const,
    subcategories: [
      { name: "Mutual Funds (SIP)", icon: "📊" },
      { name: "Mutual Funds (Lumpsum)", icon: "💹" },
      { name: "Stocks / ETFs", icon: "📈" },
      { name: "PPF / EPF / VPF", icon: "🏛️" },
      { name: "NPS", icon: "👴" },
      { name: "FD / RD", icon: "🏪" },
      { name: "Gold", icon: "🥇" },
      { name: "Crypto / Alternative Assets", icon: "₿" },
      { name: "Real Estate Investment", icon: "🏘️" },
      { name: "Children's Education Fund", icon: "🎓" },
    ],
  },
  {
    id: 6,
    name: "Loans & EMI Payments",
    icon: "💳",
    type: "expense" as const,
    subcategories: [
      { name: "Home Loan", icon: "🏠" },
      { name: "Car Loan", icon: "🚗" },
      { name: "Bike Loan", icon: "🏍️" },
      { name: "Personal Loan", icon: "💰" },
      { name: "Credit Card Bill", icon: "💳" },
      { name: "Consumer Durable Loan", icon: "📺" },
    ],
  },
  {
    id: 7,
    name: "Lifestyle & Discretionary",
    icon: "🎪",
    type: "expense" as const,
    subcategories: [
      { name: "Weekend Getaways", icon: "🏔️" },
      { name: "Vacations / Travel Abroad", icon: "✈️" },
      { name: "Social Gatherings / Parties", icon: "🎉" },
      { name: "Events / Concerts", icon: "🎵" },
      { name: "Hobbies", icon: "���" },
      { name: "Gaming / Indoor Entertainment", icon: "🎮" },
      { name: "Luxury Purchases", icon: "💎" },
    ],
  },
  {
    id: 8,
    name: "Savings & Emergency Funds",
    icon: "🏦",
    type: "expense" as const,
    subcategories: [
      { name: "Emergency Fund", icon: "🚨" },
      { name: "Opportunity Fund", icon: "💡" },
      { name: "Short-Term Goals", icon: "🎯" },
      { name: "Child Education Lumpsum", icon: "🎓" },
    ],
  },
  {
    id: 9,
    name: "Miscellaneous / One-Time",
    icon: "📦",
    type: "expense" as const,
    subcategories: [
      { name: "Festivals / Gifts", icon: "🎁" },
      { name: "Charity / Donations", icon: "❤️" },
      { name: "Home Interiors / Furnishing", icon: "🛋️" },
      { name: "Vehicle Maintenance", icon: "🔧" },
      { name: "Household Appliances", icon: "❄️" },
      { name: "Memberships", icon: "🏃" },
    ],
  },
];

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

export function Tracker() {
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Current month
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<
    Record<string, Record<string, number>>
  >({});

  // Form states
  const [transactionType, setTransactionType] = useState<"income" | "expense">(
    "expense",
  );
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [amount, setAmount] = useState("0");

  // Calculator states
  const [displayValue, setDisplayValue] = useState("0");
  const [operation, setOperation] = useState<string | null>(null);
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const filteredCategories = allCategories.filter(
    (cat) => cat.type === transactionType,
  );
  const selectedCategory = allCategories.find(
    (cat) => cat.name === selectedMainCategory,
  );
  const subCategories = selectedCategory?.subcategories || [];

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

  // Get current month key for filtering transactions
  const getCurrentMonthKey = () => {
    return `${currentMonth.getFullYear()}-${currentMonth.getMonth()}`;
  };

  // Load stored data on component mount from phone storage
  useEffect(() => {
    console.log("📱 Loading data from phone storage...");
    const storedTransactions = phoneStorage.loadTransactions();
    const storedBudgets = phoneStorage.loadBudgets();

    setTransactions(storedTransactions);
    setBudgets(storedBudgets);

    console.log(`✅ Loaded ${storedTransactions.length} transactions and ${Object.keys(storedBudgets).length} budget entries from phone storage`);
  }, []);

  // Save transactions to phone storage whenever transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      const saved = phoneStorage.saveTransactions(transactions);
      if (saved) {
        console.log("💾 Transactions automatically saved to phone storage");
      } else {
        console.error("❌ Failed to save transactions to phone storage");
      }
    }
  }, [transactions]);

  // Get budget for a specific subcategory and month
  const getBudgetForSubcategory = (subcategory: string, monthKey?: string) => {
    const targetMonth = monthKey || getCurrentMonthKey();
    return budgets[targetMonth]?.[subcategory] || 0;
  };

  // Get total expenses for a subcategory in current month
  const getExpensesForSubcategory = (subcategory: string) => {
    return currentMonthTransactions
      .filter((t) => t.type === "expense" && t.subCategory === subcategory)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Check if subcategory budget is exceeded
  const isBudgetExceeded = (subcategory: string) => {
    const budget = getBudgetForSubcategory(subcategory);
    const expenses = getExpensesForSubcategory(subcategory);
    return budget > 0 && expenses > budget;
  };

  // Get budget utilization percentage
  const getBudgetUtilization = (subcategory: string) => {
    const budget = getBudgetForSubcategory(subcategory);
    const expenses = getExpensesForSubcategory(subcategory);
    return budget > 0 ? Math.round((expenses / budget) * 100) : 0;
  };

  // Filter transactions for current month
  const currentMonthTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return (
      transactionDate.getMonth() === currentMonth.getMonth() &&
      transactionDate.getFullYear() === currentMonth.getFullYear()
    );
  });

  const totalIncome = currentMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const calculate = (
    firstOperand: string,
    secondOperand: string,
    operation: string,
  ): string => {
    const first = parseFloat(firstOperand);
    const second = parseFloat(secondOperand);

    switch (operation) {
      case "+":
        return String(first + second);
      case "-":
        return String(first - second);
      case "*":
        return String(first * second);
      case "÷":
        return second !== 0 ? String(first / second) : "Error";
      case "%":
        return String(first * (second / 100));
      case "=":
        return secondOperand;
      default:
        return secondOperand;
    }
  };

  const addDecimal = () => {
    if (waitingForOperand) {
      setDisplayValue("0.");
      setWaitingForOperand(false);
    } else if (displayValue.indexOf(".") === -1) {
      setDisplayValue(displayValue + ".");
    }
  };

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplayValue(num);
      setWaitingForOperand(false);
    } else {
      setDisplayValue(displayValue === "0" ? num : displayValue + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = displayValue;

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || "0";
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplayValue(String(newValue));
      setPreviousValue(String(newValue));
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const inputEquals = () => {
    const inputValue = displayValue;

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplayValue(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
      setAmount(String(newValue));
    }
  };

  const clearCalculator = () => {
    setDisplayValue("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const backspace = () => {
    if (displayValue.length > 1) {
      setDisplayValue(displayValue.slice(0, -1));
    } else {
      setDisplayValue("0");
    }
  };

  const handleSave = () => {
    if (
      !selectedMainCategory ||
      !selectedSubCategory ||
      parseFloat(displayValue) <= 0
    ) {
      return;
    }

    const amount = parseFloat(displayValue);

    // Check budget before saving (only for expenses)
    if (transactionType === "expense") {
      const currentExpenses = getExpensesForSubcategory(selectedSubCategory);
      const budget = getBudgetForSubcategory(selectedSubCategory);
      const newTotal = currentExpenses + amount;

      if (budget > 0 && newTotal > budget) {
        const exceededAmount = newTotal - budget;
        const confirmed = window.confirm(
          `⚠️ Budget Alert!\n\n` +
            `Category: ${selectedSubCategory}\n` +
            `Budget: ₹${budget.toLocaleString()}\n` +
            `Current Spent: ₹${currentExpenses.toLocaleString()}\n` +
            `New Entry: ₹${amount.toLocaleString()}\n` +
            `Total: ₹${newTotal.toLocaleString()}\n\n` +
            `This will exceed your budget by ₹${exceededAmount.toLocaleString()}!\n\n` +
            `Do you want to continue?`,
        );

        if (!confirmed) {
          return; // Don't save if user cancels
        }
      }
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: transactionType,
      mainCategory: selectedMainCategory,
      subCategory: selectedSubCategory,
      amount: amount,
      notes: "",
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };

    setTransactions([...transactions, newTransaction]);

    // Show brief success message
    console.log("✅ Transaction added and saved to phone storage");

    handleCancel();
  };

  const handleCancel = () => {
    setShowAddDialog(false);
    setTransactionType("expense");
    setSelectedMainCategory("");
    setSelectedSubCategory("");
    clearCalculator();
  };

  return (
    <Layout>
      <div className="space-y-6 py-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">{formatMonth(currentMonth)}</h2>
          <Button variant="ghost" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Financial Summary */}
        <Card className="p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground">INCOME</div>
              <div className="text-lg font-bold amount-income">
                ₹{totalIncome.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">EXPENSE</div>
              <div className="text-lg font-bold amount-expense">
                ₹{totalExpense.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">BALANCE</div>
              <div
                className={`text-lg font-bold ${totalIncome - totalExpense >= 0 ? "text-green-400" : "text-red-400"}`}
              >
                ₹{(totalIncome - totalExpense).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Budget Alerts */}
          {(() => {
            const exceededCategories = allCategories
              .filter((cat) => cat.type === "expense")
              .flatMap((cat) => cat.subcategories)
              .filter((sub) => isBudgetExceeded(sub.name));

            if (exceededCategories.length > 0) {
              return (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="text-sm font-medium text-red-400 mb-2">
                    ⚠️ Budget Exceeded ({exceededCategories.length} categories)
                  </div>
                  <div className="text-xs text-red-300 space-y-1">
                    {exceededCategories.slice(0, 3).map((sub) => (
                      <div key={sub.name}>
                        {sub.name}: {getBudgetUtilization(sub.name)}% used
                      </div>
                    ))}
                    {exceededCategories.length > 3 && (
                      <div>...and {exceededCategories.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </Card>

        {/* Recent Transactions */}
        <div>
          <h3 className="text-lg font-semibold text-yellow-500 mb-4">
            Recent Transactions
          </h3>
          <div className="space-y-3">
            {currentMonthTransactions.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                No transactions for {formatMonth(currentMonth)}. Click the +
                button to add your first transaction.
              </Card>
            ) : (
              currentMonthTransactions
                .slice(-5)
                .reverse()
                .map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))
            )}
          </div>
        </div>

        {/* Add Transaction Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-sm mx-auto bg-card border-2 border-primary/20">
            <DialogHeader>
              <DialogTitle className="sr-only">Add Transaction</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 pt-2">
              {/* Income/Expense Toggle - Full Width Split */}
              <div className="grid grid-cols-2 gap-0 rounded-lg overflow-hidden border">
                <Button
                  variant={transactionType === "income" ? "default" : "ghost"}
                  onClick={() => {
                    setTransactionType("income");
                    setSelectedMainCategory("");
                    setSelectedSubCategory("");
                  }}
                  className={`h-10 text-sm font-semibold rounded-none ${
                    transactionType === "income"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  💰 INCOME
                </Button>
                <Button
                  variant={transactionType === "expense" ? "default" : "ghost"}
                  onClick={() => {
                    setTransactionType("expense");
                    setSelectedMainCategory("");
                    setSelectedSubCategory("");
                  }}
                  className={`h-10 text-sm font-semibold rounded-none ${
                    transactionType === "expense"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  💸 EXPENSE
                </Button>
              </div>

              {/* Category Selection */}
              <div className="space-y-2">
                {/* Main Category Dropdown */}
                <Select
                  value={selectedMainCategory}
                  onValueChange={(value) => {
                    setSelectedMainCategory(value);
                    setSelectedSubCategory("");
                  }}
                >
                  <SelectTrigger className="bg-muted h-10 text-sm text-left w-full">
                    <SelectValue placeholder="🏷️ Select main category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sub Category Dropdown */}
                <Select
                  value={selectedSubCategory}
                  onValueChange={setSelectedSubCategory}
                  disabled={!selectedMainCategory}
                >
                  <SelectTrigger className="bg-muted h-10 text-sm text-left w-full">
                    <SelectValue placeholder="📂 Select sub category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategories.map((sub, index) => (
                      <SelectItem key={index} value={sub.name}>
                        {sub.icon} {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Display - More Prominent */}
              <div className="bg-gradient-to-r from-muted to-muted/50 rounded-xl p-2 border-2 border-primary/20">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">
                    Amount
                  </div>
                  <div
                    className={`text-2xl font-bold font-mono ${
                      transactionType === "income"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    ₹{displayValue}
                  </div>
                </div>
              </div>

              {/* Calculator - Standard 4x4 Layout */}
              <div className="bg-black/20 p-1 rounded-xl">
                <div className="grid grid-cols-4 gap-1">
                  {/* Row 1: C, ⌫, %, ÷ */}
                  <Button
                    variant="ghost"
                    onClick={clearCalculator}
                    className="h-10 text-base font-medium bg-gray-600 hover:bg-gray-500 text-orange-400 rounded-3xl border-0"
                  >
                    C
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={backspace}
                    className="h-10 text-lg font-medium bg-gray-600 hover:bg-gray-500 text-orange-400 rounded-3xl border-0"
                  >
                    ⌫
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => inputOperation("%")}
                    className="h-10 text-lg font-medium bg-gray-600 hover:bg-gray-500 text-orange-400 rounded-3xl border-0"
                  >
                    %
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => inputOperation("÷")}
                    className="h-10 text-lg font-medium bg-gray-600 hover:bg-gray-500 text-orange-400 rounded-3xl border-0"
                  >
                    ÷
                  </Button>

                  {/* Row 2: 7, 8, 9, × */}
                  <Button
                    variant="ghost"
                    onClick={() => inputNumber("7")}
                    className="h-10 text-lg font-medium bg-gray-800 hover:bg-gray-700 text-white rounded-3xl border-0"
                  >
                    7
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => inputNumber("8")}
                    className="h-10 text-lg font-medium bg-gray-800 hover:bg-gray-700 text-white rounded-3xl border-0"
                  >
                    8
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => inputNumber("9")}
                    className="h-10 text-lg font-medium bg-gray-800 hover:bg-gray-700 text-white rounded-3xl border-0"
                  >
                    9
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => inputOperation("*")}
                    className="h-10 text-lg font-medium bg-gray-600 hover:bg-gray-500 text-orange-400 rounded-3xl border-0"
                  >
                    ×
                  </Button>

                  {/* Row 3: 4, 5, 6, - */}
                  <Button
                    variant="ghost"
                    onClick={() => inputNumber("4")}
                    className="h-10 text-lg font-medium bg-gray-800 hover:bg-gray-700 text-white rounded-3xl border-0"
                  >
                    4
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => inputNumber("5")}
                    className="h-10 text-lg font-medium bg-gray-800 hover:bg-gray-700 text-white rounded-3xl border-0"
                  >
                    5
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => inputNumber("6")}
                    className="h-10 text-lg font-medium bg-gray-800 hover:bg-gray-700 text-white rounded-3xl border-0"
                  >
                    6
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => inputOperation("-")}
                    className="h-10 text-lg font-medium bg-gray-600 hover:bg-gray-500 text-orange-400 rounded-3xl border-0"
                  >
                    -
                  </Button>

                  {/* Row 4: 1, 2, 3, + */}
                  <Button
                    variant="ghost"
                    onClick={() => inputNumber("1")}
                    className="h-10 text-lg font-medium bg-gray-800 hover:bg-gray-700 text-white rounded-3xl border-0"
                  >
                    1
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => inputNumber("2")}
                    className="h-10 text-lg font-medium bg-gray-800 hover:bg-gray-700 text-white rounded-3xl border-0"
                  >
                    2
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => inputNumber("3")}
                    className="h-10 text-lg font-medium bg-gray-800 hover:bg-gray-700 text-white rounded-3xl border-0"
                  >
                    3
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => inputOperation("+")}
                    className="h-10 text-lg font-medium bg-gray-600 hover:bg-gray-500 text-orange-400 rounded-3xl border-0"
                  >
                    +
                  </Button>

                  {/* Row 5: Save, 0, ., = */}
                  <Button
                    variant="ghost"
                    onClick={handleSave}
                    className="h-10 text-sm font-medium bg-green-600 hover:bg-green-500 text-white rounded-3xl border-0"
                  >
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => inputNumber("0")}
                    className="h-10 text-lg font-medium bg-gray-800 hover:bg-gray-700 text-white rounded-3xl border-0"
                  >
                    0
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={addDecimal}
                    className="h-10 text-lg font-medium bg-gray-800 hover:bg-gray-700 text-white rounded-3xl border-0"
                  >
                    .
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={inputEquals}
                    className="h-10 text-lg font-medium bg-orange-500 hover:bg-orange-400 text-white rounded-3xl border-0"
                  >
                    =
                  </Button>
                </div>
              </div>

              {/* Date/Time */}
              <div className="text-center text-xs font-medium text-muted-foreground border-t border-border pt-1 mt-2">
                📅 {formatMonth(currentMonth)} • 🕐{" "}
                {new Date().toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Floating Add Button */}
        <Button
          size="icon"
          className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </Layout>
  );
}

interface TransactionItemProps {
  transaction: Transaction;
}

function TransactionItem({ transaction }: TransactionItemProps) {
  const category = allCategories.find(
    (cat) => cat.name === transaction.mainCategory,
  );
  const subCategory = category?.subcategories.find(
    (sub) => sub.name === transaction.subCategory,
  );

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-lg">
            {subCategory?.icon || category?.icon || "💰"}
          </div>
          <div>
            <div className="font-medium">{transaction.subCategory}</div>
            <div className="text-sm text-muted-foreground">
              {transaction.mainCategory}
            </div>
            {transaction.notes && (
              <div className="text-xs text-muted-foreground">
                {transaction.notes}
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              {transaction.date} • {transaction.time}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div
            className={`font-semibold ${transaction.type === "income" ? "text-green-400" : "text-red-400"}`}
          >
            {transaction.type === "income" ? "+" : "-"}₹
            {transaction.amount.toLocaleString()}
          </div>
        </div>
      </div>
    </Card>
  );
}
