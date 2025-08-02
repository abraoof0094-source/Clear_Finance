import { Link, useLocation } from "react-router-dom";
import {
  ClipboardList,
  PieChart,
  Calculator,
  CreditCard,
  FolderOpen,
} from "lucide-react";

export function BottomNavigation() {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: ClipboardList, label: "Records" },
    { path: "/analysis", icon: PieChart, label: "Analysis" },
    { path: "/budgets", icon: Calculator, label: "Budgets" },
    { path: "/accounts", icon: CreditCard, label: "Accounts" },
    { path: "/categories", icon: FolderOpen, label: "Categories" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="flex justify-around items-center py-2 px-4">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;

          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={24} />
              <span className="text-xs mt-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
