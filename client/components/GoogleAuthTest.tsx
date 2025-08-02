import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { TestTube, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export function GoogleAuthTestComponent() {
  const [testClientId, setTestClientId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const testGoogleAuth = async () => {
    if (!testClientId.trim() || !testClientId.includes('.apps.googleusercontent.com')) {
      setTestResult('error');
      setTestMessage('Please enter a valid Client ID');
      return;
    }

    setIsLoading(true);
    setTestResult('idle');
    setTestMessage('Testing Google OAuth...');

    try {
      // Load Google API script if not already loaded
      if (!window.gapi) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://apis.google.com/js/api.js';
          script.onload = () => resolve(true);
          script.onerror = () => reject(new Error('Failed to load Google API'));
          document.body.appendChild(script);
        });
      }

      // Initialize Google API
      await new Promise((resolve, reject) => {
        window.gapi.load('auth2', () => {
          window.gapi.auth2.init({
            client_id: testClientId,
            scope: 'https://www.googleapis.com/auth/drive.file'
          }).then(() => {
            setTestResult('success');
            setTestMessage('✅ Google OAuth configuration is valid! Authentication should work.');
            resolve(true);
          }).catch((error: any) => {
            console.error('Google Auth init error:', error);
            setTestResult('error');
            setTestMessage(`❌ OAuth Error: ${error.error || error.message || 'Invalid Client ID or configuration'}`);
            reject(error);
          });
        });
      });

    } catch (error: any) {
      console.error('Test failed:', error);
      setTestResult('error');
      setTestMessage(`❌ Test Failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 border-purple-500/20 bg-purple-500/5">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TestTube className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-medium">Test Google OAuth</span>
        </div>
        
        <div className="flex gap-2">
          <Input
            value={testClientId}
            onChange={(e) => setTestClientId(e.target.value)}
            placeholder="Paste your Client ID to test..."
            className="text-xs"
          />
          <Button 
            onClick={testGoogleAuth}
            disabled={!testClientId.trim() || isLoading}
            size="sm"
            variant="outline"
          >
            {isLoading ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              'Test'
            )}
          </Button>
        </div>

        {testResult !== 'idle' && (
          <div className={`flex items-center gap-2 p-2 rounded text-xs ${
            testResult === 'success' 
              ? 'bg-green-500/10 text-green-400' 
              : 'bg-red-500/10 text-red-400'
          }`}>
            {testResult === 'success' ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            <span>{testMessage}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
