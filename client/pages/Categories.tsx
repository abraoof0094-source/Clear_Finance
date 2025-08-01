import { useState } from "react";
import { Layout } from "../components/Layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Plus } from "lucide-react";

const incomeCategories = [
  { id: 1, name: "Grants", icon: "🎁" },
  { id: 2, name: "Refunds", icon: "💰" },
  { id: 3, name: "Salary", icon: "💼" },
];

const expenseCategories = [
  { id: 4, name: "Baby", icon: "🍼" },
  { id: 5, name: "Beauty", icon: "💄" },
  { id: 6, name: "Bills", icon: "🧾" },
  { id: 7, name: "Car", icon: "🚗" },
  { id: 8, name: "Clothing", icon: "👕" },
  { id: 9, name: "Education", icon: "🎓" },
  { id: 10, name: "Electronics", icon: "📱" },
  { id: 11, name: "Entertainment", icon: "🎬" },
  { id: 12, name: "Food", icon: "🍽️" },
  { id: 13, name: "Health", icon: "❤️" },
  { id: 14, name: "Home", icon: "🏠" },
  { id: 15, name: "Shopping", icon: "🛒" },
  { id: 16, name: "Social", icon: "👥" },
  { id: 17, name: "Sport", icon: "🏀" },
  { id: 18, name: "Tax", icon: "🏛️" },
  { id: 19, name: "Telephone", icon: "📞" },
  { id: 20, name: "Transportation", icon: "🚌" },
];

const availableIcons = ["🚗", "👕", "🍽️", "🏠", "🛒", "🏛️", "❤️", "✅", "🏀", "🧮"];

export function Categories() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [newCategoryName, setNewCategoryName] = useState("Untitled");
  const [selectedIcon, setSelectedIcon] = useState("🚗");
  const [categoryType, setCategoryType] = useState<"INCOME" | "EXPENSE">("EXPENSE");

  const handleEditCategory = (category: any) => {
    setSelectedCategory(category);
    setNewCategoryName(category.name);
    setSelectedIcon(category.icon);
    setShowEditDialog(true);
  };

  const handleDeleteCategory = (category: any) => {
    setSelectedCategory(category);
    setShowDeleteDialog(true);
  };

  return (
    <Layout>
      <div className="space-y-6 py-4">
        {/* Account Balance Summary */}
        <Card className="p-6 text-center">
          <div className="space-y-2">
            <h2 className="text-sm text-muted-foreground">All Accounts</h2>
            <div className="text-2xl font-bold text-foreground">₹257,200.00</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">EXPENSE SO FAR</div>
              <div className="text-lg font-semibold text-red-400">₹10,000.00</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">INCOME SO FAR</div>
              <div className="text-lg font-semibold text-green-400">₹267,200.00</div>
            </div>
          </div>
        </Card>

        {/* Income Categories */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Income categories</h3>
          <div className="space-y-3">
            {incomeCategories.map((category) => (
              <CategoryItem 
                key={category.id}
                category={category} 
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
              />
            ))}
          </div>
        </div>

        {/* Expense Categories */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Expense categories</h3>
          <div className="space-y-3">
            {expenseCategories.map((category) => (
              <CategoryItem 
                key={category.id}
                category={category} 
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
              />
            ))}
          </div>
        </div>

        {/* Add New Category Button */}
        <Card className="p-4">
          <Button 
            variant="outline" 
            className="w-full flex items-center gap-2"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4" />
            ADD NEW CATEGORY
          </Button>
        </Card>

        {/* Floating Add Button */}
        <Button 
          size="icon" 
          className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Add Category Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add new category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Label>Type:</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="INCOME"
                    checked={categoryType === "INCOME"}
                    onChange={(e) => setCategoryType(e.target.value as "INCOME")}
                  />
                  INCOME
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="EXPENSE"
                    checked={categoryType === "EXPENSE"}
                    onChange={(e) => setCategoryType(e.target.value as "EXPENSE")}
                  />
                  ✓ EXPENSE
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
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                CANCEL
              </Button>
              <Button onClick={() => setShowAddDialog(false)}>
                SAVE
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                CANCEL
              </Button>
              <Button onClick={() => setShowEditDialog(false)}>
                SAVE
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this category?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Deleting this category will also delete all records and budgets for this category. Are you sure?
            </p>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                NO
              </Button>
              <Button variant="destructive" onClick={() => setShowDeleteDialog(false)}>
                YES
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

interface CategoryItemProps {
  category: { name: string; icon: string };
  onEdit: (category: any) => void;
  onDelete: (category: any) => void;
}

function CategoryItem({ category, onEdit, onDelete }: CategoryItemProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <Card className="p-4 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-lg">
            {category.icon}
          </div>
          <span className="font-medium">{category.name}</span>
        </div>
        <div className="relative">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowMenu(!showMenu)}
          >
            <span className="text-muted-foreground">⋯</span>
          </Button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-md shadow-lg z-10 py-1 min-w-[100px]">
              <button 
                className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                onClick={() => {
                  onEdit(category);
                  setShowMenu(false);
                }}
              >
                Edit
              </button>
              <button 
                className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                onClick={() => {
                  onDelete(category);
                  setShowMenu(false);
                }}
              >
                Delete
              </button>
              <button 
                className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
              >
                Ignore
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
