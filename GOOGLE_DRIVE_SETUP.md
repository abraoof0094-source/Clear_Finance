# Google Drive Sync Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Name it "Clear Finance Sync"

## Step 2: Enable Google Drive API

1. Go to **APIs & Services** → **Library**
2. Search for "Google Drive API"
3. Click **Enable**

## Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client IDs**
3. Application type: **Web application**
4. Name: "Clear Finance Web App"
5. **Authorized JavaScript origins:**
   ```
   https://f0dc0a0318894e8fad68d27337feaea7-e58c75e8aa29424590f9526aa.fly.dev
   ```
6. **Authorized redirect URIs:**
   ```
   https://f0dc0a0318894e8fad68d27337feaea7-e58c75e8aa29424590f9526aa.fly.dev/preferences
   ```

## Step 4: Get Client ID

1. Copy the **Client ID** (looks like: `123456789-abcdef.apps.googleusercontent.com`)
2. Update the code with your Client ID

## Step 5: OAuth Consent Screen

1. Go to **OAuth consent screen**
2. User Type: **External**
3. App name: **Clear Finance**
4. User support email: Your email
5. Scopes: Add `https://www.googleapis.com/auth/drive.file`
6. Test users: Add your email for testing

## Step 6: Update Code

Replace `your-google-client-id` in the code with your actual Client ID.

## Step 7: Test

The Google Drive sync should now work without authorization errors!
