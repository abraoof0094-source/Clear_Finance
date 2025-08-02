import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { googleDriveSync } from '../utils/googleDriveSync';
import { Cloud, CloudOff, Download, Upload, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export function GoogleDriveSyncComponent() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const configured = googleDriveSync.isConfigured();
    setIsConfigured(configured);

    if (configured) {
      checkSignInStatus();
      loadGoogleAPI();
    }
  }, []);

  const loadGoogleAPI = () => {
    // Load Google API script
    if (!window.gapi) {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        googleDriveSync.initializeGoogleDrive().catch(console.error);
      };
      document.body.appendChild(script);
    }
  };

  const checkSignInStatus = () => {
    setIsSignedIn(googleDriveSync.isSignedIn());
    const backupInfo = googleDriveSync.getLastBackupInfo();
    setLastBackup(backupInfo.date);
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const success = await googleDriveSync.signIn();
      if (success) {
        setIsSignedIn(true);
        setStatus('success');
        setStatusMessage('Successfully connected to Google Drive!');
      } else {
        setStatus('error');
        setStatusMessage('Failed to connect to Google Drive');
      }
    } catch (error) {
      setStatus('error');
      setStatusMessage('Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await googleDriveSync.signOut();
      setIsSignedIn(false);
      setLastBackup(null);
      setStatus('idle');
      setStatusMessage('');
    } catch (error) {
      setStatus('error');
      setStatusMessage('Sign out failed');
    }
  };

  const handleBackup = async () => {
    setIsLoading(true);
    try {
      const success = await googleDriveSync.uploadBackup();
      if (success) {
        setStatus('success');
        setStatusMessage('Backup uploaded successfully!');
        const backupInfo = googleDriveSync.getLastBackupInfo();
        setLastBackup(backupInfo.date);
      } else {
        setStatus('error');
        setStatusMessage('Backup failed');
      }
    } catch (error) {
      setStatus('error');
      setStatusMessage('Backup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      const success = await googleDriveSync.restoreFromBackup();
      if (success) {
        setStatus('success');
        setStatusMessage('Data restored successfully!');
      } else {
        setStatus('error');
        setStatusMessage('No backup found or restore cancelled');
      }
    } catch (error) {
      setStatus('error');
      setStatusMessage('Restore failed');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isSignedIn ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
            {isSignedIn ? (
              <Cloud className="h-5 w-5 text-green-500" />
            ) : (
              <CloudOff className="h-5 w-5 text-gray-500" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">Google Drive Sync</h3>
            <p className="text-sm text-muted-foreground">
              {isSignedIn ? 'Connected' : 'Not connected'} • Backup your data to Google Drive
            </p>
          </div>
        </div>

        {/* Status Message */}
        {status !== 'idle' && statusMessage && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            status === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {status === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span className="text-sm">{statusMessage}</span>
          </div>
        )}

        {/* Last Backup Info */}
        {isSignedIn && (
          <div className="text-sm text-muted-foreground">
            <strong>Last backup:</strong> {formatDate(lastBackup)}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {!isSignedIn ? (
            <Button 
              onClick={handleSignIn} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Cloud className="h-4 w-4 mr-2" />
                  Connect Google Drive
                </>
              )}
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handleBackup} 
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Backup
              </Button>
              <Button 
                onClick={handleRestore} 
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Restore
              </Button>
            </div>
          )}

          {isSignedIn && (
            <Button 
              onClick={handleSignOut} 
              variant="ghost" 
              size="sm"
              className="w-full text-muted-foreground"
            >
              Disconnect Google Drive
            </Button>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <p className="font-medium mb-1">How it works:</p>
          <ul className="space-y-1">
            <li>• <strong>Backup:</strong> Upload your transactions & budgets to Google Drive</li>
            <li>• <strong>Restore:</strong> Download and restore data on any device</li>
            <li>• <strong>Sync:</strong> Keep your phone and computer data in sync</li>
            <li>• <strong>Auto-backup:</strong> Automatically backs up when you add transactions</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
