import React, { useState, useRef, useEffect } from 'react';
import { Layout } from "../components/Layout";
import { themeManager } from "../utils/themeColors";
import { Card } from "../components/ui/card";
import { Button } from '../components/ui/button';
import { ArrowLeft, FileText, Download, Upload, Copy, Check, FileUp, RotateCcw } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { phoneStorage } from "../utils/phoneStorage";

export function BackupRestore() {
  const navigate = useNavigate();
  const [exportData, setExportData] = useState<string>('');
  const [importData, setImportData] = useState<string>('');
  const [showExportData, setShowExportData] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    themeManager.setTheme(localStorage.getItem('selected-theme') || 'original');
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  // Get current data from phone storage
  const getCurrentData = () => {
    const transactions = phoneStorage.loadTransactions();
    const budgets = phoneStorage.loadBudgets();
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    
    return {
      transactions,
      budgets,
      categories,
      exportedAt: new Date().toISOString(),
      version: '1.0',
      deviceInfo: `${navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'} - ${new Date().toLocaleDateString()}`
    };
  };

  // Create backup (.mbak file)
  const handleBackupNow = () => {
    try {
      const data = getCurrentData();
      const jsonString = JSON.stringify(data, null, 2);
      
      // Create .mbak file
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clear-finance-backup-${new Date().toISOString().split('T')[0]}.mbak`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setStatus('success');
      setStatusMessage(`Backup created with ${data.transactions.length} transactions and ${Object.keys(data.budgets).length} budget entries`);
      
      // Auto-clear message
      setTimeout(() => {
        setStatus('idle');
        setStatusMessage('');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setStatusMessage('Backup creation failed');
      setTimeout(() => {
        setStatus('idle');
        setStatusMessage('');
      }, 3000);
    }
  };

  // Export for manual sharing
  const handleExportData = () => {
    try {
      const data = getCurrentData();
      const jsonString = JSON.stringify(data, null, 2);
      setExportData(jsonString);
      setShowExportData(true);
      setStatus('success');
      setStatusMessage(`Exported ${data.transactions.length} transactions and ${Object.keys(data.budgets).length} budget entries`);
    } catch (error) {
      setStatus('error');
      setStatusMessage('Export failed');
    }
  };

  // Copy export data to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      setStatus('error');
      setStatusMessage('Failed to copy to clipboard');
    }
  };

  // Handle file upload for restore
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
      setStatus('success');
      setStatusMessage(`File "${file.name}" loaded. Click "RESTORE" to proceed.`);
    };
    reader.onerror = () => {
      setStatus('error');
      setStatusMessage('Failed to read file');
    };
    reader.readAsText(file);
  };

  // Restore from backup
  const handleRestore = () => {
    if (!importData.trim()) {
      setStatus('error');
      setStatusMessage('Please select a backup file or paste backup data');
      return;
    }

    try {
      const data = JSON.parse(importData);
      
      // Validate data structure
      if (!data.transactions || !Array.isArray(data.transactions)) {
        throw new Error('Invalid backup format');
      }

      // Confirm with user before overwriting
      const currentStats = {
        transactions: phoneStorage.loadTransactions().length,
        budgets: Object.keys(phoneStorage.loadBudgets()).length
      };

      const confirmed = window.confirm(
        `🔄 Restore Backup?\n\n` +
        `Replace current data (${currentStats.transactions} transactions, ${currentStats.budgets} budgets)\n` +
        `With backup data (${data.transactions.length} transactions, ${Object.keys(data.budgets || {}).length} budgets)\n\n` +
        `Backup date: ${data.exportedAt ? new Date(data.exportedAt).toLocaleDateString() : 'Unknown'}\n` +
        `Device: ${data.deviceInfo || 'Unknown'}\n\n` +
        `This action cannot be undone. Continue?`
      );

      if (confirmed) {
        // Save data using phone storage utility
        phoneStorage.saveTransactions(data.transactions);
        phoneStorage.saveBudgets(data.budgets || {});
        if (data.categories) {
          localStorage.setItem('categories', JSON.stringify(data.categories));
        }
        localStorage.setItem('last-restore', new Date().toISOString());

        setStatus('success');
        setStatusMessage('Data restored successfully! Refreshing page...');
        setImportData('');
        
        // Reload the page to reflect changes
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      setStatus('error');
      setStatusMessage('Invalid backup file format');
    }
  };

  const getLastRestoreInfo = () => {
    const lastRestore = localStorage.getItem('last-restore');
    return lastRestore ? new Date(lastRestore).toLocaleString() : 'Never';
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
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Backup & Restore</h1>
        </div>

        {/* Backup Visual */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <div className="text-sm font-medium">.mbak</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-muted-foreground flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </div>
            </div>
            <div className="border-2 border-dashed border-muted-foreground rounded-lg p-4">
              <div className="text-2xl font-bold">Clear Finance</div>
            </div>
          </div>
        </div>

        {/* Information Card */}
        <Card className="p-6 bg-green-500/10 border-green-500/20">
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
              <p>Select a backup directory where you want Clear Finance to create backup files and search for backup files to restore.</p>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
              <p>To make a backup, press BACKUP NOW, and Clear Finance will create a single backup file(.mbak) inside your backup directory.</p>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
              <p>To restore a backup file, make sure that the file(.mbak) exists inside your selected backup directory, then press RESTORE. Clear Finance will display a list of backup files found inside your backup directory.</p>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
              <p>It is recommended to create backups regularly and keep the latest backup files in a safer place (ie. your computer or cloud storage).</p>
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

        {/* Current Data Stats */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="text-sm font-medium mb-2">📊 Current Data:</div>
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>💰 {stats.transactions} transactions</div>
            <div>📋 {stats.budgets} budget entries</div>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Last restore: {getLastRestoreInfo()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button 
            onClick={handleBackupNow}
            className="w-full py-4 text-lg font-semibold"
            size="lg"
          >
            <Download className="h-5 w-5 mr-2" />
            BACKUP NOW
          </Button>

          <Button 
            onClick={handleRestore}
            disabled={!importData.trim()}
            className="w-full py-4 text-lg font-semibold"
            variant={importData.trim() ? "default" : "outline"}
            size="lg"
          >
            <Upload className="h-5 w-5 mr-2" />
            RESTORE
          </Button>

          <Button 
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="w-full py-4 text-lg font-semibold"
            size="lg"
          >
            <FileUp className="h-5 w-5 mr-2" />
            SELECT/CHANGE DIRECTORY
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".mbak,.json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Manual Export/Import Section */}
        <div className="border-t border-border pt-6">
          <h3 className="text-lg font-semibold mb-4">Manual Export/Import</h3>
          
          <div className="space-y-4">
            <Button 
              onClick={handleExportData}
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data for Manual Transfer
            </Button>

            {showExportData && exportData && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    onClick={copyToClipboard}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Data
                      </>
                    )}
                  </Button>
                </div>
                
                <textarea
                  value={exportData}
                  readOnly
                  className="w-full h-32 p-2 text-xs bg-muted rounded font-mono"
                  placeholder="Your backup data will appear here..."
                />
              </div>
            )}

            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              className="w-full h-32 p-2 text-xs bg-muted rounded font-mono"
              placeholder="Or paste backup data here for manual restore..."
            />
          </div>
        </div>

        {/* Info Note */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <div className="w-4 h-4 rounded-full border border-muted-foreground flex items-center justify-center flex-shrink-0 mt-0.5">
            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></div>
          </div>
          <p>Clear Finance will create new backup files in your selected directory.</p>
        </div>
      </div>
    </Layout>
  );
}
