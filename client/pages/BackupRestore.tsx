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
        className="relative z-40 max-w-md mx-auto space-y-4 py-4 px-4 bg-background rounded-lg shadow-lg min-h-[calc(100vh-8rem)] flex flex-col"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-xl font-semibold">Backup & Restore</h1>
          <p className="text-sm text-muted-foreground">Protect and transfer your data</p>
        </div>

        {/* Status Message */}
        {status !== 'idle' && statusMessage && (
          <div className={`flex items-center gap-3 p-3 rounded-lg ${
            status === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {status === 'success' ? (
              <Check className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">{statusMessage}</span>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-4 flex-1">
          {/* Backup Card */}
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-green-500/20">
                <Download className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Complete Backup</div>
                <div className="text-xs text-muted-foreground">
                  Saves all transactions, budgets, and settings
                </div>
              </div>
            </div>
            <Button 
              onClick={handleBackupNow}
              disabled={isBackingUp}
              className="w-full"
              size="sm"
            >
              {isBackingUp ? (
                <>
                  <Download className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Create Backup
                </>
              )}
            </Button>
          </Card>

          {/* Restore Card */}
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-blue-500/20">
                <RotateCcw className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Restore from Backup</div>
                <div className="text-xs text-muted-foreground">
                  Upload a .mbak or .json backup file
                </div>
              </div>
            </div>

            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
              size="sm"
            >
              <FileUp className="h-4 w-4 mr-2" />
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
        <div className="text-xs text-muted-foreground bg-amber-500/10 border-amber-500/20 p-3 rounded-lg">
          <div className="flex items-center gap-2 font-medium text-amber-400 mb-1">
            💡 Tips
          </div>
          <div className="text-amber-300 space-y-1">
            <div>• Create backups regularly to protect your data</div>
            <div>• Store files in safe places (cloud storage, computer)</div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
