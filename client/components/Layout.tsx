import { ReactNode } from "react";
import { Header } from "./Header";
import { BottomNavigation } from "./BottomNavigation";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showSearch?: boolean;
}

export function Layout({ children, title, showSearch }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header
        title={title}
        showMenu={false}
        showSearch={showSearch}
      />
      <main className="pb-20 px-4">{children}</main>
      <BottomNavigation />
    </div>
  );
}
