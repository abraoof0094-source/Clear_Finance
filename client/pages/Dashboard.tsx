import { Layout } from "../components/Layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";

export function Dashboard() {
  return (
    <Layout>
      <div className="space-y-6 py-4">
        {/* Account Balance Summary */}
        <Card className="p-6 text-center">
          <div className="space-y-2">
            <h2 className="text-sm text-muted-foreground">All Accounts</h2>
            <div className="text-2xl font-bold text-foreground">
              ₹257,200.00
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">
                EXPENSE SO FAR
              </div>
              <div className="text-lg font-semibold text-red-400">
                ₹10,000.00
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">INCOME SO FAR</div>
              <div className="text-lg font-semibold text-green-400">
                ₹267,200.00
              </div>
            </div>
          </div>
        </Card>

        {/* Income Categories */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Income categories</h3>
          <div className="space-y-3">
            <CategoryItem icon="🎁" name="Grants" />
            <CategoryItem icon="💰" name="Refunds" />
            <CategoryItem icon="💼" name="Salary" />
          </div>
        </div>

        {/* Expense Categories */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Expense categories</h3>
          <div className="space-y-3">
            <CategoryItem icon="🍼" name="Baby" />
            <CategoryItem icon="💄" name="Beauty" />
            <CategoryItem icon="🧾" name="Bills" />
            <CategoryItem icon="🚗" name="Car" />
            <CategoryItem icon="👕" name="Clothing" />
            <CategoryItem icon="🎓" name="Education" />
            <CategoryItem icon="📱" name="Electronics" />
            <CategoryItem icon="🎬" name="Entertainment" />
          </div>
        </div>

        {/* Floating Add Button */}
        <Button
          size="icon"
          className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </Layout>
  );
}

interface CategoryItemProps {
  icon: string;
  name: string;
  action?: string;
}

function CategoryItem({ icon, name, action }: CategoryItemProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-lg">
            {icon}
          </div>
          <span className="font-medium">{name}</span>
        </div>
        {action && (
          <span className="text-sm text-muted-foreground">{action}</span>
        )}
        <Button variant="ghost" size="sm">
          <span className="text-muted-foreground">⋯</span>
        </Button>
      </div>
    </Card>
  );
}
