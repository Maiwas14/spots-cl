import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://khunsinhemytvjzwrzxh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtodW5zaW5oZW15dHZqendyenhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5Mjc4NDIsImV4cCI6MjA4OTUwMzg0Mn0.BOHOsDMJGT3C779YCvGrspMHEX_lSII1PEup9JXF6vQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
