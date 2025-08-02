import { useState } from "react";
import { Layout } from "../components/Layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ChevronLeft, ChevronRight, Copy } from "lucide-react";

// Import the same categories from Categories screen (only expense categories for budgets)
const expenseCategories = [
  {
    id: 2,
    name: "Fixed Household Expenses",
    icon: "🏠",
    subcategories: [
      { name: "Rent / Home Loan EMI", icon: "🏡" },
      { name: "Utilities", icon: "⚡" },
      { name: "Internet / Broadband", icon: "🌐" },
      { name: "Mobile Bills", icon: "📱" },
      { name: "DTH / OTT Subscriptions", icon: "📺" },
      { name: "Groceries & Daily Essentials", icon: "🛒" },
    ]
  },
  {
    id: 3,
    name: "Family & Personal Living",
    icon: "👨‍👩‍👧‍👦",
    subcategories: [
      { name: "Food & Dining", icon: "🍽️" },
      { name: "Travel & Commute", icon: "🚗" },
      { name: "Medical / Healthcare", icon: "⚕️" },
      { name: "Fitness / Gym / Swimming", icon: "💪" },
      { name: "Shopping & Clothing", icon: "👕" },
      { name: "Electronics & Gadgets", icon: "📱" },
    ]
  },
  {
    id: 4,
    name: "Insurance",
    icon: "🛡️",
    subcategories: [
      { name: "Term Insurance", icon: "📋" },
      { name: "Health Insurance", icon: "❤️" },
      { name: "Vehicle Insurance", icon: "🚗" },
    ]
  },
  {
    id: 5,
    name: "Investments",
    icon: "📈",
    subcategories: [
      { name: "Mutual Funds (SIP)", icon: "📊" },
      { name: "Stocks / ETFs", icon: "📈" },
      { name: "PPF / EPF / VPF", icon: "🏛️" },
    ]
  },
  {
    id: 6,
    name: "Loans & EMI Payments",
    icon: "💳",
    subcategories: [
      { name: "Home Loan", icon: "🏠" },
      { name: "Car Loan", icon: "🚗" },
      { name: "Credit Card Bill", icon: "💳" },
    ]
  },
  {
    id: 7,
    name: "Lifestyle & Discretionary",
    icon: "🎪",
    subcategories: [
      { name: "Weekend Getaways", icon: "🏔️" },
      { name: "Events / Concerts", icon: "🎵" },
      { name: "Gaming / Indoor Entertainment", icon: "🎮" },
    ]
  },
];

