import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Wrench, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { parseGoogleError } from '../utils/errorParser';

interface DiagnosticResult {
  step: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export function GoogleAuthDiagnosticComponent() {
  const [clientId, setClientId] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const runDiagnostic = async () => {
    if (!clientId.trim()) {
      alert('Please enter your Google OAuth Client ID first');
      return;
    }

    setIsRunning(true);
    clearResults();

    try {
      // Step 1: Check Client ID format
      addResult({
        step: '1. Client ID Format',
        status: 'pending',
        message: 'Checking Client ID format...'
      });

      if (!clientId.includes('.apps.googleusercontent.com')) {
        addResult({
          step: '1. Client ID Format',
          status: 'error',
          message: 'Invalid Client ID format',
          details: 'Client ID must end with .apps.googleusercontent.com'
        });
        return;
      }

      addResult({
        step: '1. Client ID Format',
        status: 'success',
        message: 'Client ID format is valid'
      });

      // Step 2: Check Google API script loading
      addResult({
        step: '2. Google API Script',
        status: 'pending',
        message: 'Loading Google API script...'
      });

      if (!window.gapi) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://apis.google.com/js/api.js';
          script.onload = () => resolve(true);
          script.onerror = () => reject(new Error('Failed to load Google API script from CDN'));
          script.timeout = 10000; // 10 second timeout
          document.body.appendChild(script);
        });
      }

      addResult({
        step: '2. Google API Script',
        status: 'success',
        message: 'Google API script loaded successfully'
      });

      // Step 3: Check Domain Configuration
      addResult({
        step: '3. Domain Check',
        status: 'pending',
        message: 'Checking domain configuration...'
      });

      const currentDomain = window.location.origin;
      addResult({
        step: '3. Domain Check',
        status: 'warning',
        message: `Current domain: ${currentDomain}`,
        details: 'Ensure this domain is added to your OAuth authorized origins in Google Cloud Console'
      });

      // Step 4: Test Auth2 initialization
      addResult({
        step: '4. Auth2 Initialization',
        status: 'pending',
        message: 'Initializing Google Auth2...'
      });

      await new Promise((resolve, reject) => {
        window.gapi.load('auth2', () => {
          const authConfig = {
            client_id: clientId,
            scope: 'https://www.googleapis.com/auth/drive.file'
          };

          console.log('Auth config:', authConfig);

          window.gapi.auth2.init(authConfig).then((authInstance: any) => {
            addResult({
              step: '4. Auth2 Initialization',
              status: 'success',
              message: 'Google Auth2 initialized successfully'
            });
            resolve(authInstance);
          }).catch((error: any) => {
            console.error('Auth2 init error details:', error);
            
            let errorMessage = 'Unknown error';
            let details = '';

            if (error && typeof error === 'object') {
              if (error.error) {
                errorMessage = error.error;
                if (error.error_description) {
                  details = error.error_description;
                }
              } else if (error.details) {
                errorMessage = error.details;
              } else {
                // Try to extract meaningful error info
                try {
                  const errorStr = JSON.stringify(error);
                  if (errorStr !== '{}') {
                    errorMessage = errorStr;
                  }
                } catch (e) {
                  errorMessage = error.toString();
                }
              }
            }

            addResult({
              step: '4. Auth2 Initialization',
              status: 'error',
              message: `Auth2 initialization failed: ${errorMessage}`,
              details: details || 'Check Google Cloud Console OAuth configuration'
            });
            reject(error);
          });
        });
      });

      // Step 5: Test sign-in capability
      addResult({
        step: '5. Sign-in Test',
        status: 'pending',
        message: 'Testing sign-in capability...'
      });

      const authInstance = window.gapi.auth2.getAuthInstance();
      if (authInstance && authInstance.isSignedIn) {
        addResult({
          step: '5. Sign-in Test',
          status: 'success',
          message: 'Ready for sign-in! Google OAuth is fully configured.'
        });
      } else {
        addResult({
          step: '5. Sign-in Test',
          status: 'warning',
          message: 'Sign-in ready but user not signed in',
          details: 'This is normal - click "Connect Google Drive" to sign in'
        });
      }

    } catch (error: any) {
      console.error('Diagnostic failed:', error);
      addResult({
        step: 'Error',
        status: 'error',
        message: `Diagnostic failed: ${error.message || error}`,
        details: 'Check browser console for more details'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'pending': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return 'bg-green-500/10 border-green-500/20 text-green-400';
      case 'error': return 'bg-red-500/10 border-red-500/20 text-red-400';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
      case 'pending': return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    }
  };

  return (
    <Card className="p-4 border-purple-500/20 bg-purple-500/5">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-medium">Google OAuth Diagnostic</span>
        </div>
        
        <div className="space-y-2">
          <Input
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Enter your Google OAuth Client ID..."
            className="text-xs"
          />
          
          <Button 
            onClick={runDiagnostic}
            disabled={!clientId.trim() || isRunning}
            size="sm"
            className="w-full"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                Running Diagnostic...
              </>
            ) : (
              <>
                <Wrench className="h-3 w-3 mr-2" />
                Run Full Diagnostic
              </>
            )}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.map((result, index) => (
              <div key={index} className={`p-2 rounded border text-xs ${getStatusColor(result.status)}`}>
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(result.status)}
                  <span className="font-medium">{result.step}</span>
                </div>
                <div>{result.message}</div>
                {result.details && (
                  <div className="mt-1 text-xs opacity-80">{result.details}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
