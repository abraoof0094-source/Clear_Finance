import { useState } from "react";
import { Layout } from "../components/Layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Plus, ChevronRight, ArrowLeft } from "lucide-react";

// Income Categories
const incomeCategories = [
  {
    id: 1,
    name: "Income Sources",
    icon: "💰",
    subcategories: [
      { name: "Fixed Salary", icon: "💼", description: "Monthly take-home salary" },
      { name: "Variable Pay", icon: "📈", description: "Performance bonus, annual bonus" },
      { name: "Reimbursements", icon: "🧾", description: "Travel allowance, food coupons" },
      { name: "Freelance/Side Income", icon: "💻", description: "Consulting, online gigs" },
      { name: "Passive Income", icon: "📊", description: "Dividends, rental income" },
      { name: "Others", icon: "🎯", description: "ESOPs, stock sales" },
    ]
  }
];

// Expense Categories
const expenseCategories = [
  {
    id: 2,
    name: "Fixed Household Expenses",
    icon: "🏠",
    subcategories: [
      { name: "Rent / Home Loan EMI", icon: "🏡", description: "Apartment rent or housing EMI" },
      { name: "Maintenance / Society Charges", icon: "🏢", description: "Gated community maintenance fees" },
      { name: "Utilities", icon: "⚡", description: "Electricity, water, gas" },
      { name: "Internet / Broadband", icon: "🌐", description: "JioFiber, Airtel, ACT" },
      { name: "Mobile Bills", icon: "📱", description: "Jio, Airtel postpaid" },
      { name: "DTH / OTT Subscriptions", icon: "📺", description: "Netflix, Amazon, Hotstar" },
      { name: "Groceries & Daily Essentials", icon: "🛒", description: "BigBasket, local supermarket" },
      { name: "House Help / Cook / Maid", icon: "👩‍🍳", description: "Monthly salaries" },
      { name: "Child Care / Nanny", icon: "👶", description: "Play school, babysitter fees" },
    ]
  },
  {
    id: 3,
    name: "Family & Personal Living",
    icon: "👨‍👩‍👧‍👦",
    subcategories: [
      { name: "Food & Dining", icon: "🍽️", description: "Restaurants, weekend dinners, Swiggy/Zomato" },
      { name: "Weekend Chills / Drinks", icon: "🍻", description: "Pubs, bars, liquor store purchases" },
      { name: "Travel & Commute", icon: "🚗", description: "Uber/Ola, metro, fuel, tolls" },
      { name: "Medical / Healthcare", icon: "⚕️", description: "Doctor visits, medicines" },
      { name: "Fitness / Gym / Swimming", icon: "💪", description: "Gym memberships, fitness classes" },
      { name: "Indoor Play / Recreation", icon: "🎳", description: "Bowling, escape rooms, indoor parks" },
      { name: "Shopping & Clothing", icon: "👕", description: "Malls, Myntra, Amazon" },
      { name: "Electronics & Gadgets", icon: "📱", description: "Phones, laptops, smartwatches" },
      { name: "Education / Courses", icon: "📚", description: "Online certifications, skill upgrades" },
      { name: "Kids' Education", icon: "🎓", description: "School fees, tuition, activities" },
      { name: "Pets", icon: "🐕", description: "Food, vet visits, grooming" },
    ]
  },
  {
    id: 4,
    name: "Insurance",
    icon: "🛡️",
    subcategories: [
      { name: "Term Insurance", icon: "📋", description: "₹5–7.5 Cr cover, 10-year premium" },
      { name: "Health Insurance", icon: "❤️", description: "Family floater policy" },
      { name: "Vehicle Insurance", icon: "🚗", description: "Bike, car" },
      { name: "Gadget Insurance", icon: "📱", description: "Mobile/laptop protection" },
      { name: "Accidental / Disability Cover", icon: "🏥", description: "Standalone rider or add-on" },
    ]
  },
  {
    id: 5,
    name: "Investments",
    icon: "📈",
    subcategories: [
      { name: "Mutual Funds (SIP)", icon: "📊", description: "Equity, hybrid, index funds" },
      { name: "Mutual Funds (Lumpsum)", icon: "💹", description: "Opportunistic investing" },
      { name: "Stocks / ETFs", icon: "📈", description: "Direct equity, MSCI World, REITs" },
      { name: "PPF / EPF / VPF", icon: "🏛️", description: "Provident fund contributions" },
      { name: "NPS", icon: "👴", description: "Retirement-focused" },
      { name: "FD / RD", icon: "🏪", description: "Bank fixed deposits" },
      { name: "Gold", icon: "🥇", description: "Gold ETFs, sovereign gold bonds" },
      { name: "Crypto / Alternative Assets", icon: "₿", description: "Bitcoin, US stocks (optional)" },
      { name: "Real Estate Investment", icon: "🏘️", description: "Plot, apartment" },
      { name: "Children's Education Fund", icon: "🎓", description: "Separate mutual fund or FD" },
    ]
  },
  {
    id: 6,
    name: "Loans & EMI Payments",
    icon: "💳",
    subcategories: [
      { name: "Home Loan", icon: "🏠", description: "Bank EMI" },
      { name: "Car Loan", icon: "🚗", description: "EMI for sedan/SUV" },
      { name: "Bike Loan", icon: "🏍️", description: "EMI for two-wheeler" },
      { name: "Personal Loan", icon: "💰", description: "For gadgets or emergencies" },
      { name: "Credit Card Bill", icon: "💳", description: "Monthly repayment" },
      { name: "Consumer Durable Loan", icon: "📺", description: "TVs, washing machines" },
    ]
  },
  {
    id: 7,
    name: "Lifestyle & Discretionary",
    icon: "🎪",
    subcategories: [
      { name: "Weekend Getaways", icon: "🏔️", description: "Coorg, Ooty, Goa trips" },
      { name: "Vacations / Travel Abroad", icon: "✈️", description: "Family holidays" },
      { name: "Social Gatherings / Parties", icon: "🎉", description: "Clubbing, friends' dinners" },
      { name: "Events / Concerts", icon: "🎵", description: "Music shows, IPL matches" },
      { name: "Hobbies", icon: "📸", description: "Photography, art supplies" },
      { name: "Gaming / Indoor Entertainment", icon: "🎮", description: "PlayStation, VR sets" },
      { name: "Luxury Purchases", icon: "💎", description: "Watches, designer clothes" },
    ]
  },
  {
    id: 8,
    name: "Savings & Emergency Funds",
    icon: "🏦",
    subcategories: [
      { name: "Emergency Fund", icon: "🚨", description: "6–12 months' expenses" },
      { name: "Opportunity Fund", icon: "💡", description: "For sudden investments" },
      { name: "Short-Term Goals", icon: "🎯", description: "New gadget, vacation" },
      { name: "Child Education Lumpsum", icon: "🎓", description: "Dedicated savings" },
    ]
  },
  {
    id: 9,
    name: "Miscellaneous / One-Time",
    icon: "📦",
    subcategories: [
      { name: "Festivals / Gifts", icon: "🎁", description: "Diwali, weddings" },
      { name: "Charity / Donations", icon: "❤️", description: "80G deductions" },
      { name: "Home Interiors / Furnishing", icon: "🛋️", description: "Sofa, modular kitchen" },
      { name: "Vehicle Maintenance", icon: "🔧", description: "Servicing, accessories" },
      { name: "Household Appliances", icon: "❄️", description: "AC, fridge upgrades" },
      { name: "Memberships", icon: "🏃", description: "Clubs, co-working spaces" },
    ]
  },
];

