// Google Drive API integration for Clear Finance data sync
interface GoogleDriveFile {
  id: string;
  name: string;
  modifiedTime: string;
}

interface ClearFinanceData {
  transactions: any[];
  budgets: Record<string, Record<string, number>>;
  categories: any[];
  lastUpdated: string;
  version: string;
}

class GoogleDriveSync {
  private accessToken: string | null = null;
  private readonly BACKUP_FILENAME = 'clear-finance-backup.json';
  private readonly SCOPES = 'https://www.googleapis.com/auth/drive.file';
  private readonly CLIENT_ID = this.getClientId();

  constructor() {
    this.loadAccessToken();
  }

  private getClientId(): string {
    // Try to get from Vite build-time environment variable
    if (typeof __GOOGLE_CLIENT_ID__ !== 'undefined' && __GOOGLE_CLIENT_ID__) {
      return __GOOGLE_CLIENT_ID__;
    }

    // Try to get from runtime window variable (if set)
    if (typeof window !== 'undefined' && (window as any).__GOOGLE_CLIENT_ID__) {
      return (window as any).__GOOGLE_CLIENT_ID__;
    }

    // Try to get from localStorage (user configured)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('google-client-id');
      if (stored) return stored;
    }

    // Fallback - will need manual configuration
    return 'your-google-client-id';
  }

  // Method to set client ID manually
  public setClientId(clientId: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('google-client-id', clientId);
      (window as any).__GOOGLE_CLIENT_ID__ = clientId;
    }
  }

  // Check if client ID is configured
  public isConfigured(): boolean {
    const clientId = this.getClientId();
    return clientId !== 'your-google-client-id' && clientId.includes('.apps.googleusercontent.com');
  }

  private loadAccessToken() {
    this.accessToken = localStorage.getItem('google-drive-token');
  }

  private saveAccessToken(token: string) {
    this.accessToken = token;
    localStorage.setItem('google-drive-token', token);
  }

  // Initialize Google Drive API
  async initializeGoogleDrive() {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.gapi) {
        reject(new Error('Google API not loaded'));
        return;
      }

      window.gapi.load('auth2', () => {
        window.gapi.auth2.init({
          client_id: this.getClientId(),
          scope: this.SCOPES
        }).then(() => {
          resolve(true);
        }).catch(reject);
      });
    });
  }

  // Sign in to Google Drive
  async signIn(): Promise<boolean> {
    try {
      if (!window.gapi || !window.gapi.auth2) {
        throw new Error('Google API not initialized');
      }

      const authInstance = window.gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      const token = user.getAuthResponse().access_token;
      
      this.saveAccessToken(token);
      return true;
    } catch (error) {
      console.error('Google Drive sign in failed:', error);
      return false;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      if (window.gapi && window.gapi.auth2) {
        const authInstance = window.gapi.auth2.getAuthInstance();
        await authInstance.signOut();
      }
      localStorage.removeItem('google-drive-token');
      this.accessToken = null;
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }

  // Check if user is signed in
  isSignedIn(): boolean {
    return !!this.accessToken;
  }

  // Get current user data from localStorage
  private getCurrentData(): ClearFinanceData {
    const transactions = JSON.parse(localStorage.getItem('tracker-transactions') || '[]');
    const budgets = JSON.parse(localStorage.getItem('budgets') || '{}');
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    
    return {
      transactions,
      budgets,
      categories,
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    };
  }

  // Save data to localStorage
  private saveCurrentData(data: ClearFinanceData): void {
    localStorage.setItem('tracker-transactions', JSON.stringify(data.transactions));
    localStorage.setItem('budgets', JSON.stringify(data.budgets));
    localStorage.setItem('categories', JSON.stringify(data.categories));
    localStorage.setItem('last-sync', data.lastUpdated);
  }

  // Find existing backup file
  private async findBackupFile(): Promise<string | null> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${this.BACKUP_FILENAME}'&spaces=appDataFolder`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      const data = await response.json();
      return data.files && data.files.length > 0 ? data.files[0].id : null;
    } catch (error) {
      console.error('Error finding backup file:', error);
      return null;
    }
  }

  // Upload/Update backup to Google Drive
  async uploadBackup(): Promise<boolean> {
    if (!this.accessToken) {
      throw new Error('Not signed in to Google Drive');
    }

    try {
      const data = this.getCurrentData();
      const fileContent = JSON.stringify(data, null, 2);
      const existingFileId = await this.findBackupFile();

      const metadata = {
        name: this.BACKUP_FILENAME,
        parents: ['appDataFolder'] // Stores in app-specific folder
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([fileContent], { type: 'application/json' }));

      const url = existingFileId 
        ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`
        : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

      const method = existingFileId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: form
      });

      if (response.ok) {
        localStorage.setItem('last-backup', new Date().toISOString());
        return true;
      } else {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Backup upload failed:', error);
      return false;
    }
  }

  // Download backup from Google Drive
  async downloadBackup(): Promise<ClearFinanceData | null> {
    if (!this.accessToken) {
      throw new Error('Not signed in to Google Drive');
    }

    try {
      const fileId = await this.findBackupFile();
      if (!fileId) {
        return null; // No backup found
      }

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data as ClearFinanceData;
      } else {
        throw new Error(`Download failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Backup download failed:', error);
      return null;
    }
  }

  // Restore data from backup
  async restoreFromBackup(): Promise<boolean> {
    try {
      const backupData = await this.downloadBackup();
      if (!backupData) {
        return false;
      }

      // Confirm with user before overwriting
      const confirmed = window.confirm(
        `🔄 Restore Backup?\n\n` +
        `This will replace your current data with:\n` +
        `• ${backupData.transactions.length} transactions\n` +
        `• Last updated: ${new Date(backupData.lastUpdated).toLocaleDateString()}\n\n` +
        `Your current data will be overwritten. Continue?`
      );

      if (confirmed) {
        this.saveCurrentData(backupData);
        // Reload the page to reflect changes
        window.location.reload();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Restore failed:', error);
      return false;
    }
  }

  // Get last backup info
  getLastBackupInfo(): { date: string | null, hasBackup: boolean } {
    const lastBackup = localStorage.getItem('last-backup');
    return {
      date: lastBackup,
      hasBackup: !!lastBackup
    };
  }

  // Auto-sync (backup) when data changes
  async autoSync(): Promise<void> {
    if (this.isSignedIn()) {
      try {
        await this.uploadBackup();
        console.log('Auto-sync completed');
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    }
  }
}

// Export singleton instance
export const googleDriveSync = new GoogleDriveSync();

// Auto-sync on data changes
export const setupAutoSync = () => {
  // Listen for storage changes and auto-sync
  let syncTimeout: NodeJS.Timeout;
  
  const handleStorageChange = () => {
    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      googleDriveSync.autoSync();
    }, 5000); // Sync 5 seconds after last change
  };

  // Override localStorage setItem to detect changes
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key: string, value: string) {
    originalSetItem.call(this, key, value);
    if (key.includes('tracker-') || key.includes('budgets')) {
      handleStorageChange();
    }
  };
};

// Declare global types for Google API
declare global {
  interface Window {
    gapi: any;
  }
}
