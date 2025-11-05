# Retrofit Mobile App

Mobile app for insulation contractors to create professional quotes in under 15 minutes. Built with React Native and Expo, synced with the Retrofit web app through Lovable Cloud (Supabase).

## What it does

- Create quotes with a 5-step flow (details, photos, measurements, costs, summary)
- View and manage all quotes with search and filters
- Dashboard with stats and recent quotes
- Settings for profile and preferences
- Everything syncs with the web app in real-time

## Setup

1. Clone the repo and navigate to the REACT folder:
   ```bash
   git clone https://github.com/nilay-goyal/Retrofit_app-v2.git
   cd Retrofit_app-v2/REACT
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. The app is already configured with Lovable Cloud credentials. If you need to change them, edit `lib/supabase/client.ts` or create a `.env` file:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. Start the dev server:
   ```bash
   npx expo start
   ```

5. Run on your device:
   - Press `i` for iOS or scan the QR code
   - Press `a` for Android or scan the QR code
   - Press `w` for web

## Project Structure

```
app/
├── (tabs)/          # Main screens (Dashboard, New Quote, Quotes, Settings)
├── auth.tsx         # Sign in/sign up
└── _layout.tsx      # Root layout

hooks/               # useAuth, useQuotes, useSettings
lib/supabase/        # Backend client and types
```

## Tech Stack

- React Native + Expo
- TypeScript
- Expo Router for navigation
- Supabase client for backend
- AsyncStorage for auth sessions

## Backend

Connects to Lovable Cloud (Supabase) using the same database as the web app. Tables: `quotes`, `profiles`, `quote_photos`, `quote_measurements`, `rebates`.

See `BACKEND_INTEGRATION.md` for API details.

## Troubleshooting

**App won't start?** Run `npx expo start --clear` to clear cache.

**Auth not working?** Check your network connection and Supabase settings.

**Quotes not loading?** Make sure you're signed in and check RLS policies in Supabase.

## License

CC-BY-4.0
