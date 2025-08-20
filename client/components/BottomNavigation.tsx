import { Link, useLocation } from "react-router-dom";
import {
  ClipboardList,
  PieChart,
  Target,
  Calculator,
  FolderOpen,
  MoreHorizontal,
} from "lucide-react";

export function BottomNavigation() {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: ClipboardList, label: "Records" },
    { path: "/analysis", icon: PieChart, label: "Analysis" },
    { path: "/tracker", icon: Target, label: "Tracker" },
    { path: "/categories", icon: FolderOpen, label: "Categories" },
    { path: "/more", icon: MoreHorizontal, label: "More" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-[10001]">
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
