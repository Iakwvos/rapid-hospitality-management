import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL is required in environment variables')
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY is required in environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Enable session persistence for frontend
    autoRefreshToken: true,
  },
}) 