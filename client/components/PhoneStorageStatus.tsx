import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Smartphone, 
  HardDrive, 
  CheckCircle, 
  AlertCircle, 
  RotateCcw,
  Trash2,
  Download,
  Info
} from 'lucide-react';
import { phoneStorage, getDataStats } from '../utils/phoneStorage';

export function PhoneStorageStatus() {
  const [stats, setStats] = useState(getDataStats());
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Update stats every few seconds to show real-time changes
    const interval = setInterval(() => {
      setStats(getDataStats());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleClearData = () => {
    const confirmed = window.confirm(
      '⚠️ Clear All Phone Data?\n\n' +
      'This will permanently delete:\n' +
      `• ${stats.transactions} transactions\n` +
      `• ${stats.budgets} budget entries\n\n` +
      'This action cannot be undone. Continue?'
    );

    if (confirmed) {
      phoneStorage.clearAllData();
      setStats(getDataStats());
      window.location.reload();
    }
  };

  const handleBackup = () => {
    const backup = phoneStorage.createBackup();
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `clear-finance-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-500/20">
              <Smartphone className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Phone Storage</h3>
              <p className="text-sm text-muted-foreground">
                Your data is saved locally on this device
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-green-500 border-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </div>

        {/* Storage Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <HardDrive className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Transactions</span>
            </div>
            <div className="text-2xl font-bold text-blue-500">
              {stats.transactions}
            </div>
            <div className="text-xs text-muted-foreground">
              Saved to phone
            </div>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <HardDrive className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Budgets</span>
            </div>
            <div className="text-2xl font-bold text-purple-500">
              {stats.budgets}
            </div>
            <div className="text-xs text-muted-foreground">
              Saved to phone
            </div>
          </div>
        </div>

        {/* Storage Info */}
        {showDetails && (
          <div className="bg-muted/30 p-3 rounded-lg space-y-2">
            <div className="text-sm font-medium mb-2">📱 Storage Details:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Storage Size: {stats.storage.totalSize} KB</div>
              <div>Items: {stats.storage.itemCount}</div>
              <div>Status: {stats.storage.available ? '✅ Available' : '❌ Error'}</div>
              <div>Last Backup: {stats.storage.lastBackup !== 'Never' ? 
                new Date(stats.storage.lastBackup).toLocaleDateString() : 'Never'}</div>
            </div>
          </div>
        )}

        {/* Status Message */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-400">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">
            All your data is automatically saved to your phone's storage. 
            It won't disappear when you reload or close the app.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="flex-1"
          >
            <Info className="h-4 w-4 mr-2" />
            {showDetails ? 'Hide' : 'Show'} Details
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackup}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Backup
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleClearData}
            className="flex-1 text-red-500 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>

        {/* Information */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <p className="font-medium mb-1">📱 How Phone Storage Works:</p>
          <ul className="space-y-1">
            <li>• ✅ Data saves automatically when you add transactions</li>
            <li>• ✅ Persists when you reload or close the app</li>
            <li>• ✅ Stored locally on your device for privacy</li>
            <li>• ⚠️ Data stays on this device only (use backup to transfer)</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
