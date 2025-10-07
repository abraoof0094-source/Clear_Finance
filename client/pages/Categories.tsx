import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  Calculator,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { phoneStorage } from "../utils/phoneStorage";

import allCategories from "../data/categories";

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

  const [categories, setCategories] = useState(() => allCategories);

  const [newCategoryName, setNewCategoryName] = useState("Untitled");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("🏷️");
  const [categoryType, setCategoryType] = useState<
    "income" | "expense" | "investment"
  >("expense");

  // Budget state
  const [budgets, setBudgets] = useState<
    Record<string, Record<string, number>>
  >({});
  const [budgetAmount, setBudgetAmount] = useState("");
  const [selectedBudgetSubcategory, setSelectedBudgetSubcategory] =
    useState<string>("");

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

      setBudgets((prev) => ({
        ...prev,
        [monthKey]: {
          ...prev[monthKey],
          [selectedBudgetSubcategory]: amount,
        },
      }));
    }
    setShowBudgetDialog(false);
    setBudgetAmount("");
    setSelectedBudgetSubcategory("");
  };

  const handleRemoveBudget = (subcategoryName: string) => {
    const monthKey = getCurrentMonthKey();
    setBudgets((prev) => {
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
    "🏡",
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
    console.log(
      "toggleMenu called for categoryId:",
      categoryId,
      "current openMenus:",
      openMenus,
    );
    setOpenMenus((prev) => {
      const newOpenMenus = new Set();
      if (!prev.has(categoryId)) {
        newOpenMenus.add(categoryId);
        console.log("Opening menu for:", categoryId);
      } else {
        console.log("Closing menu for:", categoryId);
      }
      return newOpenMenus;
    });
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
    setNewCategoryDescription("");
    setSelectedIcon("🏷️");
    setShowAddSubDialog(true);
  };

  const handleEditSubcategory = (subcategory: any) => {
    setSelectedSubcategory(subcategory);
    setNewCategoryName(subcategory.name);
    setNewCategoryDescription(subcategory.description || "");
    setSelectedIcon(subcategory.icon);
    setActiveMainCategoryId((subcategory && subcategory.parentId) || null);
    setShowEditSubDialog(true);
  };

  const handleDeleteSubcategory = (subcategory: any) => {
    setSelectedSubcategory(subcategory);
    setShowDeleteSubDialog(true);
  };

  const handleSaveMainCategory = () => {
    if (!newCategoryName.trim()) return;

    const nextId = Math.max(0, ...categories.map((c) => c.id)) + 1;
    const newCat = {
      id: nextId,
      name: newCategoryName.trim(),
      icon: selectedIcon,
      type: categoryType,
      subcategories: [],
    } as any;

    setCategories((prev) => [...prev, newCat]);

    // Reset form and close dialog
    setNewCategoryName("Untitled");
    setSelectedIcon("🏷️");
    setCategoryType("expense");
    setShowAddMainDialog(false);
  };

  const handleSaveSubcategory = () => {
    if (!newCategoryName.trim() || activeMainCategoryId === null) return;

    const newSub = {
      name: newCategoryName.trim(),
      icon: selectedIcon,
      description: newCategoryDescription || "",
    };

    setCategories((prev) =>
      prev.map((c) =>
        c.id === activeMainCategoryId
          ? { ...c, subcategories: [...c.subcategories, newSub] }
          : c,
      ),
    );

    // Reset and close
    setNewCategoryName("Untitled");
    setNewCategoryDescription("");
    setSelectedIcon("🏷️");
    setActiveMainCategoryId(null);
    setShowAddSubDialog(false);
  };

  const handleUpdateSubcategory = () => {
    if (!selectedSubcategory) return;
    const parentId = (selectedSubcategory as any).parentId || activeMainCategoryId;
    const originalName = selectedSubcategory.name;

    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== parentId) return c;
        return {
          ...c,
          subcategories: c.subcategories.map((s: any) =>
            s.name === originalName
              ? { ...s, name: newCategoryName.trim(), icon: selectedIcon, description: newCategoryDescription }
              : s,
          ),
        };
      }),
    );

    setSelectedSubcategory(null);
    setNewCategoryName("Untitled");
    setNewCategoryDescription("");
    setSelectedIcon("🏷️");
    setActiveMainCategoryId(null);
    setShowEditSubDialog(false);
  };

  const navigate = useNavigate();
  const handleBack = () => navigate(-1);

  return (
    <Layout>
      <div className="space-y-6 py-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            aria-label="Back"
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
          </Button>
          <h2 className="text-xl font-semibold">Categories</h2>
        </div>

        {/* All Categories */}
        <div>
          <div className="space-y-3">
            {categories.map((category) => (
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

            {/* Add Main Category Button */}
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={() => setShowAddMainDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Main Category
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* All Dialogs */}
      {/* Add Main Category Dialog */}
      <Dialog open={showAddMainDialog} onOpenChange={setShowAddMainDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Add New Main Category
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Category Type Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Category Type</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    categoryType === "income"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-muted hover:border-green-300"
                  }`}
                  onClick={() => setCategoryType("income")}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg">💰</span>
                    <span>INCOME</span>
                  </div>
                </button>
                <button
                  type="button"
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    categoryType === "expense"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-muted hover:border-red-300"
                  }`}
                  onClick={() => setCategoryType("expense")}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg">💸</span>
                    <span>EXPENSE</span>
                  </div>
                </button>
                <button
                  type="button"
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    categoryType === "investment"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-muted hover:border-blue-300"
                  }`}
                  onClick={() => setCategoryType("investment")}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg">📈</span>
                    <span>INVEST</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Category Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Category Name</Label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
                className="text-base"
              />
            </div>

            {/* Icon Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Choose Icon</Label>
              <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg bg-muted/10">
                {availableIcons.map((icon) => (
                  <Button
                    key={icon}
                    variant={selectedIcon === icon ? "default" : "outline"}
                    size="icon"
                    className={`h-10 w-10 text-lg ${
                      selectedIcon === icon ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedIcon(icon)}
                  >
                    {icon}
                  </Button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddMainDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveMainCategory}
                disabled={!newCategoryName.trim()}
                className="flex-1"
              >
                Save Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Main Category Dialog */}
      <Dialog open={showEditMainDialog} onOpenChange={setShowEditMainDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <Input
                value={selectedIcon}
                onChange={(e) => setSelectedIcon(e.target.value)}
                placeholder="📱"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowEditMainDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Save logic here
                  setShowEditMainDialog(false);
                }}
                disabled={!newCategoryName}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Subcategory Dialog */}
      <Dialog open={showAddSubDialog} onOpenChange={setShowAddSubDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Subcategory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Subcategory name"
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg bg-muted/10">
                {availableIcons.map((icon) => (
                  <Button
                    key={icon}
                    variant={selectedIcon === icon ? "default" : "outline"}
                    size="icon"
                    className={`h-10 w-10 text-lg ${selectedIcon === icon ? "ring-2 ring-primary" : ""}`}
                    onClick={() => setSelectedIcon(icon)}
                  >
                    {icon}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                placeholder="Add a short note about this subcategory"
                className="w-full"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddSubDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveSubcategory}
                disabled={!newCategoryName.trim()}
              >
                Save Subcategory
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Main Category Dialog */}
      <Dialog
        open={showDeleteMainDialog}
        onOpenChange={setShowDeleteMainDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete "{selectedMainCategory?.name}"?
              This will also delete all its subcategories and cannot be undone.
            </p>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteMainDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedMainCategory?.id == null) {
                    setShowDeleteMainDialog(false);
                    return;
                  }
                  const idToDelete = selectedMainCategory.id;
                  setCategories((prev) =>
                    prev.filter((c) => c.id !== idToDelete),
                  );
                  // Cleanup UI state
                  setExpandedCategories((s) => {
                    const n = new Set(s);
                    n.delete(idToDelete);
                    return n;
                  });
                  setOpenMenus((s) => {
                    const n = new Set(s);
                    n.delete(idToDelete);
                    return n;
                  });
                  setSelectedMainCategory(null);
                  setShowDeleteMainDialog(false);
                }}
              >
                Delete Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Subcategory Dialog */}
      <Dialog open={showEditSubDialog} onOpenChange={setShowEditSubDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Subcategory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Subcategory name"
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <Input
                value={selectedIcon}
                onChange={(e) => setSelectedIcon(e.target.value)}
                placeholder="📱"
              />
            </div>
            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                placeholder="Add or edit the note for this subcategory"
                className="w-full"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowEditSubDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateSubcategory}
                disabled={!newCategoryName}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Subcategory Dialog */}
      <Dialog open={showDeleteSubDialog} onOpenChange={setShowDeleteSubDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Subcategory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete "{selectedSubcategory?.name}"?
              This action cannot be undone.
            </p>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteSubDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (!selectedSubcategory) {
                    setShowDeleteSubDialog(false);
                    return;
                  }
                  const parentId = (selectedSubcategory as any).parentId;
                  const subName = selectedSubcategory.name;
                  if (parentId == null) {
                    // Try to find parent by searching categories
                    setCategories((prev) =>
                      prev.map((c) => ({
                        ...c,
                        subcategories: c.subcategories.filter(
                          (s) => s.name !== subName,
                        ),
                      })),
                    );
                  } else {
                    setCategories((prev) =>
                      prev.map((c) =>
                        c.id === parentId
                          ? {
                              ...c,
                              subcategories: c.subcategories.filter(
                                (s) => s.name !== subName,
                              ),
                            }
                          : c,
                      ),
                    );
                  }
                  setSelectedSubcategory(null);
                  setShowDeleteSubDialog(false);
                }}
              >
                Delete Subcategory
              </Button>
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
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground">
                  ₹
                </span>
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
                {getBudget(selectedBudgetSubcategory) > 0
                  ? "Update Budget"
                  : "Set Budget"}
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
  const [localMenuOpen, setLocalMenuOpen] = useState(false);
  const [justOpened, setJustOpened] = useState(false);

  // Prevent immediate closure when menu just opened
  useEffect(() => {
    if (localMenuOpen) {
      setJustOpened(true);
      const timer = setTimeout(() => setJustOpened(false), 100);
      return () => clearTimeout(timer);
    }
  }, [localMenuOpen]);

  return (
    <Card className="relative border-0 shadow-sm bg-card/50">
      {/* Main Category Header */}
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-4 cursor-pointer flex-1"
            onClick={onToggle}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center text-lg shadow-sm">
              {category.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-semibold text-foreground">
                  {category.name}
                </span>
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all ${
                    category.type === "income"
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                      : category.type === "investment"
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                        : "bg-gradient-to-r from-red-500 to-rose-500 text-white"
                  }`}
                >
                  {category.type === "income" && "💰"}
                  {category.type === "investment" && "📈"}
                  {category.type === "expense" && "💸"}
                  <span className="tracking-wide">
                    {category.type === "income"
                      ? "INCOME"
                      : category.type === "investment"
                        ? "INVEST"
                        : "EXPENSE"}
                  </span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {category.subcategories.length} subcategories
              </div>
            </div>
            <div className="transition-transform duration-200 ml-2">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Main Category Menu */}
          <div
            className="relative ml-2 menu-container z-[9999]"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-muted"
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log(
                  "Main menu button mousedown, localMenuOpen:",
                  localMenuOpen,
                );
                setLocalMenuOpen(!localMenuOpen);
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <span className="text-foreground font-bold text-lg">⋯</span>
            </Button>
            {localMenuOpen &&
              createPortal(
                <>
                  <div
                    className="fixed inset-0 z-[9998]"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!justOpened) {
                        setLocalMenuOpen(false);
                      }
                    }}
                  ></div>
                  <div
                    className="fixed bg-card border border-border rounded-md shadow-xl z-[9999] py-1 min-w-[120px]"
                    style={{ right: "8px", top: "120px" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-muted text-sm flex items-center gap-2"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Edit main category clicked");
                        onEditMain();
                        setLocalMenuOpen(false);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                      Edit Category
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-muted text-sm flex items-center gap-2 text-red-600"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Delete main category clicked");
                        onDeleteMain();
                        setLocalMenuOpen(false);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete Category
                    </button>
                  </div>
                </>,
                document.body,
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
                onEdit={(sub) => onEditSubcategory({ ...sub, parentId: category.id })}
                onDelete={(sub) =>
                  onDeleteSubcategory({ ...sub, parentId: category.id })
                }
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
  const [justOpened, setJustOpened] = useState(false);

  // Prevent immediate closure when menu just opened
  useEffect(() => {
    if (showMenu) {
      setJustOpened(true);
      const timer = setTimeout(() => setJustOpened(false), 100);
      return () => clearTimeout(timer);
    }
  }, [showMenu]);

  return (
    <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 relative ml-6 border border-border/30 hover:border-border/60 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-9 h-9 bg-gradient-to-br from-primary/15 to-primary/5 rounded-lg flex items-center justify-center text-sm shadow-sm">
            {subcategory.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm text-foreground">
                {subcategory.name}
              </span>
              {budget > 0 && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-semibold shadow-sm">
                  <span>💰</span>
                  <span>₹{budget.toLocaleString()}</span>
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {subcategory.description}
            </div>
          </div>
        </div>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              console.log(
                "Subcategory menu button clicked, showMenu:",
                showMenu,
              );
              if (!showMenu) {
                setShowMenu(true);
              } else {
                setShowMenu(false);
              }
            }}
          >
            <span className="text-muted-foreground">⋯</span>
          </Button>
          {showMenu &&
            createPortal(
              <>
                <div
                  className="fixed inset-0 z-[9998]"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!justOpened) {
                      setShowMenu(false);
                    }
                  }}
                ></div>
                <div
                  className="fixed bg-card border border-border rounded-md shadow-xl z-[9999] py-1 min-w-[140px]"
                  style={{ right: "8px", top: "200px" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-muted text-sm flex items-center gap-2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("Edit subcategory clicked:", subcategory);
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
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("Edit budget clicked:", subcategory.name);
                          onSetBudget(subcategory.name);
                          setShowMenu(false);
                        }}
                      >
                        <Calculator className="h-3 w-3" />
                        Edit Budget
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 hover:bg-muted text-sm flex items-center gap-2 text-orange-600"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log(
                            "Remove budget clicked:",
                            subcategory.name,
                          );
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
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Set budget clicked:", subcategory.name);
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
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("Delete subcategory clicked:", subcategory);
                      onDelete(subcategory);
                      setShowMenu(false);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </>,
              document.body,
            )}
        </div>
      </div>
    </div>
  );
}
