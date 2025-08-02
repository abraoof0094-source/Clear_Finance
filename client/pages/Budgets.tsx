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
  const [currentMonth, setCurrentMonth] = useState("August, 2025");
  const [showSetBudgetDialog, setShowSetBudgetDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgets, setBudgets] = useState<Record<string, number>>({});

  // Calculate total budget
  const totalBudget = Object.values(budgets).reduce((sum, amount) => sum + amount, 0);

  // Calculate budget sum for a main category
  const getCategoryBudgetSum = (category: any) => {
    return category.subcategories.reduce((sum: number, subcategory: any) => {
      return sum + (budgets[subcategory.name] || 0);
    }, 0);
  };

  const handleSetBudget = (subcategory: any) => {
    setSelectedCategory(subcategory);
    setBudgetAmount("");
    setShowSetBudgetDialog(true);
  };

  const handleSaveBudget = () => {
    if (selectedCategory && budgetAmount) {
      const key = selectedCategory.name;
      setBudgets(prev => ({
        ...prev,
        [key]: parseFloat(budgetAmount) || 0
      }));
      setShowSetBudgetDialog(false);
      setBudgetAmount("");
      setSelectedCategory(null);
    }
  };

  const handleCopyFromPreviousMonth = () => {
    // This would copy budgets from previous month
    // For now, let's simulate by setting some example budgets
    setBudgets({
      "Rent / Home Loan EMI": 25000,
      "Groceries & Daily Essentials": 8000,
      "Food & Dining": 5000,
      "Travel & Commute": 3000,
      "Health Insurance": 2000,
    });
  };

  const getBudgetForCategory = (categoryName: string) => {
    return budgets[categoryName] || 0;
  };

  return (
    <Layout>
      <div className="space-y-6 py-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">{currentMonth}</h2>
          <Button variant="ghost" size="icon">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Budget Summary */}
        <Card className="p-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground">Total Budget</div>
              <div className="text-xl font-bold">₹{totalBudget.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Spent</div>
              <div className="text-xl font-bold text-red-400">₹0.00</div>
            </div>
          </div>
        </Card>

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
                    {getCategoryBudgetSum(category) > 0 && (
                      <div className="text-sm font-medium text-primary">
                        Total: ₹{getCategoryBudgetSum(category).toLocaleString()}
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
                          {budget > 0 ? "EDIT" : "SET BUDGET"}
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
          onClick={handleCopyFromPreviousMonth}
        >
          <Copy className="h-4 w-4" />
          COPY FROM PREVIOUS MONTH
        </Button>
      </div>

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
                CANCEL
              </Button>
              <Button onClick={handleSaveBudget}>
                SAVE BUDGET
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
