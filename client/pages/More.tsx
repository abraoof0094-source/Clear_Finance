import { useState } from "react";
import { Layout } from "../components/Layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { 
  Download, 
  Upload, 
  FileText, 
  Settings, 
  FolderOpen,
  Smartphone,
  Calendar,
  BarChart3,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { phoneStorage } from "../utils/phoneStorage";

export function More() {
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Quick export CSV
  const quickExport = async () => {
    setIsExporting(true);
    try {
      const transactions = phoneStorage.loadTransactions();
      
      if (transactions.length === 0) {
        alert('No transactions to export');
        return;
      }

      // Create CSV
      const headers = ['Date', 'Time', 'Type', 'Category', 'Subcategory', 'Amount', 'Notes'];
      const csvContent = [
        headers.join(','),
        ...transactions.map(t => [
          `"${t.date}"`, `"${t.time}"`, `"${t.type}"`, 
          `"${t.mainCategory}"`, `"${t.subCategory}"`, 
          t.amount, `"${t.notes || ''}"`
        ].join(','))
      ].join('\n');

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clear-finance-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  // Quick backup
  const quickBackup = async () => {
    setIsBackingUp(true);
    try {
      const data = {
        transactions: phoneStorage.loadTransactions(),
        budgets: phoneStorage.loadBudgets(),
        categories: JSON.parse(localStorage.getItem('categories') || '[]'),
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };

      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clear-finance-backup-${new Date().toISOString().split('T')[0]}.mbak`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Backup failed');
    } finally {
      setIsBackingUp(false);
    }
  };

  const getDataStats = () => {
    const transactions = phoneStorage.loadTransactions();
    const budgets = phoneStorage.loadBudgets();
    return {
      transactions: transactions.length,
      budgets: Object.keys(budgets).length
    };
  };

  const stats = getDataStats();

  return (
    <Layout>
      <div className="space-y-6 py-4">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold section-header mb-2">More</h1>
          <p className="text-sm text-muted-foreground">
            Backup, export, and manage your data
          </p>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold section-header mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4">
              <div className="text-center space-y-3">
                <div className="p-3 rounded-full bg-blue-500/20 mx-auto w-fit">
                  <Download className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <div className="font-medium text-sm">Quick Export</div>
                  <div className="text-xs text-muted-foreground">
                    {stats.transactions} transactions
                  </div>
                </div>
                <Button 
                  onClick={quickExport}
                  disabled={isExporting || stats.transactions === 0}
                  size="sm"
                  className="w-full"
                >
                  {isExporting ? 'Exporting...' : 'Export CSV'}
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-center space-y-3">
                <div className="p-3 rounded-full bg-green-500/20 mx-auto w-fit">
                  <Upload className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <div className="font-medium text-sm">Quick Backup</div>
                  <div className="text-xs text-muted-foreground">
                    Complete data backup
                  </div>
                </div>
                <Button 
                  onClick={quickBackup}
                  disabled={isBackingUp}
                  size="sm"
                  className="w-full"
                  variant="outline"
                >
                  {isBackingUp ? 'Creating...' : 'Backup All'}
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Data Management */}
        <div>
          <h2 className="text-lg font-semibold section-header mb-4">Data Management</h2>
          <Card className="p-1">
            <div className="space-y-1">
              {/* Advanced Export */}
              <button
                onClick={() => navigate('/export-records')}
                className="flex items-center justify-between p-4 w-full text-left hover:bg-muted/50 rounded-md transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-500/20">
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <div className="font-medium">Advanced Export</div>
                    <div className="text-sm text-muted-foreground">
                      Export with date range and filters
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>

              {/* Backup & Restore */}
              <button
                onClick={() => navigate('/backup-restore')}
                className="flex items-center justify-between p-4 w-full text-left hover:bg-muted/50 rounded-md transition-colors border-t border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-500/20">
                    <FileText className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium">Backup & Restore</div>
                    <div className="text-sm text-muted-foreground">
                      Complete backup and restore options
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </Card>
        </div>

        {/* Tools & Settings */}
        <div>
          <h2 className="text-lg font-semibold section-header mb-4">Tools & Settings</h2>
          <Card className="p-1">
            <div className="space-y-1">
              {/* Categories */}
              <button
                onClick={() => navigate('/categories')}
                className="flex items-center justify-between p-4 w-full text-left hover:bg-muted/50 rounded-md transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-500/20">
                    <FolderOpen className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <div className="font-medium">Categories</div>
                    <div className="text-sm text-muted-foreground">
                      Manage expense and income categories
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>

              {/* Phone Storage */}
              <button
                onClick={() => navigate('/preferences')}
                className="flex items-center justify-between p-4 w-full text-left hover:bg-muted/50 rounded-md transition-colors border-t border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-500/20">
                    <Smartphone className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium">Storage & Preferences</div>
                    <div className="text-sm text-muted-foreground">
                      Storage status, themes, and settings
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-500 border-green-500">
                  {stats.transactions} saved
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </Card>
        </div>

        {/* Data Summary */}
        <Card className="p-4 bg-muted/30">
          <div className="text-center space-y-3">
            <div className="text-sm font-medium">📱 Your Data</div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-2xl font-bold amount-income">{stats.transactions}</div>
                <div className="text-xs text-muted-foreground">Transactions</div>
              </div>
              <div>
                <div className="text-2xl font-bold theme-accent">{stats.budgets}</div>
                <div className="text-xs text-muted-foreground">Budget entries</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              All data is securely stored on your phone
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
