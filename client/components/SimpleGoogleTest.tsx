import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Zap, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export function SimpleGoogleTestComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const testBasicConnectivity = async () => {
    setIsLoading(true);
    setResult('idle');
    setMessage('Testing basic connectivity...');

    try {
      // Instead of direct fetch (which FullStory interferes with),
      // test by loading Google API script directly
      setMessage('Testing Google API script availability...');

      // Create a test script element to check if Google APIs are accessible
      const testScript = document.createElement('script');
      testScript.src = 'https://apis.google.com/js/api.js';

      const loadResult = await new Promise((resolve, reject) => {
        testScript.onload = () => {
          console.log('Google API script accessible');
          resolve('success');
        };
        testScript.onerror = (e) => {
          console.error('Google API script not accessible:', e);
          reject(new Error('Cannot load Google API script'));
        };

        // Add timeout
        setTimeout(() => {
          reject(new Error('Script load timeout - connection issues'));
        }, 8000);

        // Don't actually add to DOM, just test the load
        document.head.appendChild(testScript);
      });

      // Clean up
      if (testScript.parentNode) {
        testScript.parentNode.removeChild(testScript);
      }

      setResult('success');
      setMessage('✅ Google APIs are accessible! Your internet connection is working.');

    } catch (error: any) {
      console.error('Connectivity test failed:', error);
      setResult('error');
      setMessage(`❌ Connection test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testGAPILoad = async () => {
    setIsLoading(true);
    setResult('idle');
    setMessage('Testing Google API availability...');

    try {
      // Check if gapi is already loaded
      if (window.gapi) {
        setResult('success');
        setMessage('✅ Google API (gapi) is already loaded and available!');
        return;
      }

      // Try to load Google API script
      setMessage('Loading Google API script...');

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';

      await new Promise((resolve, reject) => {
        script.onload = () => {
          console.log('Google API script loaded successfully');
          resolve(true);
        };
        script.onerror = (e) => {
          console.error('Script load error:', e);
          reject(new Error('Failed to load Google API script - network or CORS issue'));
        };

        // 8 second timeout
        setTimeout(() => {
          reject(new Error('Script load timeout - slow connection or blocked'));
        }, 8000);

        document.head.appendChild(script);
      });

      // Give a moment for gapi to become available
      await new Promise(resolve => setTimeout(resolve, 500));

      // Test if gapi is available
      if (window.gapi) {
        setResult('success');
        setMessage('✅ Google API script loaded and gapi is available! OAuth should work.');
      } else {
        setResult('error');
        setMessage('❌ Script loaded but gapi is not available - possible conflict with other scripts');
      }

    } catch (error: any) {
      console.error('GAPI load test failed:', error);
      setResult('error');
      setMessage(`❌ Google API loading failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 border-green-500/20 bg-green-500/5">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium">Quick Tests</span>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={testBasicConnectivity}
            disabled={isLoading}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            {isLoading ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              'Test Connectivity'
            )}
          </Button>
          
          <Button 
            onClick={testGAPILoad}
            disabled={isLoading}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            {isLoading ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              'Test Script Load'
            )}
          </Button>
        </div>

        {result !== 'idle' && (
          <div className={`flex items-center gap-2 p-2 rounded text-xs ${
            result === 'success' 
              ? 'bg-green-500/10 text-green-400' 
              : 'bg-red-500/10 text-red-400'
          }`}>
            {result === 'success' ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            <span>{message}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
