import { Layout } from "../components/Layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";

const accounts = [
  {
    id: 1,
    name: "Card",
    balance: "₹0.00",
    icon: "💳",
    color: "bg-red-500",
  },
  {
    id: 2,
    name: "Cash",
    balance: "₹0.00",
    icon: "💵",
    color: "bg-green-500",
  },
  {
    id: 3,
    name: "Savings",
    balance: "₹257,200.00",
    icon: "🐷",
    color: "bg-pink-500",
  },
];

export function Accounts() {
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

        {/* Accounts Section */}
        <div>
          <h3 className="text-lg font-semibold text-yellow-500 mb-4">Accounts</h3>
          <div className="space-y-3">
            {accounts.map((account) => (
              <AccountItem key={account.id} account={account} />
            ))}
          </div>
        </div>

        {/* Add New Account Button */}
        <Button variant="outline" className="w-full flex items-center gap-2">
          <Plus className="h-4 w-4" />
          ADD NEW ACCOUNT
        </Button>

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

interface AccountItemProps {
  account: {
    name: string;
    balance: string;
    icon: string;
    color: string;
  };
}

function AccountItem({ account }: AccountItemProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 ${account.color} rounded-lg flex items-center justify-center text-lg`}
          >
            {account.icon}
          </div>
          <div>
            <div className="font-medium">{account.name}</div>
            <div className="text-sm text-muted-foreground">
              Balance: {account.balance}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <span className="text-muted-foreground">⋯</span>
        </Button>
      </div>
    </Card>
  );
}
