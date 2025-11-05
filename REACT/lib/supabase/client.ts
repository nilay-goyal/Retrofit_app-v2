import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Lovable Cloud (Supabase) Configuration
const SUPABASE_URL = 
  Constants.expoConfig?.extra?.supabaseUrl || 
  process.env.EXPO_PUBLIC_SUPABASE_URL || 
  'https://mukydtfkyfyjkljpuqzs.supabase.co';

const SUPABASE_ANON_KEY = 
  Constants.expoConfig?.extra?.supabaseAnonKey || 
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11a3lkdGZreWZ5amtsanB1cXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMTU4MzMsImV4cCI6MjA3NDc5MTgzM30.xhgw_OhU9NZQ6iWeRL_tTKO7xZqgi4xbWap_Cap8azo';

// Validate configuration
if (!SUPABASE_URL || SUPABASE_URL === '' || !SUPABASE_URL.startsWith('http')) {
  throw new Error(
    'Missing or invalid Supabase URL. Please set EXPO_PUBLIC_SUPABASE_URL in your .env file or add supabaseUrl to app.json extra config.\n' +
    'Example: EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co'
  );
}

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === '') {
  throw new Error(
    'Missing Supabase anon key. Please set EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file or add supabaseAnonKey to app.json extra config.\n' +
    'Example: EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

