import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Settings, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { googleDriveSync } from '../utils/googleDriveSync';

export function GoogleDriveSetupComponent() {
  const [clientId, setClientId] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Check if already configured
    const configured = googleDriveSync.isConfigured();
    setIsConfigured(configured);

    // Debug: Log current configuration status
    console.log('Google Drive Setup - Configuration status:', {
      isConfigured: configured,
      hasStoredClientId: !!localStorage.getItem('google-client-id'),
      storedClientId: localStorage.getItem('google-client-id')?.substring(0, 20) + '...'
    });
  }, []);

  const handleSaveClientId = () => {
    if (clientId.trim() && clientId.includes('.apps.googleusercontent.com')) {
      // Save the client ID
      googleDriveSync.setClientId(clientId);
      setIsConfigured(true);
      setClientId('');

      // Trigger a page refresh to sync all components
      setTimeout(() => {
        window.location.reload();
      }, 1000);

      alert(`✅ Client ID saved successfully!\n\nRefreshing page to activate Google Drive sync...`);
    } else {
      alert('❌ Please enter a valid Google OAuth Client ID\n(should end with .apps.googleusercontent.com)');
    }
  };

  return (
    <Card className="p-6 border-2 border-blue-500/20 bg-blue-500/5">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isConfigured ? 'bg-green-500/20' : 'bg-orange-500/20'}`}>
            {isConfigured ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Settings className="h-5 w-5 text-orange-500" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">Google Drive OAuth Setup</h3>
            <p className="text-sm text-muted-foreground">
              {isConfigured ? '✅ OAuth configured and ready!' : '⚙️ Configure OAuth to enable Google Drive sync'}
            </p>
          </div>
        </div>

        {isConfigured ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Google Drive sync is ready!</span>
            </div>
            <p className="text-xs text-green-300 mt-1">
              You can now use the Google Drive sync feature below.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-orange-400 mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Setup Required</span>
              </div>
              <div className="text-xs text-orange-300 space-y-1">
                <p>1. ✅ You completed Google Cloud Console setup</p>
                <p>2. ⏳ Now add your Client ID below:</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Google OAuth Client ID:</label>
              <div className="flex gap-2">
                <Input
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="123456789-abcdefghijk.apps.googleusercontent.com"
                  className="font-mono text-xs"
                />
                <Button 
                  onClick={handleSaveClientId}
                  disabled={!clientId.trim()}
                  size="sm"
                >
                  Save
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Where to find your Client ID:</strong></p>
              <p>1. Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1">Google Cloud Console <ExternalLink className="h-3 w-3" /></a></p>
              <p>2. APIs & Services → Credentials</p>
              <p>3. Copy the Client ID (ends with .apps.googleusercontent.com)</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
