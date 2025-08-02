import React, { useState, useRef, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Download,
  Upload,
  FileUp,
  Check,
  AlertCircle,
  Shield,
  RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { phoneStorage } from "../utils/phoneStorage";
import { themeManager } from "../utils/themeColors";

export function BackupRestore() {
  const navigate = useNavigate();
  const [importData, setImportData] = useState<string>("");
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    themeManager.setTheme(localStorage.getItem("selected-theme") || "original");
  }, []);

  // Create backup
  const handleBackupNow = async () => {
    setIsBackingUp(true);
    setStatus("idle");

    try {
      const data = {
        transactions: phoneStorage.loadTransactions(),
        budgets: phoneStorage.loadBudgets(),
        categories: JSON.parse(localStorage.getItem("categories") || "[]"),
        exportedAt: new Date().toISOString(),
        version: "1.0",
        deviceInfo: `${navigator.userAgent.includes("Mobile") ? "Mobile" : "Desktop"} - ${new Date().toLocaleDateString()}`,
      };

      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clear-finance-backup-${new Date().toISOString().split("T")[0]}.mbak`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus("success");
      setStatusMessage(
        `Backup created with ${data.transactions.length} transactions and ${Object.keys(data.budgets).length} budget entries`,
      );
      setTimeout(() => setStatus("idle"), 4000);
    } catch (error) {
      setStatus("error");
      setStatusMessage("Backup creation failed");
      setTimeout(() => setStatus("idle"), 4000);
    } finally {
      setIsBackingUp(false);
    }
  };

  // Handle file upload and auto-restore
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);

      // Auto-trigger restore immediately after file is loaded
      setTimeout(() => {
        handleRestoreWithContent(content, file.name);
      }, 100);
    };
    reader.onerror = () => {
      setStatus("error");
      setStatusMessage("Failed to read file");
    };
    reader.readAsText(file);
  };

  // Restore with provided content
  const handleRestoreWithContent = async (
    content: string,
    fileName: string,
  ) => {
    setIsRestoring(true);
    setStatus("idle");

    try {
      const data = JSON.parse(content);

      if (!data.transactions || !Array.isArray(data.transactions)) {
        throw new Error("Invalid backup format");
      }

      const currentStats = {
        transactions: phoneStorage.loadTransactions().length,
        budgets: Object.keys(phoneStorage.loadBudgets()).length,
      };

      const confirmed = window.confirm(
        `🔄 Restore from "${fileName}"?\n\n` +
          `Replace current data (${currentStats.transactions} transactions, ${currentStats.budgets} budgets)\n` +
          `With backup data (${data.transactions.length} transactions, ${Object.keys(data.budgets || {}).length} budgets)\n\n` +
          `Backup date: ${data.exportedAt ? new Date(data.exportedAt).toLocaleDateString() : "Unknown"}\n\n` +
          `This action cannot be undone. Continue?`,
      );

      if (confirmed) {
        phoneStorage.saveTransactions(data.transactions);
        phoneStorage.saveBudgets(data.budgets || {});
        if (data.categories) {
          localStorage.setItem("categories", JSON.stringify(data.categories));
        }
        localStorage.setItem("last-restore", new Date().toISOString());

        setStatus("success");
        setStatusMessage("Data restored successfully! Refreshing page...");
        setImportData("");

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setImportData("");
      }
    } catch (error) {
      setStatus("error");
      setStatusMessage(`Invalid backup file: ${fileName}`);
      setImportData("");
      setTimeout(() => setStatus("idle"), 3000);
    } finally {
      setIsRestoring(false);
    }
  };

  // Restore from backup
  const handleRestore = async () => {
    if (!importData.trim()) {
      setStatus("error");
      setStatusMessage("Please select a backup file");
      setTimeout(() => setStatus("idle"), 3000);
      return;
    }

    setIsRestoring(true);
    setStatus("idle");

    try {
      const data = JSON.parse(importData);

      if (!data.transactions || !Array.isArray(data.transactions)) {
        throw new Error("Invalid backup format");
      }

      const currentStats = {
        transactions: phoneStorage.loadTransactions().length,
        budgets: Object.keys(phoneStorage.loadBudgets()).length,
      };

      const confirmed = window.confirm(
        `🔄 Restore Backup?\n\n` +
          `Replace current data (${currentStats.transactions} transactions, ${currentStats.budgets} budgets)\n` +
          `With backup data (${data.transactions.length} transactions, ${Object.keys(data.budgets || {}).length} budgets)\n\n` +
          `Backup date: ${data.exportedAt ? new Date(data.exportedAt).toLocaleDateString() : "Unknown"}\n\n` +
          `This action cannot be undone. Continue?`,
      );

      if (confirmed) {
        phoneStorage.saveTransactions(data.transactions);
        phoneStorage.saveBudgets(data.budgets || {});
        if (data.categories) {
          localStorage.setItem("categories", JSON.stringify(data.categories));
        }
        localStorage.setItem("last-restore", new Date().toISOString());

        setStatus("success");
        setStatusMessage("Data restored successfully! Refreshing page...");
        setImportData("");

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      setStatus("error");
      setStatusMessage("Invalid backup file format");
      setTimeout(() => setStatus("idle"), 3000);
    } finally {
      setIsRestoring(false);
    }
  };

  const getDataStats = () => {
    const transactions = phoneStorage.loadTransactions();
    const budgets = phoneStorage.loadBudgets();
    return {
      transactions: transactions.length,
      budgets: Object.keys(budgets).length,
    };
  };

  const getLastRestoreInfo = () => {
    const lastRestore = localStorage.getItem("last-restore");
    return lastRestore ? new Date(lastRestore).toLocaleDateString() : "Never";
  };

  const stats = getDataStats();

  return (
    <Layout>
      {/* Click outside overlay */}
      <div
        className="fixed inset-0 bg-black/5 z-30"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          navigate(-1);
        }}
      />

      {/* Content container */}
      <div
        className="relative z-40 max-w-md mx-auto space-y-6 py-4 bg-background rounded-lg shadow-lg"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-xl font-semibold">Backup & Restore</h1>
          <p className="text-sm text-muted-foreground">
            Protect and transfer your data
          </p>
        </div>

        {/* Status Message */}
        {status !== "idle" && statusMessage && (
          <div
            className={`flex items-center gap-3 p-4 rounded-lg ${
              status === "success"
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {status === "success" ? (
              <Check className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="text-sm font-medium">{statusMessage}</span>
          </div>
        )}

        {/* Backup Section */}
        <div>
          <h2 className="text-lg font-semibold section-header mb-3">
            Create Backup
          </h2>
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/20">
                <Download className="h-6 w-6 text-green-500" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Complete Backup</div>
                <div className="text-sm text-muted-foreground">
                  Saves all your transactions, budgets, and settings
                </div>
              </div>
            </div>
            <Button
              onClick={handleBackupNow}
              disabled={isBackingUp}
              className="w-full mt-4"
              size="lg"
            >
              {isBackingUp ? (
                <>
                  <Download className="h-5 w-5 mr-2 animate-spin" />
                  Creating Backup...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Create Backup (.mbak)
                </>
              )}
            </Button>
          </Card>
        </div>

        {/* Restore Section */}
        <div>
          <h2 className="text-lg font-semibold section-header mb-3">
            Restore Data
          </h2>
          <Card className="p-4">
            <div className="space-y-4">
              {/* File Upload */}
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-full bg-blue-500/20">
                  <RotateCcw className="h-6 w-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Restore from Backup</div>
                  <div className="text-sm text-muted-foreground">
                    Upload a .mbak or .json backup file
                  </div>
                </div>
              </div>

              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
                size="lg"
              >
                <FileUp className="h-5 w-5 mr-2" />
                Select Backup File
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".mbak,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="p-4 bg-amber-500/10 border-amber-500/20">
          <div className="text-sm space-y-2">
            <div className="flex items-center gap-2 font-medium text-amber-400">
              <Shield className="h-4 w-4" />
              Backup Tips
            </div>
            <ul className="space-y-1 text-amber-300">
              <li>• Create backups regularly to protect your data</li>
              <li>
                • Store backup files in safe places (cloud storage, computer)
              </li>
              <li>
                • Backup files contain ALL your data and can fully restore it
              </li>
              <li>• Always backup before major changes or updates</li>
            </ul>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
