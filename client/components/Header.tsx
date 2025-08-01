import { Menu, Search } from "lucide-react";
import { Button } from "./ui/button";

interface HeaderProps {
  title?: string;
  showMenu?: boolean;
  showSearch?: boolean;
}

export function Header({ title = "Clear Finance", showMenu = true, showSearch = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          {showMenu && (
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6 text-primary" />
            </Button>
          )}
          <h1 className="text-xl font-bold text-primary italic">{title}</h1>
        </div>
        
        {showSearch && (
          <Button variant="ghost" size="icon">
            <Search className="h-6 w-6" />
          </Button>
        )}
      </div>
    </header>
  );
}
