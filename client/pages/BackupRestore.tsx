import React, { useState, useRef, useEffect } from 'react';
import { Layout } from "../components/Layout";
import { Card } from "../components/ui/card";
import { Button } from '../components/ui/button';
import { Download, Upload, FileUp, Check, AlertCircle, RotateCcw } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { phoneStorage } from "../utils/phoneStorage";
import { themeManager } from "../utils/themeColors";

export function BackupRestore() {
  const navigate = useNavigate();
  const [importData, setImportData] = useState<string>('');
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    themeManager.setTheme(localStorage.getItem('selected-theme') || 'original');
  }, []);

  // Create backup
  const handleBackupNow = async () => {
    setIsBackingUp(true);
    setStatus('idle');
    
    try {
      const data = {
        transactions: phoneStorage.loadTransactions(),
        budgets: phoneStorage.loadBudgets(),
        categories: JSON.parse(localStorage.getItem('categories') || '[]'),
        exportedAt: new Date().toISOString(),
        version: '1.0',
        deviceInfo: `${navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'} - ${new Date().toLocaleDateString()}`
      };

      const jsonString = JSON.stringify(data, null, 2);
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
      setStatusMessage(`Backup created successfully`);
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      setStatus('error');
      setStatusMessage('Backup creation failed');
      setTimeout(() => setStatus('idle'), 3000);
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
      setStatus('error');
      setStatusMessage('Failed to read file');
    };
    reader.readAsText(file);
  };

  // Restore with provided content
  const handleRestoreWithContent = async (content: string, fileName: string) => {
    setIsRestoring(true);
    setStatus('idle');

    try {
      const data = JSON.parse(content);
      
      if (!data.transactions || !Array.isArray(data.transactions)) {
        throw new Error('Invalid backup format');
      }

      const currentStats = {
        transactions: phoneStorage.loadTransactions().length,
        budgets: Object.keys(phoneStorage.loadBudgets()).length
      };

      const confirmed = window.confirm(
        `🔄 Restore from "${fileName}"?\n\n` +
        `Replace current data (${currentStats.transactions} transactions, ${currentStats.budgets} budgets)\n` +
        `With backup data (${data.transactions.length} transactions, ${Object.keys(data.budgets || {}).length} budgets)\n\n` +
        `Backup date: ${data.exportedAt ? new Date(data.exportedAt).toLocaleDateString() : 'Unknown'}\n\n` +
        `This action cannot be undone. Continue?`
      );

      if (confirmed) {
        phoneStorage.saveTransactions(data.transactions);
        phoneStorage.saveBudgets(data.budgets || {});
        if (data.categories) {
          localStorage.setItem('categories', JSON.stringify(data.categories));
        }
        localStorage.setItem('last-restore', new Date().toISOString());

        setStatus('success');
        setStatusMessage('Data restored successfully! Refreshing page...');
        setImportData('');
        
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setImportData('');
      }
    } catch (error) {
      setStatus('error');
      setStatusMessage(`Invalid backup file: ${fileName}`);
      setImportData('');
      setTimeout(() => setStatus('idle'), 3000);
    } finally {
      setIsRestoring(false);
    }
  };

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
        className="relative z-40 max-w-sm mx-auto space-y-3 py-3 px-3 bg-background rounded-lg shadow-lg"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-lg font-semibold">Backup & Restore</h1>
          <p className="text-xs text-muted-foreground">Protect and transfer your data</p>
        </div>

        {/* Status Message */}
        {status !== 'idle' && statusMessage && (
          <div className={`flex items-center gap-2 p-2 rounded-lg ${
            status === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {status === 'success' ? (
              <Check className="h-3 w-3" />
            ) : (
              <AlertCircle className="h-3 w-3" />
            )}
            <span className="text-xs font-medium">{statusMessage}</span>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-2">
          {/* Backup Card */}
          <Card className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-full bg-green-500/20">
                <Download className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Complete Backup</div>
                <div className="text-xs text-muted-foreground">
                  Saves all your data
                </div>
              </div>
            </div>
            <Button
              onClick={handleBackupNow}
              disabled={isBackingUp}
              className="w-full h-8"
              size="sm"
            >
              {isBackingUp ? (
                <>
                  <Download className="h-3 w-3 mr-1 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Download className="h-3 w-3 mr-1" />
                  Create Backup
                </>
              )}
            </Button>
          </Card>

          {/* Restore Card */}
          <Card className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-full bg-blue-500/20">
                <RotateCcw className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Restore from Backup</div>
                <div className="text-xs text-muted-foreground">
                  Upload .mbak or .json file
                </div>
              </div>
            </div>

            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-8"
              size="sm"
            >
              <FileUp className="h-3 w-3 mr-1" />
              Select Backup File
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".mbak,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </Card>
        </div>

        {/* Compact Tips */}
        <div className="text-xs text-muted-foreground bg-amber-500/10 border-amber-500/20 p-2 rounded-lg">
          <div className="flex items-center gap-1 font-medium text-amber-400 mb-1">
            💡 <span className="text-xs">Tips</span>
          </div>
          <div className="text-amber-300 text-xs leading-tight">
            • Create backups regularly • Store in safe places
          </div>
        </div>
      </div>
    </Layout>
  );
}