export function Categories() {
  const [selectedMainCategory, setSelectedMainCategory] = useState<any>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<any>(null);
  const [newCategoryName, setNewCategoryName] = useState("Untitled");
  const [selectedIcon, setSelectedIcon] = useState("🏷️");
  const [categoryType, setCategoryType] = useState<"INCOME" | "EXPENSE">("EXPENSE");

  const availableIcons = ["💰", "🏠", "🍽️", "🚗", "📱", "❤️", "🎓", "🛒", "🎯", "📊"];

  const handleMainCategoryClick = (category: any) => {
    setSelectedMainCategory(category);
  };

  const handleBackToMain = () => {
    setSelectedMainCategory(null);
  };

  const handleEditSubcategory = (subcategory: any) => {
    setSelectedSubcategory(subcategory);
    setNewCategoryName(subcategory.name);
    setSelectedIcon(subcategory.icon);
    setShowEditDialog(true);
  };

  const handleDeleteSubcategory = (subcategory: any) => {
    setSelectedSubcategory(subcategory);
    setShowDeleteDialog(true);
  };

  if (selectedMainCategory) {
    return (
      <Layout>
        <div className="space-y-6 py-4">
          {/* Back Button and Category Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={handleBackToMain}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-lg">
                {selectedMainCategory.icon}
              </div>
              <h2 className="text-xl font-semibold">{selectedMainCategory.name}</h2>
            </div>
          </div>

          {/* Subcategories */}
          <div className="space-y-3">
            {selectedMainCategory.subcategories.map((subcategory: any, index: number) => (
              <SubcategoryItem 
                key={index}
                subcategory={subcategory} 
                onEdit={handleEditSubcategory}
                onDelete={handleDeleteSubcategory}
              />
            ))}
          </div>

          {/* Add New Subcategory Button */}
          <Card className="p-4">
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="h-4 w-4" />
              ADD NEW SUBCATEGORY
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

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
          <h3 className="text-lg font-semibold mb-4">Income Categories</h3>
          <div className="space-y-3">
            {incomeCategories.map((category) => (
              <MainCategoryItem 
                key={category.id}
                category={category} 
                onClick={() => handleMainCategoryClick(category)}
              />
            ))}
          </div>
        </div>

        {/* Expense Categories */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Expense Categories</h3>
          <div className="space-y-3">
            {expenseCategories.map((category) => (
              <MainCategoryItem 
                key={category.id}
                category={category} 
                onClick={() => handleMainCategoryClick(category)}
              />
            ))}
          </div>
        </div>

        {/* Add New Main Category Button */}
        <Card className="p-4">
          <Button 
            variant="outline" 
            className="w-full flex items-center gap-2"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4" />
            ADD NEW MAIN CATEGORY
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
              <div className="grid grid-cols-5 gap-2">
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
            <DialogTitle>Edit subcategory</DialogTitle>
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
              <div className="grid grid-cols-5 gap-2">
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
            <DialogTitle>Delete this subcategory?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Deleting this subcategory will also delete all records and budgets for this subcategory. Are you sure?
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

interface MainCategoryItemProps {
  category: { name: string; icon: string; subcategories: any[] };
  onClick: () => void;
}

function MainCategoryItem({ category, onClick }: MainCategoryItemProps) {
  return (
    <Card className="p-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={onClick}>
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
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </Card>
  );
}

interface SubcategoryItemProps {
  subcategory: { name: string; icon: string; description: string };
  onEdit: (subcategory: any) => void;
  onDelete: (subcategory: any) => void;
}

function SubcategoryItem({ subcategory, onEdit, onDelete }: SubcategoryItemProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <Card className="p-4 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-lg">
            {subcategory.icon}
          </div>
          <div>
            <div className="font-medium">{subcategory.name}</div>
            <div className="text-sm text-muted-foreground">{subcategory.description}</div>
          </div>
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
                  onEdit(subcategory);
                  setShowMenu(false);
                }}
              >
                Edit
              </button>
              <button 
                className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                onClick={() => {
                  onDelete(subcategory);
                  setShowMenu(false);
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
