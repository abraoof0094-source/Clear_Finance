import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { themeManager } from "../utils/themeColors";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ArrowLeft, FileText, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { phoneStorage } from "../utils/phoneStorage";

export function ExportRecords() {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState("2025-08-01");
  const [toDate, setToDate] = useState("2025-08-31");
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleBack = () => {
    navigate(-1);
  };

  const exportToCSV = async () => {
    setIsExporting(true);
    setStatus('idle');
    
    try {
      // Get all transactions
      const allTransactions = phoneStorage.loadTransactions();
      
      // Filter by date range
      const fromDateObj = new Date(fromDate);
      const toDateObj = new Date(toDate);
      
      const filteredTransactions = allTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= fromDateObj && transactionDate <= toDateObj;
      });

      if (filteredTransactions.length === 0) {
        setStatus('error');
        setStatusMessage('No transactions found in the selected date range');
        setIsExporting(false);
        return;
      }

      // Create CSV content
      const headers = [
        'Date',
        'Time', 
        'Type',
        'Main Category',
        'Sub Category',
        'Amount',
        'Notes'
      ];

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

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `clear-finance-export-${fromDate}-to-${toDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setStatus('success');
      setStatusMessage(`Successfully exported ${filteredTransactions.length} transactions`);
      
    } catch (error) {
      setStatus('error');
      setStatusMessage('Export failed. Please try again.');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
      setTimeout(() => {
        setStatus('idle');
        setStatusMessage('');
      }, 3000);
    }
  };

  const getTransactionCount = () => {
    const allTransactions = phoneStorage.loadTransactions();
    const fromDateObj = new Date(fromDate);
    const toDateObj = new Date(toDate);
    
    return allTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= fromDateObj && transactionDate <= toDateObj;
    }).length;
  };

  return (
    <Layout>
      <div className="space-y-6 py-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Export records</h1>
        </div>

        {/* Export Visual */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-6">
            <div className="border-2 border-dashed border-muted-foreground rounded-lg p-4">
              <div className="text-2xl font-bold">Clear Finance</div>
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-muted-foreground flex items-center justify-center">
              <div className="w-4 h-0 border-t-2 border-muted-foreground"></div>
              <div className="w-0 h-0 border-l-4 border-l-muted-foreground border-y-2 border-y-transparent ml-1"></div>
            </div>
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <div className="text-sm font-medium">.xlsx</div>
            </div>
          </div>
        </div>

        {/* Information Card */}
        <Card className="p-6 bg-green-500/10 border-green-500/20">
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
              <p>All records between a specified time range can be exported as a worksheet (Currently in .csv format).</p>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
              <p>To export records, set the start time and end time of the interval below and tap EXPORT NOW.</p>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
              <p>Note that, exported files(.csv) are not backup files and you cannot restore data from these files.</p>
            </div>
          </div>
        </Card>

        {/* Status Message */}
        {status !== 'idle' && statusMessage && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            status === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            <span className="text-sm">{statusMessage}</span>
          </div>
        )}

        {/* Date Range Selection */}
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-lg font-semibold mb-2">From:</div>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="text-center text-lg font-medium border-b-2 border-primary/50 bg-transparent"
            />
          </div>

          <div className="text-center">
            <div className="text-lg font-semibold mb-2">To:</div>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="text-center text-lg font-medium border-b-2 border-primary/50 bg-transparent"
            />
          </div>
        </div>

        {/* Transaction Count Preview */}
        <div className="text-center text-sm text-muted-foreground">
          {getTransactionCount()} transactions in selected range
        </div>

        {/* Export Button */}
        <div className="flex justify-center pt-6">
          <Button
            onClick={exportToCSV}
            disabled={isExporting || !fromDate || !toDate}
            className="px-12 py-3 text-lg font-semibold"
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
                EXPORT NOW
              </>
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
