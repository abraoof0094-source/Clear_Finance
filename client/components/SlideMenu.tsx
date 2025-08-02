import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
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
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide Menu */}
      <div
        ref={menuRef}
        className="fixed top-0 left-0 h-full w-1/2 bg-background border-r border-border z-50 transform transition-transform duration-300 ease-out overflow-y-auto"
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
          <div className="text-right">
            <h1 className="text-xl font-bold text-primary">Clear Finance</h1>
            <p className="text-sm text-muted-foreground">5.8-free</p>
          </div>
        </div>

        {/* Menu Content */}
        <div className="p-4 space-y-6">
          {/* Preferences Section */}
          <div>
            <div className="rounded-lg border bg-card p-1">
              <Button
                variant="ghost"
                className="w-full justify-between p-4 h-auto"
                onClick={() => {
                  navigate("/preferences");
                  onClose();
                }}
              >
                <div className="flex items-center gap-3">
                  <SettingsIcon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Preferences</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Management Section */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">
              Management
            </h3>
            <div className="rounded-lg border bg-card p-1">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto"
                  onClick={() => {
                    navigate("/export-records");
                    onClose();
                  }}
                >
                  <Download className="h-5 w-5 mr-3 text-muted-foreground" />
                  <span>Export records</span>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto"
                  onClick={() => {
                    navigate("/backup-restore");
                    onClose();
                  }}
                >
                  <Database className="h-5 w-5 mr-3 text-muted-foreground" />
                  <span>Backup & Restore</span>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto"
                >
                  <Trash2 className="h-5 w-5 mr-3 text-muted-foreground" />
                  <span>Delete & Reset</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Application Section */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">
              Application
            </h3>
            <div className="rounded-lg border bg-card p-1">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto"
                >
                  <Heart className="h-5 w-5 mr-3 text-muted-foreground" />
                  <span>Like Clear Finance</span>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto"
                >
                  <HelpCircle className="h-5 w-5 mr-3 text-muted-foreground" />
                  <span>Help</span>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto"
                >
                  <MessageSquare className="h-5 w-5 mr-3 text-muted-foreground" />
                  <span>Feedback</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
