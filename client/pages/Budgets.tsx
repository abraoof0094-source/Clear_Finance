import { Layout } from "../components/Layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

const budgetCategories = [
  { name: "Entertainment", icon: "🎬" },
  { name: "Food", icon: "🍽️" },
  { name: "Health", icon: "❤️" },
  { name: "Home", icon: "🏠" },
  { name: "Insurance", icon: "✅" },
  { name: "Shopping", icon: "🛒" },
  { name: "Social", icon: "👥" },
  { name: "Sport", icon: "🏀" },
  { name: "Tax", icon: "🏛️" },
  { name: "Telephone", icon: "📞" },
  { name: "Transportation", icon: "🚌" },
];

export function Budgets() {
  return (
    <Layout>
      <div className="space-y-6 py-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">August, 2025</h2>
          <Button variant="ghost" size="icon">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Budget Summary */}
        <Card className="p-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground">TOTAL BUDGET</div>
              <div className="text-xl font-bold">₹0.00</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">TOTAL SPENT</div>
              <div className="text-xl font-bold text-red-400">₹0.00</div>
            </div>
          </div>
        </Card>

        {/* Budget Categories */}
        <div className="space-y-4">
          {budgetCategories.map((category, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-lg">
                    {category.icon}
                  </div>
                  <span className="font-medium">{category.name}</span>
                </div>
                <Button variant="outline" size="sm">
                  SET BUDGET
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Set From Past Months Button */}
        <Button variant="outline" className="w-full flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          SET FROM PAST MONTHS
        </Button>
      </div>
    </Layout>
  );
}
