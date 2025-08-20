import React, { useState, useEffect, useRef } from "react";
import { Layout } from "../components/Layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Download,
  Shield,
  Check,
  AlertCircle,
  Info,
  Cloud,
  HardDrive,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { phoneStorage } from "../utils/phoneStorage";
import { themeManager } from "../utils/themeColors";

export function BackupRestore() {
  const navigate = useNavigate();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [stats, setStats] = useState({
    transactions: 0,
    budgets: 0,
    categories: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);

  useEffect(() => {
    themeManager.setTheme(localStorage.getItem("selected-theme") || "original");
    
    // Load current data stats
    const transactions = phoneStorage.loadTransactions();
    const budgets = phoneStorage.loadBudgets();
    const categories = JSON.parse(localStorage.getItem("categories") || "[]");
    
    setStats({
      transactions: transactions.length,
      budgets: Object.keys(budgets).length,
      categories: categories.length,
    });
  }, []);

  // Touch event handlers for swipe gestures
  const handleTouchStart = (e: TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = startXRef.current;
  };

  const handleTouchMove = (e: TouchEvent) => {
    currentXRef.current = e.touches[0].clientX;
    const diff = currentXRef.current - startXRef.current;

    if (diff < 0 && containerRef.current) {
      const translateX = Math.max(diff, -window.innerWidth * 0.5);
      containerRef.current.style.transform = `translateX(${translateX}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (!containerRef.current) return;

    const diff = currentXRef.current - startXRef.current;
    const threshold = -window.innerWidth * 0.15;

    if (diff < threshold) {
      navigate(-1);
    } else {
      containerRef.current.style.transform = "translateX(0)";
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("touchstart", handleTouchStart);
      container.addEventListener("touchmove", handleTouchMove);
      container.addEventListener("touchend", handleTouchEnd);

      return () => {
        container.removeEventListener("touchstart", handleTouchStart);
        container.removeEventListener("touchmove", handleTouchMove);
        container.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, []);

  // Create backup
  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    setStatus("idle");

    try {
      const data = {
        version: "2.0",
        exportedAt: new Date().toISOString(),
        appInfo: {
          name: "Clear Finance",
          version: "2.0",
          platform: navigator.userAgent.includes("Mobile") ? "Mobile" : "Desktop",
        },
        data: {
          transactions: phoneStorage.loadTransactions(),
          budgets: phoneStorage.loadBudgets(),
          categories: JSON.parse(localStorage.getItem("categories") || "[]"),
          settings: {
            theme: localStorage.getItem("selected-theme") || "original",
            lastBackup: new Date().toISOString(),
          },
        },
        metadata: {
          totalTransactions: stats.transactions,
          totalBudgets: stats.budgets,
          totalCategories: stats.categories,
          dateRange: {
            earliest: phoneStorage.loadTransactions().length > 0 
              ? phoneStorage.loadTransactions().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0].date
              : null,
            latest: phoneStorage.loadTransactions().length > 0
              ? phoneStorage.loadTransactions().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
              : null,
          },
        },
      };

      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const timestamp = new Date().toISOString().split("T")[0];
      a.download = `clear-finance-backup-${timestamp}.mbak`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus("success");
      setStatusMessage(`Backup created successfully! Saved as clear-finance-backup-${timestamp}.mbak`);
      setTimeout(() => setStatus("idle"), 5000);
    } catch (error) {
      setStatus("error");
      setStatusMessage("Failed to create backup. Please try again.");
      setTimeout(() => setStatus("idle"), 3000);
    } finally {
      setIsBackingUp(false);
    }
  };

  const getLastBackupDate = () => {
    const lastBackup = localStorage.getItem("last-backup");
    if (lastBackup) {
      return new Date(lastBackup).toLocaleDateString();
    }
    return "Never";
  };

  return (
    <Layout>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => navigate(-1)}
      />

      {/* Slide Panel */}
      <div
        ref={containerRef}
        className="fixed top-0 left-0 h-full w-1/2 bg-background border-r border-border z-50 transform transition-transform duration-300 ease-out overflow-y-auto"
        style={{
          transform: "translateX(0)",
        }}
      >
        <div className="space-y-4 py-4 px-4">
          {/* Header */}
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-lg font-semibold">Create Backup</h1>
            <p className="text-xs text-muted-foreground">
              Protect your financial data safely
            </p>
          </div>

          {/* Status Message */}
          {status !== "idle" && statusMessage && (
            <div
              className={`flex items-start gap-2 p-3 rounded-lg ${
                status === "success"
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {status === "success" ? (
                <Check className="h-4 w-4 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 mt-0.5" />
              )}
              <span className="text-sm font-medium">{statusMessage}</span>
            </div>
          )}

          {/* Current Data Summary */}
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 rounded-full bg-blue-500/20">
                <HardDrive className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Your Data Summary
                </h3>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Ready to backup the following data
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                  {stats.transactions}
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  Transactions
                </div>
              </div>
              <div className="text-center p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                  {stats.budgets}
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  Budgets
                </div>
              </div>
              <div className="text-center p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                  {stats.categories}
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  Categories
                </div>
              </div>
            </div>
          </Card>

          {/* Backup Instructions */}
          <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-green-500/20">
                <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                  What's Included
                </h3>
                <div className="text-xs text-green-700 dark:text-green-300 space-y-1">
                  <p>• All your transaction records</p>
                  <p>• Budget settings and limits</p>
                  <p>• Custom categories and subcategories</p>
                  <p>• App preferences and themes</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Main Backup Action */}
          <div className="space-y-3">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600">
                  <Download className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">Complete Backup</div>
                  <div className="text-xs text-muted-foreground">
                    Download all your data as .mbak file
                  </div>
                </div>
              </div>
              <Button
                onClick={handleCreateBackup}
                disabled={isBackingUp || stats.transactions === 0}
                className="w-full h-10 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium"
              >
                {isBackingUp ? (
                  <>
                    <Download className="h-4 w-4 mr-2 animate-bounce" />
                    Creating Backup...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Create Backup Now
                  </>
                )}
              </Button>
              
              {stats.transactions === 0 && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  No data to backup. Add some transactions first.
                </p>
              )}
            </Card>
          </div>

          {/* Backup Tips */}
          <Card className="p-3 bg-gray-50 dark:bg-gray-900/30">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Backup Tips
              </span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <p>• Regular backups protect against data loss</p>
              <p>• Store backup files in a safe location</p>
              <p>• Use cloud storage for extra protection</p>
              <p>• Backup before major changes or updates</p>
            </div>
          </Card>

          {/* Safety Note */}
          <Card className="p-3 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-1">
                  Secure & Private
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Your backup file is created locally on your device. No data is sent to external servers.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
