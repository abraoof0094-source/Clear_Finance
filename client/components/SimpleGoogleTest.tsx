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
    setMessage('');

    try {
      // Test 1: Can we reach Google APIs?
      setMessage('Testing Google API connectivity...');
      
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        method: 'HEAD'
      });
      
      console.log('Google API HEAD request status:', response.status);
      
      if (response.status === 401) {
        // 401 is expected without auth - means API is reachable
        setResult('success');
        setMessage('✅ Google APIs are reachable! The issue is likely with your OAuth configuration.');
      } else if (response.ok) {
        setResult('success');
        setMessage('✅ Google APIs are accessible!');
      } else {
        setResult('error');
        setMessage(`❌ Google API returned status: ${response.status}`);
      }
      
    } catch (error: any) {
      console.error('Connectivity test failed:', error);
      
      if (error.name === 'TypeError' && error.message.includes('CORS')) {
        setResult('success');
        setMessage('✅ CORS error is normal - Google APIs are reachable!');
      } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        setResult('error');
        setMessage('❌ Cannot reach Google APIs - check your internet connection');
      } else {
        setResult('error');
        setMessage(`❌ Connectivity test failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const testGAPILoad = async () => {
    setIsLoading(true);
    setResult('idle');
    setMessage('Testing Google API script loading...');

    try {
      // Remove existing script if any
      const existingScript = document.querySelector('script[src*="apis.google.com"]');
      if (existingScript) {
        existingScript.remove();
        // Clear gapi
        (window as any).gapi = undefined;
      }

      // Load fresh
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
          console.log('Google API script loaded');
          setMessage('Google API script loaded successfully');
          resolve(true);
        };
        script.onerror = (e) => {
          console.error('Script load error:', e);
          reject(new Error('Failed to load Google API script'));
        };
        
        // Add timeout
        setTimeout(() => {
          reject(new Error('Script load timeout'));
        }, 10000);
        
        document.head.appendChild(script);
      });

      // Test if gapi is available
      if (window.gapi) {
        setResult('success');
        setMessage('✅ Google API script loaded and gapi is available!');
      } else {
        setResult('error');
        setMessage('❌ Google API script loaded but gapi is not available');
      }

    } catch (error: any) {
      console.error('GAPI load test failed:', error);
      setResult('error');
      setMessage(`❌ Script loading failed: ${error.message}`);
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
