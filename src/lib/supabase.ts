import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'placeholder-key';

// Create Supabase client with validation
const validateSupabaseConfig = () => {
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_KEY) {
    console.warn('Supabase configuration is missing. Some features may not work properly.');
    return false;
  }
  return true;
};

export const supabase = createClient(supabaseUrl, supabaseKey);

export const isSupabaseConfigured = validateSupabaseConfig();