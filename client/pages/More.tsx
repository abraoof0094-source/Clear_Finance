import { useState, useEffect, useRef } from "react";
import { Layout } from "../components/Layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Settings,
  Download,
  Upload,
  Database,
  Smartphone,
  Calculator,
  Users,
  Lock,
  MessageSquare,
  HelpCircle,
  Heart,
  Trash2,
  FileText,
  PieChart,
  TrendingUp,
  Shield,
  Palette,
  Bell,
  Globe,
  Check,
  AlertCircle,
  Info,
  FileUp,
  HardDrive,
  FolderOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { phoneStorage } from "../utils/phoneStorage";

export function More() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    transactions: 0,
    totalIncome: 0,
    totalExpenses: 0,
    thisMonth: 0,
  });

  useEffect(() => {
    // Get statistics
    const transactions = phoneStorage.loadTransactions();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const thisMonthTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    });

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    setStats({
      transactions: transactions.length,
      totalIncome,
      totalExpenses,
      thisMonth: thisMonthTransactions.length,
    });
  }, []);

  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);

  const tools = [
    {
      id: "preferences",
      title: "Configuration",
      subtitle: "App settings & themes",
      icon: Settings,
      color: "bg-blue-500/10 text-blue-500",
      action: () => navigate("/preferences"),
    },
    {
      id: "categories",
      title: "Categories",
      subtitle: "Manage categories & budgets",
      icon: FolderOpen,
      color: "bg-purple-500/10 text-purple-500",
      action: () => navigate("/categories"),
    },
    {
      id: "passcode",
      title: "Passcode",
      subtitle: "Security settings",
      icon: Lock,
      color: "bg-orange-500/10 text-orange-500",
      action: () => {},
    },
    {
      id: "import",
      title: "Import",
      subtitle: "Load backup file",
      icon: Download,
      color: "bg-indigo-500/10 text-indigo-500",
      action: () => setShowImportDialog(true),
    },
    {
      id: "export",
      title: "Export",
      subtitle: "Create backup file",
      icon: Upload,
      color: "bg-emerald-500/10 text-emerald-500",
      action: () => setShowBackupDialog(true),
    },
    {
      id: "feedback",
      title: "Feedback",
      subtitle: "Send feedback",
      icon: MessageSquare,
      color: "bg-pink-500/10 text-pink-500",
      action: () => {},
    },
    {
      id: "help",
      title: "Help",
      subtitle: "Support center",
      icon: HelpCircle,
      color: "bg-amber-500/10 text-amber-500",
      action: () => {},
    },
    {
      id: "recommend",
      title: "Recommend",
      subtitle: "Share with friends",
      icon: Heart,
      color: "bg-rose-500/10 text-rose-500",
      action: () => {},
    },
  ];

  return (
    <Layout>
      <div className="space-y-6 py-4">
        {/* Tools Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4 px-1">Settings</h2>
          <div className="grid grid-cols-3 gap-4">
            {tools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <Card
                  key={tool.id}
                  className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer border-0 bg-card/50 backdrop-blur-sm"
                  onClick={tool.action}
                >
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div
                      className={`w-12 h-12 rounded-xl ${tool.color} flex items-center justify-center transition-transform hover:scale-110`}
                    >
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{tool.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {tool.subtitle}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modern Import Dialog */}
      <ImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
      />

      {/* Modern Export Dialog */}
      <ExportDialog
        open={showBackupDialog}
        onOpenChange={setShowBackupDialog}
      />
    </Layout>
  );
}

// Modern Import Dialog Component
function ImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isImporting, setIsImporting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
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
          `⚠️ This action cannot be undone. Continue?`,
      );

      if (confirmed) {
        phoneStorage.saveTransactions(data.transactions);
        phoneStorage.saveBudgets(data.budgets || {});
        if (data.categories) {
          localStorage.setItem("categories", JSON.stringify(data.categories));
        }

        setStatus("success");
        setStatusMessage(
          `Successfully imported ${data.transactions.length} transactions!`,
        );

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      setStatus("error");
      setStatusMessage(`Invalid backup file format`);
      setTimeout(() => setStatus("idle"), 3000);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
              <Upload className="h-5 w-5 text-white" />
            </div>
            Import Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Select a backup file (.mbak or .json) to restore your data. This
                will replace all current transactions and settings.
              </div>
            </div>
          </Card>

          {/* Import Button */}
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium"
          >
            {isImporting ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-pulse" />
                Importing...
              </>
            ) : (
              <>
                <FileUp className="h-4 w-4 mr-2" />
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Modern Export Dialog Component
function ExportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [stats, setStats] = useState({
    transactions: 0,
    budgets: 0,
    categories: 0,
  });

  useEffect(() => {
    if (open) {
      const transactions = phoneStorage.loadTransactions();
      const budgets = phoneStorage.loadBudgets();
      const categories = JSON.parse(localStorage.getItem("categories") || "[]");

      setStats({
        transactions: transactions.length,
        budgets: Object.keys(budgets).length,
        categories: categories.length,
      });
    }
  }, [open]);

  const handleCreateExport = async () => {
    setIsExporting(true);
    setStatus("idle");

    try {
      const data = {
        version: "2.0",
        exportedAt: new Date().toISOString(),
        transactions: phoneStorage.loadTransactions(),
        budgets: phoneStorage.loadBudgets(),
        categories: JSON.parse(localStorage.getItem("categories") || "[]"),
        settings: {
          theme: localStorage.getItem("selected-theme") || "original",
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
      setStatusMessage(`Backup file created successfully!`);
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {
      setStatus("error");
      setStatusMessage("Failed to create backup file. Please try again.");
      setTimeout(() => setStatus("idle"), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600">
              <Download className="h-5 w-5 text-white" />
            </div>
            Export Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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

          {/* Data Summary */}
          <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-3">
              <HardDrive className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-semibold text-green-900 dark:text-green-100">
                Ready to Export
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-white/60 dark:bg-gray-800/60 rounded">
                <div className="text-lg font-bold text-green-900 dark:text-green-100">
                  {stats.transactions}
                </div>
                <div className="text-xs text-green-700 dark:text-green-300">
                  Transactions
                </div>
              </div>
              <div className="text-center p-2 bg-white/60 dark:bg-gray-800/60 rounded">
                <div className="text-lg font-bold text-green-900 dark:text-green-100">
                  {stats.budgets}
                </div>
                <div className="text-xs text-green-700 dark:text-green-300">
                  Budgets
                </div>
              </div>
              <div className="text-center p-2 bg-white/60 dark:bg-gray-800/60 rounded">
                <div className="text-lg font-bold text-green-900 dark:text-green-100">
                  {stats.categories}
                </div>
                <div className="text-xs text-green-700 dark:text-green-300">
                  Categories
                </div>
              </div>
            </div>
          </Card>

          {/* Export Information */}
          <Card className="p-3 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Export includes all transactions, budgets, categories, and app
                settings. Backup file will be saved to your Downloads folder.
              </div>
            </div>
          </Card>

          {/* Export Button */}
          <Button
            onClick={handleCreateExport}
            disabled={isExporting || stats.transactions === 0}
            className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium"
          >
            {isExporting ? (
              <>
                <Download className="h-4 w-4 mr-2 animate-bounce" />
                Creating Backup File...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Create Backup File
              </>
            )}
          </Button>

          {stats.transactions === 0 && (
            <p className="text-xs text-muted-foreground text-center">
              No data to export. Add some transactions first.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
