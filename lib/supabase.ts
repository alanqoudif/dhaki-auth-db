import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// حل المشكلة: انقل مكونات الخادم إلى ملف منفصل (supabase-server.ts)
// import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
// import { cookies } from 'next/headers'; // هذا سبب المشكلة - مكتبة خاصة بالسيرفر

// نوع قاعدة البيانات - يمكن استبداله بنوع أكثر تفصيلاً
export type Database = {
  public: {
    tables: {
      profiles: {
        Row: User;
        Insert: Omit<User, 'created_at' | 'updated_at'>;
        Update: Partial<User>;
      };
      questions: {
        Row: Question;
        Insert: Omit<Question, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Question>;
      };
    };
  };
};

// أنواع البيانات
export interface User {
  id: string;
  email: string;
  created_at?: string;
  updated_at?: string;
  questions_count: number;
  is_paid_user: boolean;
}

export interface Question {
  id: string;
  user_id: string;
  question: string;
  created_at?: string;
  updated_at?: string;
}

// 1. للاستخدام في مكونات العميل فقط
export const createClientComponent = () => {
  return createClientComponentClient<Database>();
};

// سننقل هذا الكود إلى ملف منفصل: lib/supabase-server.ts
// // 2. للاستخدام في مكونات الخادم فقط
// export const createServerComponent = () => {
//   return createServerComponentClient<Database>({ cookies });
// };