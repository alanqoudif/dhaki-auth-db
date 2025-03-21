import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Supabase client for client components
export const createClientComponent = () => {
  return createClientComponentClient();
};

// Supabase client for server components
export const createServerClient = () => {
  return createServerComponentClient({ cookies });
};

// Database schema types
export type User = {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  questions_count: number;
  is_paid_user: boolean;
};

export type Question = {
  id: string;
  user_id: string;
  question: string;
  created_at: string;
  updated_at: string;
};