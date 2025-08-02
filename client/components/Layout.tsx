import { ReactNode, useState } from "react";
import { Header } from "./Header";
import { BottomNavigation } from "./BottomNavigation";
import { SlideMenu } from "./SlideMenu";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showMenu?: boolean;
  showSearch?: boolean;
}

export function Layout({ children, title, showMenu, showSearch }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header title={title} showMenu={showMenu} showSearch={showSearch} />
      <main className="pb-20 px-4">{children}</main>
      <BottomNavigation />
    </div>
  );
}