export function Budgets() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 7)); // August 2025
  const [showSetBudgetDialog, setShowSetBudgetDialog] = useState(false);
  const [showCopyBudgetDialog, setShowCopyBudgetDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgets, setBudgets] = useState<Record<string, Record<string, number>>>({});
  const [copyFromMonth, setCopyFromMonth] = useState(new Date(2025, 6)); // July 2025 as default

  // Get current month key
  const getCurrentMonthKey = () => {
    return `${currentMonth.getFullYear()}-${currentMonth.getMonth()}`;
  };

  // Get current month's budgets
  const getCurrentMonthBudgets = () => {
    return budgets[getCurrentMonthKey()] || {};
  };

  // Calculate total budget for current month
  const totalBudget = Object.values(getCurrentMonthBudgets()).reduce((sum, amount) => sum + amount, 0);

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

  // Navigate copy dialog months
  const goToPreviousCopyMonth = () => {
    setCopyFromMonth(new Date(copyFromMonth.getFullYear(), copyFromMonth.getMonth() - 1));
  };

  const goToNextCopyMonth = () => {
    const nextMonth = new Date(copyFromMonth.getFullYear(), copyFromMonth.getMonth() + 1);
    // Don't allow copying from current month or future months
    if (nextMonth < currentMonth) {
      setCopyFromMonth(nextMonth);
    }
  };

  // Check if copy month has budgets
  const getCopyMonthKey = () => {
    return `${copyFromMonth.getFullYear()}-${copyFromMonth.getMonth()}`;
  };

  const copyMonthHasBudgets = () => {
    const copyBudgets = budgets[getCopyMonthKey()];
    return copyBudgets && Object.keys(copyBudgets).length > 0;
  };

  // Calculate allocated budget for a main category
  const getCategoryAllocatedBudget = (category: any) => {
    const currentBudgets = getCurrentMonthBudgets();
    return category.subcategories.reduce((sum: number, subcategory: any) => {
      return sum + (currentBudgets[subcategory.name] || 0);
    }, 0);
  };

  const handleSetBudget = (category: any, subcategory: any) => {
    setSelectedCategory(subcategory);
    setBudgetAmount("");
    setShowSetBudgetDialog(true);
  };

  const handleSaveBudget = () => {
    if (selectedCategory && budgetAmount) {
      const monthKey = getCurrentMonthKey();
      const categoryName = selectedCategory.name;
      setBudgets(prev => ({
        ...prev,
        [monthKey]: {
          ...prev[monthKey],
          [categoryName]: parseFloat(budgetAmount) || 0
        }
      }));
      setShowSetBudgetDialog(false);
      setBudgetAmount("");
      setSelectedCategory(null);
    }
  };

  const handleOpenCopyDialog = () => {
    // Set copy month to previous month by default
    setCopyFromMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    setShowCopyBudgetDialog(true);
  };

  const handleCopyBudgets = () => {
    const currentMonthKey = getCurrentMonthKey();
    const copyMonthKey = getCopyMonthKey();

    if (budgets[copyMonthKey]) {
      setBudgets(prev => ({
        ...prev,
        [currentMonthKey]: { ...budgets[copyMonthKey] }
      }));
    }
    setShowCopyBudgetDialog(false);
  };

  const getBudgetForCategory = (categoryName: string) => {
    const currentBudgets = getCurrentMonthBudgets();
    return currentBudgets[categoryName] || 0;
  };

  return (
    <Layout>
      <div className="space-y-6 py-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold">{formatMonth(currentMonth)}</h2>
          <Button variant="ghost" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* No Budget Notification */}
        {totalBudget === 0 && (
          <Card className="p-4 mb-4 bg-muted/50 border-primary/20">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                No budgets set for {formatMonth(currentMonth)}
              </p>
              <p className="text-xs text-muted-foreground">
                Set budgets for subcategories to start planning your monthly expenses
              </p>
            </div>
          </Card>
        )}

        {/* Budget Categories */}
        <div className="space-y-4">
          {expenseCategories.map((category) => (
            <div key={category.id}>
              {/* Main Category */}
              <Card className="p-4 mb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-lg">
                      {category.icon}
                    </div>
                    <div>
                      <span className="font-medium">{category.name}</span>
                      <div className="text-sm text-muted-foreground">
                        {category.subcategories.length} subcategories
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {getCategoryAllocatedBudget(category) > 0 && (
                      <div className="text-sm font-medium text-primary">
                        Allocated: ₹{getCategoryAllocatedBudget(category).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Subcategories */}
              <div className="space-y-2 ml-4">
                {category.subcategories.map((subcategory, index) => {
                  const budget = getBudgetForCategory(subcategory.name);
                  return (
                    <Card key={index} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm">
                            {subcategory.icon}
                          </div>
                          <div>
                            <span className="font-medium text-sm">{subcategory.name}</span>
                            {budget > 0 && (
                              <div className="text-xs text-primary">Budget: ₹{budget.toLocaleString()}</div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetBudget(category, subcategory)}
                        >
                          {budget > 0 ? "Edit" : "Set Budget"}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Copy from Previous Month Button */}
        <Button
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={handleOpenCopyDialog}
        >
          <Copy className="h-4 w-4" />
          Copy from Previous Month
        </Button>
      </div>

      {/* Copy Budget Dialog */}
      <Dialog open={showCopyBudgetDialog} onOpenChange={setShowCopyBudgetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Copy budget</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Month: {formatMonth(currentMonth)}</div>
            </div>

            <div>
              <div className="text-center text-sm mb-4">
                Select a previous month you want to copy from:
              </div>

              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPreviousCopyMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-lg font-medium">{formatMonth(copyFromMonth)}</div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNextCopyMonth}
                  disabled={new Date(copyFromMonth.getFullYear(), copyFromMonth.getMonth() + 1) >= currentMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Budget Status */}
              <div className="min-h-[120px] border-2 border-dashed border-border rounded-lg flex items-center justify-center p-6">
                {copyMonthHasBudgets() ? (
                  <div className="text-center">
                    <div className="text-2xl mb-2">💰</div>
                    <div className="text-sm text-primary font-medium">
                      Budget data available
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-2xl mb-2">📊</div>
                    <div className="text-sm text-muted-foreground">
                      No budget applied in this month.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Warning */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="text-muted-foreground text-sm">ℹ️</div>
                <div className="text-xs text-muted-foreground">
                  Copying will overwrite all previously applied budget-limits for this month.
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCopyBudgetDialog(false)}>
                Close
              </Button>
              <Button
                onClick={handleCopyBudgets}
                disabled={!copyMonthHasBudgets()}
              >
                Copy All
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Set Budget Dialog */}
      <Dialog open={showSetBudgetDialog} onOpenChange={setShowSetBudgetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Budget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-lg font-medium">{selectedCategory?.name}</div>
              <div className="text-sm text-muted-foreground">Monthly Budget</div>
            </div>
            
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                placeholder="Enter budget amount"
                className="text-center text-lg"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowSetBudgetDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveBudget}>
                Save Budget
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
