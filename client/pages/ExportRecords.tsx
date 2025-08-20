import { useState, useEffect, useRef } from "react";
import { Layout } from "../components/Layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Upload,
  FileText,
  Check,
  AlertCircle,
  Info,
  FileUp,
  Database,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { phoneStorage } from "../utils/phoneStorage";
import { themeManager } from "../utils/themeColors";

export function ExportRecords() {
  const navigate = useNavigate();
  const [isImporting, setIsImporting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [importData, setImportData] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);

  useEffect(() => {
    themeManager.setTheme(localStorage.getItem("selected-theme") || "original");
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

  // Handle file upload and import
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
      setTimeout(() => {
        handleImportData(content, file.name);
      }, 100);
    };
    reader.onerror = () => {
      setStatus("error");
      setStatusMessage("Failed to read file");
    };
    reader.readAsText(file);
  };

  // Import data from backup file
  const handleImportData = async (content: string, fileName: string) => {
    setIsImporting(true);
    setStatus("idle");

    try {
      const data = JSON.parse(content);

      if (!data.transactions || !Array.isArray(data.transactions)) {
        throw new Error("Invalid backup file format");
      }

      const currentStats = {
        transactions: phoneStorage.loadTransactions().length,
        budgets: Object.keys(phoneStorage.loadBudgets()).length,
      };

      const confirmed = window.confirm(
        `🔄 Import Data from "${fileName}"?\n\n` +
          `This will replace your current data:\n` +
          `• Current: ${currentStats.transactions} transactions, ${currentStats.budgets} budgets\n` +
          `• Backup: ${data.transactions.length} transactions, ${Object.keys(data.budgets || {}).length} budgets\n\n` +
          `Backup created: ${data.exportedAt ? new Date(data.exportedAt).toLocaleDateString() : "Unknown date"}\n\n` +
          `⚠️ This action cannot be undone. Continue?`,
      );

      if (confirmed) {
        phoneStorage.saveTransactions(data.transactions);
        phoneStorage.saveBudgets(data.budgets || {});
        if (data.categories) {
          localStorage.setItem("categories", JSON.stringify(data.categories));
        }
        localStorage.setItem("last-import", new Date().toISOString());

        setStatus("success");
        setStatusMessage(
          `Successfully imported ${data.transactions.length} transactions! Refreshing...`,
        );
        setImportData("");

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setImportData("");
      }
    } catch (error) {
      setStatus("error");
      setStatusMessage(`Invalid backup file format`);
      setImportData("");
      setTimeout(() => setStatus("idle"), 3000);
    } finally {
      setIsImporting(false);
    }
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
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-lg font-semibold">Import Data</h1>
            <p className="text-xs text-muted-foreground">
              Restore your financial data from backup
            </p>
          </div>

          {/* Status Message */}
          {status !== "idle" && statusMessage && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${
                status === "success"
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {status === "success" ? (
                <Check className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">{statusMessage}</span>
            </div>
          )}

          {/* Import Instructions */}
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-blue-500/20">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  How to Import
                </h3>
                <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <p>• Select a backup file (.mbak or .json)</p>
                  <p>• Your current data will be replaced</p>
                  <p>• All transactions and budgets will be restored</p>
                  <p>• The app will refresh automatically</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Import Actions */}
          <div className="space-y-3">
            {/* Main Import Button */}
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                  <FileUp className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">
                    Select Backup File
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Choose .mbak or .json backup file
                  </div>
                </div>
              </div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="w-full h-10 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium"
              >
                {isImporting ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-pulse" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Backup File
                  </>
                )}
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".mbak,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </Card>

            {/* Supported Formats */}
            <Card className="p-3 bg-gray-50 dark:bg-gray-900/30">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Supported Formats
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs font-mono">.mbak</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-xs font-mono">.json</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Safety Note */}
          <Card className="p-3 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-1">
                  Important Note
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Importing will completely replace your current data. Consider
                  creating a backup of your current data first.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
