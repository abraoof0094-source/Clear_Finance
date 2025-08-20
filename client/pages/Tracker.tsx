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
} from "lucide-react";

// Transaction interface
interface Transaction {
  id: string;
  type: "income" | "expense" | "investment";
  mainCategory: string;
  subCategory: string;
  amount: number;
  date: string;
  time: string;
}

// All Categories (Income + Expense + Investment combined)
const allCategories = [
  {
    id: 1,
    name: "Income Sources",
    icon: "💰",
    type: "income" as const,
    subcategories: [
      { name: "Fixed Salary", icon: "💵", description: "Monthly take-home salary" },
      { name: "Variable Pay", icon: "💎", description: "Performance bonus, annual bonus" },
      { name: "Reimbursements", icon: "📄", description: "Travel allowance, food coupons" },
      { name: "Freelance/Side Income", icon: "💻", description: "Consulting, online gigs" },
      { name: "Passive Income", icon: "📊", description: "Dividends, rental income" },
      { name: "Others", icon: "💡", description: "Gifts, lottery, miscellaneous income" },
    ],
  },
  {
    id: 2,
    name: "Fixed Household Expenses",
    icon: "🏠",
    type: "expense" as const,
    subcategories: [
      { name: "Rent/EMI", icon: "🏡", description: "House rent or home loan EMI" },
      { name: "Utilities", icon: "💡", description: "Electricity, water, gas bills" },
      { name: "Internet & Mobile", icon: "📱", description: "Broadband, mobile plans" },
      { name: "Maintenance", icon: "🔧", description: "Society charges, repairs" },
      { name: "Domestic Help", icon: "👥", description: "Maid, cook, driver salaries" },
      { name: "Others", icon: "🏷️", description: "Other fixed household costs" },
    ],
  },
  {
    id: 3,
    name: "Family & Personal Living",
    icon: "👪",
    type: "expense" as const,
    subcategories: [
      { name: "Groceries", icon: "🛒", description: "Daily food & household items" },
      { name: "Food & Dining", icon: "🍽️", description: "Restaurants, food delivery, cafes" },
      { name: "Transportation", icon: "🚗", description: "Fuel, public transport, taxi" },
      { name: "Healthcare", icon: "🏥", description: "Doctor visits, medicines, checkups" },
      { name: "Personal Care", icon: "💄", description: "Salon, cosmetics, hygiene" },
      { name: "Clothing", icon: "👗", description: "Apparel, footwear, accessories" },
      { name: "Education", icon: "📚", description: "School fees, courses, books" },
      { name: "Entertainment", icon: "🎬", description: "Movies, games, subscriptions" },
      { name: "Travel & Vacation", icon: "✈️", description: "Holidays, weekend trips" },
      { name: "Gifts & Donations", icon: "🎁", description: "Presents, charity, festivals" },
      { name: "Others", icon: "🏷️", description: "Miscellaneous family expenses" },
    ],
  },
  {
    id: 4,
    name: "Insurance",
    icon: "🛡️",
    type: "expense" as const,
    subcategories: [
      { name: "Life Insurance", icon: "❤️", description: "Term, whole life policies" },
      { name: "Health Insurance", icon: "🏥", description: "Medical, family health plans" },
      { name: "Vehicle Insurance", icon: "🚗", description: "Car, bike insurance" },
      { name: "Home Insurance", icon: "🏠", description: "Property, contents insurance" },
      { name: "Others", icon: "🛡️", description: "Travel, other insurance types" },
    ],
  },
  {
    id: 5,
    name: "Investments",
    icon: "📈",
    type: "investment" as const,
    subcategories: [
      { name: "Mutual Funds", icon: "📊", description: "SIP, lump sum investments" },
      { name: "Stocks & Shares", icon: "📈", description: "Direct equity investments" },
      { name: "Fixed Deposits", icon: "🏦", description: "Bank FDs, recurring deposits" },
      { name: "PPF & ELSS", icon: "🎯", description: "Tax-saving investments" },
      { name: "Real Estate", icon: "🏘️", description: "Property investments" },
      { name: "Gold", icon: "✨", description: "Physical gold, gold ETFs" },
      { name: "Crypto", icon: "₿", description: "Bitcoin, other cryptocurrencies" },
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
  const [transactionType, setTransactionType] = useState<"income" | "expense" | "investment">("expense");
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [displayValue, setDisplayValue] = useState("0");
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [showKeypad, setShowKeypad] = useState(false);

  // Load transactions from localStorage on component mount
  useEffect(() => {
    const stored = localStorage.getItem("tracker-transactions");
    if (stored) {
      setTransactions(JSON.parse(stored));
    }
  }, []);

  // Update current date and time
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const date = now.toLocaleDateString("en-GB", { 
        day: "2-digit", 
        month: "2-digit", 
        year: "2-digit",
        weekday: "short"
      });
      const time = now.toLocaleTimeString("en-US", { 
        hour: "numeric", 
        minute: "2-digit",
        hour12: true 
      });
      
      setCurrentDate(date);
      setCurrentTime(time);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Calculator functions
  const handleNumberClick = (num: string) => {
    if (displayValue === "0") {
      setDisplayValue(num);
      setAmount(num);
    } else {
      const newValue = displayValue + num;
      setDisplayValue(newValue);
      setAmount(newValue);
    }
  };

  const handleClear = () => {
    setDisplayValue("0");
    setAmount("");
  };

  const handleBackspace = () => {
    if (displayValue.length > 1) {
      const newValue = displayValue.slice(0, -1);
      setDisplayValue(newValue);
      setAmount(newValue);
    } else {
      setDisplayValue("0");
      setAmount("");
    }
  };

  const handleDecimal = () => {
    if (!displayValue.includes(".")) {
      const newValue = displayValue + ".";
      setDisplayValue(newValue);
      setAmount(newValue);
    }
  };

  // Get filtered categories based on transaction type
  const filteredCategories = allCategories.filter(
    (cat) => cat.type === transactionType
  );

  // Get subcategories for selected main category
  const subCategories =
    filteredCategories.find((cat) => cat.name === selectedMainCategory)
      ?.subcategories || [];

  // Save transaction
  const handleSave = () => {
    if (!selectedMainCategory || !selectedSubCategory || !amount) {
      alert("Please fill all required fields");
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: transactionType,
      mainCategory: selectedMainCategory,
      subCategory: selectedSubCategory,
      amount: parseFloat(amount),
      date: currentDate,
      time: currentTime,
    };

    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    localStorage.setItem("tracker-transactions", JSON.stringify(updatedTransactions));

    // Reset form
    setTransactionType("expense");
    setSelectedMainCategory("");
    setSelectedSubCategory("");
    setDisplayValue("0");
    setAmount("");
    setShowAddDialog(false);
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
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center">
            <div className="text-sm text-muted-foreground">Income</div>
            <div className="text-lg font-bold text-green-500">
              ₹{totalIncome.toLocaleString()}
            </div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-sm text-muted-foreground">Expense</div>
            <div className="text-lg font-bold text-red-500">
              ₹{totalExpense.toLocaleString()}
            </div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-sm text-muted-foreground">Invest</div>
            <div className="text-lg font-bold text-blue-500">
              ₹{totalInvestment.toLocaleString()}
            </div>
          </Card>
        </div>

        {/* Recent Transactions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {transactions.slice(0, 10).map((transaction) => (
              <Card key={transaction.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-12 rounded-full ${
                      transaction.type === "income" ? "bg-green-500" : 
                      transaction.type === "investment" ? "bg-blue-500" : "bg-red-500"
                    }`}></div>
                    <div>
                      <div className="font-medium">{transaction.subCategory}</div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.mainCategory}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {transaction.date} • {transaction.time}
                      </div>
                    </div>
                  </div>
                  <div className={`font-bold text-lg ${
                    transaction.type === "income" ? "text-green-500" : 
                    transaction.type === "investment" ? "text-blue-500" : "text-red-500"
                  }`}>
                    {transaction.type === "income" ? "+" : "-"}₹{transaction.amount.toLocaleString()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Add Transaction Button */}
        <Button
          size="icon"
          className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>

        {/* Add Transaction Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="w-full h-full max-w-none max-h-none m-0 rounded-none border-0 bg-background">
            <DialogHeader className="sr-only">
              <DialogTitle>
                {transactionType === "income" ? "Add Income" :
                 transactionType === "investment" ? "Add Investment" : "Add Expense"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <Button variant="ghost" size="icon" onClick={() => setShowAddDialog(false)}>
                  <ArrowLeft className="h-6 w-6" />
                </Button>
                <h2 className="text-xl font-semibold">
                  {transactionType === "income" ? "Income" :
                   transactionType === "investment" ? "Invest" : "Expense"}
                </h2>
                <div></div>
              </div>

              <div className="flex-1 flex flex-col">
                {/* Type Selection Tabs */}
                <div className="grid grid-cols-3 gap-0 m-4 rounded-lg overflow-hidden border">
                  <Button
                    variant={transactionType === "income" ? "default" : "ghost"}
                    onClick={() => {
                      setTransactionType("income");
                      setSelectedMainCategory("");
                      setSelectedSubCategory("");
                    }}
                    className={`h-12 text-sm font-semibold rounded-none ${
                      transactionType === "income"
                        ? "bg-green-500 text-white border-green-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    Income
                  </Button>
                  <Button
                    variant={transactionType === "expense" ? "default" : "ghost"}
                    onClick={() => {
                      setTransactionType("expense");
                      setSelectedMainCategory("");
                      setSelectedSubCategory("");
                    }}
                    className={`h-12 text-sm font-semibold rounded-none border-x ${
                      transactionType === "expense"
                        ? "bg-red-500 text-white border-red-600"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    Expense
                  </Button>
                  <Button
                    variant={transactionType === "investment" ? "default" : "ghost"}
                    onClick={() => {
                      setTransactionType("investment");
                      setSelectedMainCategory("");
                      setSelectedSubCategory("");
                    }}
                    className={`h-12 text-sm font-semibold rounded-none ${
                      transactionType === "investment"
                        ? "bg-blue-500 text-white border-blue-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    Invest
                  </Button>
                </div>

                {/* Form Fields */}
                <div className="px-4 space-y-6 flex-1">
                  {/* Date and Time */}
                  <div className="space-y-2">
                    <label className="text-base text-muted-foreground">Date</label>
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{currentDate}</span>
                      <span className="text-lg">{currentTime}</span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="space-y-2">
                    <label className="text-base text-muted-foreground">Amount</label>
                    <div
                      className="text-3xl font-bold cursor-pointer py-2"
                      onClick={() => setShowKeypad(true)}
                    >
                      ₹ {displayValue}
                    </div>
                    <div className={`h-px ${
                      transactionType === 'income' ? 'bg-green-500' :
                      transactionType === 'investment' ? 'bg-blue-500' : 'bg-red-500'
                    }`}></div>
                  </div>

                  {/* Category */}
                  <div className="space-y-3">
                    <label className="text-base text-muted-foreground">Category</label>

                    {/* Category List - More Compact */}
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {filteredCategories.map((category) => (
                        <div key={category.id}>
                          <div
                            className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                              selectedMainCategory === category.name
                                ? 'bg-muted border border-primary'
                                : 'bg-muted/20 hover:bg-muted/40'
                            }`}
                            onClick={() => {
                              if (selectedMainCategory === category.name) {
                                setSelectedMainCategory("");
                                setSelectedSubCategory("");
                              } else {
                                setSelectedMainCategory(category.name);
                                setSelectedSubCategory("");
                              }
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base">{category.icon}</span>
                              <span className="text-xs font-medium">{category.name}</span>
                            </div>
                            <svg
                              className={`w-3 h-3 text-muted-foreground transition-transform ${
                                selectedMainCategory === category.name ? 'rotate-90' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>

                          {/* Sub Categories - Compact */}
                          {selectedMainCategory === category.name && (
                            <div className="ml-4 mt-1 space-y-1">
                              {category.subcategories.map((sub, index) => (
                                <div
                                  key={index}
                                  className={`flex items-center gap-2 p-1.5 rounded text-xs cursor-pointer transition-colors ${
                                    selectedSubCategory === sub.name
                                      ? 'bg-primary/20 border border-primary'
                                      : 'hover:bg-muted/20'
                                  }`}
                                  onClick={() => setSelectedSubCategory(sub.name)}
                                >
                                  <span className="text-xs">{sub.icon}</span>
                                  <span className="font-medium">{sub.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className={`h-px ${
                      transactionType === 'income' ? 'bg-green-500' :
                      transactionType === 'investment' ? 'bg-blue-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 grid grid-cols-2 gap-4">
                  <Button
                    onClick={handleSave}
                    className={`h-12 text-white rounded-lg ${
                      transactionType === 'income' ? 'bg-green-500 hover:bg-green-600' :
                      transactionType === 'investment' ? 'bg-blue-500 hover:bg-blue-600' :
                      'bg-red-500 hover:bg-red-600'
                    }`}
                    disabled={!selectedMainCategory || !selectedSubCategory || !amount}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 rounded-lg"
                    onClick={() => setShowAddDialog(false)}
                  >
                    Continue
                  </Button>
                </div>

                {/* Calculator Keypad - Only show when needed */}
                {showKeypad && (
                  <div className="p-4 pb-24 bg-muted/30 border-t">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-muted-foreground">Enter Amount</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowKeypad(false)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <Button onClick={() => handleNumberClick("1")} variant="ghost" className="h-12 text-lg">1</Button>
                      <Button onClick={() => handleNumberClick("2")} variant="ghost" className="h-12 text-lg">2</Button>
                      <Button onClick={() => handleNumberClick("3")} variant="ghost" className="h-12 text-lg">3</Button>
                      <Button onClick={handleBackspace} variant="ghost" className="h-12">
                        <X className="h-5 w-5" />
                      </Button>

                      <Button onClick={() => handleNumberClick("4")} variant="ghost" className="h-12 text-lg">4</Button>
                      <Button onClick={() => handleNumberClick("5")} variant="ghost" className="h-12 text-lg">5</Button>
                      <Button onClick={() => handleNumberClick("6")} variant="ghost" className="h-12 text-lg">6</Button>
                      <Button onClick={handleClear} variant="ghost" className="h-12 text-lg">-</Button>

                      <Button onClick={() => handleNumberClick("7")} variant="ghost" className="h-12 text-lg">7</Button>
                      <Button onClick={() => handleNumberClick("8")} variant="ghost" className="h-12 text-lg">8</Button>
                      <Button onClick={() => handleNumberClick("9")} variant="ghost" className="h-12 text-lg">9</Button>
                      <Button onClick={handleClear} variant="ghost" className="h-12">
                        <Calculator className="h-5 w-5" />
                      </Button>

                      <div></div>
                      <Button onClick={() => handleNumberClick("0")} variant="ghost" className="h-12 text-lg">0</Button>
                      <Button onClick={handleDecimal} variant="ghost" className="h-12 text-lg">.</Button>
                      <Button
                        onClick={() => {
                          setShowKeypad(false);
                        }}
                        className={`h-12 text-white ${
                          transactionType === 'income' ? 'bg-green-500 hover:bg-green-600' :
                          transactionType === 'investment' ? 'bg-blue-500 hover:bg-blue-600' :
                          'bg-red-500 hover:bg-red-600'
                        }`}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </Layout>
  );
}
