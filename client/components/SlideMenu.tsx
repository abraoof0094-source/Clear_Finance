import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import {
  Settings as SettingsIcon,
  Download,
  Database,
  Trash2,
  Heart,
  HelpCircle,
  MessageSquare,
  Moon,
  Sun,
  X,
  ChevronRight,
  User,
  Palette,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SlideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SlideMenu({ isOpen, onClose }: SlideMenuProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);
  const navigate = useNavigate();

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Touch event handlers for swipe gestures
  const handleTouchStart = (e: TouchEvent) => {
    if (!isOpen) return;
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = startXRef.current;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isOpen) return;
    currentXRef.current = e.touches[0].clientX;
    const diff = currentXRef.current - startXRef.current;

    // Only allow swiping to the left (negative diff means swiping left to close)
    if (diff < 0 && menuRef.current) {
      const translateX = Math.max(diff, -window.innerWidth * 0.5);
      menuRef.current.style.transform = `translateX(${translateX}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (!isOpen || !menuRef.current) return;

    const diff = currentXRef.current - startXRef.current;
    const threshold = -window.innerWidth * 0.15; // 15% of screen width (negative for left swipe)

    if (diff < threshold) {
      // Swipe was far enough, close the menu
      onClose();
    } else {
      // Snap back to original position
      menuRef.current.style.transform = "translateX(0)";
    }
  };

  // Add touch event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("touchstart", handleTouchStart);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);

      return () => {
        document.removeEventListener("touchstart", handleTouchStart);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide Menu */}
      <div
        ref={menuRef}
        className="fixed top-0 left-0 h-full w-80 bg-background/95 backdrop-blur-xl border-r border-border/50 z-50 transform transition-all duration-300 ease-out shadow-2xl"
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm">
          <div className="flex items-center justify-between p-6 pb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="hover:bg-primary/10 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="text-right">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Clear Finance
              </h1>
              <div className="flex items-center gap-2 justify-end mt-1">
                <Badge variant="secondary" className="text-xs font-medium">
                  v5.8
                </Badge>
                <Badge variant="outline" className="text-xs border-green-500/20 text-green-400">
                  Free
                </Badge>
              </div>
            </div>
          </div>
          
          {/* User Section */}
          <div className="px-6 pb-6">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Personal Account</p>
                <p className="text-xs text-muted-foreground">Free Plan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Content */}
        <div className="px-6 py-2 space-y-6 overflow-y-auto h-full pb-32">
          {/* Quick Actions */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Quick Actions
            </h3>
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start h-12 px-4 rounded-xl hover:bg-primary/5 group transition-all duration-200"
                onClick={() => {
                  navigate("/preferences");
                  onClose();
                }}
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <SettingsIcon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">Preferences</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </Button>
            </div>
          </div>

          {/* Data Management */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Data Management
            </h3>
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start h-12 px-4 rounded-xl hover:bg-blue-500/5 group transition-all duration-200"
                onClick={() => {
                  navigate("/export-records");
                  onClose();
                }}
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/15 transition-colors">
                    <Download className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">Export Records</p>
                    <p className="text-xs text-muted-foreground">Download as CSV</p>
                  </div>
                </div>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start h-12 px-4 rounded-xl hover:bg-green-500/5 group transition-all duration-200"
                onClick={() => {
                  navigate("/backup-restore");
                  onClose();
                }}
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/15 transition-colors">
                    <Database className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">Backup & Restore</p>
                    <p className="text-xs text-muted-foreground">Secure data backup</p>
                  </div>
                </div>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start h-12 px-4 rounded-xl hover:bg-red-500/5 group transition-all duration-200"
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/15 transition-colors">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">Delete & Reset</p>
                    <p className="text-xs text-muted-foreground">Clear all data</p>
                  </div>
                </div>
              </Button>
            </div>
          </div>

          {/* Theme Toggle */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Appearance
            </h3>
            <div className="space-y-1">
              <div className="flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border/50">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/10 flex items-center justify-center">
                    <Palette className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">Toggle theme</p>
                  </div>
                </div>
                <Switch 
                  checked={isDarkMode} 
                  onCheckedChange={handleThemeToggle}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </div>
          </div>

          {/* Support & Feedback */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Support & Feedback
            </h3>
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start h-12 px-4 rounded-xl hover:bg-pink-500/5 group transition-all duration-200"
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-500/15 transition-colors">
                    <Heart className="h-4 w-4 text-pink-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">Like Clear Finance</p>
                    <p className="text-xs text-muted-foreground">Rate & review</p>
                  </div>
                </div>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start h-12 px-4 rounded-xl hover:bg-violet-500/5 group transition-all duration-200"
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/15 transition-colors">
                    <HelpCircle className="h-4 w-4 text-violet-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">Help & Support</p>
                    <p className="text-xs text-muted-foreground">Get assistance</p>
                  </div>
                </div>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start h-12 px-4 rounded-xl hover:bg-orange-500/5 group transition-all duration-200"
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/15 transition-colors">
                    <MessageSquare className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">Send Feedback</p>
                    <p className="text-xs text-muted-foreground">Share your thoughts</p>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
