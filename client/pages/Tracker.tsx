import { useState } from "react";
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
import { Textarea } from "../components/ui/textarea";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";

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
      { name: "Reimbursements", icon: "🧾" },
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
      { name: "Internet / Broadband", icon: "🌐" },
      { name: "Mobile Bills", icon: "📱" },
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
  
  // Form states
  const [transactionType, setTransactionType] = useState<"income" | "expense">("expense");
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [amount, setAmount] = useState("0");
  const [notes, setNotes] = useState("");

  // Calculator states
  const [displayValue, setDisplayValue] = useState("0");
  const [operation, setOperation] = useState<string | null>(null);
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const filteredCategories = allCategories.filter(cat => cat.type === transactionType);
  const selectedCategory = allCategories.find(cat => cat.name === selectedMainCategory);
  const subCategories = selectedCategory?.subcategories || [];

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // Format month display
  const formatMonth = (date: Date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  // Get current month key for filtering transactions
  const getCurrentMonthKey = () => {
    return `${currentMonth.getFullYear()}-${currentMonth.getMonth()}`;
  };

  // Filter transactions for current month
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth.getMonth() &&
           transactionDate.getFullYear() === currentMonth.getFullYear();
  });

  const totalIncome = currentMonthTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = currentMonthTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const calculate = (firstOperand: string, secondOperand: string, operation: string): string => {
    const first = parseFloat(firstOperand);
    const second = parseFloat(secondOperand);

    switch (operation) {
      case "+":
        return String(first + second);
      case "-":
        return String(first - second);
      case "=":
        return secondOperand;
      default:
        return secondOperand;
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

  const addDecimal = () => {
    if (waitingForOperand) {
      setDisplayValue("0.");
      setWaitingForOperand(false);
    } else if (displayValue.indexOf(".") === -1) {
      setDisplayValue(displayValue + ".");
    }
  };

  const handleSave = () => {
    if (!selectedMainCategory || !selectedSubCategory || parseFloat(displayValue) <= 0) {
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: transactionType,
      mainCategory: selectedMainCategory,
      subCategory: selectedSubCategory,
      amount: parseFloat(displayValue),
      notes,
      date: currentMonth.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      time: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
    };

    setTransactions([...transactions, newTransaction]);
    handleCancel();
  };

  const handleCancel = () => {
    setShowAddDialog(false);
    setTransactionType("expense");
    setSelectedMainCategory("");
    setSelectedSubCategory("");
    setNotes("");
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
              <div className="text-lg font-bold text-green-400">₹{totalIncome.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">EXPENSE</div>
              <div className="text-lg font-bold text-red-400">₹{totalExpense.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">BALANCE</div>
              <div className={`text-lg font-bold ${totalIncome - totalExpense >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ₹{(totalIncome - totalExpense).toLocaleString()}
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Transactions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {currentMonthTransactions.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                No transactions for {formatMonth(currentMonth)}. Click the + button to add your first transaction.
              </Card>
            ) : (
              currentMonthTransactions.slice(-5).reverse().map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))
            )}
          </div>
        </div>

        {/* Add Transaction Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-sm mx-auto bg-card">
            <DialogHeader className="flex flex-row items-center justify-between">
              <Button 
                variant="ghost" 
                onClick={handleCancel}
                className="text-yellow-400 p-0 h-auto font-semibold"
              >
                ✕ CANCEL
              </Button>
              <DialogTitle className="text-center flex-1">Add Transaction</DialogTitle>
              <Button 
                variant="ghost" 
                onClick={handleSave}
                className="text-yellow-400 p-0 h-auto font-semibold"
              >
                ✓ SAVE
              </Button>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              {/* Income/Expense Toggle */}
              <div className="flex justify-center gap-1">
                <Button
                  variant={transactionType === "income" ? "default" : "ghost"}
                  onClick={() => {
                    setTransactionType("income");
                    setSelectedMainCategory("");
                    setSelectedSubCategory("");
                  }}
                  className="text-sm"
                >
                  INCOME
                </Button>
                <Button
                  variant={transactionType === "expense" ? "default" : "ghost"}
                  onClick={() => {
                    setTransactionType("expense");
                    setSelectedMainCategory("");
                    setSelectedSubCategory("");
                  }}
                  className="text-sm"
                >
                  EXPENSE
                </Button>
              </div>

              {/* Category Dropdowns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Main Category</label>
                  <Select value={selectedMainCategory} onValueChange={(value) => {
                    setSelectedMainCategory(value);
                    setSelectedSubCategory("");
                  }}>
                    <SelectTrigger className="bg-muted">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCategories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.icon} {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Sub Category</label>
                  <Select 
                    value={selectedSubCategory} 
                    onValueChange={setSelectedSubCategory}
                    disabled={!selectedMainCategory}
                  >
                    <SelectTrigger className="bg-muted">
                      <SelectValue placeholder="Sub Category" />
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
              </div>

              {/* Notes */}
              <div>
                <Textarea
                  placeholder="Add notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-muted min-h-[80px]"
                />
              </div>

              {/* Calculator Display */}
              <div className="bg-muted rounded-lg p-4 relative">
                <div className="text-right text-2xl font-mono mb-2">
                  {displayValue}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={clearCalculator}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Calculator */}
              <div className="grid grid-cols-4 gap-2">
                <Button
                  variant="secondary"
                  onClick={() => inputOperation("+")}
                  className="h-12 text-lg"
                >
                  +
                </Button>
                <Button
                  variant="outline"
                  onClick={() => inputNumber("7")}
                  className="h-12 text-lg"
                >
                  7
                </Button>
                <Button
                  variant="outline"
                  onClick={() => inputNumber("8")}
                  className="h-12 text-lg"
                >
                  8
                </Button>
                <Button
                  variant="outline"
                  onClick={() => inputNumber("9")}
                  className="h-12 text-lg"
                >
                  9
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => inputOperation("-")}
                  className="h-12 text-lg"
                >
                  -
                </Button>
                <Button
                  variant="outline"
                  onClick={() => inputNumber("4")}
                  className="h-12 text-lg"
                >
                  4
                </Button>
                <Button
                  variant="outline"
                  onClick={() => inputNumber("5")}
                  className="h-12 text-lg"
                >
                  5
                </Button>
                <Button
                  variant="outline"
                  onClick={() => inputNumber("6")}
                  className="h-12 text-lg"
                >
                  6
                </Button>

                <Button
                  variant="ghost"
                  className="h-12 text-lg text-muted-foreground"
                  disabled
                >
                  ×
                </Button>
                <Button
                  variant="outline"
                  onClick={() => inputNumber("1")}
                  className="h-12 text-lg"
                >
                  1
                </Button>
                <Button
                  variant="outline"
                  onClick={() => inputNumber("2")}
                  className="h-12 text-lg"
                >
                  2
                </Button>
                <Button
                  variant="outline"
                  onClick={() => inputNumber("3")}
                  className="h-12 text-lg"
                >
                  3
                </Button>

                <Button
                  variant="ghost"
                  className="h-12 text-lg text-muted-foreground"
                  disabled
                >
                  ÷
                </Button>
                <Button
                  variant="outline"
                  onClick={() => inputNumber("0")}
                  className="h-12 text-lg"
                >
                  0
                </Button>
                <Button
                  variant="outline"
                  onClick={addDecimal}
                  className="h-12 text-lg"
                >
                  .
                </Button>
                <Button
                  variant="default"
                  onClick={inputEquals}
                  className="h-12 text-lg bg-yellow-600 hover:bg-yellow-700"
                >
                  =
                </Button>
              </div>

              {/* Date/Time */}
              <div className="text-center text-sm text-muted-foreground border-t pt-4">
                {formatMonth(currentMonth)} | {new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
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
  const category = allCategories.find(cat => cat.name === transaction.mainCategory);
  const subCategory = category?.subcategories.find(sub => sub.name === transaction.subCategory);

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
              <div className="text-xs text-muted-foreground">{transaction.notes}</div>
            )}
            <div className="text-xs text-muted-foreground">
              {transaction.date} • {transaction.time}
            </div>
          </div>
        </div>
        <div
          className={`font-semibold ${transaction.type === "income" ? "text-green-400" : "text-red-400"}`}
        >
          {transaction.type === "income" ? "+" : "-"}₹{transaction.amount.toLocaleString()}
        </div>
      </div>
    </Card>
  );
}
