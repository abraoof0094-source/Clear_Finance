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
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Plus, ChevronDown, ChevronRight, Edit, Trash2, Calculator, IndianRupee } from "lucide-react";
import { phoneStorage } from "../utils/phoneStorage";

// All Categories (Income + Expense combined)
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
        icon: "📈",
        description: "Performance bonus, annual bonus",
      },
      {
        name: "Reimbursements",
        icon: "🧾",
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
      { name: "Others", icon: "🎯", description: "ESOPs, stock sales" },
    ],
  },
  {
    id: 2,
    name: "Fixed Household Expenses",
    icon: "🏠",
    type: "expense" as const,
    subcategories: [
      {
        name: "Rent / Home Loan EMI",
        icon: "🏡",
        description: "Apartment rent or housing EMI",
      },
      {
        name: "Maintenance / Society Charges",
        icon: "🏢",
        description: "Gated community maintenance fees",
      },
      { name: "Utilities", icon: "⚡", description: "Electricity, water, gas" },
      {
        name: "Internet / Broadband",
        icon: "🌐",
        description: "JioFiber, Airtel, ACT",
      },
      { name: "Mobile Bills", icon: "📱", description: "Jio, Airtel postpaid" },
      {
        name: "DTH / OTT Subscriptions",
        icon: "📺",
        description: "Netflix, Amazon, Hotstar",
      },
      {
        name: "Groceries & Daily Essentials",
        icon: "🛒",
        description: "BigBasket, local supermarket",
      },
      {
        name: "House Help / Cook / Maid",
        icon: "👩‍🍳",
        description: "Monthly salaries",
      },
      {
        name: "Child Care / Nanny",
        icon: "👶",
        description: "Play school, babysitter fees",
      },
    ],
  },
  {
    id: 3,
    name: "Family & Personal Living",
    icon: "👨‍👩‍👧‍👦",
    type: "expense" as const,
    subcategories: [
      {
        name: "Food & Dining",
        icon: "🍽️",
        description: "Restaurants, weekend dinners, Swiggy/Zomato",
      },
      {
        name: "Weekend Chills / Drinks",
        icon: "🍻",
        description: "Pubs, bars, liquor store purchases",
      },
      {
        name: "Travel & Commute",
        icon: "🚗",
        description: "Uber/Ola, metro, fuel, tolls",
      },
      {
        name: "Medical / Healthcare",
        icon: "⚕️",
        description: "Doctor visits, medicines",
      },
      {
        name: "Fitness / Gym / Swimming",
        icon: "💪",
        description: "Gym memberships, fitness classes",
      },
      {
        name: "Indoor Play / Recreation",
        icon: "🎳",
        description: "Bowling, escape rooms, indoor parks",
      },
      {
        name: "Shopping & Clothing",
        icon: "👕",
        description: "Malls, Myntra, Amazon",
      },
      {
        name: "Electronics & Gadgets",
        icon: "📱",
        description: "Phones, laptops, smartwatches",
      },
      {
        name: "Education / Courses",
        icon: "📚",
        description: "Online certifications, skill upgrades",
      },
      {
        name: "Kids' Education",
        icon: "🎓",
        description: "School fees, tuition, activities",
      },
      { name: "Pets", icon: "🐕", description: "Food, vet visits, grooming" },
    ],
  },
  {
    id: 4,
    name: "Insurance",
    icon: "🛡️",
    type: "expense" as const,
    subcategories: [
      {
        name: "Term Insurance",
        icon: "📋",
        description: "₹5–7.5 Cr cover, 10-year premium",
      },
      {
        name: "Health Insurance",
        icon: "❤️",
        description: "Family floater policy",
      },
      { name: "Vehicle Insurance", icon: "🚗", description: "Bike, car" },
      {
        name: "Gadget Insurance",
        icon: "📱",
        description: "Mobile/laptop protection",
      },
      {
        name: "Accidental / Disability Cover",
        icon: "🏥",
        description: "Standalone rider or add-on",
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
        name: "Mutual Funds (SIP)",
        icon: "📊",
        description: "Equity, hybrid, index funds",
      },
      {
        name: "Mutual Funds (Lumpsum)",
        icon: "💹",
        description: "Opportunistic investing",
      },
      {
        name: "Stocks / ETFs",
        icon: "📈",
        description: "Direct equity, MSCI World, REITs",
      },
      {
        name: "PPF / EPF / VPF",
        icon: "🏛️",
        description: "Provident fund contributions",
      },
      { name: "NPS", icon: "👴", description: "Retirement-focused" },
      { name: "FD / RD", icon: "🏪", description: "Bank fixed deposits" },
      {
        name: "Gold",
        icon: "🥇",
        description: "Gold ETFs, sovereign gold bonds",
      },
      {
        name: "Crypto / Alternative Assets",
        icon: "₿",
        description: "Bitcoin, US stocks (optional)",
      },
      {
        name: "Real Estate Investment",
        icon: "🏘️",
        description: "Plot, apartment",
      },
      {
        name: "Children's Education Fund",
        icon: "🎓",
        description: "Separate mutual fund or FD",
      },
    ],
  },
  {
    id: 6,
    name: "Loans & EMI Payments",
    icon: "💳",
    type: "expense" as const,
    subcategories: [
      { name: "Home Loan", icon: "🏠", description: "Bank EMI" },
      { name: "Car Loan", icon: "🚗", description: "EMI for sedan/SUV" },
      { name: "Bike Loan", icon: "🏍️", description: "EMI for two-wheeler" },
      {
        name: "Personal Loan",
        icon: "💰",
        description: "For gadgets or emergencies",
      },
      {
        name: "Credit Card Bill",
        icon: "💳",
        description: "Monthly repayment",
      },
      {
        name: "Consumer Durable Loan",
        icon: "📺",
        description: "TVs, washing machines",
      },
    ],
  },
  {
    id: 7,
    name: "Lifestyle & Discretionary",
    icon: "🎪",
    type: "expense" as const,
    subcategories: [
      {
        name: "Weekend Getaways",
        icon: "🏔️",
        description: "Coorg, Ooty, Goa trips",
      },
      {
        name: "Vacations / Travel Abroad",
        icon: "✈️",
        description: "Family holidays",
      },
      {
        name: "Social Gatherings / Parties",
        icon: "🎉",
        description: "Clubbing, friends' dinners",
      },
      {
        name: "Events / Concerts",
        icon: "🎵",
        description: "Music shows, IPL matches",
      },
      { name: "Hobbies", icon: "📸", description: "Photography, art supplies" },
      {
        name: "Gaming / Indoor Entertainment",
        icon: "🎮",
        description: "PlayStation, VR sets",
      },
      {
        name: "Luxury Purchases",
        icon: "💎",
        description: "Watches, designer clothes",
      },
    ],
  },
  {
    id: 8,
    name: "Savings & Emergency Funds",
    icon: "🏦",
    type: "expense" as const,
    subcategories: [
      {
        name: "Emergency Fund",
        icon: "🚨",
        description: "6–12 months' expenses",
      },
      {
        name: "Opportunity Fund",
        icon: "💡",
        description: "For sudden investments",
      },
      {
        name: "Short-Term Goals",
        icon: "🎯",
        description: "New gadget, vacation",
      },
      {
        name: "Child Education Lumpsum",
        icon: "🎓",
        description: "Dedicated savings",
      },
    ],
  },
  {
    id: 9,
    name: "Miscellaneous / One-Time",
    icon: "📦",
    type: "expense" as const,
    subcategories: [
      {
        name: "Festivals / Gifts",
        icon: "🎁",
        description: "Diwali, weddings",
      },
      {
        name: "Charity / Donations",
        icon: "❤️",
        description: "80G deductions",
      },
      {
        name: "Home Interiors / Furnishing",
        icon: "🛋️",
        description: "Sofa, modular kitchen",
      },
      {
        name: "Vehicle Maintenance",
        icon: "🔧",
        description: "Servicing, accessories",
      },
      {
        name: "Household Appliances",
        icon: "❄️",
        description: "AC, fridge upgrades",
      },
      {
        name: "Memberships",
        icon: "🏃",
        description: "Clubs, co-working spaces",
      },
    ],
  },
];

