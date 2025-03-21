import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from './supabase';

// للاستخدام في مكونات الخادم فقط
export const createServerComponent = () => {
  return createServerComponentClient<Database>({ cookies });
};

// للاستخدام في الطرق التي تتعامل مع الطلبات (route handlers)
export const createServerActionClient = async () => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
};