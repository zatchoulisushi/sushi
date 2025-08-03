import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase';

// Server-side Supabase client for build-time data loading only
// Uses service role key with full database access
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function createMockClient() {
  const mockResponse = { data: [], error: null };
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve(mockResponse)
        }),
        order: () => Promise.resolve(mockResponse)
      })
    })
  };
}

export const supabase = (!supabaseUrl || !supabaseServiceKey) 
  ? createMockClient() as any
  : createClient<Database>(supabaseUrl, supabaseServiceKey);