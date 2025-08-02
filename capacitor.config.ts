import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.clearfinance.app',
  appName: 'Clear Finance',
  webDir: 'dist/spa',
  server: {
    androidScheme: 'file'
  }
};

export default config;
