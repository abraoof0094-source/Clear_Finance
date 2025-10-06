import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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
import {
  Plus,
  ArrowLeft,
  Calculator,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { universalStorage, Transaction, Summary } from "../utils/clientStorage";
import sharedCategories from "../data/categories";

// Transaction interface imported from API utils

// All Categories (Income + Expense + Investment combined)
const allCategories = [
  {
    id: 1,
    name: "Income Sources",
    icon: "💰",
    type: "income" as const,
    subcategories: [
      {
        name: "Fixed Salary",
        icon: "💵",
        description: "Monthly take-home salary",
      },
      {
        name: "Variable Pay",
        icon: "💎",
        description: "Performance bonus, annual bonus",
      },
      {
        name: "Reimbursements",
        icon: "📄",
        description: "Travel allowance, food coupons",
      },
      {
        name: "Freelance/Side Income",
        icon: "💻",
        description: "Consulting, online gigs",
      },
      {
        name: "Passive Income",
        icon: "📊",
        description: "Dividends, rental income",
      },
      {
        name: "Others",
        icon: "💡",
        description: "Gifts, lottery, miscellaneous income",
      },
    ],
  },
  {
    id: 2,
    name: "Fixed Household Expenses",
    icon: "����",
    type: "expense" as const,
    subcategories: [
      {
        name: "Rent/EMI",
        icon: "🏡",
        description: "House rent or home loan EMI",
      },
      {
        name: "Utilities",
        icon: "💡",
        description: "Electricity, water, gas bills",
      },
      {
        name: "Internet & Mobile",
        icon: "📱",
        description: "Broadband, mobile plans",
      },
      {
        name: "Maintenance",
        icon: "🔧",
        description: "Society charges, repairs",
      },
      {
        name: "Domestic Help",
        icon: "👥",
        description: "Maid, cook, driver salaries",
      },
      {
        name: "Others",
        icon: "🏷️",
        description: "Other fixed household costs",
      },
    ],
  },
  {
    id: 3,
    name: "Family & Personal Living",
    icon: "👪",
    type: "expense" as const,
    subcategories: [
      {
        name: "Groceries",
        icon: "🛒",
        description: "Daily food & household items",
      },
      {
        name: "Food & Dining",
        icon: "🍽️",
        description: "Restaurants, food delivery, cafes",
      },
      {
        name: "Transportation",
        icon: "��",
        description: "Fuel, public transport, taxi",
      },
      {
        name: "Healthcare",
        icon: "🏥",
        description: "Doctor visits, medicines, checkups",
      },
      {
        name: "Personal Care",
        icon: "💄",
        description: "Salon, cosmetics, hygiene",
      },
      {
        name: "Clothing",
        icon: "👗",
        description: "Apparel, footwear, accessories",
      },
      {
        name: "Education",
        icon: "📚",
        description: "School fees, courses, books",
      },
      {
        name: "Entertainment",
        icon: "🎬",
        description: "Movies, games, subscriptions",
      },
      {
        name: "Travel & Vacation",
        icon: "✈️",
        description: "Holidays, weekend trips",
      },
      {
        name: "Gifts & Donations",
        icon: "����",
        description: "Presents, charity, festivals",
      },
      {
        name: "Others",
        icon: "🏷️",
        description: "Miscellaneous family expenses",
      },
    ],
  },
  {
    id: 4,
    name: "Insurance",
    icon: "🛡️",
    type: "expense" as const,
    subcategories: [
      {
        name: "Life Insurance",
        icon: "❤️",
        description: "Term, whole life policies",
      },
      {
        name: "Health Insurance",
        icon: "🏥",
        description: "Medical, family health plans",
      },
      {
        name: "Vehicle Insurance",
        icon: "����",
        description: "Car, bike insurance",
      },
      {
        name: "Home Insurance",
        icon: "🏠",
        description: "Property, contents insurance",
      },
      {
        name: "Others",
        icon: "🛡️",
        description: "Travel, other insurance types",
      },
    ],
  },
  {
    id: 5,
    name: "Investments",
    icon: "📈",
    type: "investment" as const,
    subcategories: [
      {
        name: "Mutual Funds",
        icon: "📊",
        description: "SIP, lump sum investments",
      },
      {
        name: "Stocks & Shares",
        icon: "���",
        description: "Direct equity investments",
      },
      {
        name: "Fixed Deposits",
        icon: "🏦",
        description: "Bank FDs, recurring deposits",
      },
      { name: "PPF & ELSS", icon: "🎯", description: "Tax-saving investments" },
      {
        name: "Real Estate",
        icon: "������️",
        description: "Property investments",
      },
      { name: "Gold", icon: "✨", description: "Physical gold, gold ETFs" },
      {
        name: "Crypto",
        icon: "₿",
        description: "Bitcoin, other cryptocurrencies",
      },
      { name: "Others", icon: "💰", description: "Bonds, other investments" },
    ],
  },
  {
    id: 6,
    name: "Loans & EMI Payments",
    icon: "💳",
    type: "expense" as const,
    subcategories: [
      { name: "Home Loan", icon: "🏠", description: "House purchase loan EMI" },
      { name: "Car Loan", icon: "🚗", description: "Vehicle loan EMI" },
      { name: "Personal Loan", icon: "💰", description: "Personal loan EMI" },
      { name: "Credit Card", icon: "💳", description: "Credit card payments" },
      { name: "Education Loan", icon: "🎓", description: "Study loan EMI" },
      { name: "Others", icon: "💸", description: "Other loan repayments" },
    ],
  },
];

export function Tracker() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [transactionType, setTransactionType] = useState<
    "income" | "expense" | "investment"
  >("expense");
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [displayValue, setDisplayValue] = useState("0");
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [showCalculator, setShowCalculator] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [pendingSum, setPendingSum] = useState<number | null>(null);
  const [showCategorySelection, setShowCategorySelection] = useState(false);
  const [showAllSubcategories, setShowAllSubcategories] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  // Month navigation state
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Month navigation functions
  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // Load transactions from client-side storage (IndexedDB with localStorage fallback)
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        // Initialize client storage (IndexedDB or localStorage)
        await universalStorage.init();

        // Load transactions for current month
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1; // JavaScript months are 0-indexed
        const transactions = await universalStorage.getTransactionsByMonth(
          year,
          month,
        );
        setTransactions(transactions);

        console.log(
          `Loaded ${transactions.length} transactions for ${formatMonth(currentMonth)} from client storage`,
        );
      } catch (error) {
        console.error("Failed to load transactions:", error);
        setTransactions([]);
      }
    };

    loadTransactions();
  }, [currentMonth]); // Re-load when currentMonth changes

  // Update current date and time
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const date = now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        weekday: "short",
      });
      const time = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      setCurrentDate(date);
      setCurrentTime(time);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // Simple calculator state and handlers (basic + - * /)
  const [calcExpr, setCalcExpr] = useState("");
  const [calcMemory, setCalcMemory] = useState<number | null>(null);

  // Keypad handlers for amount input (showKeypad)
  const handleNumberClick = (num: string) => {
    const cur = displayValue || "0";
    const next = cur === "0" ? (num === "00" ? "0" : num) : cur + num;
    setDisplayValue(next);
  };

  const handleBackspace = () => {
    if (!displayValue || displayValue === "0") {
      setDisplayValue("0");
      return;
    }
    if (displayValue.length > 1) {
      setDisplayValue(displayValue.slice(0, -1));
    } else {
      setDisplayValue("0");
    }
  };

  const handleDecimal = () => {
    if (!displayValue.includes(".")) {
      setDisplayValue(displayValue + ".");
    }
  };

  const handleClear = () => {
    setDisplayValue("0");
    setAmount("");
  };

  // Operators on the small keypad are no-ops (calculator modal handles expressions)
  const handleOperatorClick = (op: string) => {
    // no-op or you could implement sign toggle
    return;
  };

  const calcResult = React.useMemo(() => {
    if (!calcExpr) return "";
    // replace unicode operators if any
    const sanitized = calcExpr.replace(/×/g, "*").replace(/÷/g, "/");
    // allow digits, operators, parentheses, dot and spaces only
    if (!/^[0-9+\-*/().\s]+$/.test(sanitized)) return "ERR";
    try {
      // eslint-disable-next-line no-new-func
      const val = Function(`'use strict'; return (${sanitized})`)();
      if (typeof val === "number" && Number.isFinite(val)) return String(val);
      return "ERR";
    } catch (e) {
      return "ERR";
    }
  }, [calcExpr]);

  const handleCalcInput = (token: string) => {
    setCalcExpr((s) => s + token);
  };

  const handleCalcClear = () => setCalcExpr("");
  const handleCalcBackspace = () => setCalcExpr((s) => s.slice(0, -1));

  // Memory and utility handlers
  const handleMemAdd = () => {
    const val = calcResult && calcResult !== "ERR" ? parseFloat(calcResult) : (calcExpr && /^\s*\d+(?:\.\d+)?\s*$/.test(calcExpr) ? parseFloat(calcExpr) : NaN);
    if (!isNaN(val)) {
      setCalcMemory((m) => (m ?? 0) + val);
    }
  };
  const handleMemSub = () => {
    const val = calcResult && calcResult !== "ERR" ? parseFloat(calcResult) : (calcExpr && /^\s*\d+(?:\.\d+)?\s*$/.test(calcExpr) ? parseFloat(calcExpr) : NaN);
    if (!isNaN(val)) {
      setCalcMemory((m) => (m ?? 0) - val);
    }
  };
  const handleMemRecall = () => {
    if (calcMemory !== null) {
      setCalcExpr((calcMemory || 0).toString());
    }
  };
  const handleToggleSign = () => {
    if (!calcExpr) return;
    if (calcExpr.startsWith("-")) setCalcExpr(calcExpr.slice(1));
    else setCalcExpr("-" + calcExpr);
  };
  const handlePercent = () => {
    // if expression is a single number, divide by 100; else append /100
    if (/^\s*\d+(?:\.\d+)?\s*$/.test(calcExpr)) {
      const val = parseFloat(calcExpr) / 100;
      setCalcExpr(String(val));
    } else {
      setCalcExpr((s) => s + "/100");
    }
  };

  const handleCalcDone = () => {
    // prefer evaluated result if valid
    if (calcResult && calcResult !== "ERR") {
      setAmount(calcResult);
      setDisplayValue(calcResult);
    } else if (calcExpr && /^\s*\d+(?:\.\d+)?\s*$/.test(calcExpr)) {
      const val = calcExpr.trim();
      setAmount(val);
      setDisplayValue(val);
    }
    setShowCalculator(false);
    setShowKeypad(false);
  };

  // Edit transaction
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setTransactionType(transaction.type);
    setSelectedMainCategory(transaction.mainCategory);
    setSelectedSubCategory(transaction.subCategory);
    setAmount(transaction.amount.toString());
    setDisplayValue(transaction.amount.toString());
    setShowAddDialog(true);
    setOpenMenuId(null);
  };

  // Delete transaction
  const handleDeleteTransaction = async (
    transactionId: string,
    date: string,
  ) => {
    try {
      // Remove from client storage
      const success = await universalStorage.deleteTransaction(transactionId);

      if (success) {
        // Update local state
        const updatedTransactions = transactions.filter(
          (t) => t.id !== transactionId,
        );
        setTransactions(updatedTransactions);
        console.log("Transaction deleted successfully");
      } else {
        alert("Transaction not found");
      }
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      alert("Failed to delete transaction. Please try again.");
    }
    setOpenMenuId(null);
  };

  // Get filtered categories based on transaction type
  const filteredCategories = sharedCategories.filter(
    (cat) => cat.type === transactionType,
  );

  // Get subcategories for selected main category
  const subCategories =
    filteredCategories.find((cat) => cat.name === selectedMainCategory)
      ?.subcategories || [];

  // Debug logging
  console.log("Debug State:", {
    selectedMainCategory,
    selectedSubCategory,
    amount,
    displayValue,
    subCategoriesCount: subCategories.length,
    filteredCategoriesCount: filteredCategories.length,
  });

  // Preview amount while using keypad: show pendingSum + current input if present
  const previewAmount = showKeypad
    ? String(
        (pendingSum !== null ? pendingSum : 0) + (parseFloat(displayValue || "0") || 0),
      )
    : amount || "0";

  // Save transaction
  const handleSave = async () => {
    if (!selectedMainCategory || !selectedSubCategory || !amount) {
      alert("Please fill all required fields");
      return;
    }

    try {
      if (editingTransaction) {
        // Update existing transaction
        await universalStorage.deleteTransaction(editingTransaction.id);

        const updatedTransactionData = {
          type: transactionType,
          mainCategory: selectedMainCategory,
          subCategory: selectedSubCategory,
          amount: parseFloat(amount),
          date: editingTransaction.date, // Keep original date
          time: editingTransaction.time, // Keep original time
        };

        const savedTransaction = await universalStorage.addTransaction(
          updatedTransactionData,
        );

        // Update local state
        const updatedTransactions = transactions.map((t) =>
          t.id === editingTransaction.id ? savedTransaction : t,
        );
        setTransactions(updatedTransactions);

        console.log("Transaction updated successfully");
      } else {
        // Create new transaction
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD format

        const transactionData = {
          type: transactionType,
          mainCategory: selectedMainCategory,
          subCategory: selectedSubCategory,
          amount: parseFloat(amount),
          date: dateStr,
          time: currentTime,
        };

        const savedTransaction =
          await universalStorage.addTransaction(transactionData);

        // Check if the new transaction belongs to the current month view
        const transactionDate = new Date(savedTransaction.date);
        const transactionMonth = new Date(
          transactionDate.getFullYear(),
          transactionDate.getMonth(),
          1,
        );

        if (transactionMonth.getTime() === currentMonth.getTime()) {
          // Update local state only if transaction is for current month
          const updatedTransactions = [savedTransaction, ...transactions];
          setTransactions(updatedTransactions);
        }

        console.log("Transaction saved successfully to client storage");
      }

      // Reset form
      setTransactionType("expense");
      setSelectedMainCategory("");
      setSelectedSubCategory("");
      setDisplayValue("0");
      setAmount("");
      setEditingTransaction(null);
      setShowAddDialog(false);
    } catch (error) {
      console.error("Failed to save transaction:", error);
      alert("Failed to save transaction. Please try again.");
    }
  };

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalInvestment = transactions
    .filter((t) => t.type === "investment")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense - totalInvestment;

  return (
    <Layout>
      <div className="space-y-6 py-4 pb-20">
        {/* Header with Month Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-semibold">
              {formatMonth(currentMonth)}
            </h2>
            <Button variant="ghost" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Transactions</h3>
          <div className="space-y-3">
            {transactions.slice(0, 10).map((transaction) => (
              <Card key={transaction.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-12 rounded-full"
                      style={{
                        backgroundColor:
                          transaction.type === "income"
                            ? "#22c55e"
                            : transaction.type === "investment"
                              ? "#3b82f6"
                              : "#ef4444",
                      }}
                    ></div>
                    <div>
                      <div className="font-medium">
                        {transaction.subCategory}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.mainCategory}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {transaction.date} • {transaction.time}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="font-bold text-lg"
                      style={{
                        color:
                          transaction.type === "income"
                            ? "#22c55e"
                            : transaction.type === "investment"
                              ? "#3b82f6"
                              : "#ef4444",
                      }}
                    >
                      {transaction.type === "income"
                        ? "+"
                        : transaction.type === "investment"
                          ? "+"
                          : "-"}
                      ₹{transaction.amount.toLocaleString()}
                    </div>

                    {/* Three-dot menu */}
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(
                            openMenuId === transaction.id
                              ? null
                              : transaction.id,
                          );
                        }}
                      >
                        <svg
                          className="h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </Button>

                      {openMenuId === transaction.id && (
                        <>
                          <div
                            className="fixed inset-0 z-[9998]"
                            onClick={() => setOpenMenuId(null)}
                          ></div>
                          <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-md shadow-xl z-[9999] py-1 min-w-[120px]">
                            <button
                              className="w-full text-left px-3 py-2 hover:bg-muted text-sm flex items-center gap-2"
                              onClick={() => handleEditTransaction(transaction)}
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Edit
                            </button>
                            <button
                              className="w-full text-left px-3 py-2 hover:bg-muted text-sm flex items-center gap-2 text-red-600 hover:text-red-700"
                              onClick={() =>
                                handleDeleteTransaction(
                                  transaction.id,
                                  transaction.date,
                                )
                              }
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Add Transaction Button */}
        <Button
          size="icon"
          className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg z-[10002] bg-red-500 text-white flex items-center justify-center"
          onClick={() => setShowAddDialog(true)}
          aria-label="Add transaction"
        >
          <Plus className="h-6 w-6" />
        </Button>

        {/* Add Transaction Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="w-full h-full max-w-none max-h-none m-0 rounded-none border-0 bg-background overflow-auto">
            <DialogHeader className="sr-only">
              <DialogTitle>
                {transactionType === "income"
                  ? "Add Income"
                  : transactionType === "investment"
                    ? "Add Investment"
                    : "Add Expense"}
              </DialogTitle>
            </DialogHeader>
            <div className="min-h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-background z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAddDialog(false)}
                >
                  <ArrowLeft className="h-6 w-6" />
                </Button>
                <h2 className="text-xl font-semibold">
                  {editingTransaction ? "Edit " : ""}
                  {transactionType === "income"
                    ? "Income"
                    : transactionType === "investment"
                      ? "Invest"
                      : "Expense"}
                </h2>
                <div></div>
              </div>

              <div className="pb-24">
                {/* Type Selection Tabs */}
                <div style={{ margin: "16px", display: "flex" }}>
                  <button
                    onClick={() => {
                      setTransactionType("income");
                      setSelectedMainCategory("");
                      setSelectedSubCategory("");
                    }}
                    style={{
                      height: "48px",
                      flex: "1",
                      margin: "0",
                      padding: "0",
                      border: "none",
                      outline: "none",
                      fontSize: "14px",
                      fontWeight: "600",
                      backgroundColor:
                        transactionType === "income" ? "#22c55e" : "#000000",
                      color:
                        transactionType === "income" ? "#ffffff" : "#ffffff",
                      cursor: "pointer",
                    }}
                  >
                    Income
                  </button>
                  <button
                    onClick={() => {
                      setTransactionType("expense");
                      setSelectedMainCategory("");
                      setSelectedSubCategory("");
                    }}
                    style={{
                      height: "48px",
                      flex: "1",
                      margin: "0",
                      padding: "0",
                      border: "none",
                      outline: "none",
                      fontSize: "14px",
                      fontWeight: "600",
                      backgroundColor:
                        transactionType === "expense" ? "#ef4444" : "#000000",
                      color:
                        transactionType === "expense" ? "#ffffff" : "#ffffff",
                      cursor: "pointer",
                    }}
                  >
                    Expense
                  </button>
                  <button
                    onClick={() => {
                      setTransactionType("investment");
                      setSelectedMainCategory("");
                      setSelectedSubCategory("");
                    }}
                    style={{
                      height: "48px",
                      flex: "1",
                      margin: "0",
                      padding: "0",
                      border: "none",
                      outline: "none",
                      fontSize: "14px",
                      fontWeight: "600",
                      backgroundColor:
                        transactionType === "investment"
                          ? "#3b82f6"
                          : "#000000",
                      color:
                        transactionType === "investment"
                          ? "#ffffff"
                          : "#ffffff",
                      cursor: "pointer",
                    }}
                  >
                    Invest
                  </button>
                </div>

                {/* Form Fields */}
                <div className="px-4 space-y-8 flex-1">
                  {/* Date and Time */}
                  <div>
                    <div className="text-base text-muted-foreground mb-2">
                      Date
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{currentDate}</span>
                      <span className="text-lg">{currentTime}</span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <div className="text-base text-muted-foreground mb-2">
                      Amount
                    </div>
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        setShowKeypad(!showKeypad);
                        setShowCategorySelection(false);
                      }}
                    >
                      <div className="text-2xl font-normal">
                        ₹ {previewAmount}
                      </div>
                    </div>
                    <div
                      className="h-px mt-2"
                      style={{
                        backgroundColor:
                          transactionType === "income"
                            ? "#22c55e"
                            : transactionType === "investment"
                              ? "#3b82f6"
                              : "#ef4444",
                      }}
                    ></div>
                  </div>

                  {/* Category */}
                  <div>
                    <div
                      className="text-base text-muted-foreground mb-2 cursor-pointer flex items-center gap-2"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Commit amount if user entered via keypad but didn't press Done
                        if (showKeypad && displayValue && displayValue !== "0") {
                          setAmount(displayValue);
                        }
                        setShowCategorySelection(!showCategorySelection);
                        setShowKeypad(false);
                      }}
                    >
                      {selectedMainCategory && selectedSubCategory ? (
                        <>
                          <span>
                            {
                              subCategories.find(
                                (s) => s.name === selectedSubCategory,
                              )?.icon
                            }
                          </span>
                          <span>
                            {selectedMainCategory}/{selectedSubCategory}
                          </span>
                        </>
                      ) : (
                        "Category"
                      )}
                    </div>
                    <div
                      className="h-px"
                      style={{
                        backgroundColor:
                          transactionType === "income"
                            ? "#22c55e"
                            : transactionType === "investment"
                              ? "#3b82f6"
                              : "#ef4444",
                      }}
                    ></div>
                  </div>
                </div>

                {/* Category Selection - Show when category is clicked */}
                {showCategorySelection && (
                  <div className="border-t bg-background">
                    <div className="flex justify-between items-center p-4 border-b">
                      <span className="text-base font-semibold">Category</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowCategorySelection(false)}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="h-[60vh] pb-24">
                      <div className="flex h-full min-h-0">
                        {/* Main Categories Panel */}
                        <div className="w-1/2 border-r bg-background min-h-0 h-full overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
                          <div className="h-full">
                            {filteredCategories.map((category) => (
                              <div
                                key={category.id}
                                className={`flex items-center gap-3 p-4 border-b cursor-pointer transition-colors ${
                                  selectedMainCategory === category.name
                                    ? transactionType === "income"
                                      ? "bg-green-50 border-l-4 border-l-green-500 text-green-700"
                                      : transactionType === "investment"
                                        ? "bg-blue-50 border-l-4 border-l-blue-500 text-blue-700"
                                        : "bg-red-50 border-l-4 border-l-red-500 text-red-700"
                                    : "hover:bg-muted/50"
                                }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setSelectedMainCategory(category.name);
                                  setSelectedSubCategory("");
                                }}
                              >
                                <span className="text-lg">{category.icon}</span>
                                <div className="flex-1">
                                  <div className="text-sm font-medium leading-tight">
                                    {category.name}
                                  </div>
                                </div>
                                <svg
                                  className="w-4 h-4 text-muted-foreground"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Subcategories Panel */}
                        <div className="w-1/2 bg-muted/20 min-h-0 h-full overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
                          <div className="h-full">
                            {selectedMainCategory ? (
                              subCategories.map((sub, index) => (
                                <div
                                  key={index}
                                  className={`flex items-center gap-3 p-4 border-b cursor-pointer transition-colors ${
                                    selectedSubCategory === sub.name
                                      ? transactionType === "income"
                                        ? "bg-green-100 text-green-800"
                                        : transactionType === "investment"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-red-100 text-red-800"
                                      : "hover:bg-muted/50"
                                  }`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSelectedSubCategory(sub.name);
                                    setShowCategorySelection(false);
                                  }}
                                >
                                  <span className="text-base">{sub.icon}</span>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium">
                                      {sub.name}
                                    </div>
                                    {sub.description && (
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {sub.description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="flex items-center justify-center h-full text-muted-foreground">
                                <div className="text-center">
                                  <div className="text-sm">
                                    Select a category
                                  </div>
                                  <div className="text-xs mt-1">
                                    Choose from the left panel
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Keypad - Show when amount is clicked */}
                {showKeypad && (
                  <div className="p-4 bg-muted/30 border-t">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-muted-foreground">
                        Amount
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowKeypad(false)}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {/* Row 1: 1, 2, 3, Backspace */}
                      <Button
                        onClick={() => handleNumberClick("1")}
                        variant="ghost"
                        className="h-14 text-xl font-bold bg-background hover:bg-muted rounded-lg"
                      >
                        1
                      </Button>
                      <Button
                        onClick={() => handleNumberClick("2")}
                        variant="ghost"
                        className="h-14 text-xl font-bold bg-background hover:bg-muted rounded-lg"
                      >
                        2
                      </Button>
                      <Button
                        onClick={() => handleNumberClick("3")}
                        variant="ghost"
                        className="h-14 text-xl font-bold bg-background hover:bg-muted rounded-lg"
                      >
                        3
                      </Button>
                      <Button
                        onClick={handleBackspace}
                        variant="ghost"
                        className="h-14 bg-background hover:bg-muted rounded-lg"
                      >
                        ⌫
                      </Button>

                      {/* Row 2: 4, 5, 6, - */}
                      <Button
                        onClick={() => handleNumberClick("4")}
                        variant="ghost"
                        className="h-14 text-xl font-bold bg-background hover:bg-muted rounded-lg"
                      >
                        4
                      </Button>
                      <Button
                        onClick={() => handleNumberClick("5")}
                        variant="ghost"
                        className="h-14 text-xl font-bold bg-background hover:bg-muted rounded-lg"
                      >
                        5
                      </Button>
                      <Button
                        onClick={() => handleNumberClick("6")}
                        variant="ghost"
                        className="h-14 text-xl font-bold bg-background hover:bg-muted rounded-lg"
                      >
                        6
                      </Button>
                      <Button
                        onClick={() => {
                          const cur = parseFloat(displayValue || "0") || 0;
                          setPendingSum((s) => (s === null ? -cur : s - cur));
                          setDisplayValue("0");
                        }}
                        variant="ghost"
                        className="h-14 bg-background hover:bg-muted rounded-lg"
                      >
                        −
                      </Button>

                      {/* Row 3: 7, 8, 9, Calculator */}
                      <Button
                        onClick={() => handleNumberClick("7")}
                        variant="ghost"
                        className="h-14 text-xl font-bold bg-background hover:bg-muted rounded-lg"
                      >
                        7
                      </Button>
                      <Button
                        onClick={() => handleNumberClick("8")}
                        variant="ghost"
                        className="h-14 text-xl font-bold bg-background hover:bg-muted rounded-lg"
                      >
                        8
                      </Button>
                      <Button
                        onClick={() => handleNumberClick("9")}
                        variant="ghost"
                        className="h-14 text-xl font-bold bg-background hover:bg-muted rounded-lg"
                      >
                        9
                      </Button>
                      <Button
                        onClick={() => {
                          const cur = parseFloat(displayValue || "0") || 0;
                          setPendingSum((s) => (s === null ? cur : s + cur));
                          setDisplayValue("0");
                        }}
                        variant="ghost"
                        className="h-14 bg-background hover:bg-muted rounded-lg"
                      >
                        +
                      </Button>

                      {/* Row 4: Empty, 0, ., Done */}
                      <Button
                        onClick={() => handleNumberClick("00")}
                        variant="ghost"
                        className="h-14 text-xl font-bold bg-background hover:bg-muted rounded-lg"
                      >
                        00
                      </Button>
                      <Button
                        onClick={() => handleNumberClick("0")}
                        variant="ghost"
                        className="h-14 text-xl font-bold bg-background hover:bg-muted rounded-lg"
                      >
                        0
                      </Button>
                      <Button
                        onClick={handleDecimal}
                        variant="ghost"
                        className="h-14 text-xl font-bold bg-background hover:bg-muted rounded-lg"
                      >
                        .
                      </Button>
                      <Button
                        onClick={() => {
                          const cur = parseFloat(displayValue || "0") || 0;
                          const final = pendingSum !== null ? pendingSum + cur : cur;
                          setAmount(String(final));
                          setDisplayValue(String(final));
                          setPendingSum(null);
                          setShowKeypad(false);
                        }}
                        className={`h-14 text-white font-bold rounded-lg ${
                          transactionType === "income"
                            ? "bg-green-500 hover:bg-green-600"
                            : transactionType === "investment"
                              ? "bg-blue-500 hover:bg-blue-600"
                              : "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                )}

                {/* Action Buttons - Single Save */}
                <div className="p-4">
                  <Button
                    onClick={handleSave}
                    className={`w-full h-12 text-white rounded-lg ${
                      transactionType === "income"
                        ? "bg-green-500 hover:bg-green-600"
                        : transactionType === "investment"
                          ? "bg-blue-500 hover:bg-blue-600"
                          : "bg-red-500 hover:bg-red-600"
                    }`}
                    disabled={
                      !selectedMainCategory ||
                      !selectedSubCategory ||
                      !amount ||
                      parseFloat(amount) <= 0
                    }
                  >
                    Save Entry
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Calculator Modal */}
        <Dialog open={showCalculator} onOpenChange={setShowCalculator}>
          <DialogContent className="w-full max-w-none max-h-[90vh] m-0 rounded-none border-0 bg-black text-white overflow-auto">
            <DialogHeader className="sr-only">
              <DialogTitle>Calculator</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col min-h-0 h-full">
              <div className="flex items-center justify-end p-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCalculator(false)}
                  className="text-white hover:bg-gray-800"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md">
                  <div className="text-right text-sm text-muted-foreground mb-2 truncate">{calcExpr || "0"}</div>
                  <div className="text-right text-4xl font-semibold">{calcResult || "0"}</div>
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-4 gap-3">
  <Button onClick={handleCalcClear} variant="ghost" className="h-14 rounded-lg">AC</Button>
  <Button onClick={handleCalcBackspace} variant="ghost" className="h-14 rounded-lg">⌫</Button>
  <Button onClick={handleToggleSign} variant="ghost" className="h-14 rounded-lg">±</Button>
  <Button onClick={handlePercent} variant="ghost" className="h-14 rounded-lg">%</Button>

  <Button onClick={() => handleCalcInput('7')} variant="ghost" className="h-14 rounded-lg">7</Button>
  <Button onClick={() => handleCalcInput('8')} variant="ghost" className="h-14 rounded-lg">8</Button>
  <Button onClick={() => handleCalcInput('9')} variant="ghost" className="h-14 rounded-lg">9</Button>
  <Button onClick={() => handleCalcInput('/')} variant="ghost" className="h-14 rounded-lg">÷</Button>

  <Button onClick={() => handleCalcInput('4')} variant="ghost" className="h-14 rounded-lg">4</Button>
  <Button onClick={() => handleCalcInput('5')} variant="ghost" className="h-14 rounded-lg">5</Button>
  <Button onClick={() => handleCalcInput('6')} variant="ghost" className="h-14 rounded-lg">6</Button>
  <Button onClick={() => handleCalcInput('*')} variant="ghost" className="h-14 rounded-lg">×</Button>

  <Button onClick={() => handleCalcInput('1')} variant="ghost" className="h-14 rounded-lg">1</Button>
  <Button onClick={() => handleCalcInput('2')} variant="ghost" className="h-14 rounded-lg">2</Button>
  <Button onClick={() => handleCalcInput('3')} variant="ghost" className="h-14 rounded-lg">3</Button>
  <Button onClick={handleCalcDone} variant="ghost" className="h-14 rounded-lg">=</Button>

  <Button onClick={() => handleCalcInput('00')} variant="ghost" className="h-14 rounded-lg">00</Button>
  <Button onClick={() => handleCalcInput('0')} variant="ghost" className="h-14 rounded-lg">0</Button>
  <Button onClick={() => handleCalcInput('.')} variant="ghost" className="h-14 rounded-lg">.</Button>
  <Button onClick={handleCalcDone} variant="ghost" className="h-14 bg-orange-500 hover:bg-orange-400 text-white rounded-lg">Done</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
