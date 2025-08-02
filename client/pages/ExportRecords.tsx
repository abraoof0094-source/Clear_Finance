import { useState, useEffect, useRef } from "react";
import { Layout } from "../components/Layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Download, Calendar, BarChart3, Check, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { phoneStorage } from "../utils/phoneStorage";
import { themeManager } from "../utils/themeColors";

export function ExportRecords() {
  const navigate = useNavigate();
  const [fromMonth, setFromMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [toMonth, setToMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
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

    // Only allow swiping to the left (negative diff means swiping left to close)
    if (diff < 0 && containerRef.current) {
      const translateX = Math.max(diff, -window.innerWidth * 0.75);
      containerRef.current.style.transform = `translateX(${translateX}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (!containerRef.current) return;

    const diff = currentXRef.current - startXRef.current;
    const threshold = -window.innerWidth * 0.15; // 15% of screen width (negative for left swipe)

    if (diff < threshold) {
      // Swipe was far enough, close the page
      navigate(-1);
    } else {
      // Snap back to original position
      containerRef.current.style.transform = "translateX(0)";
    }
  };

  // Add touch event listeners
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

  const exportToCSV = async () => {
    setIsExporting(true);
    setStatus("idle");

    try {
      const allTransactions = phoneStorage.loadTransactions();
      const [fromYear, fromMonthNum] = fromMonth.split("-").map(Number);
      const [toYear, toMonthNum] = toMonth.split("-").map(Number);

      const filteredTransactions = allTransactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        const transactionYear = transactionDate.getFullYear();
        const transactionMonth = transactionDate.getMonth() + 1;

        const transactionYearMonth = transactionYear * 100 + transactionMonth;
        const fromYearMonth = fromYear * 100 + fromMonthNum;
        const toYearMonth = toYear * 100 + toMonthNum;

        return transactionYearMonth >= fromYearMonth && transactionYearMonth <= toYearMonth;
      });

      if (filteredTransactions.length === 0) {
        setStatus("error");
        setStatusMessage("No transactions found in selected date range");
        setTimeout(() => setStatus("idle"), 3000);
        return;
      }

      const headers = ["Date", "Time", "Type", "Main Category", "Sub Category", "Amount", "Notes"];
      const csvContent = [
        headers.join(","),
        ...filteredTransactions.map((transaction) =>
          [
            `"${transaction.date}"`,
            `"${transaction.time}"`,
            `"${transaction.type}"`,
            `"${transaction.mainCategory}"`,
            `"${transaction.subCategory}"`,
            transaction.amount,
            `"${transaction.notes || ""}"`,
          ].join(",")
        ),
      ].join("\\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `clear-finance-export-${fromMonth}-to-${toMonth}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setStatus("success");
      setStatusMessage(`Successfully exported ${filteredTransactions.length} transactions`);
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {
      setStatus("error");
      setStatusMessage("Export failed. Please try again.");
      setTimeout(() => setStatus("idle"), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const getTransactionCount = () => {
    const allTransactions = phoneStorage.loadTransactions();
    const [fromYear, fromMonthNum] = fromMonth.split("-").map(Number);
    const [toYear, toMonthNum] = toMonth.split("-").map(Number);

    return allTransactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      const transactionYear = transactionDate.getFullYear();
      const transactionMonth = transactionDate.getMonth() + 1;

      const transactionYearMonth = transactionYear * 100 + transactionMonth;
      const fromYearMonth = fromYear * 100 + fromMonthNum;
      const toYearMonth = toYear * 100 + toMonthNum;

      return transactionYearMonth >= fromYearMonth && transactionYearMonth <= toYearMonth;
    }).length;
  };

  const setQuickRange = (range: "lastMonth" | "last3" | "last6" | "lastYear") => {
    const now = new Date();
    let fromYear: number, fromMonth: number, toYear: number, toMonth: number;

    // Set to month to current month for all ranges
    toYear = now.getFullYear();
    toMonth = now.getMonth() + 1;

    switch (range) {
      case "lastMonth":
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
        fromYear = toYear = lastMonth.getFullYear();
        fromMonth = toMonth = lastMonth.getMonth() + 1;
        break;
      case "last3":
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2);
        fromYear = threeMonthsAgo.getFullYear();
        fromMonth = threeMonthsAgo.getMonth() + 1;
        break;
      case "last6":
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5);
        fromYear = sixMonthsAgo.getFullYear();
        fromMonth = sixMonthsAgo.getMonth() + 1;
        break;
      case "lastYear":
        const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11);
        fromYear = twelveMonthsAgo.getFullYear();
        fromMonth = twelveMonthsAgo.getMonth() + 1;
        break;
    }

    setFromMonth(`${fromYear}-${String(fromMonth).padStart(2, "0")}`);
    setToMonth(`${toYear}-${String(toMonth).padStart(2, "0")}`);
  };

  // Navigation functions for month arrows
  const navigateMonth = (direction: "prev" | "next", monthType: "from" | "to") => {
    const currentMonth = monthType === "from" ? fromMonth : toMonth;
    const [year, month] = currentMonth.split("-").map(Number);

    let newYear = year;
    let newMonth = month;

    if (direction === "next") {
      newMonth += 1;
      if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      }
    } else {
      newMonth -= 1;
      if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      }
    }

    const newMonthStr = `${newYear}-${String(newMonth).padStart(2, "0")}`;

    if (monthType === "from") {
      setFromMonth(newMonthStr);
    } else {
      setToMonth(newMonthStr);
    }
  };

  const transactionCount = getTransactionCount();

  return (
    <Layout>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={() => navigate(-1)} />

      {/* Slide Panel */}
      <div
        ref={containerRef}
        className="fixed top-0 left-0 h-full w-3/4 bg-background border-r border-border z-50 transform transition-transform duration-300 ease-out overflow-y-auto"
        style={{
          transform: "translateX(0)",
        }}
      >
        <div className="space-y-4 py-4 px-4">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-lg font-semibold">Export Records</h1>
            <p className="text-xs text-muted-foreground">Export transactions as CSV spreadsheet</p>
          </div>

          {/* Status Message */}
          {status !== "idle" && statusMessage && (
            <div
              className={`flex items-center gap-2 p-2 rounded-lg ${
                status === "success"
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {status === "success" ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
              <span className="text-xs font-medium">{statusMessage}</span>
            </div>
          )}

          {/* Quick Range Buttons */}
          <div>
            <h2 className="text-sm font-semibold section-header mb-2">Quick Date Ranges</h2>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => setQuickRange("lastMonth")} className="text-xs">
                Last Month
              </Button>
              <Button variant="outline" size="sm" onClick={() => setQuickRange("last3")} className="text-xs">
                Last 3 Months
              </Button>
              <Button variant="outline" size="sm" onClick={() => setQuickRange("last6")} className="text-xs">
                Last 6 Months
              </Button>
              <Button variant="outline" size="sm" onClick={() => setQuickRange("lastYear")} className="text-xs">
                Last Year
              </Button>
            </div>
          </div>

          {/* Date Range Selection */}
          <Card className="p-3">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-3 w-3 theme-accent" />
                <span className="text-sm font-medium">Custom Date Range</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">From Month</label>
                  <div className="flex items-center gap-1 mt-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => navigateMonth("prev", "from")}
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <Input
                      type="month"
                      value={fromMonth}
                      onChange={(e) => setFromMonth(e.target.value)}
                      className="flex-1 h-7 text-xs"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => navigateMonth("next", "from")}
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">To Month</label>
                  <div className="flex items-center gap-1 mt-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => navigateMonth("prev", "to")}
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <Input
                      type="month"
                      value={toMonth}
                      onChange={(e) => setToMonth(e.target.value)}
                      className="flex-1 h-7 text-xs"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => navigateMonth("next", "to")}
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Export Button */}
          <Button
            onClick={exportToCSV}
            disabled={isExporting || !fromMonth || !toMonth || transactionCount === 0}
            className="w-full py-3 text-sm font-semibold"
            size="sm"
          >
            {isExporting ? (
              <>
                <Download className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </>
            )}
          </Button>

          {/* Info Card */}
          <Card className="p-3 bg-blue-500/10 border-blue-500/20">
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-2 font-medium text-blue-400">
                <BarChart3 className="h-3 w-3" />
                Export Information
              </div>
              <ul className="space-y-1 text-blue-300 text-xs">
                <li>• CSV files can be opened in Excel, Google Sheets, or Numbers</li>
                <li>• Perfect for tax reporting and financial analysis</li>
                <li>• CSV files cannot be imported back (use Backup for that)</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
