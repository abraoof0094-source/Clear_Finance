import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ArrowLeft, Download, Calendar, BarChart3, Check, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { phoneStorage } from "../utils/phoneStorage";
import { themeManager } from "../utils/themeColors";

export function ExportRecords() {
  const navigate = useNavigate();
  const [fromMonth, setFromMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [toMonth, setToMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    themeManager.setTheme(localStorage.getItem('selected-theme') || 'original');
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const exportToCSV = async () => {
    setIsExporting(true);
    setStatus('idle');
    
    try {
      const allTransactions = phoneStorage.loadTransactions();

      // Create month range from MM-YY inputs
      const [fromYear, fromMonthNum] = fromMonth.split('-').map(Number);
      const [toYear, toMonthNum] = toMonth.split('-').map(Number);

      const filteredTransactions = allTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const transactionYear = transactionDate.getFullYear();
        const transactionMonth = transactionDate.getMonth() + 1;

        const transactionYearMonth = transactionYear * 100 + transactionMonth;
        const fromYearMonth = fromYear * 100 + fromMonthNum;
        const toYearMonth = toYear * 100 + toMonthNum;

        return transactionYearMonth >= fromYearMonth && transactionYearMonth <= toYearMonth;
      });

      if (filteredTransactions.length === 0) {
        setStatus('error');
        setStatusMessage('No transactions found in selected date range');
        setTimeout(() => setStatus('idle'), 3000);
        return;
      }

      const headers = ['Date', 'Time', 'Type', 'Main Category', 'Sub Category', 'Amount', 'Notes'];
      const csvContent = [
        headers.join(','),
        ...filteredTransactions.map(transaction => [
          `"${transaction.date}"`,
          `"${transaction.time}"`,
          `"${transaction.type}"`,
          `"${transaction.mainCategory}"`,
          `"${transaction.subCategory}"`,
          transaction.amount,
          `"${transaction.notes || ''}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `clear-finance-export-${fromMonth}-to-${toMonth}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setStatus('success');
      setStatusMessage(`Successfully exported ${filteredTransactions.length} transactions`);
      setTimeout(() => setStatus('idle'), 3000);
      
    } catch (error) {
      setStatus('error');
      setStatusMessage('Export failed. Please try again.');
      setTimeout(() => setStatus('idle'), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const getTransactionCount = () => {
    const allTransactions = phoneStorage.loadTransactions();
    const [fromYear, fromMonthNum] = fromMonth.split('-').map(Number);
    const [toYear, toMonthNum] = toMonth.split('-').map(Number);

    return allTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const transactionYear = transactionDate.getFullYear();
      const transactionMonth = transactionDate.getMonth() + 1;

      const transactionYearMonth = transactionYear * 100 + transactionMonth;
      const fromYearMonth = fromYear * 100 + fromMonthNum;
      const toYearMonth = toYear * 100 + toMonthNum;

      return transactionYearMonth >= fromYearMonth && transactionYearMonth <= toYearMonth;
    }).length;
  };

  const setQuickRange = (range: 'thisMonth' | 'lastMonth' | 'last3Months' | 'thisYear') => {
    const now = new Date();
    let fromYear: number, fromMonth: number, toYear: number, toMonth: number;

    switch (range) {
      case 'thisMonth':
        fromYear = toYear = now.getFullYear();
        fromMonth = toMonth = now.getMonth() + 1;
        break;
      case 'lastMonth':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
        fromYear = toYear = lastMonth.getFullYear();
        fromMonth = toMonth = lastMonth.getMonth() + 1;
        break;
      case 'last3Months':
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2);
        fromYear = threeMonthsAgo.getFullYear();
        fromMonth = threeMonthsAgo.getMonth() + 1;
        toYear = now.getFullYear();
        toMonth = now.getMonth() + 1;
        break;
      case 'thisYear':
        fromYear = toYear = now.getFullYear();
        fromMonth = 1;
        toMonth = 12;
        break;
    }

    setFromMonth(`${fromYear}-${String(fromMonth).padStart(2, '0')}`);
    setToMonth(`${toYear}-${String(toMonth).padStart(2, '0')}`);
  };

  const transactionCount = getTransactionCount();

  return (
    <Layout>
      <div className="space-y-6 py-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Export Records</h1>
            <p className="text-sm text-muted-foreground">Export transactions as CSV spreadsheet</p>
          </div>
        </div>

        {/* Status Message */}
        {status !== 'idle' && statusMessage && (
          <div className={`flex items-center gap-3 p-4 rounded-lg ${
            status === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {status === 'success' ? (
              <Check className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="text-sm font-medium">{statusMessage}</span>
          </div>
        )}

        {/* Quick Range Buttons */}
        <div>
          <h2 className="text-lg font-semibold section-header mb-3">Quick Date Ranges</h2>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setQuickRange('thisMonth')}
              className="text-xs"
            >
              This Month
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setQuickRange('lastMonth')}
              className="text-xs"
            >
              Last Month
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setQuickRange('last3Months')}
              className="text-xs"
            >
              Last 3 Months
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setQuickRange('thisYear')}
              className="text-xs"
            >
              This Year
            </Button>
          </div>
        </div>

        {/* Date Range Selection */}
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 theme-accent" />
              <span className="font-medium">Custom Date Range</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">From Month</label>
                <Input
                  type="month"
                  value={fromMonth}
                  onChange={(e) => setFromMonth(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">To Month</label>
                <Input
                  type="month"
                  value={toMonth}
                  onChange={(e) => setToMonth(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Transaction Count */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 theme-accent" />
                <span className="text-sm font-medium">Transactions to export</span>
              </div>
              <span className="text-lg font-bold theme-primary">{transactionCount}</span>
            </div>
          </div>
        </Card>

        {/* Export Button */}
        <Button
          onClick={exportToCSV}
          disabled={isExporting || !fromDate || !toDate || transactionCount === 0}
          className="w-full py-4 text-lg font-semibold"
          size="lg"
        >
          {isExporting ? (
            <>
              <Download className="h-5 w-5 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-5 w-5 mr-2" />
              Export CSV ({transactionCount} transactions)
            </>
          )}
        </Button>

        {/* Info Card */}
        <Card className="p-4 bg-blue-500/10 border-blue-500/20">
          <div className="text-sm space-y-2">
            <div className="flex items-center gap-2 font-medium text-blue-400">
              <BarChart3 className="h-4 w-4" />
              Export Information
            </div>
            <ul className="space-y-1 text-blue-300">
              <li>• CSV files can be opened in Excel, Google Sheets, or Numbers</li>
              <li>• Files include date, time, category, amount, and notes</li>
              <li>• Perfect for tax reporting and financial analysis</li>
              <li>• CSV files cannot be imported back (use Backup for that)</li>
            </ul>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