export function Categories() {
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set(),
  );
  const [openMenus, setOpenMenus] = useState<Set<number>>(new Set());
  const [showAddMainDialog, setShowAddMainDialog] = useState(false);
  const [showEditMainDialog, setShowEditMainDialog] = useState(false);
  const [showDeleteMainDialog, setShowDeleteMainDialog] = useState(false);
  const [showAddSubDialog, setShowAddSubDialog] = useState(false);
  const [showEditSubDialog, setShowEditSubDialog] = useState(false);
  const [showDeleteSubDialog, setShowDeleteSubDialog] = useState(false);
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);

  const [selectedMainCategory, setSelectedMainCategory] = useState<any>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<any>(null);
  const [activeMainCategoryId, setActiveMainCategoryId] = useState<
    number | null
  >(null);

  const [newCategoryName, setNewCategoryName] = useState("Untitled");
  const [selectedIcon, setSelectedIcon] = useState("🏷️");
  const [categoryType, setCategoryType] = useState<
    "income" | "expense" | "investment"
  >("expense");

  // Budget state
  const [budgets, setBudgets] = useState<Record<string, Record<string, number>>>({});
  const [budgetAmount, setBudgetAmount] = useState("");
  const [selectedBudgetSubcategory, setSelectedBudgetSubcategory] = useState<string>("");

  // Helper to get current month key
  const getCurrentMonthKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}`;
  };

  // Load budgets on component mount
  useEffect(() => {
    const loadedBudgets = phoneStorage.loadBudgets();
    setBudgets(loadedBudgets);
  }, []);

  // Save budgets when state changes
  useEffect(() => {
    phoneStorage.saveBudgets(budgets);
  }, [budgets]);

  // Get budget for a subcategory
  const getBudget = (subcategoryName: string) => {
    const monthKey = getCurrentMonthKey();
    return budgets[monthKey]?.[subcategoryName] || 0;
  };

  // Handle budget operations
  const handleSetBudget = (subcategoryName: string) => {
    setSelectedBudgetSubcategory(subcategoryName);
    const currentBudget = getBudget(subcategoryName);
    setBudgetAmount(currentBudget > 0 ? currentBudget.toString() : "");
    setShowBudgetDialog(true);
  };

  const handleSaveBudget = () => {
    if (selectedBudgetSubcategory && budgetAmount) {
      const monthKey = getCurrentMonthKey();
      const amount = parseFloat(budgetAmount) || 0;
      
      setBudgets(prev => ({
        ...prev,
        [monthKey]: {
          ...prev[monthKey],
          [selectedBudgetSubcategory]: amount
        }
      }));
    }
    setShowBudgetDialog(false);
    setBudgetAmount("");
    setSelectedBudgetSubcategory("");
  };

  const handleRemoveBudget = (subcategoryName: string) => {
    const monthKey = getCurrentMonthKey();
    setBudgets(prev => {
      const newBudgets = { ...prev };
      if (newBudgets[monthKey]) {
        delete newBudgets[monthKey][subcategoryName];
        if (Object.keys(newBudgets[monthKey]).length === 0) {
          delete newBudgets[monthKey];
        }
      }
      return newBudgets;
    });
  };

  const availableIcons = [
    "💰",
    "🏠",
    "🍽️",
    "🚗",
    "📱",
    "❤️",
    "🎓",
    "🛒",
    "🎯",
    "📊",
    "💳",
    "🛡️",
    "📈",
    "🎪",
    "🏦",
    "📦",
  ];

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside any menu
      const target = event.target as Element;
      if (!target.closest(".menu-container")) {
        setOpenMenus(new Set());
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleMenu = (categoryId: number) => {
    const newOpenMenus = new Set<number>();
    if (!openMenus.has(categoryId)) {
      newOpenMenus.add(categoryId);
    }
    setOpenMenus(newOpenMenus);
  };

  const handleEditMainCategory = (category: any) => {
    setSelectedMainCategory(category);
    setNewCategoryName(category.name);
    setSelectedIcon(category.icon);
    setCategoryType(category.type);
    setShowEditMainDialog(true);
  };

  const handleDeleteMainCategory = (category: any) => {
    setSelectedMainCategory(category);
    setShowDeleteMainDialog(true);
  };

  const handleAddSubcategory = (mainCategoryId: number) => {
    setActiveMainCategoryId(mainCategoryId);
    setNewCategoryName("");
    setSelectedIcon("🏷️");
    setShowAddSubDialog(true);
  };

  const handleEditSubcategory = (subcategory: any) => {
    setSelectedSubcategory(subcategory);
    setNewCategoryName(subcategory.name);
    setSelectedIcon(subcategory.icon);
    setShowEditSubDialog(true);
  };

  const handleDeleteSubcategory = (subcategory: any) => {
    setSelectedSubcategory(subcategory);
    setShowDeleteSubDialog(true);
  };

  return (
    <Layout>
      <div className="space-y-6 py-4">
        {/* All Categories */}
        <div>
          <h3 className="text-lg font-semibold text-yellow-500 mb-4">
            All Categories
          </h3>
          <div className="space-y-3">
            {allCategories.map((category) => (
              <div key={category.id}>
                <ExpandableCategoryItem
                  category={category}
                  isExpanded={expandedCategories.has(category.id)}
                  isMenuOpen={openMenus.has(category.id)}
                  onToggle={() => toggleCategory(category.id)}
                  onToggleMenu={() => toggleMenu(category.id)}
                  onEditMain={() => handleEditMainCategory(category)}
                  onDeleteMain={() => handleDeleteMainCategory(category)}
                  onAddSubcategory={() => handleAddSubcategory(category.id)}
                  onEditSubcategory={handleEditSubcategory}
                  onDeleteSubcategory={handleDeleteSubcategory}
                  onSetBudget={handleSetBudget}
                  onRemoveBudget={handleRemoveBudget}
                  getBudget={getBudget}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Floating Add Button */}
        <Button
          size="icon"
          className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg"
          onClick={() => setShowAddMainDialog(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* All Dialogs */}
      {/* Add Main Category Dialog */}
      <Dialog open={showAddMainDialog} onOpenChange={setShowAddMainDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add new main category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Label>Type:</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="income"
                    checked={categoryType === "income"}
                    onChange={(e) =>
                      setCategoryType(e.target.value as "income")
                    }
                  />
                  INCOME
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="expense"
                    checked={categoryType === "expense"}
                    onChange={(e) =>
                      setCategoryType(e.target.value as "expense")
                    }
                  />
                  ✓ EXPENSE
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="investment"
                    checked={categoryType === "investment"}
                    onChange={(e) =>
                      setCategoryType(e.target.value as "investment")
                    }
                  />
                  📈 INVESTMENT
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-6 gap-2">
                {availableIcons.map((icon) => (
                  <Button
                    key={icon}
                    variant={selectedIcon === icon ? "default" : "outline"}
                    size="icon"
                    onClick={() => setSelectedIcon(icon)}
                  >
                    {icon}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddMainDialog(false)}
              >
                CANCEL
              </Button>
              <Button onClick={() => setShowAddMainDialog(false)}>SAVE</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Set Budget Dialog */}
      <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Budget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="p-3 bg-muted rounded-md">
                <span className="font-medium">{selectedBudgetSubcategory}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Monthly Budget Amount (₹)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="0"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowBudgetDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveBudget} disabled={!budgetAmount}>
                {getBudget(selectedBudgetSubcategory) > 0 ? "Update Budget" : "Set Budget"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

interface ExpandableCategoryItemProps {
  category: {
    id: number;
    name: string;
    icon: string;
    type: "income" | "expense" | "investment";
    subcategories: any[];
  };
  isExpanded: boolean;
  isMenuOpen: boolean;
  onToggle: () => void;
  onToggleMenu: () => void;
  onEditMain: () => void;
  onDeleteMain: () => void;
  onAddSubcategory: () => void;
  onEditSubcategory: (subcategory: any) => void;
  onDeleteSubcategory: (subcategory: any) => void;
  onSetBudget: (subcategoryName: string) => void;
  onRemoveBudget: (subcategoryName: string) => void;
  getBudget: (subcategoryName: string) => number;
}

function ExpandableCategoryItem({
  category,
  isExpanded,
  isMenuOpen,
  onToggle,
  onToggleMenu,
  onEditMain,
  onDeleteMain,
  onAddSubcategory,
  onEditSubcategory,
  onDeleteSubcategory,
  onSetBudget,
  onRemoveBudget,
  getBudget,
}: ExpandableCategoryItemProps) {
  return (
    <Card className="relative">
      {/* Main Category Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer flex-1"
            onClick={onToggle}
          >
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-lg">
              {category.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{category.name}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    category.type === "income"
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : category.type === "investment"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  }`}
                >
                  {category.type.toUpperCase()}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {category.subcategories.length} subcategories
              </div>
            </div>
            <div className="transition-transform duration-200">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Main Category Menu */}
          <div className="relative ml-2 menu-container">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-muted"
              onClick={(e) => {
                e.stopPropagation();
                onToggleMenu();
              }}
            >
              <span className="text-foreground font-bold text-lg">⋯</span>
            </Button>
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-md shadow-lg z-50 py-1 min-w-[120px]">
                <button
                  className="w-full text-left px-3 py-2 hover:bg-muted text-sm flex items-center gap-2"
                  onClick={() => {
                    onEditMain();
                    onToggleMenu();
                  }}
                >
                  <Edit className="h-3 w-3" />
                  Edit Category
                </button>
                <button
                  className="w-full text-left px-3 py-2 hover:bg-muted text-sm flex items-center gap-2 text-red-600"
                  onClick={() => {
                    onDeleteMain();
                    onToggleMenu();
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                  Delete Category
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subcategories - Expandable */}
      {isExpanded && (
        <div className="border-t border-border bg-muted/20">
          <div className="space-y-1 p-2">
            {category.subcategories.map((subcategory, index) => (
              <SubcategoryItem
                key={index}
                subcategory={subcategory}
                onEdit={onEditSubcategory}
                onDelete={onDeleteSubcategory}
                onSetBudget={onSetBudget}
                onRemoveBudget={onRemoveBudget}
                budget={getBudget(subcategory.name)}
              />
            ))}

            {/* Add Subcategory Button */}
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={onAddSubcategory}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add subcategory
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

interface SubcategoryItemProps {
  subcategory: { name: string; icon: string; description: string };
  onEdit: (subcategory: any) => void;
  onDelete: (subcategory: any) => void;
  onSetBudget: (subcategoryName: string) => void;
  onRemoveBudget: (subcategoryName: string) => void;
  budget: number;
}

function SubcategoryItem({
  subcategory,
  onEdit,
  onDelete,
  onSetBudget,
  onRemoveBudget,
  budget,
}: SubcategoryItemProps) {
  const [showMenu, setShowMenu] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".submenu-container")) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showMenu]);

  return (
    <div className="bg-background rounded-md p-3 relative ml-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm">
            {subcategory.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{subcategory.name}</span>
              {budget > 0 && (
                <Badge variant="outline" className="text-xs border-blue-500/20 text-blue-400">
                  ₹{budget.toLocaleString()}
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {subcategory.description}
            </div>
          </div>
        </div>
        <div className="relative submenu-container">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMenu(!showMenu)}
          >
            <span className="text-muted-foreground">⋯</span>
          </Button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-md shadow-lg z-50 py-1 min-w-[140px]">
              <button
                className="w-full text-left px-3 py-2 hover:bg-muted text-sm flex items-center gap-2"
                onClick={() => {
                  onEdit(subcategory);
                  setShowMenu(false);
                }}
              >
                <Edit className="h-3 w-3" />
                Edit
              </button>
              
              {budget > 0 ? (
                <>
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-muted text-sm flex items-center gap-2 text-blue-600"
                    onClick={() => {
                      onSetBudget(subcategory.name);
                      setShowMenu(false);
                    }}
                  >
                    <Calculator className="h-3 w-3" />
                    Edit Budget
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-muted text-sm flex items-center gap-2 text-orange-600"
                    onClick={() => {
                      onRemoveBudget(subcategory.name);
                      setShowMenu(false);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                    Remove Budget
                  </button>
                </>
              ) : (
                <button
                  className="w-full text-left px-3 py-2 hover:bg-muted text-sm flex items-center gap-2 text-green-600"
                  onClick={() => {
                    onSetBudget(subcategory.name);
                    setShowMenu(false);
                  }}
                >
                  <Calculator className="h-3 w-3" />
                  Set Budget
                </button>
              )}
              
              <div className="border-t border-border my-1"></div>
              <button
                className="w-full text-left px-3 py-2 hover:bg-muted text-sm flex items-center gap-2 text-red-600"
                onClick={() => {
                  onDelete(subcategory);
                  setShowMenu(false);
                }}
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
