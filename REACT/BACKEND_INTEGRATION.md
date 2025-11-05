# Retrofit Mobile App - Backend Integration Guide

## Overview

The Retrofit mobile app is now integrated with the Supabase backend used by the Retrofit web app. This allows both apps to share the same database and authentication system.

## Setup Instructions

### 1. Install Dependencies

All required dependencies have been installed:
- `@supabase/supabase-js` - Supabase client library
- `@react-native-async-storage/async-storage` - Storage for auth sessions
- `react-native-url-polyfill` - Required for Supabase in React Native

### 2. Configure Supabase Credentials

**IMPORTANT:** You must configure your Supabase credentials before the app will work. The app will show a clear error message if credentials are missing.

You have two options:

#### Option A: Environment Variables (Recommended)

Create a `.env` file in the `REACT` directory:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Note:** For Expo, you need to restart the development server after creating/modifying the `.env` file:
```bash
# Stop the current server (Ctrl+C)
npx expo start --clear
```

#### Option B: app.json Configuration

Alternatively, you can add the credentials to `app.json`:

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "https://your-project-id.supabase.co",
      "supabaseAnonKey": "your-anon-key-here"
    }
  }
}
```

**Note:** After modifying `app.json`, restart the development server.

### 3. Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to Settings → API
3. Copy the following:
   - **Project URL** → Use as `SUPABASE_URL`
   - **anon/public key** → Use as `SUPABASE_ANON_KEY`

## Features Integrated

### ✅ Authentication
- Sign in with email/password
- Sign up with email/password
- Sign out
- Session persistence
- Auto token refresh

### ✅ Quotes Management
- Load all user quotes
- Create new quotes
- Update quote status
- Delete quotes
- Filter and search quotes

### ✅ Dashboard
- Real-time quote statistics
- Recent quotes display
- Revenue calculations

### ✅ Settings
- Profile management
- Company information
- Preferences (notifications, etc.)

## Database Schema

The app uses the following Supabase tables:
- `quotes` - All quote records
- `profiles` - User profile information
- `quote_photos` - Photos attached to quotes
- `quote_measurements` - Measurements for quotes

## Next Steps

1. **Quote Creation**: The New Quote flow (`new-quote.tsx`) needs to be integrated with the `createQuote` function from `useQuotes` hook.

2. **Photo Upload**: Implement photo upload to Supabase Storage and link photos to quotes via `quote_photos` table.

3. **Authentication Flow**: Add sign-in/sign-up screens if not already present.

4. **Error Handling**: Add user-friendly error messages for API failures.

5. **Offline Support**: Consider implementing offline queue for quote creation when network is unavailable.

## Testing

1. Ensure your Supabase project is running
2. Test authentication flow
3. Create a test quote and verify it appears in the web app
4. Update settings and verify persistence

## Troubleshooting

### "Supabase URL not found" error
- Check that your environment variables are set correctly
- Verify the Supabase URL is correct and accessible

### Authentication not working
- Check that AsyncStorage is properly configured
- Verify Supabase auth settings in dashboard
- Check network connectivity

### Quotes not loading
- Verify user is authenticated
- Check Supabase RLS (Row Level Security) policies
- Verify user_id matches authenticated user

