import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import type { Database } from '../types/database'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL is required in environment variables')
}

if (!supabaseKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required in environment variables')
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (error) {
  throw new Error('SUPABASE_URL must be a valid URL')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
}) 