import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Download, Upload, Copy, Check, FileText, Smartphone, Monitor, FileUp } from 'lucide-react';

export function ManualDataSyncComponent() {
  const [exportData, setExportData] = useState<string>('');
  const [importData, setImportData] = useState<string>('');
  const [showExportData, setShowExportData] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current data from localStorage
  const getCurrentData = () => {
    const transactions = JSON.parse(localStorage.getItem('tracker-transactions') || '[]');
    const budgets = JSON.parse(localStorage.getItem('budgets') || '{}');
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

  // Export data as JSON string
  const handleExport = () => {
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

  // Download export data as file
  const downloadAsFile = () => {
    try {
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clear-finance-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus('success');
      setStatusMessage('Backup file downloaded successfully!');
    } catch (error) {
      setStatus('error');
      setStatusMessage('Download failed');
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
      setStatus('success');
      setStatusMessage(`File "${file.name}" loaded. Click "Import Data" to proceed.`);
    };
    reader.onerror = () => {
      setStatus('error');
      setStatusMessage('Failed to read file');
    };
    reader.readAsText(file);
  };

  // Import data from JSON string
  const handleImport = () => {
    if (!importData.trim()) {
      setStatus('error');
      setStatusMessage('Please paste your backup data');
      return;
    }

    try {
      const data = JSON.parse(importData);
      
      // Validate data structure
      if (!data.transactions || !Array.isArray(data.transactions)) {
        throw new Error('Invalid backup format');
      }

      // Confirm with user before overwriting
      const confirmed = window.confirm(
        `🔄 Import Backup Data?\n\n` +
        `This will replace your current data with:\n` +
        `• ${data.transactions.length} transactions\n` +
        `• ${Object.keys(data.budgets || {}).length} budget entries\n` +
        `• Exported: ${data.exportedAt ? new Date(data.exportedAt).toLocaleDateString() : 'Unknown date'}\n` +
        `• Device: ${data.deviceInfo || 'Unknown'}\n\n` +
        `Your current data will be overwritten. Continue?`
      );

      if (confirmed) {
        // Save data to localStorage
        localStorage.setItem('tracker-transactions', JSON.stringify(data.transactions));
        localStorage.setItem('budgets', JSON.stringify(data.budgets || {}));
        if (data.categories) {
          localStorage.setItem('categories', JSON.stringify(data.categories));
        }
        localStorage.setItem('last-import', new Date().toISOString());

        setStatus('success');
        setStatusMessage('Data imported successfully! Refreshing page...');
        setImportData('');
        
        // Reload the page to reflect changes
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      setStatus('error');
      setStatusMessage('Invalid backup data format');
    }
  };

  const getLastImportInfo = () => {
    const lastImport = localStorage.getItem('last-import');
    return lastImport ? new Date(lastImport).toLocaleString() : 'Never';
  };

  const getDataStats = () => {
    const transactions = JSON.parse(localStorage.getItem('tracker-transactions') || '[]');
    const budgets = JSON.parse(localStorage.getItem('budgets') || '{}');
    return {
      transactions: transactions.length,
      budgets: Object.keys(budgets).length
    };
  };

  const stats = getDataStats();

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/20">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Manual Data Sync</h3>
            <p className="text-sm text-muted-foreground">
              Export/Import your data manually • Works on any device
            </p>
          </div>
        </div>

        {/* Status Message */}
        {status !== 'idle' && statusMessage && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            status === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {status === 'success' ? (
              <Check className="h-4 w-4" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span className="text-sm">{statusMessage}</span>
          </div>
        )}

        {/* Current Data Stats */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="text-sm font-medium mb-2">📊 Current Data:</div>
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>💰 {stats.transactions} transactions</div>
            <div>📋 {stats.budgets} budget entries</div>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Last import: {getLastImportInfo()}
          </div>
        </div>

        {/* Export Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Smartphone className="h-4 w-4 text-green-500" />
            Export Data (From Phone to Computer)
          </div>
          
          <Button 
            onClick={handleExport} 
            className="w-full"
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Export My Data
          </Button>

          {showExportData && exportData && (
            <div className="space-y-2">
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
                <Button
                  onClick={downloadAsFile}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download File
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
        </div>

        {/* Import Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Monitor className="h-4 w-4 text-blue-500" />
            Import Data (From Phone/Other Device)
          </div>

          {/* File Upload Option */}
          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="flex-1"
            >
              <FileUp className="h-4 w-4 mr-2" />
              Upload File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex-1 text-center text-xs text-muted-foreground self-center">
              OR
            </div>
            <div className="flex-1 text-xs text-muted-foreground self-center">
              Paste data below ↓
            </div>
          </div>

          <textarea
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            className="w-full h-32 p-2 text-xs bg-muted rounded font-mono"
            placeholder="Paste your backup data here, or use 'Upload File' button above..."
          />

          <Button
            onClick={handleImport}
            disabled={!importData.trim()}
            className="w-full"
            variant={importData.trim() ? "default" : "outline"}
          >
            <Upload className="h-4 w-4 mr-2" />
            {importData.trim() ? 'Import Data' : 'Paste Data First'}
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <p className="font-medium mb-1">📱➡️💻 How to sync:</p>
          <ol className="space-y-1">
            <li>1. On your <strong>phone</strong>: Click "Export My Data" → Copy the text</li>
            <li>2. Send the text to yourself (WhatsApp, email, etc.)</li>
            <li>3. On your <strong>computer</strong>: Paste the text → Click "Import Data"</li>
            <li>4. Your data will sync! 🎉</li>
          </ol>
        </div>
      </div>
    </Card>
  );
}
